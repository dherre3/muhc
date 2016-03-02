var exports=module.exports={};
var Q = require('q');
var utility = require('./utility.js');
var sqlInterface = require('./sqlInterface.js');
var validate = require('./validate.js');

exports.logout=function(requestObject)
{
  var r = Q.defer();
  if (!validate(requestObject)) {
      r.reject('Invalid');
  } else {
      sqlInterface.addToActivityLog(requestObject);
      r.resolve(requestObject);
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
          //sqlInterface.addToActivityLog(requestObject);
          r.resolve(objectRequest);
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
        r.resolve(requestObject);
      }).catch(function(error){
        r.reject(error);
      });
  }
  return r.promise;
}
exports.accountChange = function (requestObject) {
    var r = Q.defer();
    if (!validate(requestObject)) {
        r.reject('Invalid');
    } else {
        sqlInterface.updateAccountField(requestObject).then(function (requestObject) {
          r.resolve(requestObject);
        }).catch(function(error){
          r.reject(error);
        });
    }
    return r.promise;
};
exports.checkIn = function (requestObject) {
    var r = Q.defer();
    if (!validate(requestObject)) {
        r.reject('Invalid');
    } else {
        sqlInterface.checkIn(requestObject).then(function (requestObject) {
          //sqlInterface.addToActivityLog(requestObject);
          r.resolve(requestObject);
        });
    }
    return r.promise;
};
