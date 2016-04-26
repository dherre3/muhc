var exports = module.exports = {};
var Q = require('q');
var sqlInterface = require('./sqlInterface.js');
var utility = require('./utility.js');
var validate = require('./validate.js');
var queries = require('./queries.js');
var timeEstimate = require('./timeEstimate.js');
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
      console.log(result);
      var date=new Date(result.DateTime);
      console.log('date of login', date);
      console.log(result);
      date.setDate(date.getDate()+1);
      var today=new Date();
      if(typeof result !=='undefined'&&result.Request=='Login')
      {
         result.Request='Logout';
         sqlInterface.updateLogout([result.Request,result.Username,result.DeviceId,result.SessionId,date]).then(function(response){
            console.log(response);
         },function(error){
            console.log(error);
         });
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
exports.checkCheckin = function(requestObject)
{
  var r = Q.defer();
  sqlInterface.checkCheckinInAria(requestObject).then(function(result){
    r.resolve({CheckCheckin:{response:result, AppointmentSerNum:requestObject.Parameters.AppointmentSerNum}});
  }).catch(function(error){
    r.reject({CheckCheckin:{response:result, AppointmentSerNum:requestObject.Parameters.AppointmentSerNum}});
  });
  return r.promise;
};
exports.checkinUpdate = function(requestObject)
{
  var r = Q.defer();
  var serNum = requestObject.Parameters.AppointmentSerNum;
  console.log(serNum);

  sqlInterface.runSqlQuery(queries.getAppointmentAriaSer(),[requestObject.UserID,serNum]).then(function(result)
  {
    result = result[0];
    console.log('results query', result);
    console.log(result.AppointmentAriaSer);
    timeEstimate.getEstimate(result.AppointmentAriaSer).then(
      function(estimate){
          console.log('Estimate:', estimate);
          r.resolve({CheckinUpdate: estimate});
      },function(error)
      {
        console.log('Estimate:', error);
        r.resolve({CheckinUpdate: error});
    });
  });
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
};
