var exports=module.exports={};
var Q = require('q');
var utility = require('./utility.js');
var sqlInterface = require('./sqlInterface.js');
var validate = require('./validate.js');
var timeEstimate = require('./timeEstimate.js');

exports.logout=function(requestObject)
{
  var r = Q.defer();
  if (!validate(requestObject)) {
      r.reject('Invalid');
  } else {
      sqlInterface.addToActivityLog(requestObject);
      r.resolve('Hospital Request Proccessed');
  }
  return r.promise;
}
exports.sendMessage=function(requestObject)
{
  var r = Q.defer();
  if (!validate(requestObject)) {
      r.reject('Invalid');
  } else {
      sqlInterface.sendMessage(requestObject).then(function (objectRequest) {
          r.resolve('Hospital Request Proccessed');
      });
  }
  return r.promise;
}
exports.inputFeedback=function(requestObject)
{
  var r = Q.defer();
  if (!validate(requestObject)) {
      r.reject('Invalid');
  } else {
      sqlInterface.inputFeedback(requestObject).then(function (requestObject) {
          //sqlInterface.addToActivityLog(requestObject);
        r.resolve('Hospital Request Proccessed');
      }).catch(function(error){
        r.reject(error);
      });
  }
  return r.promise;
}
exports.accountChange = function (requestObject) {
    var r = Q.defer();
    if (!validate('Hospital Request Proccessed')) {
        r.reject('Invalid');
    } else {
        sqlInterface.updateAccountField(requestObject).then(function (requestObject) {
          r.resolve('Hospital Request Proccessed');
        }).catch(function(error){
          r.reject(error);
        });
    }
    return r.promise;
};


exports.updateReadStatus=function(requestObject)
{
  var r=Q.defer();
  sqlInterface.updateReadStatus(requestObject.UserID,requestObject.Parameters).then(function(result)
  {
    r.resolve('Hospital Request Proccessed');
  }).catch(function(error){
    r.reject(error);
  });
  return r.promise;
}
exports.checkIn = function (requestObject) {
    var r = Q.defer();
    if (!validate('Hospital Request Proccessed')) {
        r.reject('Invalid');
    } else {
        sqlInterface.checkIn(requestObject).then(function (requestObject) {
          //sqlInterface.addToActivityLog(requestObject);
          r.resolve('Hospital Request Proccessed');
        }).catch(function(error){
          console.log(error);
          r.reject(error);
        });
    }
    return r.promise;
};
