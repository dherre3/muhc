/**
 * SQL Interface Module
 * @module SQL/Interface
 * @see module:Firebase/Interface
 * @requires mysql
 * @requires bluebird
 * @requires http
 */

var mysql = require('mysql');
var bluebird = require('bluebird');
var helperFunctions = require('./helperFunctions.js');
var http = require('http');
var credentials = require('./credentials.js');
module.exports = {};
/*var sqlConfig={
  port:'/Applications/MAMP/tmp/mysql/mysql.sock',
  user:'root',
  password:'root',
  database:'QPlusApp',
  dateStrings:true
};*/

var sqlConfig = {
  host:credentials.HOST,
  user:credentials.MYSQL_USERNAME,
  password:credentials.MYSQL_PASSWORD,
  database:credentials.MYSQL_DATABASE,
  dateStrings:true
};
/*
*Connecting to mysql database
*/
var connection = mysql.createConnection(sqlConfig);

function handleDisconnect(myconnection) {
  myconnection.on('error', function(err) {
    console.log('Re-connecting lost connection');
    connection.destroy();
    connection = mysql.createConnection(sqlConfig);
    handleDisconnect(connection);
    connection.connect();
  });
}

handleDisconnect(connection);
//Get All checkin appointments using php script

/**
 * @method
 * @name getAllCheckinAppointments
 * @description Method calls John's script to obtain the list of checking appointments
 * @return {Promise} Returns promise that resolves to the checkin appointments for that moment
 */
module.exports.getAllCheckinAppointments = function()
{
    return new Promise(function(resolve, reject)
    {
      var urlCheckin = { path: urlsVirtualWaitingRoom["Checkin-Appointments"]};
      //making request to checkin
          var x = http.request(urlCheckin,function(res){
              res.on('data',function(data){                
                //Data from php.
                //console.log(data.toString());
                resolve(JSON.parse(data.toString()));
              });
              res.on('error',function(error){
                console.log(error);
                reject(error);
              });
          }).end();
    });
};

var resourcesForDayQuery = "SELECT DISTINCT ClinicResources.ResourceName, ClinicResources.FROM ClinicResources, ClinicSchedule WHERE ClinicSchedule.Day =  ? AND ClinicSchedule.AMPM IN ( 'AM',  'PM') AND ClinicResources.ClinicScheduleSerNum = ClinicSchedule.ClinicScheduleSerNum"
/**
* @method
* @name getResourcesForDay()
* @description Returns all the resources for a particular day
* @returns {promise} Promise containing the resources from the day using the WaitRoomManagement DB
*/ 
module.exports.getResourcesForDay = function()
{
  var date = new Date();
  var dayOfWeek = helperFunctions.getDayOfWeek(date);
  return new Promise(function(resolve, reject){
      var query = connection.query(resourcesForDayQuery, [dayOfWeek],function(error, rows)
      {
        if(error) reject(error);
        resolve(rows);
      });
    });
}
var resourceRoomQuery = "SELECT DISTINCT ClinicResources.ResourceName, ExamRoom.AriaVenueId FROM ClinicResources, ClinicSchedule, ExamRoom WHERE ClinicResources.ResourceName IN ? AND ClinicResources.ClinicScheduleSerNum =  ClinicSchedule.ClinicScheduleSerNum AND ClinicSchedule.DAY =  ? AND ClinicSchedule.AMPM =  ? AND ClinicSchedule.ExamRoomSerNum = ExamRoom.ExamRoomSerNum";
/**
 * @method
 * @name getRoomsResources
 * @description Obtains the rooms for an array of resources
 * @return {Promise} Returns promise that resolves to the checkin appointments for that moment
 */
module.exports.getRoomsResources = function(array)
{
    var date = new Date();
    var dayOfWeek = helperFunctions.getDayOfWeek(date);
    var timeOfDay = date.getHours()>12? 'PM':'AM';
    return new Promise(function(resolve, reject){
      var query = connection.query(resourceRoomQuery, [array, dayOfWeek, timeOfDay],function(error, rows)
      {
        if(error) reject(error);
        resolve(rows);
      });
    });
    
};
module.exports.getResourcesForDay().then(function(data){
  //console.log(data);
});
module.exports.getRoomsResources([['Tarek Hijal, MD (08221)','Tirek Hijal']]).then(function(data){
  //console.log(data);
});

var basicUrlPhp = "http://172.26.66.41/devDocuments/screens/php/";
var urlsVirtualWaitingRoom = 
{
  "ExamRooms":"http://172.26.66.41/devDocuments/screens/php/getExamRooms.php",
  "Checkin-Appointments":"http://172.26.66.41/devDocuments/screens/php/getCheckinAppointments.php",
  "Checkin-Patient-Aria": basicUrlPhp + "checkinPatient.php",
  "Checkin-Patient-Medivisit":basicUrlPhp + "checkinPatientMV.php",
  "Similar-Checkins":basicUrlPhp+"similarCheckIns.php"
};
module.exports.checkinPatientToLocation = function(system,parameters)
{
  return new Promise(function(resolve,reject)
  {
     var params = '?CheckinVenue='+parameters.CheckinVenue+'&ScheduledActivitySer='+parameters.ScheduledActivitySer; 
    var url= (system == 'Aria')?urlsVirtualWaitingRoom["Checkin-Patient-Aria"]+params: urlsVirtualWaitingRoom["Checkin-Patient-Medivisit"]+params;
    var urlCheckin = { path:url}
      //making request to checkin
          var x = http.request(urlCheckin,function(res){
              res.on('data',function(data){                
                //Data from php.
                //console.log(data.toString());
                resolve(JSON.parse(data.toString()));
              });
              res.on('error',function(error){
                console.log(error);
                reject(error);
              });
          }).end();
  });
};

module.exports.screenName = function(request)
{
  var patient = request.Parameters.Patient;
  var months = ["Jan", "Fev / Feb","Mar","Avr / Apr", "Mai / May","Jui / Jun","Jul","Aou / Aug","Sep","Oct","Nov","Dec"];
      // Mark the patient as "called"
      //patient.called = true;?

      //-----------------------------------------------------------------------
      // First, check that there are no other patients with similar names 
      // checked in. If there are, we will need to display extra identifier information
      // to ensure that the correct patient is called
      // Since we need the answer of how many other patients there are before
      // semding the data to the screens we need to put the update to Firebase 
      // inside the $http function 
      //-----------------------------------------------------------------------
    return new Promise(function(resolve,reject)
    {
      var params = '?FirstName='+patient.FirstName+'&LastNameFirstThree='+patient.SSN; 
      var urlScreenName = { path:urlsVirtualWaitingRoom["Similar-Checkins"]+params}
        //making request to checkin
            var x = http.request(urlScreenName,function(res){
                res.on('data',function(data){                
                  var names = JSON.parse(data.toString());
                  var child_id = patient.PatientSer + "-" + patient.ScheduledActivitySer + "-" + patient.ScheduledStartTime;    
                  if(names.length == 1){
                    patient.LastName = patient.SSN + "*****"; 
                   }else{
                    if(patient.MONTHOFBIRTH > 50){patient.MONTHOFBIRTH-=50;}
                    patient.MONTHOFBIRTH = months[Number(patient.MONTHOFBIRTH)];
                     patient.LastName = patient.SSN + " (Naissance / Birthday: " + patient.DAYOFBIRTH + " " + patient.MONTHOFBIRTH + ")";    
                  }
                  resolve(patient.LastName);
                });
                res.on('error',function(error){
                  console.log(error);
                  reject(error);
                });
            }).end();
    });  
 
};
module.exports.getExamRooms = function(resources)
{
  return new Promise(function(resolve,reject){
    var promises = [];
    var objectToReturn = {};
    for (var i = 0; i < resources.length; i++) {
      promises.push(getExamRoomsHelper(resources[i])); 
    }
    Promise.all(promises).then(function(results)
    {
     
      for (var j = 0; j < results.length; j++) {
        objectToReturn[resources[j]] = results[j];
      }
      resolve(objectToReturn);
    }).catch(function(error){
      reject(error);
    }); 
  });
};
function getExamRoomsHelper(examRoom)
{
  return new Promise(function(resolve,reject)
  {
    var urlCheckin = { path:urlsVirtualWaitingRoom.ExamRooms+'?'+'IntermediateVenue='+examRoom};
      //making request to checkin
          var x = http.request(urlCheckin,function(res){
              res.on('data',function(data){                
                //Data from php.
                //console.log(data.toString());
                resolve(JSON.parse(data.toString()));
              });
              res.on('error',function(error){
                console.log(error);
                reject(error);
              });
          }).end();
  });
  
}




