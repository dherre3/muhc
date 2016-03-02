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
      if(result.Request=='Login')
      {
          var date=new Date(result.DateTime);
          date=date.setDate(date.getDate()-1);
          result.Request='Logout';
          result.Timestamp=date.getTime();
          sqlInterface.addToActivityLog(result);
      }
    });
    if(!validate('Login',UserID))
    {
      sqlInterface.getPatient(UserID).then(function (rows) {
          objectToFirebase.Patient = rows;

          sqlInterface.getPatientDoctors(UserID).then(function (rows) {
              objectToFirebase.Doctors = rows;

              sqlInterface.getPatientDiagnoses(UserID).then(function (rows) {
                  objectToFirebase.Diagnoses = rows;

                  sqlInterface.getPatientMessages(UserID).then(function (rows) {
                      objectToFirebase.Messages = rows;

                      sqlInterface.getPatientAppointments(UserID).then(function (rows) {
                          objectToFirebase.Appointments = rows;

                          sqlInterface.getPatientDocuments(UserID).then(function (rows) {
                              objectToFirebase.Documents = rows;

                              sqlInterface.getPatientNotifications(UserID).then(function (rows) {
                                  objectToFirebase.Notifications = rows;

                                  sqlInterface.getPatientTasks(UserID).then(function (rows) {
                                      objectToFirebase.Tasks = rows;

                                      sqlInterface.getPatientLabTests(UserID).then(function(rows){
                                         /*
                                       * Add additional fields for login in here!!!!
                                       */
                                        objectToFirebase.LabTests=rows;
                                        sqlInterface.addToActivityLog(requestObject);
                                        r.resolve(objectToFirebase);
                                      });


                                  });
                              });
                          });
                      });
                  });
              });
          });
      });
    }else{
      r.reject('Invalid');
    }

    return r.promise;
};
/*
*@name refresh
*@requires sqlInterface
*@parameter(string) UserID Patients User Id
*@parameter(string) Parameters, either an array of fields to be uploaded,
or a single table field.
*/
exports.refresh = function (requestObject) {
    var UserID=requestObject.UserID;
    var parameters=requestObject.Parameters;
    var r = Q.defer();
    var objectToFirebase = {};
    if(!validate("Defined",parameters))
    {

      r.reject('Invalid');
    }
    var paramArray=parameters.replace(" ","").split(",");
    if (paramArray.length>1) {
        if (!validate('RefreshArray', paramArray)) {
            r.reject('Invalid');
        }
        var queue = utility.Queue();
        queue.enqueueArray(paramArray);
        sqlInterface.cascadeFunction(UserID, queue, {}).then(function (rows) {
            objectToFirebase = rows;
            sqlInterface.addToActivityLog(requestObject);
            r.resolve(objectToFirebase);
        });
    } else if(parameters=='All'){
      exports.login(requestObject).then(function(objectToFirebase){
        r.resolve(objectToFirebase);
      });
    }else {
        if (!validate('RefreshField', parameters)) {
            r.reject('Invalid');
        }
        //validate(parameters)
        sqlInterface.refreshField(UserID, parameters).then(function (rows) {
            objectToFirebase = rows;
            sqlInterface.addToActivityLog(requestObject);
            r.resolve(objectToFirebase);
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
