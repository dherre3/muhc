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
  database:credentials.MYSQL_DATABASE
};*/
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
//Running sql query
exports.runSqlQuery=function(query, parameters)
{
  connection.query(query,parameters, function(err,rows,fields){
    var r=Q.defer();
    if (err) r.reject(error);
    r.resolve(rows);
  });
}

//Function that refreshes a table and sends it to table in mysql
exports.refreshField=function(UserID, field)
{
  var r=Q.defer();
  var objectData={};

  if(tableMappings[field])
  {

    var functionField=tableMappings[field];
    functionField(UserID).then(function(fieldObject)
    {
      objectData[field]=fieldObject;
      r.resolve(objectData);
    });
  }else{
    r.reject('Invalid');
  }
  return r.promise;
}
//Utility function to run queries, accepts UserID, query, and callbackfunction with
//the results from the query
exports.apiRequestField=function(UserID, query, callbackFunction)
{
  connection.query(query, function(err,rows,fields){
    var r=Q.defer();
    if (err) r.reject(error);
    callbackFunction(rows).then(function(rows){
      r.resolve(rows);
    });
  });
  return r.promise;
}
/*
*@name cascadeFunction
*@param(string) UserID The patients user id
@param(string) queue queue of promises to be processed.
@param(startObject) startObject Object to return
@description Takes a queue of promises and executes them all sequentially
*@return (object) Return the object containing the patient information with
for all the fields listed in the queue
*/

exports.cascadeFunction=function(UserID,queue,startObject)
{
  var r=Q.defer();
  if(queue.isEmpty())
  {

    r.resolve(startObject);
  }else{
    var field=queue.dequeue();
    var functionField=tableMappings[field];
    functionField(UserID).then(function(rows){
      startObject[field]=rows;
      r.resolve(exports.cascadeFunction(UserID,queue,startObject));
    });
  }


  return r.promise;
}

exports.getAllPatientFields=function(userid)
{
  var r=Q.defer();
  var tablePromisesArray;
  var objectToFirebase={};
  
   Q.all(preparePromiseArray(userid)).then(function(response){
    for (var key in tableMappings) {
      objectToFirebase[key]=response[i];
    }
    r.resolve(objectToFirebase);
  },function(error){
    r.reject(error);
  });
  return r.promise;
}
function preparePromiseArray(userid)
{
  console.log(userid);
  var array=[];
  for (var key in tableMappings) {
    array.push(tableMappings[key](userid));
  }
  return array;
}
//Gets the patient fields in patient table and converts user image to base64
exports.getPatient=function(UserID)
{
  var r=Q.defer();
  connection.query(queries.patientQuery(UserID), function(error, rows, fields)
  {

    if (error) r.reject(error);
    loadProfileImagePatient(rows).then(function(rows){
    r.resolve(rows[0]);
    });
  });
  return r.promise;
}

//Obtaints the patient lab tests from lab test table
exports.getPatientLabTests=function(UserID)
{
  var r=Q.defer();
  connection.query(queries.patientLabResultsQuery(UserID), function(error, rows, fields)
  {
    if (error) r.reject(error);
    r.resolve(rows);
  });
  return r.promise;
}

//Obtains the patient doctors
exports.getPatientDoctors=function(UserID)
{
  var r=Q.defer();
  connection.query(queries.patientDoctorsQuery(UserID),function(error,rows,fields){
      if (error) r.reject(error);
      loadImageDoctor(rows).then(function(rows){
        r.resolve(rows);
      });
  });
  return r.promise;
}

//Obtains patient diagnosis
exports.getPatientDiagnoses=function(UserID)
{
  var r=Q.defer();
  connection.query(queries.patientDiagnosesQuery(UserID),function(error,rows,fields){
      if (error) r.reject(error);
      r.resolve(rows);
  });
  return r.promise;
}

//Api call to obtain patient messages;
exports.getPatientMessages=function(UserID)
{
  var r=Q.defer();
  connection.query(queries.patientMessagesQuery(UserID),function(error,rows,fields){
      if (error) r.reject(error);
      LoadAttachments(rows).then(function(rows){
        r.resolve(rows);
      });
  });
  return r.promise;
}
//Api call to obtain patient appointments
exports.getPatientAppointments=function(UserID)
{
  var r=Q.defer();
  connection.query(queries.patientAppointmentsQuery(UserID),function(error,rows,fields){
      if (error) r.reject(error);
      r.resolve(rows);
  });
  return r.promise;
}
//Gets patient documents
exports.getPatientDocuments=function(UserID)
{
  var r=Q.defer();
  connection.query(queries.patientDocumentsQuery(UserID),function(error,rows,fields){
      if (error) r.reject(error);
      LoadDocuments(rows).then(function(response){
      if(response=='All images were loaded!')
      {
        r.resolve(rows);
      }else{
        r.resolve(response);
      }

      },function(error){r.resolve(rows)});
  });
  return r.promise;
}
//Api call to obtain patient notifications
exports.getPatientNotifications=function(UserID)
{
  var r=Q.defer();
  console.log(queries.patientNotificationsQuery(UserID));
  connection.query(queries.patientNotificationsQuery(UserID),function(error,rows,fields){
      console.log(error);
      if (error) r.reject(error);
      console.log(rows);
      r.resolve(rows);
  });
  return r.promise;


}
//Api call to obtain patient tasks
exports.getPatientTasks=function(UserID)
{
  var r=Q.defer();
  connection.query(queries.patientTasksQuery(UserID),function(error,rows,fields){
      if (error) r.reject(error);
      r.resolve(rows);
  });
  return r.promise;
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
  getPatientFromUserID(UserID).then(function(user)
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
  getPatientFromUserID(UserID).then(function(user)
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
    r.resolve(rows[0].Password);
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
    r.resolve(rows[0]);
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

/*
Table mappings for cascade synchronous function
*/
var tablePromisesArray=[
  exports.getPatientMessages,
  exports.getPatient,
  exports.getPatientDoctors,
  exports.getPatientDiagnoses,
  exports.getPatientAppointments,
  exports.getPatientNotifications,
  exports.getPatientTasks,
  exports.getPatientDocuments,
  exports.getPatientLabTests
];
var tableNames=
[
  'Messages',
  'Patient',
  'Doctors',
  'Diagnoses',
  'Appointments',
  'Notifications',
  'Tasks',
  'Documents',
  'LabTests'
];
var tableMappings=
{
  'Messages':exports.getPatientMessages,
  'Patient':exports.getPatient,
  'Doctors':exports.getPatientDoctors,
  'Diagnoses':exports.getPatientDiagnoses,
  'Appointments':exports.getPatientAppointments,
  'Notifications':exports.getPatientNotifications,
  'Tasks':exports.getPatientTasks,
  'Documents':exports.getPatientDocuments,
  'LabTests':exports.getPatientLabTests
};
function getPatientFromUserID(UserID)
{
  var r=Q.defer();
  connection.query(queries.getPatientFromUserId(UserID),function(error, rows, fields){
    if(error) r.reject(error);
    r.resolve(rows[0]);
  });
  return r.promise;
}

var LoadDocuments = function (rows)
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


function loadProfileImagePatient(rows){
  var deferred = Q.defer();
  if(rows[0].ProfileImage && rows[0].ProfileImage!=='')
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
