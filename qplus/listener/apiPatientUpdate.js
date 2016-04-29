var exports = module.exports = {};
var Q = require('q');
var sqlInterface = require('./sqlInterface.js');
var utility = require('./utility.js');
var validate = require('./validate.js');
var queries = require('./queries.js');

/*
 *@name login
 *@requires slqInterface
 *@parameter(string) UserID Patients user ID
 *@description Grabs all the tables for the user and updates them to firebase
 */

exports.login = function (requestObject) {
  console.log('Inside Login function', requestObject);
  
    sqlInterface.getPatientDeviceLastActivity(requestObject.UserID,requestObject.DeviceId).then(function(result){
      var date=new Date(result.DateTime);
      date.setDate(date.getDate()+1);
      var today=new Date();
      if(typeof result !=='undefined'&&result.Request=='Login')
      {
         result.Request='Logout';
         sqlInterface.updateLogout([result.Request,result.Username,result.DeviceId,result.SessionId,date]).then(function(response){
            console.log('Updating logout', response);
         },function(error){
            console.log('Error updating logout', error);
         });
      }
    });
    sqlInterface.addToActivityLog(requestObject);
    return sqlInterface.getPatientTableFields(requestObject.UserID);
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
  return sqlInterface.getPatientTableFields(requestObject.UserID);
};
exports.refresh = function (requestObject) {
    var r = Q.defer();
    var UserId=requestObject.UserID;
    var parameters=requestObject.Parameters;
    var timestamp=requestObject.Timestamp;
    var objectToFirebase = {};
    if(!validate("Defined",parameters))
    {

      r.reject('Invalid');
    }
    if(parameters=='All'){
      sqlInterface.getPatientTableFields(UserId,timestamp).then(function(objectToFirebase){
        objectToFirebase = utility.resolveEmptyResponse(objectToFirebase);
        r.resolve(objectToFirebase);
      }).catch(function(error){
        r.reject(error);
      });
    }else {
      if(!(typeof parameters.constructor !=='undefined'&&parameters.constructor=== Array)) parameters=[parameters];
        if (!validate('RefreshArray', parameters)) {
            r.reject('Invalid');
        }
        sqlInterface.getPatientTableFields(UserId, timestamp, parameters).then(function (rows) {
            objectToFirebase=utility.resolveEmptyResponse(rows);
            r.resolve(objectToFirebase);
        },function(reason)
        {
          r.reject(reason);
        });
    }
    return r.promise;
};

//Check checkin API call
exports.checkCheckin = function(requestObject)
{
  return sqlInterface.checkCheckinInAria(requestObject);
};

//Get checkin update API call
exports.checkinUpdate = function(requestObject)
{
  return sqlInterface.runSqlQuery(queries.getAppointmentAriaSer(),[requestObject.UserID,requestObject.Parameters.AppointmentSerNum], sqlInterface.getTimeEstimate);
};

//Get Map Location API call 
exports.getMapLocation=function(requestObject)
{
   return sqlInterface.getMapLocation(requestObject);
};
