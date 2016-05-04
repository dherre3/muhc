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

module.exports = {};
var sqlConfig={
  port:'/Applications/MAMP/tmp/mysql/mysql.sock',
  user:'root',
  password:'root',
  database:'QPlusApp',
  dateStrings:true
};
/*
*Connecting to mysql database
*/
/*var sqlConfig={
  host:credentials.HOST,
  user:credentials.MYSQL_USERNAME,
  password:credentials.MYSQL_PASSWORD,
  database:credentials.MYSQL_DATABASE,
  dateStrings:true
};*/
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
         var urlCheckin = {hostname: 'localhost',port: 8888, path: '/muhc/copyServer/qplus/virtual-treatment-room/php/getCheckinAppointments.php?david=herrera', agent:false};
      //making request to checkin
          var x = http.request(urlCheckin,function(res){
              res.on('data',function(data){                
                //Data from php.
                resolve(JSON.parse(data.toString()));
              });
              res.on('error',function(error){
                console.log(error);
                reject(error);
              });
          }).end();
    });
};
var resourcesQuery = "SELECT ClinicResources.ResourceName, ExamRoom.AriaVenueId FROM ClinicResources, ClinicSchedule, ExamRoom WHERE ClinicResources.ResourceName IN ? AND ClinicResources.ClinicScheduleSerNum =  ClinicSchedule.ClinicScheduleSerNum AND ClinicSchedule.DAY =  ? AND ClinicSchedule.AMPM =  ? AND ClinicSchedule.ExamRoomSerNum = ExamRoom.ExamRoomSerNum')";
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
      connection.query(resourcesQuery, [array, dayOfWeek, timeOfDay],function(error, rows)
      {
        if(error) reject(error);
        resolve(rows);
      });
    });
    
};









