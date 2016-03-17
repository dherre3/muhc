var exports=module.exports={};
var Q=require('q');
var apiPatientUpdate=require('./apiPatientUpdate.js');
var apiHospitalUpdate=require('./apiHospitalUpdate.js');

var validate=require('./validate.js');
exports.processRequest=function(requestObject)
{
  var r=Q.defer();
  var type=requestObject.Request;
  var UserID=requestObject.UserID;
  var parameters=requestObject.Parameters;
  var objectToFirebase={};
  console.log(requestObject);
  //Types account change, Notification read, messages read, checkin,
  //Message
  if(!validate('DefinedObjectRequest',requestObject))
  {
    r.reject('Invalid');
  }
  if(type=='Login')
  {
    apiPatientUpdate.login(requestObject).then(function(objectToFirebase){
      r.resolve(objectToFirebase);
    }).catch(function(response)
    {
      r.reject(response);
    });
  }else if(type=='Resume')
  {
    apiPatientUpdate.resume(requestObject).then(function(objectToFirebase)
    {
      r.resolve(objectToFirebase);
    }).catch(function(response)
    {
      r.reject(response);
    });
  }else if(type=='Refresh')
  {
    apiPatientUpdate.refresh(requestObject).then(function(objectToFirebase)
    {
      r.resolve(objectToFirebase);
    }).catch(function(response)
    {
      r.reject(response);
    });
  }else if(type=='MapLocation'){
    apiPatientUpdate.getMapLocation(requestObject).then(function(objectToFirebase)
    {
      r.resolve(objectToFirebase);
    }).catch(function(response)
    {
      r.reject(reponse);
    });
  }else if(type=='MessageRead')
  {
    apiHospitalUpdate.readMessage(requestObject).then(function(response)
    {
      r.resolve(response);
    }).catch(function(response)
    {
      r.reject(response);
    });
  }else if(type=='NotificationRead')
  {
    apiHospitalUpdate.readNotification(requestObject).then(function(response)
    {
      r.resolve(response);
    }).catch(function(response)
    {
      r.reject(response);
    });
  }else if(type=='Checkin')
  {
    apiHospitalUpdate.checkIn(requestObject).then(function(response)
    {
      r.resolve(response);
    }).catch(function(response)
    {
      r.reject(response);
    });
  }else if(type=='Logout')
  {
    apiHospitalUpdate.logout(requestObject).then(function(response)
    {
      r.resolve(response);
    }).catch(function(response)
    {
      r.reject(response);
    });
  }else if(type=='Message')
  {
    console.log('I am about the send a message');
    apiHospitalUpdate.sendMessage(requestObject).then(function(response){
        r.resolve(response);
    }).catch(function(response)
    {
      r.reject(response);
    });
  }else  if(type=='AccountChange')
  {
    apiHospitalUpdate.accountChange(requestObject).then(function(response)
    {
      r.resolve(response);
    }).catch(function(response)
    {
      r.reject(response);
    });
  }else if(type=='Feedback')
  {
    apiHospitalUpdate.inputFeedback(requestObject).then(function(response)
    {
      r.resolve(response);
    }).catch(function(response)
    {
      r.reject(response);
    });
  }else{
    r.reject('Invalid');
  }

  return r.promise;
};
