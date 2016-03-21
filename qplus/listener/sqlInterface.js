var mysql       = require('mysql');
var filesystem  =require('fs');
var Q           =require('q');
var queries=require('./queries.js');
var credentials=require('./credentials.js');
var CryptoJS=require('crypto-js');
var buffer=require('buffer');



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
    numberOfLastUpdated:2
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
    numberOfLastUpdated:1
  },
  'Appointments':
  {
    sql:queries.patientAppointmentsTableFields(),
    numberOfLastUpdated:2
  },
  'Notifications':
  {
    sql:queries.patientNotificationsTableFields(),
    numberOfLastUpdated:2
  },
  'Tasks':
  {
    sql:queries.patientTasksTableFields(),
    numberOfLastUpdated:2
  },
  'LabTests':{
    sql:queries.patientTestResultsTableFields(),
    numberOfLastUpdated:1
  }
};

//Query processing function
exports.runSqlQuery=function(query, parameters, processRawFunction)
{
  var r=Q.defer();
  console.log(query);
  console.log(parameters);
  connection.query(query, parameters, function(err,rows,fields){
    if (err) r.reject(err);
    if(typeof rows[0] !=='undefined')
    {

      if(processRawFunction&&typeof processRawFunction !=='undefined')
      {
        processRawFunction(rows).then(function(result)
        {
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
}

//Gets Patient tables based on userID,  if timestamp defined sends requests
//that are only updated after timestamp, third parameter is an array of table names, if not present all tables are gathered
exports.getPatientTableFields=function(userId,timestamp,arrayTables)
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
      console.log('BOOM');
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
}
//Helper function to format the table, userId and timestamp
function processSelectRequest(table, userId, timestamp)
{
  var r=Q.defer();
  var requestMappingObject=exports.requestMappings[table];
  var date=new Date(0);
  console.log('time',timestamp)
  if(typeof timestamp!=='undefined')
  {
    console.log('asdtime')
    date=new Date(Number(timestamp));
    console.log(date);
  }
  var paramArray=[userId,date];
  if(requestMappingObject.numberOfLastUpdated==2) paramArray.push(date);
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
}

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
}
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
}
//Api call to checkin to an Appointment (Implementation in Aria is yet to be done)
exports.checkIn=function(requestObject)
{
  var r=Q.defer();
  var serNum=requestObject.Parameters.AppointmentSerNum;

  connection.query(queries.checkin(serNum,requestObject.Token),function(error, rows, fields)
  {
    if(error) r.reject(error);
    r.resolve(requestObject);
  });
  return r.promise;
}
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
}
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
}
//Adding action to activity log
exports.addToActivityLog=function(requestObject)
{
  connection.query(queries.logActivity(requestObject),
  function(error, rows, fields)
  {
    console.log(rows);
  });
}
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
}
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
}
exports.getMapLocation=function(requestObject)
{
  var qrCode=requestObject.Parameters.QRCode;
  console.log(requestObject);
  var r=Q.defer();
  connection.query(queries.getMapLocation(qrCode),function(error,rows,fields)
  {
    console.log(error);
    if(error) r.reject(error);
    r.resolve(rows[0]);
  });
  return r.promise;
}
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
}
exports.setNewPassword=function(password,patientSerNum, token)
{
  var r=Q.defer();
  connection.query(queries.setNewPassword(password,patientSerNum,token),function(error,rows,fields)
  {
    if(error) r.reject(error);
    r.resolve(rows);
  });
  return r.promise;
}
exports.getPatientDeviceLastActivity=function(userid,device)
{
  var r=Q.defer();
  connection.query(queries.getPatientDeviceLastActivity(userid,device),function(error,rows,fields)
  {
    if(error) r.reject(error);
    r.resolve(rows[0]);
  });
  return r.promise;
}

exports.updateLogout=function(requestObject)
{
  var r=Q.defer();
  connection.query(queries.updateLogout(requestObject),function(err, rows, fields){
    if(err) r.reject(err);
    console.log(rows);
    r.resolve(rows);
  });
  return r.promise;
}

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
    var imageCounter=0 ;
    var deferred = Q.defer();
    if (Object.keys(rows).length==0) { deferred.resolve('All images were loaded!'); }
    for (var key in rows)
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
};


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
