var Firebase    =require('firebase');
var utility=require('./utility.js');
var updateClient=require('./updateClient.js');
var updateServer=require('./updateServer.js');
var credentials=require('./credentials.js');
var sqlInterface=require('./sqlInterface.js');
var CryptoJS=require('crypto-js')
var q=require('q');
var api=require('./api.js');

//console.log(a);
//var requestTest={type:'pirlo',param:{david:'12121',andres:'andres'}};

//request(requestTest)
var ref=new Firebase(credentials.FIREBASE_URL);
ref.child('requests').on('child_added',function(requestsFromFirebase){
  var requestObject=requestsFromFirebase.val();
  var requestKey=requestsFromFirebase.key();
  if(requestObject.Request=='VerifySSN'||requestObject.Request=='SetNewPassword')
  {
    console.log(requestObject);
    exports.resetPasswordRequest(requestKey,requestObject);
  }else{
    exports.apiRequest(requestKey, requestObject);

  }
});


exports.apiRequest=function(requestKey, requestObject){
  sqlInterface.getUsersPassword(requestObject.UserID).then(function(key){
    console.log(key);
    console.log(requestObject.Request);
    requestObject.Request=utility.decryptObject(requestObject.Request,key);
    var encryptionKey=key;
    //console.log(encryptionKey);
    if(requestObject.Request=='') {
      console.log('Rejecting request');
      completeRequest(requestKey,{},'Invalid');
      return;
    }
    requestObject.Parameters=utility.decryptObject(requestObject.Parameters,key);
    if(requestObject.Request=='Login'||requestObject.Request=='Refresh'||requestObject=='MapLocation')
    {
      updateClient.update(requestObject).then(function(objectToFirebase)
      {
        console.log(encryptionKey);
          uploadToFirebase(requestKey, encryptionKey,requestObject, objectToFirebase);

      }).catch(function(response){
          completeRequest(requestKey,requestObject,'Invalid');
      });
    }else
    {
      console.log(requestObject);
      updateServer.update(requestObject).then(function(response)
      {
          completeRequest(requestKey, requestObject);
      }).catch(function(response){
          completeRequest(requestKey,requestObject,'Invalid');
      });
    }
  }).catch(function(error){
    console.log(error);
    completeRequest(requestKey,{},'Invalid');
  });
}
function uploadToFirebase(requestKey,encryptionKey,requestObject,object)
{
  console.log('I am about to go to into encrypting');
  //console.log(request);
  object=utility.encryptObject(object,encryptionKey);
  //console.log(object);
  var deviceId=requestObject.DeviceId;
  var UserID=requestObject.UserID;
  var userFieldsPath='Users/'+UserID+'/'+deviceId;
  object.timestamp=Firebase.ServerValue.TIMESTAMP;
    console.log('I am about to write to firebase');
  ref.child(userFieldsPath).update(object, function(){
    console.log('I just finished writing to firebase');
    completeRequest(requestKey, requestObject);
    //logRequest(requestObject);
  });
}
function completeRequest(requestKey, requestObject, invalid)
{

  //Clear request
  ref.child('requests').child(requestKey).set(null);
  //Log Request
  if(invalid!==undefined)
  {
    api.logRequest(requestObject);
  }else{
    requestObject.reason='Error wrong arguments';
    api.logRequest(requestObject);
  }


}
exports.resetPasswordRequest=function(requestKey, requestObject)
{
  //console.log(requestObject.UserID);
  //console.log(requestKey);
    sqlInterface.getPatientFieldsForPasswordReset(requestObject.UserID).then(function(patient){
      console.log('Inside this function');
      console.log(patient);
      console.log(patient.SSN);
      if(requestObject.Request=='VerifySSN'){
        var unencrypted=utility.decryptObject(requestObject.Parameters,patient.SSN);
        console.log(unencrypted);
        if(typeof unencrypted.SSN!=='undefined'&&unencrypted.SSN!=='')
        {
          //console.log(patient.PatientSerNum);
          sqlInterface.getSecurityQuestions(patient.PatientSerNum).then(function(questions)
          {
            console.log(questions);
            var integer=Math.floor((3*Math.random()));
            console.log(integer);
            questions[integer].type='success';
            var response={ResetPassword:questions[integer]};
            uploadToFirebase(requestKey,patient.SSN,requestObject,response);
          });
        }else{
          var response={};
          response.ResetPassword={};
          response.ResetPassword.type='error';
          var deviceId=requestObject.DeviceId;
          var UserID=requestObject.UserID;
          var userFieldsPath='Users/'+UserID+'/'+deviceId;
            console.log('I am about to write to firebase');
          ref.child(userFieldsPath).update(response, function(){
            console.log('I just finished writing to firebase');
            completeRequest(requestKey, requestObject);
            //logRequest(requestObject);
          });
        }
      }else{
        sqlInterface.getSecurityQuestions(patient.PatientSerNum).then(function(questions)
        {
          console.log(questions);
          var flag=false;
          var newPassword='';
          for (var i = 0; i < questions.length; i++) {
            console.log(questions[i].Answer);
            var password={NewPassword:requestObject.Parameters.NewPassword};
            console.log(password);
            password=utility.decryptObject(password,questions[i].Answer);
            console.log(password);
            if(typeof password.NewPassword!=='undefined'&&password.NewPassword!==''){
              console.log(password.NewPassword);
              newPassword=CryptoJS.SHA256(password.NewPassword).toString();
              console.log(newPassword);
              console.log('I am the truth');
              flag=true;
            }
          }
          if(!flag)
          {
            //completeRequest(requestKey,{},'Invalid');
            console.log('Invalid flag');
          }else{
            console.log(patient);
            sqlInterface.setNewPassword(newPassword,patient.PatientSerNum,requestObject.Token).then(function(){
              completeRequest(requestKey,requestObject);
            }).catch(function(response){
              console.log('Invalid setting password');
                //completeRequest(requestKey,{},'Invalid');
            });
          }
        });
      }
    }).catch(function(response){
      completeRequest(requestKey,{},'Invalid');
    });
}
exports.apiRequestBrowserListener=function(requestKey,requestObject)
{
  var r=q.defer();
  sqlInterface.getUsersPassword(requestObject.UserID).then(function(key){
    requestObject.Request=utility.decryptObject(requestObject.Request,key);
    var encryptionKey=key;
    console.log(requestObject.Request);

    if(requestObject.Request=='') {
      console.log('Rejecting request');
      var firebaseObject={};
      firebaseObject.requestKey=requestKey;
      firebaseObject.requestObject={};
      firebaseObject.type='CompleteRequest';
      firebaseObject.Invalid='Invalid';
      if(firebaseObject.Invalid!==undefined)
      {
        api.logRequest(requestObject);
      }else{
        requestObject.reason='Error wrong arguments';
        api.logRequest(requestObject);
      }
      r.resolve(firebaseObject);

    }
    requestObject.Parameters=utility.decryptObject(requestObject.Parameters,key);
    if(requestObject.Request=='Login'||requestObject.Request=='Refresh'||requestObject.Request=='MapLocation')
    {
      console.log('Im in there');
      updateClient.update(requestObject).then(function(objectToFirebase)
      {
        console.log(objectToFirebase);
        var firebaseObject={};
        firebaseObject.requestKey=requestKey;
        firebaseObject.requestObject=requestObject;
        firebaseObject.encryptionKey=encryptionKey;
        firebaseObject.object=objectToFirebase;
        firebaseObject.type='UploadToFirebase';
        r.resolve(firebaseObject);
        console.log('Completing update client requests');
      }).catch(function(response){
          var firebaseObject={};
          firebaseObject.requestKey=requestKey;
          firebaseObject.requestObject=requestObject;
          firebaseObject.type='CompleteRequest';
          firebaseObject.Invalid='Invalid';
          if(firebaseObject.Invalid!==undefined)
          {
            api.logRequest(requestObject);
          }else{
            requestObject.reason='Error wrong arguments';
            api.logRequest(requestObject);
          }
          r.resolve(firebaseObject);
      });
    }else
    {
      console.log('server request');
      updateServer.update(requestObject).then(function(response)
      {
        var firebaseObject={};
        firebaseObject.requestKey=requestKey;
        firebaseObject.requestObject=requestObject;
        firebaseObject.type='CompleteRequest';
        r.resolve(firebaseObject);
      }).catch(function(response){
        var firebaseObject={};
        firebaseObject.requestKey=requestKey;
        firebaseObject.requestObject=requestObject;
        firebaseObject.type='CompleteRequest';
        firebaseObject.Invalid='Invalid';
        if(firebaseObject.Invalid!==undefined)
        {
          api.logRequest(requestObject);
        }else{
          requestObject.reason='Error wrong arguments';
          api.logRequest(requestObject);
        }
        console.log('Problems with update server request');
        r.resolve(firebaseObject);
      });
    }
  }).catch(function(error){
    console.log(error);
    var firebaseObject={};
    firebaseObject.requestKey=requestKey;
    firebaseObject.requestObject=requestObject;
    firebaseObject.type='CompleteRequest';
    firebaseObject.Invalid='Invalid';
    if(firebaseObject.Invalid!==undefined)
    {
      api.logRequest(requestObject);
    }else{
      requestObject.reason='Error wrong arguments';
      api.logRequest(requestObject);
    }
    r.resolve(firebaseObject);
  });

  return r.promise;
}
exports.resetPasswordBrowserListener=function(requestKey, requestObject)
{
  var r=q.defer();
  sqlInterface.getPatientFieldsForPasswordReset(requestObject.UserID).then(function(patient){
    console.log('Inside this function');
    console.log(patient);
    console.log(patient.SSN);
    if(requestObject.Request=='VerifySSN'){
      var unencrypted=utility.decryptObject(requestObject.Parameters,patient.SSN);
      console.log(unencrypted);
      if(typeof unencrypted.SSN!=='undefined'&&unencrypted.SSN!=='')
      {
        //console.log(patient.PatientSerNum);
        sqlInterface.getSecurityQuestions(patient.PatientSerNum).then(function(questions)
        {
          console.log(questions);
          var integer=Math.floor((questions.length*Math.random()));
          console.log(integer);
          questions[integer].type='success';
          var response={ResetPassword:questions[integer]};
          var firebaseObject={};
          firebaseObject.type='UploadToFirebase';
          firebaseObject.requestKey=requestKey;
          firebaseObject.requestObject=requestObject;
          firebaseObject.encryptionKey=patient.SSN;
          firebaseObject.object=response;
          r.resolve(firebaseObject);
        });
      }else{
        response.type='ResetPasswordError';
        response.requestKey=requestKey;
        response.requestObject=requestObject;
        r.resolve(response);
      }
    }else{
      sqlInterface.getSecurityQuestions(patient.PatientSerNum).then(function(questions)
      {
        console.log(questions);
        var flag=false;
        var newPassword='';
        for (var i = 0; i < questions.length; i++) {
          console.log(questions[i].Answer);
          var password={NewPassword:requestObject.Parameters.NewPassword};
          console.log(password);
          password=utility.decryptObject(password,questions[i].Answer);
          console.log(password);
          if(typeof password.NewPassword!=='undefined'&&password.NewPassword!==''){
            console.log(password.NewPassword);
            newPassword=CryptoJS.SHA256(password.NewPassword).toString();
            console.log(newPassword);
            console.log('I am the truth');
            flag=true;
          }
        }
        if(!flag)
        {
          //completeRequest(requestKey,{},'Invalid');
          console.log('Invalid flag');
        }else{
          console.log(patient);
          sqlInterface.setNewPassword(newPassword,patient.PatientSerNum, requestObject.Token).then(function(){
            var firebaseObject={};
            firebaseObject.requestKey=requestKey;
            firebaseObject.requestObject={};
            firebaseObject.type='CompleteRequest';
            r.resolve(firebaseObject);
          }).catch(function(response){
            console.log('Invalid setting password');
              //completeRequest(requestKey,{},'Invalid');
              var firebaseObject={};
              firebaseObject.requestKey=requestKey;
              firebaseObject.requestObject={};
              firebaseObject.type='CompleteRequest';
              firebaseObject.Invalid='Invalid';
              if(firebaseObject.Invalid!==undefined)
              {
                api.logRequest(requestObject);
              }else{
                requestObject.reason='Error wrong arguments';
                api.logRequest(requestObject);
              }
              r.resolve(firebaseObject);
          });
        }
      });
    }
  }).catch(function(response){
    var firebaseObject={};
    firebaseObject.requestKey=requestKey;
    firebaseObject.requestObject={};
    firebaseObject.type='CompleteRequest';
    firebaseObject.Invalid='Invalid';
    if(firebaseObject.Invalid!==undefined)
    {
      api.logRequest(requestObject);
    }else{
      requestObject.reason='Error wrong arguments';
      api.logRequest(requestObject);
    }
    r.resolve(firebaseObject);
  });
  return r.promise;
}
