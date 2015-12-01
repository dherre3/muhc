var Firebase    =require('firebase');
var utility=require('./utility.js');
var updateClient=require('./updateClient.js');
var updateServer=require('./updateServer.js');
var credentials=require('./credentials.js');
var api=require('./api.js');

//console.log(a);
//var requestTest={type:'pirlo',param:{david:'12121',andres:'andres'}};

//request(requestTest)
var ref=new Firebase(credentials.FIREBASE_URL);
ref.child('requests').on('child_added',function(requestsFromFirebase){
  var requestObject=requestsFromFirebase.val();
  var requestKey=requestsFromFirebase.key();
  request(requestKey,requestObject);
});


function request(requestKey, requestObject)
{

  requestObject.Request=utility.decryptObject(requestObject.Request);
  console.log(requestObject.Request);
  requestObject.Parameters=utility.decryptObject(requestObject.Parameters);
  if(requestObject.Request=='Login'||requestObject.Request=='Refresh')
  {
    updateClient.update(requestObject).then(function(objectToFirebase)
    {
        uploadToFirebase(requestKey, requestObject, objectToFirebase);

    }).catch(function(response){
        completeRequest(requestKey,requestObject,'Invalid');
    });
  }else
  {
    updateServer.update(requestObject).then(function(requestObject)
    {
        completeRequest(requestKey, requestObject);
    }).catch(function(response){
        completeRequest(requestKey,requestObject,'Invalid');
    });
 }

}
function uploadToFirebase(requestKey,requestObject,object)
{
  console.log('I am about to go to into encrypting');
  //console.log(request);
  object=utility.encryptObject(object);

  var deviceId=requestObject.DeviceId;
  var UserID=requestObject.UserID;
  var userFieldsPath='Users/'+UserID+'/'+deviceId;
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
