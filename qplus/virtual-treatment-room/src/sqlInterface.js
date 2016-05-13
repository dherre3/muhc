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
         resolve([ { ScheduledActivitySer: '1671409',
    ArrivalDateTime: 'Apr 29 2016 02:53:34:267PM',
    Expression1: 'FOLLOW UP',
    LastName: 'Arsenault',
    FirstName: 'Paul',
    PatientId: '5177985',
    ScheduledActivityCode: 'Open',
    ResourceName: 'Clin Nutrition',
    ScheduledStartTime: 'Apr 29 2016 03:00:00:000PM',
    ScheduledStartTime_hh: '15',
    ScheduledStartTime_mm: '0',
    TimeRemaining: '-123',
    WaitTime: '130',
    ArrivalDateTime_hh: '14',
    ArrivalDateTime_mm: '53',
    VenueId: 'S1 WAITING ROOM',
    DoctorName: 'Shenouda',
    PatientSer: '48341',
    CheckInSystem: 'Aria',
    SSN: 'ARS',
    DAYOFBIRTH: '05',
    MONTHOFBIRTH: '04' },
  { ScheduledActivitySer: '1671409',
    ArrivalDateTime: 'Apr 29 2016 02:53:34:267PM',
    Expression1: 'NUTRITION FOLLOW UP',
    LastName: 'Arsenault',
    FirstName: 'Paul',
    PatientId: '5177985',
    ScheduledActivityCode: 'Open',
    ResourceName: 'Clin Nutrition',
    ScheduledStartTime: 'Apr 29 2016 03:00:00:000PM',
    ScheduledStartTime_hh: '15',
    ScheduledStartTime_mm: '0',
    TimeRemaining: '-123',
    WaitTime: '130',
    ArrivalDateTime_hh: '14',
    ArrivalDateTime_mm: '53',
    VenueId: 'S1 WAITING ROOM',
    DoctorName: 'Shenouda',
    PatientSer: '48341',
    CheckInSystem: 'Aria',
    SSN: 'ARS',
    DAYOFBIRTH: '05',
    MONTHOFBIRTH: '04' },
  { ScheduledActivitySer: '1661887',
    ArrivalDateTime: 'Apr 29 2016 04:55:36:997PM',
    Expression1: '.EBC-Daily Rx',
    LastName: 'Ibrahim',
    FirstName: 'Jaafar',
    PatientId: '5104895',
    ScheduledActivityCode: 'In Progress',
    ResourceName: 'TB_5',
    ScheduledStartTime: 'Apr 29 2016 05:15:00:000PM',
    ScheduledStartTime_hh: '17',
    ScheduledStartTime_mm: '15',
    TimeRemaining: '12',
    WaitTime: '8',
    ArrivalDateTime_hh: '16',
    ArrivalDateTime_mm: '55',
    VenueId: 'RT TX ROOM 5',
    DoctorName: 'Souhami',
    PatientSer: '45644',
    CheckInSystem: 'Aria',
    SSN: 'IBR',
    DAYOFBIRTH: '15',
    MONTHOFBIRTH: '12' },
  { ScheduledActivitySer: '1671529',
    ArrivalDateTime: 'Apr 29 2016 01:39:55:927PM',
    Expression1: 'DRESSING',
    LastName: 'Keller',
    FirstName: 'Rhonda',
    PatientId: '0592642',
    ScheduledActivityCode: 'Open',
    ResourceName: 'Nursing Glen',
    ScheduledStartTime: 'Apr 30 2016 02:00:00:000AM',
    ScheduledStartTime_hh: '2',
    ScheduledStartTime_mm: '0',
    TimeRemaining: '537',
    WaitTime: '204',
    ArrivalDateTime_hh: '13',
    ArrivalDateTime_mm: '39',
    VenueId: 'S1 WAITING ROOM',
    DoctorName: 'Panet-Raymond',
    PatientSer: '48124',
    CheckInSystem: 'Aria',
    SSN: 'KEL',
    DAYOFBIRTH: '30',
    MONTHOFBIRTH: '57' },
  { ScheduledActivitySer: '6606',
    ArrivalDateTime: '2016-04-29 07:11:57',
    Expression1: 'CHM',
    LastName: 'Bitetto',
    FirstName: 'Gerardo',
    PatientId: '2063721',
    ScheduledActivityCode: 'Open',
    ResourceName: 'Chemotherapy Treatment - Glen',
    ScheduledDateTime: '2016-04-29 10:00:00',
    ScheduledStartTime_hh: '10',
    ScheduledStartTime_mm: '0',
    ScheduledStartTime: '2016-04-29 10:00:00',
    TimeRemaining: '-423',
    WaitTime: '591',
    ArrivalDateTime_hh: '7',
    ArrivalDateTime_mm: '11',
    VenueId: 'DRC Waiting Room',
    DoctorName: 'Chemotherapy Treatment - Glen',
    PatientSer: '487',
    CheckInSystem: 'Medivisit',
    SSN: 'BIT',
    DAYOFBIRTH: '26',
    MONTHOFBIRTH: '04' },
  { ScheduledActivitySer: '6619',
    ArrivalDateTime: '2016-04-29 07:25:38',
    Expression1: 'CHM',
    LastName: 'Crepeau',
    FirstName: 'Rene',
    PatientId: '5137947',
    ScheduledActivityCode: 'Open',
    ResourceName: 'Chemotherapy Treatment - Glen',
    ScheduledDateTime: '2016-04-29 10:00:00',
    ScheduledStartTime_hh: '10',
    ScheduledStartTime_mm: '0',
    ScheduledStartTime: '2016-04-29 10:00:00',
    TimeRemaining: '-423',
    WaitTime: '577',
    ArrivalDateTime_hh: '7',
    ArrivalDateTime_mm: '25',
    VenueId: 'DRC Waiting Room',
    DoctorName: 'Chemotherapy Treatment - Glen',
    PatientSer: '493',
    CheckInSystem: 'Medivisit',
    SSN: 'CRE',
    DAYOFBIRTH: '28',
    MONTHOFBIRTH: '04' },
  { ScheduledActivitySer: '6623',
    ArrivalDateTime: '2016-04-29 07:25:31',
    Expression1: 'HYD',
    LastName: 'Deveau',
    FirstName: 'Thelma',
    PatientId: '5086632',
    ScheduledActivityCode: 'Open',
    ResourceName: 'Treatment - Glen',
    ScheduledDateTime: '2016-04-29 00:00:00',
    ScheduledStartTime_hh: '0',
    ScheduledStartTime_mm: '0',
    ScheduledStartTime: '2016-04-29 00:00:00',
    TimeRemaining: '-1023',
    WaitTime: '577',
    ArrivalDateTime_hh: '7',
    ArrivalDateTime_mm: '25',
    VenueId: 'DRC Waiting Room',
    DoctorName: 'Treatment - Glen',
    PatientSer: '942',
    CheckInSystem: 'Medivisit',
    SSN: 'DEV',
    DAYOFBIRTH: '16',
    MONTHOFBIRTH: '51' },
  { ScheduledActivitySer: '6630',
    ArrivalDateTime: '2016-04-29 07:24:03',
    Expression1: 'INF',
    LastName: 'Frechette',
    FirstName: 'Celine',
    PatientId: '5137745',
    ScheduledActivityCode: 'Open',
    ResourceName: 'Treatment - Glen',
    ScheduledDateTime: '2016-04-29 00:00:00',
    ScheduledStartTime_hh: '0',
    ScheduledStartTime_mm: '0',
    ScheduledStartTime: '2016-04-29 00:00:00',
    TimeRemaining: '-1023',
    WaitTime: '579',
    ArrivalDateTime_hh: '7',
    ArrivalDateTime_mm: '24',
    VenueId: 'DRC Waiting Room',
    DoctorName: 'Treatment - Glen',
    PatientSer: '1073',
    CheckInSystem: 'Medivisit',
    SSN: 'FRE',
    DAYOFBIRTH: '29',
    MONTHOFBIRTH: '54' },
  { ScheduledActivitySer: '6638',
    ArrivalDateTime: '2016-04-29 10:27:15',
    Expression1: 'IVIG',
    LastName: 'Haskel',
    FirstName: 'Barbara',
    PatientId: '63788',
    ScheduledActivityCode: 'Open',
    ResourceName: 'Treatment - Glen',
    ScheduledDateTime: '2016-04-29 10:15:00',
    ScheduledStartTime_hh: '10',
    ScheduledStartTime_mm: '15',
    ScheduledStartTime: '2016-04-29 10:15:00',
    TimeRemaining: '-408',
    WaitTime: '395',
    ArrivalDateTime_hh: '10',
    ArrivalDateTime_mm: '27',
    VenueId: 'TX AREA H',
    DoctorName: 'Treatment - Glen',
    PatientSer: '552',
    CheckInSystem: 'Medivisit',
    SSN: 'HAS',
    DAYOFBIRTH: '15',
    MONTHOFBIRTH: '58' },
  { ScheduledActivitySer: '6648',
    ArrivalDateTime: '2016-04-29 07:32:18',
    Expression1: 'INF',
    LastName: 'Leduc',
    FirstName: 'Philippe',
    PatientId: '5077542',
    ScheduledActivityCode: 'Open',
    ResourceName: 'Treatment - Glen',
    ScheduledDateTime: '2016-04-29 00:00:00',
    ScheduledStartTime_hh: '0',
    ScheduledStartTime_mm: '0',
    ScheduledStartTime: '2016-04-29 00:00:00',
    TimeRemaining: '-1023',
    WaitTime: '570',
    ArrivalDateTime_hh: '7',
    ArrivalDateTime_mm: '32',
    VenueId: 'DRC Waiting Room',
    DoctorName: 'Treatment - Glen',
    PatientSer: '131',
    CheckInSystem: 'Medivisit',
    SSN: 'LED',
    DAYOFBIRTH: '07',
    MONTHOFBIRTH: '01' },
  { ScheduledActivitySer: '6658',
    ArrivalDateTime: '2016-04-29 14:05:54',
    Expression1: 'CHM',
    LastName: 'Mckenna',
    FirstName: 'Frances',
    PatientId: '1410857',
    ScheduledActivityCode: 'Open',
    ResourceName: 'Chemotherapy Treatment - Glen',
    ScheduledDateTime: '2016-04-29 14:15:00',
    ScheduledStartTime_hh: '14',
    ScheduledStartTime_mm: '15',
    ScheduledStartTime: '2016-04-29 14:15:00',
    TimeRemaining: '-168',
    WaitTime: '177',
    ArrivalDateTime_hh: '14',
    ArrivalDateTime_mm: '5',
    VenueId: 'TX AREA G',
    DoctorName: 'Chemotherapy Treatment - Glen',
    PatientSer: '371',
    CheckInSystem: 'Medivisit',
    SSN: 'MCK',
    DAYOFBIRTH: '18',
    MONTHOFBIRTH: '53' },
  { ScheduledActivitySer: '6674',
    ArrivalDateTime: '2016-04-29 10:23:18',
    Expression1: 'CHM',
    LastName: 'Stevens',
    FirstName: 'Pamela',
    PatientId: '103647',
    ScheduledActivityCode: 'Open',
    ResourceName: 'Chemotherapy Treatment - Glen',
    ScheduledDateTime: '2016-04-29 14:15:00',
    ScheduledStartTime_hh: '14',
    ScheduledStartTime_mm: '15',
    ScheduledStartTime: '2016-04-29 14:15:00',
    TimeRemaining: '-168',
    WaitTime: '399',
    ArrivalDateTime_hh: '10',
    ArrivalDateTime_mm: '23',
    VenueId: 'DRC Waiting Room',
    DoctorName: 'Chemotherapy Treatment - Glen',
    PatientSer: '478',
    CheckInSystem: 'Medivisit',
    SSN: 'STE',
    DAYOFBIRTH: '25',
    MONTHOFBIRTH: '51' },
  { ScheduledActivitySer: '6675',
    ArrivalDateTime: '2016-04-29 15:11:53',
    Expression1: 'CHM',
    LastName: 'Sun',
    FirstName: 'Liang',
    PatientId: '5153183',
    ScheduledActivityCode: 'Open',
    ResourceName: 'Chemotherapy Treatment - Glen',
    ScheduledDateTime: '2016-04-29 14:45:00',
    ScheduledStartTime_hh: '14',
    ScheduledStartTime_mm: '45',
    ScheduledStartTime: '2016-04-29 14:45:00',
    TimeRemaining: '-138',
    WaitTime: '111',
    ArrivalDateTime_hh: '15',
    ArrivalDateTime_mm: '11',
    VenueId: 'TX AREA C',
    DoctorName: 'Chemotherapy Treatment - Glen',
    PatientSer: '616',
    CheckInSystem: 'Medivisit',
    SSN: 'SUN',
    DAYOFBIRTH: '26',
    MONTHOFBIRTH: '11' } ]);
        /*var urlCheckin = { path: urlsVirtualWaitingRoom["Checkin-Appointments"]};
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
          }).end();*/
    });
};

var resourcesForDayQuery = "SELECT ClinicResources.ResourceName FROM ClinicResources, ClinicSchedule WHERE ClinicSchedule.Day =  ? AND ClinicSchedule.AMPM IN ( 'AM',  'PM') AND ClinicResources.ClinicScheduleSerNum = ClinicSchedule.ClinicScheduleSerNum"
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

module.exports.screenName = function(patient)
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
      

        //-----------------------------------------------------------------------
        // Message to screens - add this patient's details to our firebase
        // First create a child for this patient and then fill the data
        //-----------------------------------------------------------------------
        var patient_child = firebaseScreenRef.child(child_id); 
        patient_child.set(
		{ 
			FirstName: patient.FirstName, 
			LastName: patient.LastName, 
			PatientSer: patient.PatientSer, 
			Destination: $scope.PatientDestination.VenueId, 
			PatientStatus: "Called", 
			Appointment: patient.Expression1, 
			Resource: patient.ResourceName, 
			ScheduledActivitySer: patient.ScheduledActivitySer,
			Timestamp: Firebase.ServerValue.TIMESTAMP
		});
        $scope.debug_messages = $scope.debug_messages + " --- going to log--";

        $scope.debug_messages = $scope.debug_messages + " --- adding to log --";
      });
}
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




