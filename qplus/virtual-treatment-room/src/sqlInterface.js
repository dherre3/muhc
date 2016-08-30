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
var request = require('request');
var credentials = require('./credentials.js');
module.exports = {};
/*var sqlConfig={
  port:'/Applications/MAMP/tmp/mysql/mysql.sock',
  user:'root',
  password:'root',
  database:'VirtualWaitingRoom',
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

var basicUrlPhp = "http://172.26.66.41/devDocuments/screens/php/";
var urlsVirtualWaitingRoom = 
{
  "ExamRooms":basicUrlPhp+"getExamRooms.php",
  "Checkin-Appointments":basicUrlPhp+"getCheckinsAll.php",
  "Checkin-Patient-Aria": basicUrlPhp + "checkInPatient.php",
  "Checkin-Patient-Medivisit":basicUrlPhp + "checkInPatientMV.php",
  "Similar-Checkins":basicUrlPhp+"similarCheckIns.php",
  "Resources":basicUrlPhp+"getResourcesAll.php"
};
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
        var response = '';
        request(urlsVirtualWaitingRoom["Checkin-Appointments"],function(error, response,body)
        {
            if(error) reject(error);
            if(!error&&response.statusCode=='200')
            {
              resolve(JSON.parse(body));
            }
        });
    });
};

var resourcesForDayQuery = "SELECT DISTINCT ClinicResources.ResourceName FROM ClinicResources, ClinicSchedule WHERE ClinicSchedule.Day =  ? AND ClinicSchedule.AMPM = ? AND ClinicResources.ClinicScheduleSerNum = ClinicSchedule.ClinicScheduleSerNum";
/**
* @method
* @name getResourcesForDay()
* @description Returns all the resources for a particular day
* @returns {promise} Promise containing the resources from the day using the WaitRoomManagement DB
*/ 
module.exports.getResourcesForDay = function()
{
  
  return new Promise(function(resolve, reject){
    request(urlsVirtualWaitingRoom["Resources"],function(error, response, body){
      if(error) reject(error);
      if(!error&&response.statusCode=='200')
      {
        console.log();
        resolve(JSON.parse(body));
      }

    });
  });
    /*var date = new Date();
  var timeOfDay = date.getHours() > 13 ? 'PM':'AM';
  var dayOfWeek = helperFunctions.getDayOfWeek(date);
      connection.query(resourcesForDayQuery, [dayOfWeek,timeOfDay],function(error, rows,fields)
      {
        console.log(error);
        if(error) reject(error);

        resolve(rows);
      });
    });*/
};
var resourceRoomQuery = "SELECT DISTINCT IntermediateVenue.AriaVenueId FROM ClinicResources, ClinicSchedule, ExamRoom, IntermediateVenue WHERE ClinicResources.ResourceName IN ? AND IntermediateVenue.IntermediateVenueSerNum = ExamRoom.IntermediateVenueSerNum AND  ClinicResources.ClinicScheduleSerNum =  ClinicSchedule.ClinicScheduleSerNum AND ClinicSchedule.DAY =  ? AND ClinicSchedule.AMPM =  ? AND ClinicSchedule.ExamRoomSerNum = ExamRoom.ExamRoomSerNum";
var resourceAllRoomsQuery = "SELECT DISTINCT IntermediateVenue.AriaVenueId FROM ClinicResources, ClinicSchedule, ExamRoom, IntermediateVenue WHERE ClinicResources.ClinicScheduleSerNum =  ClinicSchedule.ClinicScheduleSerNum AND ClinicSchedule.DAY =  ? AND ClinicSchedule.AMPM =  ? AND ClinicSchedule.ExamRoomSerNum = ExamRoom.ExamRoomSerNum";

//var resourceRoomQuery = "SELECT  ExamRoom.AriaVenueId  FROM IntermediateVenue, ExamRoom WHERE IntermediateVenue.IntermediateVenueSerNum = ExamRoom.IntermediateVenueSerNum AND IntermediateVenue.AriaVenueId = ?";
/**
 * @method
 * @name getRoomsResources
 * @description Obtains the rooms for an array of resources
 * @return {Promise} Returns promise that resolves to the checkin appointments for that moment
 */
module.exports.getVenueIdForResources = function(user, array)
{
  //Parameters for sql 
    var query = '';
    var params = [];
    
    //Parameters for query
    var date = new Date();
    var dayOfWeek = helperFunctions.getDayOfWeek(date);
    
    var timeOfDay = date.getHours() > 13 ? 'PM':'AM';
    console.log('Is array undefined', array);
    if(typeof array !=='undefined' && array.length > 0)
    {
      queryRooms = resourceRoomQuery;
      params = [[array],'Mon', timeOfDay];
    }else{
      queryRooms = resourceAllRoomsQuery;
      params = ['Mon', timeOfDay];
    }
    
    console.log(queryRooms);
    return new Promise(function(resolve, reject){
      var query = connection.query(queryRooms, params,function(error, rows)
      {
        console.log(error);
        if(error) reject(error);
        console.log('rows',rows);
        resolve(getRoomsOnly(rows));
      });
    });
    
};

module.exports.dischargePatient = function(user, parameters)
{
   return new Promise(function(resolve,reject){
    request({
    url: 'http://172.26.66.41/devDocuments/screens/php/dischargePatient.php',
    qs: parameters, //Query string data
    method: 'GET'},function(error,response,body)
    {
      if(error) reject(error);
      if(!error&&response.statusCode == '200')
      {
        resolve(body);
      }
    });
   });
};

module.exports.checkinPatientToLocation = function(user,parameters)
{
  var system = parameters.CheckinSystem;
  return new Promise(function(resolve,reject)
  { 
     var params = "?CheckinVenue="+parameters.CheckinVenue+"&ScheduledActivitySer="+parameters.ScheduledActivitySer; 
    var url= (system == 'Aria')?urlsVirtualWaitingRoom["Checkin-Patient-Aria"]+params: urlsVirtualWaitingRoom["Checkin-Patient-Medivisit"]+params;
    //var urlCheckin = { hostname:'172.26.66.41', path:"/devDocuments/screens/php/checkInPatient.php"+params};
    request(url,function(error, response, body){
      if(!error&&response.statusCode == 200)
      { 
        resolve('success');
      }else{  
        reject(error);
      }
    });
  });
};

var queryScreenName = "SELECT DISTINCT ExamRoom.Level, IntermediateVenue.ScreenDisplayName FROM IntermediateVenue, ExamRoom WHERE IntermediateVenue.IntermediateVenueSerNum = ExamRoom.IntermediateVenueSerNum AND IntermediateVenue.AriaVenueId = ?";
module.exports.screenName = function(user, parameters)
{

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
      var objectResponse = {};
      
      if (typeof parameters == 'undefined')
      {
        

        reject("No intermediate venue provided");
      }else{
        
        var que = connection.query(queryScreenName,[parameters.VenueId],function(err,rows, fields){
            console.log(err);
            if(err) reject(err);
            

            similarNames(parameters.SSN, parameters.FirstName).then(function(bool){
              objectResponse.similarNames = String(bool);
              objectResponse.screenName = rows[0].ScreenDisplayName;
              objectResponse.level = rows[0].Level;
              resolve(objectResponse);
            }).catch(function(error){
              reject(error);
            });
        }); 
      }
    });  
 
};

var examRoomsQueryPerResource  = "SELECT DISTINCT ExamRoom.AriaVenueId FROM `ExamRoom`, ClinicResources, ClinicSchedule WHERE  ClinicSchedule.ClinicScheduleSerNum = ClinicResources.ClinicScheduleSerNum AND ClinicSchedule.ExamRoomSerNum = ExamRoom.ExamRoomSerNum AND ClinicResources.ResourceName = ?";
var examRoomsQueryPerResourceAll  = "SELECT DISTINCT ExamRoom.AriaVenueId FROM `ExamRoom`, ClinicResources, ClinicSchedule WHERE  ClinicSchedule.ClinicScheduleSerNum = ClinicResources.ClinicScheduleSerNum AND ClinicSchedule.ExamRoomSerNum = ExamRoom.ExamRoomSerNum";
function getExamRoomsHelper(all, resource)
{
  return new Promise(function(resolve,reject)
  { 
    var url = (all)?examRoomsQueryPerResourceAll:examRoomsQueryPerResource;
    var sql = connection.query(url,[resource],function(error, rows,fields){
      if(error) reject(error);
      resolve(rows);
    });
  }); 
}
function getRoomsOnly(results)
{
  var array = [];
  console.log(results);
  for (var i = 0; i < results.length; i++) {
    array.push(results[i].AriaVenueId);
  }
  return array;
}

function similarNames(ssn, firstname)
{
  return new Promise(function(resolve,reject){
    if(10*Math.random()>5)
    {
      resolve(true);
    }else{
      resolve(false);
    }
    
  });
}



// module.exports.getExamRooms = function(user, resources)
// {
//   return new Promise(function(resolve,reject){
//     var promises = [];
//     var objectToReturn = {};
//     var all = (typeof resources !== 'undefined')?true:false;
//       console.log(all);
//     if(all)
//     {
//       for (var i = 0; i < resources.length; i++) {
//         promises.push(getExamRoomsHelper(all,resources[i])); 
//       }
//       var array = [];
//       Promise.all(promises).then(function(results)
//       {
        
//         for (var j = 0; j < results.length; j++) {
//           console.log(Object.prototype.toString.call( results[j] ) === '[object Array]');
//           array = array.concat(results[j]);

//         }
//         //Cleans out the AriasVenueId object
//         array = getRoomsOnly(array);
//         resolve(array);
//       }).catch(function(error){
//         reject(error);
//       }); 
//     }else{
//       getExamRoomsHelper(true).then(function(data){
//         data = getRoomsOnly(data);
//         resolve(data);
//       }).catch(function(error){
//         reject(error);
//       });
//     }
      
    
    
//   });
// };