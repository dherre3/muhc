var exports = module.exports = {};
var Q = require('q');
var sqlInterface = require('./sqlInterface.js');
var utility = require('./utility.js');
var validate = require('./validate.js');
/*
 *@name login
 *@requires slqInterface
 *@parameter(string) UserID Patients user ID
 *@description Grabs all the tables for the user and updates them to firebase
 */

exports.login = function (requestObject) {
    var r = Q.defer();
    var UserID=requestObject.UserID;
    var device=requestObject.DeviceId;
    var objectToFirebase = {};
    sqlInterface.getPatientDeviceLastActivity(UserID,device).then(function(result){
      var date=new Date(result.DateTime);
      date.setDate(date.getDate()+1);
      var today=new Date();
      if(result.Request=='Login'&&date<today)
      {
         result.Request='Logout';
         result.DateTime=utility.toMYSQLString(date);
         sqlInterface.updateLogout(result);
      }
    });
    sqlInterface.getPatientTableFields(UserID).then(function(objectToFirebase)
    {
      sqlInterface.addToActivityLog(requestObject);
      r.resolve(objectToFirebase);
    },function(reason){
      r.resolve(reason);
    });
    return r.promise;
};
/*
*@name refresh
*@requires sqlInterface
*@parameter(string) UserID Patients User Id
*@parameter(string) Parameters, either an array of fields to be uploaded,
or a single table field.
*/
exports.resume=function(requestObject)
{
  var r = Q.defer();
  var UserId=requestObject.UserID;
  sqlInterface.getPatientTableFields(UserId).then(function(objectToFirebase){
    r.resolve(objectToFirebase);
  }).catch(function(error){
    r.reject(error);
  });
  return r.promise;
};
exports.refresh = function (requestObject) {
    var r = Q.defer();
    var UserId=requestObject.UserID;
    var parameters=requestObject.Parameters;
    var timestamp=requestObject.Timestamp;
    console.log(requestObject);
    var objectToFirebase = {};
    if(!validate("Defined",parameters))
    {

      r.reject('Invalid');
    }
    if(parameters=='All'){
      sqlInterface.getPatientTableFields(UserId,timestamp).then(function(objectToFirebase){
        objectToFirebase=utility.resolveEmptyResponse(objectToFirebase);
        console.log(objectToFirebase);

        r.resolve(objectToFirebase);
      }).catch(function(error){
        r.reject(error);
      });
    }else {
      console.log(parameters);
      if(!(typeof parameters.constructor !=='undefined'&&parameters.constructor=== Array)) parameters=[parameters];
      console.log(parameters);
      console.log(timestamp);
        if (!validate('RefreshArray', parameters)) {
            r.reject('Invalid');
        }
        sqlInterface.getPatientTableFields(UserId, timestamp, parameters).then(function (rows) {
            objectToFirebase = rows;

            objectToFirebase=utility.resolveEmptyResponse(objectToFirebase);
              console.log(objectToFirebase);
            r.resolve(objectToFirebase);
        },function(reason)
        {
          r.reject(reason);
        });
    }
    return r.promise;
};

exports.getMapLocation=function(requestObject)
{
  var r=Q.defer();
  console.log(requestObject);
  sqlInterface.getMapLocation(requestObject).then(function(response)
  {
    var objectToSend={};
    objectToSend.MapLocation=response;
    console.log(response);
    r.resolve(objectToSend);
  }).catch(function(error){
    r.reject('Invalid');
  });
  return r.promise;
}
