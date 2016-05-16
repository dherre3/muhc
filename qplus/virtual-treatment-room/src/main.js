var exports = module.exports = {};
var firebaseInterface = require('./firebaseInterface.js');
var sqlInterface = require('./sqlInterface.js');
var helperFunctions = require('./helperFunctions.js');
var CheckinAppointments = require('./checkinAppointments.js');
var bluebird = require('bluebird');


exports.requests = {
  'Appointments-Resources':appointmentsResources
};
exports.processRequest = function(request, parameters,callback)
{
  exports.requests[request](parameters).then(function(data){
    callback(data);
  });
};


function appointmentsResources()
{
  return new Promise(function(resolve, reject){
    sqlInterface.getAllCheckinAppointments().then(function(data){
    sqlInterface.sqlInterface.getResourcesForDay().then(function(data){
        var appointments =new CheckinAppointments(data); 
        resolve({appointments:appointments.CheckinAppointments, resources:appointments.Resources});
      }).catch(function(error){
        console.log(error);
        reject(error);
      });
    }).catch(function(error){
      console.log(error);
      reject(error);
    });

  });
   
}



function main()
{
  //Initialize Firebase request!
  ///setInterval(function()
  //{
    sqlInterface.getAllCheckinAppointments().then(function(data){
    sqlInterface.sqlInterface.getResourcesForDay().then(function(data){
        var appointments =new CheckinAppointments(resources); 
        console.log(appointments);           
        firebaseInterface.writeToFirebase('checkin-appointments', appointments.CheckinAppointments);
        firebaseInterface.writeToFirebase('Resources', resources); 
    });

    }); 
 // },10000);
  startRequestListener();
 
}

function startRequestListener()
{
  firebaseInterface.firebaseRefRequest.on('child_added', function(snap)
  {
    //key: user, Value:request
    console.log(snap.key(), snap.val());
    var snapshot = snap.val();
    
     api.processRequest(snapshot.request, snapshot.parameters).then(function(data)
     {
       console.log(data);
       firebaseInterface.replyRequest(snap.key(), snap.val(),data);
     });
  });
}

