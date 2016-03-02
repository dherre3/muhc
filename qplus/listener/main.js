var Firebase    =require('firebase');
var utility=require('./utility.js');
var updateClient=require('./updateClient.js');
var updateServer=require('./updateServer.js');
var credentials=require('./credentials.js');
var sqlInterface=require('./sqlInterface.js');
var resetPasswordApi=require('./resetPassword.js');
var CryptoJS=require('crypto-js')
var q=require('q');
var api=require('./api.js');
var processApiRequest=require('./processApiRequest.js');
var ref=new Firebase(credentials.FIREBASE_URL);


ref.child('requests').on('child_added',function(requestsFromFirebase){
  var requestObject=requestsFromFirebase.val();
  var requestKey=requestsFromFirebase.key();
  if(requestObject.Request=='VerifySSN'||requestObject.Request=='SetNewPassword')
  {
    resetPasswordApi.resetPasswordRequest(requestKey,requestObject).then(function(results)
    {
      console.log('Reset Password ');
      console.log(results);
      handleResponse(results);
    });
  }else{
    exports.apiRequest(requestKey, requestObject).then(function(results){
      console.log('Api call from server.js')
      console.log(results);
      handleResponse(results);
    });
  }
});
function handleResponse(data)
{
  if(data.type=='UploadToFirebase')
  {
    uploadToFirebase(data.requestKey, data.encryptionKey,data.requestObject, data.object);
  }else if(data.type=='CompleteRequest')
  {
    completeRequest(data.requestKey,data.requestObject,data.Invalid);
  }else if(data.type=='ResetPasswordError')
  {
    resetPasswordError(data.requestKey,data.requestObject);
  }
}
exports.apiRequest=function(requestKey,requestObject)
{
  var r=q.defer();
  sqlInterface.getUsersPassword(requestObject.UserID).then(function(key){
    requestObject.Request=utility.decryptObject(requestObject.Request,key);
    var encryptionKey=key;
    console.log(requestObject.Request);

    if(requestObject.Request=='') {
      console.log('Rejecting request');
      var firebaseObject={
        requestKey:requestKey,
        requestObject:{},
        type:'CompleteRequest',
        Invalid:'Invalid',
        response:'Error',
        reason:'Incorrect user password hash'
      };
      r.resolve(firebaseObject);

    }
    requestObject.Parameters=utility.decryptObject(requestObject.Parameters,key);
    processApiRequest.processRequest(requestObject).then(function(objectToFirebase)
    {
      var firebaseObject={
        requestKey:requestKey,
        requestObject:requestObject,
        encryptionKey:encryptionKey,
        type:'UploadToFirebase',
        object:objectToFirebase,
        response:'Success'
      };
      r.resolve(firebaseObject);
      console.log('Completing update client requests');
    }).catch(function(response){
        var firebaseObject={
          requestKey:requestKey,
          requestObject:requestObject,
          encryptionKey:encryptionKey,
          type:'CompleteRequest',
          Invalid:'Invalid',
          reason:'Failed to retrieve fields from database, problems with database',
          response:'Error'
        };
        r.resolve(firebaseObject);
    });


    /*if(requestObject.Request=='Login'||requestObject.Request=='Refresh'||requestObject.Request=='MapLocation')
    {
      console.log('Im in there');
      updateClient.update(requestObject).then(function(objectToFirebase)
      {
        var firebaseObject={
          requestKey:requestKey,
          requestObject:requestObject,
          encryptionKey:encryptionKey,
          type:'UploadToFirebase',
          object:objectToFirebase,
          response:'Success'
        };
        r.resolve(firebaseObject);
        console.log('Completing update client requests');
      }).catch(function(response){
          var firebaseObject={
            requestKey:requestKey,
            requestObject:requestObject,
            encryptionKey:encryptionKey,
            type:'CompleteRequest',
            Invalid:'Invalid',
            reason:'Failed to retrieve fields from database, problems with database',
            response:'Error'
          };
          r.resolve(firebaseObject);
      });
    }else
    {
      console.log('server request');
      updateServer.update(requestObject).then(function(response)
      {
        var firebaseObject={
          requestKey:requestKey,
          requestObject:requestObject,
          type:'CompleteRequest',
          response:'Success'
        };
        r.resolve(firebaseObject);
      }).catch(function(response){
        var firebaseObject={
          requestKey:requestKey,
          requestObject:requestObject,
          type:'CompleteRequest',
          Invalid:'Invalid',
          reason:'Failed to upload database'+response,
          response:'Error'
        };
        r.resolve(firebaseObject);
      });
    }
  }).catch(function(error){
    console.log(error);
    var firebaseObject={
      requestKey:requestKey,
      requestObject:requestObject,
      type:'CompleteRequest',
      Invalid:'Invalid',
      reason:'Failed to retrieve users password',
      response:'Error'
    };
    r.resolve(firebaseObject);
  });*/

  return r.promise;
}


function resetPasswordError(requestKey,requestObject)
{
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
