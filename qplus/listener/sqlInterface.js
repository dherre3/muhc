var mysql       = require('mysql');
var filesystem  =require('fs');
var Q           =require('q');
var utility = require('./utility.js');
var queries=require('./queries.js');
var credentials=require('./credentials.js');
var CryptoJS=require('crypto-js');
var buffer=require('buffer');
var http = require('http');
var timeEstimate = require('./timeEstimate.js');




var sqlConfig={
  port:'/Applications/MAMP/tmp/mysql/mysql.sock',
  user:'root',
  password:'root',
  database:'QPlusApp',
  dateStrings:true
};
/*
*Connecting to mysql database
*/
/*var sqlConfig={
  host:credentials.HOST,
  user:credentials.MYSQL_USERNAME,
  password:credentials.MYSQL_PASSWORD,
  database:credentials.MYSQL_DATABASE,
  dateStrings:true
};
/*
*Re-connecting the sql database, NodeJS has problems and disconnects if inactive,
The handleDisconnect deals with that
*/
var connection = mysql.createConnection(sqlConfig);

function handleDisconnect(myconnection) {
  myconnection.on('error', function(err) {
    console.log('Re-connecting lost connection');
    connection.destroy();
    connection = mysql.createConnection(sqlConfig);
    handleDisconnect(connection);
    connection.connect();
  });
}

handleDisconnect(connection);

var exports=module.exports={};



//Table mappings and process data functions for results obtained from the database.
exports.requestMappings=
{
  'Patient':{
    sql:queries.patientTableFields(),
    processFunction:loadProfileImagePatient,
    numberOfLastUpdated:1
  },
  'Documents':
  {
    sql:queries.patientDocumentTableFields(),
    processFunction:LoadDocuments,
    numberOfLastUpdated:2,
    table:'Document',
    serNum:'DocumentSerNum'
  },
  'Doctors':{
    sql:queries.patientDoctorTableFields(),
    processFunction:loadImageDoctor,
    numberOfLastUpdated:2
  },
  'Diagnosis':{
    sql:queries.patientDiagnosisTableFields(),
    numberOfLastUpdated:1
  },
  'Messages':{
    sql:queries.patientMessageTableFields(),
    processFunction:LoadAttachments,
    numberOfLastUpdated:1,
    table:'Messages',
    serNum:'MessagesSerNum'
  },
  'Appointments':
  {
    sql:queries.patientAppointmentsTableFields(),
    numberOfLastUpdated:5,
    table:'Appointment',
    serNum:'MessagesSerNum'
  },
  'Notifications':
  {
    sql:queries.patientNotificationsTableFields(),
    numberOfLastUpdated:2,
    table:'Notification',
    serNum:'NotificationSerNum'
  },
  'Tasks':
  {
    sql:queries.patientTasksTableFields(),
    numberOfLastUpdated:2
  },
  'LabTests':{
    sql:queries.patientTestResultsTableFields(),
    numberOfLastUpdated:1
  },
  'TxTeamMessages':{
    sql:queries.patientTeamMessagesTableFields(),
    numberOfLastUpdated:2,
    table:'TxTeamMessage',
    serNum:'TxTeamMessageSerNum'
  },
  'EducationalMaterial':{
    sql:queries.patientEducationalMaterialTableFields(),
    processFunction:getEducationTableOfContents,
    numberOfLastUpdated:5,
    table:'EducationalMaterial',
    serNum:'EducationalMaterialSerNum'
  },
  'Announcements':{
    sql:queries.patientAnnouncementsTableFields(),
    numberOfLastUpdated:2,
    table:'Announcement',
    serNum:'AnnouncementSerNum'
  }
};
//Query processing function
exports.runSqlQuery = function(query, parameters, processRawFunction)
{
  var r = Q.defer();
  console.log('RunSqlQuery parameters', parameters);

  connection.query(query, parameters, function(err,rows,fields){
    if (err) r.reject(err);
    if(typeof rows !=='undefined')
    {
      if(processRawFunction&&typeof processRawFunction !=='undefined')
      {
        console.log('processRawFunction',processRawFunction);
        
        processRawFunction(rows).then(function(result)
        {
          console.log('resuls of raw function', result);
          r.resolve(result);
        });
      }else{
        r.resolve(rows);
      }
    }else{
      r.resolve([]);
    }
  });
  return r.promise;
};

//Gets Patient tables based on userID,  if timestamp defined sends requests
//that are only updated after timestamp, third parameter is an array of table names, if not present all tables are gathered
exports.getPatientTableFields = function(userId,timestamp,arrayTables)
{
  var r=Q.defer();
  var timestp=0;
  if(arguments.length>2)
  {
    timestp=timestamp;
    console.log('Grab', arrayTables);
  }else if(arguments.length==2)
  {
    timestp=timestamp;
  }else{
    console.log('User name grab all fields');
  }
  var objectToFirebase={};
  var index=0;
  console.log(timestp);
  console.log('Inside patient fields');
   Q.all(preparePromiseArrayFields(userId,timestp,arrayTables)).then(function(response){
     if(typeof arrayTables!=='undefined')
     {
       for (var i = 0; i < arrayTables.length; i++) {
         objectToFirebase[arrayTables[i]]=response[index];
         index++;
       }
     }else{
       for (var key in exports.requestMappings) {
         objectToFirebase[key]=response[index];
         index++;
       }
     }   
     r.resolve(objectToFirebase);
  },function(error){
    r.reject(error);
  });
  return r.promise;
};
//Helper function to format the table, userId and timestamp
function processSelectRequest(table, userId, timestamp)
{
  var r=Q.defer();
  var requestMappingObject=exports.requestMappings[table];
  var date=new Date(0);
  console.log('time of update',timestamp);
  if(typeof timestamp!=='undefined')
  {
    date=new Date(Number(timestamp));
    console.log(date);
  }
  var paramArray=[userId,date];
  if(requestMappingObject.numberOfLastUpdated>1){
    for (var i = 1; i < requestMappingObject.numberOfLastUpdated; i++) {
      paramArray.push(date);
    }
  }
  exports.runSqlQuery(requestMappingObject.sql,paramArray,
    requestMappingObject.processFunction).then(function(rows)
    {
       r.resolve(rows);
    },function(err)
    {
      r.reject(err);
    });
  return r.promise;
}

//Preparing a promise array for later retrieval
function preparePromiseArrayFields(userId,timestamp,arrayTables)
{
  console.log('PreparePromise',timestamp);
  var array=[];
  if(typeof arrayTables!=='undefined')
  {
    for (var i = 0; i < arrayTables.length; i++) {
      array.push(processSelectRequest(arrayTables[i],userId,timestamp));
    }
  }else{
    for (var key in exports.requestMappings) {
      array.push(processSelectRequest(key,userId,timestamp));
    }
  }
  return array;
}


//Update read status for a table
exports.updateReadStatus=function(userId, parameters)
{
  var r= Q.defer();
  table=exports.requestMappings[parameters.Field].table;
  tableSerNum=exports.requestMappings[parameters.Field].serNum;
  id=parameters.Id;
  console.log('Affected Id', id);
  var query=connection.query(queries.updateReadStatus(),[table,table, tableSerNum, id, table, 'PatientSerNum', userId],
  function(err,rows,fields){
    if(err) r.reject(err);
    r.resolve(rows);
  });
  console.log(query.sql);
  return r.promise;
};

//Api call to insert a message into messages table
exports.sendMessage=function(requestObject)
{
  var r=Q.defer();
  console.log(requestObject);
  connection.query(queries.sendMessage(requestObject),function(error,rows, fields)
  {

    if(error) r.reject(error);
    //connection.query(queriesMH.sendMessage(objectRequest,id));
    r.resolve(requestObject);
  });
  return r.promise;
};

//Api call to read message
exports.readMessage=function(requestObject)
{
  var r=Q.defer();
  var serNum=requestObject.Parameters.MessageSerNum;
  connection.query(queries.readMessage(serNum, requestObject.Token),function(error, rows, fields)
  {
    if(error) r.reject(error);
    r.resolve(requestObject);
  });
  return r.promise;
};
//Api call to read notification
exports.readNotification=function(requestObject)
{
  var r=Q.defer();
  var serNum=requestObject.Parameters.NotificationSerNum;
  connection.query(queries.readNotification(serNum, requestObject.Token),function(error, rows, fields)
  {
    if(error) r.reject(error);
    r.resolve(requestObject);
  });
  return r.promise;
};

//Check if user is already checkedin 
exports.checkCheckinInAria = function(requestObject)
{
  var r = Q.defer();
  var serNum = requestObject.Parameters.AppointmentSerNum;
  var username = requestObject.UserID;
  //Get the appointment aria ser
   getAppointmentAriaSer(username, serNum).then(function(response){
    var ariaSerNum = response[0].AppointmentAriaSer;
    console.log('Appointment aria ser', ariaSerNum);
    //Check using Ackeem's script whether the patient has checked in at the kiosk
    checkIfCheckedIntoAriaHelper(ariaSerNum).then(function(success){
      console.log('the user has checked in ', success);
      //Check in the user into mysql if they have indeed checkedin at kiosk
      exports.runSqlQuery(queries.checkin(),['Kiosk', serNum, username]);
      r.resolve({CheckCheckin:{response:success, AppointmentSerNum:serNum}});
    }).catch(function(error){
      //Returns false to whether the patient has checked in.
      r.reject({CheckCheckin:{response:error, AppointmentSerNum:serNum}});
    });
  });
  return r.promise;
};



//Api call to checkin to an Appointment (Implementation in Aria is yet to be done)
exports.checkIn=function(requestObject)
{
  var r=Q.defer();
  var serNum = requestObject.Parameters.AppointmentSerNum;
  var latitude = requestObject.Parameters.Latitude;
  var longitude = requestObject.Parameters.Longitude;
  var accuracy = requestObject.Parameters.Accuracy;
  var username = requestObject.UserID;
  var session = requestObject.Token;
  var deviceId = requestObject.DeviceId;
  //Getting the appointment ariaSer to checkin to aria
  getAppointmentAriaSer(username, serNum).then(function(response){
    var ariaSerNum = response[0].AppointmentAriaSer;
    console.log('Appointment aria ser', ariaSerNum);
    //Check in to aria using Johns script
    checkIntoAria(ariaSerNum).then(function(response){
      console.log('Checked in successfully done in aria', response);

      //If successfully checked in change field in mysql
      exports.runSqlQuery(queries.checkin(),[session, serNum, username]).then(function(result){
        console.log('Checkin to appointment in sql', result);
        exports.runSqlQuery(queries.logCheckin(),[serNum, deviceId,latitude, longitude, accuracy, new Date()]).then(function(response){
          console.log('Checkin done successfully', 'Finished writint to database');
          r.resolve({Checkin:{response:'success'}});
        }).catch(function(error){
          console.log('error login checkin', error);
          r.resolve({Checkin:{response:'failure'}});
        });
      }).catch(function(error){
        console.log('Error inserting in sql', error);
        r.resolve({Checkin:{response:'failure'}});
      });
    }).catch(function(error){
      console.log('Unable to checkin to aria',error);
      r.resolve({Checkin:{response:'failure'}});
    });
  }).catch(function(error){
    console.log('Error while grabbing aria ser num', error);
    r.resolve({Checkin:{response:'failure'}});
  });
  return r.promise;
};
//Updating field in the database tables
exports.updateAccountField=function(requestObject)
{
  var r=Q.defer();
  var UserID=requestObject.UserID;
  getUserFromUserID(UserID).then(function(user)
  {

    var patientSerNum=user.UserTypeSerNum;
    var field=requestObject.Parameters.FieldToChange;
    var newValue=requestObject.Parameters.NewValue;
    if(field=='Password')
    {
      newValue=CryptoJS.SHA256(newValue);
      connection.query(queries.setNewPassword(newValue,patientSerNum,requestObject.Token),
      function(error, rows, fields)
      {
        if(error) r.reject(error);
        delete requestObject.Parameters.NewValue;
        r.resolve(requestObject);
      });

    }else{
      connection.query(queries.accountChange(patientSerNum,field,newValue,requestObject.Token),
      function(error, rows, fields)
      {
        if(error) r.reject(error);
        r.resolve(requestObject);
      });
    }
  });
  return r.promise;
};
//Inputing feedback into feedback table
exports.inputFeedback=function(requestObject)
{
  var r =Q.defer();
  var UserID=requestObject.UserID;
  getUserFromUserID(UserID).then(function(user)
  {
    var userSerNum=user.UserSerNum;
    var content=requestObject.Parameters.FeedbackContent;
    connection.query(queries.inputFeedback(userSerNum,content,requestObject.Token),
    function(error, rows, fields)
    {
      if(error) r.reject(error);
      r.resolve(requestObject);
    });
  });
  return r.promise;
};
//Adding action to activity log
exports.addToActivityLog=function(requestObject)
{
  connection.query(queries.logActivity(requestObject),
  function(error, rows, fields)
  {
    console.log(rows);
  });
};
//Gets user password for encrypting/decrypting
exports.getUsersPassword=function(username)
{
  var r=Q.defer();
  connection.query(queries.userPassword(username),function(error,rows,fields)
  {
    console.log(error);
    if(error) r.reject(error);
    r.resolve(rows);
  });
  return r.promise;
};
//API call to get Security questions
exports.getSecurityQuestions=function(PatientSerNum)
{
  var r=Q.defer();
  connection.query(queries.getSecurityQuestions(PatientSerNum),function(error,rows,fields)
  {
    if(error) r.reject(error);
    r.resolve(rows);
  });
  return r.promise;
};
exports.getMapLocation=function(requestObject)
{
  var qrCode=requestObject.Parameters.QRCode;
  console.log(requestObject);
  var r=Q.defer();
  connection.query(queries.getMapLocation(qrCode),function(error,rows,fields)
  {
    console.log(error);
    if(error) r.reject('Invalid');
    r.resolve({'MapLocation':rows[0]});
  });
  return r.promise;
};
//Api call to get patient fields for password reset
exports.getPatientFieldsForPasswordReset=function(userID)
{
  var r=Q.defer();
  connection.query(queries.getPatientFieldsForPasswordReset(userID),function(error,rows,fields)
  {
    if(error) r.reject(error);
    r.resolve(rows);
  });
  return r.promise;
};
exports.setNewPassword=function(password,patientSerNum, token)
{
  var r=Q.defer();
  connection.query(queries.setNewPassword(password,patientSerNum,token),function(error,rows,fields)
  {
    if(error) r.reject(error);
    r.resolve(rows);
  });
  return r.promise;
};
exports.getPatientDeviceLastActivity=function(userid,device)
{
  var r=Q.defer();
  connection.query(queries.getPatientDeviceLastActivity(userid,device),function(error,rows,fields)
  {
    if(error) r.reject(error);
    r.resolve(rows[0]);
  });
  return r.promise;
};

exports.updateLogout=function(fields)
{
  var r=Q.defer();
  connection.query(queries.updateLogout(),fields,function(err, rows, fields){
    if(err) r.reject(err);
    console.log(rows);
    r.resolve(rows);
  });
  return r.promise;
};

function getUserFromUserID(UserID)
{
  var r=Q.defer();
  connection.query(queries.getUserFromUserID(UserID),function(error, rows, fields){
    if(error) r.reject(error);
    r.resolve(rows[0]);
  });
  return r.promise;
}

function LoadDocuments(rows)
{
  /**
  * @ngdoc method
  * @methodOf Qplus Firebase Listener
  *@name LoadImages
  *@description  Uses the q module to make a promise to load images. The promise is resolved after all of them have been read from file system using the fs module. The code continues to run only if the promise is resolved.
  **/
   console.log('Inside document fetching function');
   console.log(rows);
    var imageCounter=0 ;
    var deferred = Q.defer();
    if (rows.length === 0) { deferred.resolve([]); }
    for (var key = 0; key < rows.length; key++)
    {

      var n = rows[key].FinalFileName.lastIndexOf(".");
      var substring=rows[key].FinalFileName.substring(n+1,rows[key].FinalFileName.length);
      rows[key].DocumentType=substring;
      rows[key].Content=filesystem.readFileSync(__dirname+'/Documents/' + rows[key].FinalFileName,'base64',function(error,data){
        if(error) r.reject(error);
      });

      imageCounter++;
      //console.log('imagecounter is : ',imageCounter);
      if (imageCounter == Object.keys(rows).length )
       {
         deferred.resolve(rows);
       }
    }
    return deferred.promise;
}


//Function toobtain Doctors images
function loadImageDoctor(rows){
  var deferred = Q.defer();
  for (var key in rows){
    if((typeof rows[key].ProfileImage !=="undefined" )&&rows[key].ProfileImage){

      var n = rows[key].ProfileImage.lastIndexOf(".");
      var substring=rows[key].ProfileImage.substring(n+1,rows[key].ProfileImage.length);
      rows[key].DocumentType=substring;
      rows[key].ProfileImage=filesystem.readFileSync(__dirname+'/Doctors/'+rows[key].ProfileImage,'base64' );

    }
  }
  deferred.resolve(rows);
  return deferred.promise;
}

//function to format patient image to base 64
function loadProfileImagePatient(rows){
  var deferred = Q.defer();

  if(rows[0]&&rows[0].ProfileImage && rows[0].ProfileImage!=='')
  {
    var buffer=new Buffer(rows[0].ProfileImage,'hex');
    var base64Buffer=buffer.toString('base64');
    rows[0].DocumentType='jpg';
    rows[0].ProfileImage=base64Buffer;
    deferred.resolve(rows);
    /*var n = rows[0].ProfileImage.lastIndexOf(".");
    var substring=rows[0].ProfileImage.substring(n+1,rows[0].ProfileImage.length);
    rows[0].DocumentType=substring;
    rows[0].ProfileImage=filesystem.readFileSync(__dirname + '/Patients/'+ rows[0].ProfileImage,'base64' );
    deferred.resolve(rows);*/
  }else{
    deferred.resolve(rows);
  }

  return deferred.promise;
}
function getEducationalMaterialTableOfContents(rows)
{
  var r = Q.defer();
  if(rows.length>0)
  {
    var array=[];
    for (var i = 0; i < rows.length; i++) {
      array.push(exports.runSqlQuery(queries.patientEducationalMaterialContents(), [rows[i].EducationalMaterialControlSerNum]));
    }
    Q.all(array).then(function(results)
    {
      for (var i = 0; i < results.length; i++) {
        rows[i].TableContents=results[i];
      }
      r.resolve(rows);
    });
  }else{
    r.resolve(rows);
  }
  return r.promise;
}
function getEducationTableOfContents(rows)
{
  var r = Q.defer();
  var indexes = [];
  var promises =[];
  for (var i = rows.length-1; i >= 0; i--) {
    if(!rows[i].URL_EN || typeof rows[i].URL_EN == 'undefined'|| rows[i].URL_EN.length === 0)
    {
      var array=[];
      for (var j = rows.length-1; j >= 0; j--) {
        if(rows[j].EducationalMaterialSerNum == rows[i].EducationalMaterialSerNum && rows[j].EducationalMaterialControlSerNum !== rows[i].EducationalMaterialControlSerNum)
        {
          indexes.push(j);
        }
      }
    }
  }
  for (var k = 0; k < indexes.length; k++) {
    rows.splice(indexes[k],1);
  }
  for (var l = 0; l < rows.length; l++) {
    promises.push(exports.runSqlQuery(queries.patientEducationalMaterialContents(),[rows[l].EducationalMaterialControlSerNum] ));
  }
  Q.all(promises).then(
    function(results){
      for (var i = 0; i < results.length; i++) {
        if(results[i].length !== 0)
        {
            for (var j = 0; j < rows.length; j++) {
              if(rows[j].EducationalMaterialControlSerNum ==results[i][0].ParentSerNum)
              {
                rows[j].TableContents = results[i];
              }
            }
        }
      }
      r.resolve(rows);
    }
  ).catch(function(error){r.reject(error);});
  return r.promise;
}

var LoadAttachments = function (rows )
{
  /**
  * @ngdoc method
  * @methodOf Qplus Firebase Listener
  *@name LoadAttachments
  *@description  Uses the q module to make a promise to load attachments. The promise is resolved after all of them have been read from file system using the fs module. The code continues to run only if the promise is resolved.
  **/
    var messageCounter=0 ;
    var r = Q.defer();
    r.resolve(rows);
    return r.promise;
    /*if (Object.keys(rows).length==0) { deferred.resolve('All attachments were loaded!'); }
    for (var key in rows)
    {
      // It fetches all of the attachment every time a user logs in. Very bad for bandwidth !
      if (rows[key].Attachment && rows[key].Attachment!=="No" )
      {
        rows[key].Attachment=filesystem.readFileSync(__dirname + rows[key].Attachment,'base64' );
      }
      messageCounter++;
      if (messageCounter == Object.keys(rows).length )
       {
         dataObject.Messages= JSON.parse(JSON.stringify(rows));
         deferred.resolve('All attachments were loaded!');
       }
    }
    return deferred.promise;*/
  };
function getAppointmentAriaSer(username, appSerNum)
{
  return exports.runSqlQuery(queries.getAppointmentAriaSer(),[username, appSerNum]);
}
function checkIntoAria(patientActivitySerNum)
{
  var r = Q.defer();
  //Url to checkin
  var urlCheckin = {
      path: 'http://medphys/devDocuments/screens/php/checkInPatient.php?CheckinVenue=8225&ScheduledActivitySer='+patientActivitySerNum
    };
  //Url to check the successful or unsuccessful checkin
  var urlCheckCheckin = {
      path: 'http://medphys/devDocuments/ackeem/getCheckins.php?AppointmentAriaSer='+patientActivitySerNum
  };
  //making request to checkin
      var x = http.request(urlCheckin,function(res){
          res.on('data',function(data){
            //Check if it successfully checked in
            checkIfCheckedIntoAriaHelper(patientActivitySerNum).then(function(response){
              r.resolve(response);
            }).catch(function(error){
              r.reject(error);
            });
          });
      }).end();
  return r.promise;
}
//Check if checked in for an appointment in aria
function checkIfCheckedIntoAriaHelper(patientActivitySerNum)
{
  var r = Q.defer();
    var urlCheckCheckin = {
      path: 'http://medphys/devDocuments/ackeem/getCheckins.php?AppointmentAriaSer='+patientActivitySerNum
    };
    var y = http.request(urlCheckCheckin,function(response){
      response.on('data',function(data){
          data = data.toString();
          console.log('Checking in aria if checked in', data);
          if(data.length === 0)
          {
            r.reject('failure');
          }else{
            r.resolve('success');
          }
        });
      }).end();
    return r.promise;
}
//Get time estimate from Ackeem's scripts

exports.getTimeEstimate = function(result)
{
  var r = Q.defer();
  result = result[0];
  timeEstimate.getEstimate(result.AppointmentAriaSer).then(
      function(estimate){
          r.resolve({CheckinUpdate: estimate});
      },function(error)
      {
        r.resolve({CheckinUpdate: error});
    });
    return r.promise;
};
