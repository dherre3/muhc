var exports = module.exports = {};
var firebaseInterface = require('./firebaseInterface.js');
var sqlInterface = require('./sqlInterface.js');
var helperFunctions = require('./helperFunctions.js');
var CheckinAppointments = require('./checkinAppointments.js');

//Calling the main function
main();
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

