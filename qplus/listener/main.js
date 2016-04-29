var Firebase    =require('firebase'),
    utility=require('./utility.js'),
    credentials=require('./credentials.js'),
    sqlInterface=require('./sqlInterface.js'),
    resetPasswordApi=require('./resetPassword.js'),
    CryptoJS=require('crypto-js'),
    q=require('q'),
    processApiRequest=require('./processApiRequest.js');


//Declaring Firebase reference
var ref=new Firebase(credentials.FIREBASE_URL);

//Authenticating with secret token
ref.authWithCustomToken(credentials.FIREBASE_SECRET, main);

//Main function backend
function main()
{
  console.log('Starting Server, listening to requests');
 
  //Instantiate instance of firebase to delete timeout requests
  deletingTimeoutRequests();

  //Processing Firebase Request
  ref.child('requests').on('child_added',function(requestsFromFirebase){
    var requestObject=requestsFromFirebase.val();
    var requestKey=requestsFromFirebase.key();
    if(requestObject.Request=='VerifySSN'||requestObject.Request=='SetNewPassword'||requestObject.Request=='VerifySecurityAnswer')
    {
      //Reset password API call
      resetPasswordApi.resetPasswordRequest(requestKey,requestObject).then(function(results)
      {
        console.log('Reset Password ');
        console.log(results);
        handleResponse(results);
      });
    }else{
      //Normal api request
      exports.apiRequestFormatter(requestKey, requestObject).then(function(results){
        handleResponse(results);
      });
    }
  });
}


//Helper function to simulate results
function handleResponse(data)
{
  console.log('Handling response');
  if(data.type=='UploadToFirebase')
  {
    console.log('Update to Firebase');
    uploadToFirebase(data.requestKey, data.encryptionKey,data.requestObject, data.object);
  }else if(data.type=='CompleteRequest')
  {
    completeRequest(data.requestKey,data.requestObject,data.Invalid);
  }else if(data.type=='ResetPasswordError')
  {
    resetPasswordError(data.requestKey,data.requestObject);
  }
}

//This handles the api requests by formating the response obtain from the API
exports.apiRequestFormatter=function(requestKey,requestObject)
{
  var r=q.defer();
  
  //Gets user password for decryptiong
  sqlInterface.getUsersPassword(requestObject.UserID).then(function(rows){
    if(rows.length>1||rows.length === 0)
    {
      //Rejects requests if username returns more than one password
      console.log('Rejecting request');
      //Construction of request object
      var firebaseObject={ requestKey:requestKey,requestObject:{},type:'CompleteRequest',Invalid:'Invalid',response:'Error', reason:'Injection attack'};       
      r.resolve(firebaseObject);
    }else{
      //Gets password and decrypts request
      var key=rows[0].Password;
      requestObject.Request=utility.decryptObject(requestObject.Request,key);
      var encryptionKey=key;
      //If requests after decryption is empty, key was incorrect, reject the request
      if(requestObject.Request === '') {
        console.log('Rejecting request');
        var errorObject={ requestKey:requestKey, requestObject:{},  type:'CompleteRequest',Invalid:'Invalid',response:'Error', reason:'Incorrect user password hash'};
        r.resolve(errorObject);
      }else{
        //Otherwise decrypt the parameters and send to process api request
        requestObject.Parameters=utility.decryptObject(requestObject.Parameters,key);
        
        //Process request simple checks the request and pipes it to the appropiate API call, then it receives the response
        processApiRequest.processRequest(requestObject).then(function(objectToFirebase)
        {
          var firebaseObject={};
          //Once its process if the response is a hospital request processed, simply delete request
          if(objectToFirebase=='Hospital Request Proccessed')
          {
              firebaseObject={requestKey:requestKey,requestObject:requestObject, encryptionKey:encryptionKey, type:'CompleteRequest', reason:'Finish Processing '+requestObject.Request,response:'Success'};
          }else{
            //Otherwise upload the user information to firebase
            console.log('I am done proccessing about to write');
              firebaseObject={requestKey:requestKey, requestObject:requestObject,encryptionKey:encryptionKey, type:'UploadToFirebase',object:objectToFirebase,response:'Success'};
          }
          console.log('Completing update client requests');
          r.resolve(firebaseObject);
        }).catch(function(response){
          console.log(response);
          //There was an error processing the request with the parameters, delete request
            var firebaseObject={requestKey:requestKey, requestObject:requestObject,encryptionKey:encryptionKey, type:'CompleteRequest', Invalid:'Invalid',reason:'Failed to retrieve fields from database, problems with database', response:'Error'};
            r.resolve(firebaseObject);
        });
      }
    }
  }).catch(function(error){
    console.log(error);
    var firebaseObject={requestKey:requestKey, requestObject:requestObject, type:'CompleteRequest', Invalid:'Invalid',reason:'Failed to retrieve users password', response:'Error'};
    r.resolve(firebaseObject);
  });

  return r.promise;
};


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

//Upload data response to firebase, once its done delete request
function uploadToFirebase(requestKey,encryptionKey,requestObject,object)
{
  console.log('I am about to go to into encrypting');
  //console.log(request);
  object=utility.encryptObject(object,encryptionKey);
  //console.log(object);
  var request=uploadSection(requestObject);
  var deviceId=requestObject.DeviceId;
  var UserID=requestObject.UserID;
  console.log(request);
  var userFieldsPath='Users/'+UserID+'/'+deviceId+'/'+request;
  console.log(userFieldsPath);
  object.Timestamp=Firebase.ServerValue.TIMESTAMP;
    console.log('I am about to write to firebase');
  ref.child(userFieldsPath).update(object, function(){
    console.log('I just finished writing to firebase');
    completeRequest(requestKey, requestObject);
    //logRequest(requestObject);
  });
}

//Delete the request
function completeRequest(requestKey, requestObject, invalid)
{
  //Clear request
  ref.child('requests').child(requestKey).set(null);
}

//Pick the path to upload request
function uploadSection(requestObject)
{
  if(requestObject.Request=='Login'||requestObject.Request=='Resume'||requestObject.Request=='All'||(requestObject.Request=='Refresh'&&requestObject.Parameters=='All'))
  {
    console.log(requestObject);
    return 'All';
  }else if((requestObject.Request=='Refresh'&&requestObject.Parameters instanceof Array)){
    return 'ArrayFields';
  }else if(requestObject.Request=='Refresh'){
    return 'Field';
  }else{
    return 'Field';
  }
}


//Deleting requests that timeout
function deletingTimeoutRequests()
{
  setInterval(function(){
  ref.child('Users').on('value',function(snapshot){
        //console.log(snapshot.val());
        var now=(new Date()).getTime();
        var usersData=snapshot.val();
        for (var user in usersData) {

          for(var device in usersData[user])
          {
            if(typeof usersData[user][device].Timestamp!=='undefined')
            {
              if(now-usersData[user][device].Timestamp>240000)
              {
                console.log('Deleting', user);
                ref.child('Users/'+user+'/'+device).set({});
              }
            }else{
              for(var request in usersData[user][device])
              {
                if(now-usersData[user][device][request].Timestamp>240000)
                {
                  console.log('Deleting', user);
                  ref.child('Users/'+user+'/'+device).set({});
                }
              }
            }
          }
        }
    });
  },60000);
}