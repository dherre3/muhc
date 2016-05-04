var exports = module.exports = {};
var firebaseInterface = require('./firebaseInterface.js');
var sqlInterface = require('./sqlInterface.js');
var helperFunction = require('./helperFunctions.js');
var CheckinAppointments = require('./checkinAppointments.js');

//Calling the main function
main();
function main()
{
  //Initialize Firebase request!
  setInterval(function()
  {
    sqlInterface.getAllCheckinAppointments().then(function(data){
      var appointments =new CheckinAppointments(data);      
      console.log(appointments.CheckinAppointments);
      
      firebaseInterface.writeToFirebase('checkin-appointments', appointments.CheckinAppointments);
      firebaseInterface.writeToFirebase('Resources', appointments.Resources);
    }); 
  },1000);
  startRequestListener();
 
}

function startRequestListener()
{
  firebaseInterface.firebaseRefRequest.on('child_added', function(snap)
  {
    //key: user, Value:request
     api.processRequest(snap.key(), snap.val()).then(function(data)
     {
       firebaseInterface.writeResponseToRequest(data.user, data.response);
     });
  });
}

