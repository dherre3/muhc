var exports = module.exports = {};
var firebaseInterface = require('./firebaseInterface.js');
var sqlInterface = require('./sqlInterface.js');
var helperFunctions = require('./helperFunctions.js');
var CheckinAppointments = require('./checkinAppointments.js');
var bluebird = require('bluebird');
var Firebase = require('firebase');

var ref = new Firebase('https://brilliant-inferno-7679.firebaseio.com/VWR');
ref.child('requests').on('child_added',function(snapshot){
   var key = snapshot.key();
   var requestObject = snapshot.val();
   var user = requestObject.uid;
   console.log(requestObject);
   if(typeof requestObject !== 'undefined')
   {
     exports.processRequest(requestObject,function(data){
       data.Timestamp = Firebase.ServerValue.TIMESTAMP;
       ref.child(user+'/'+key).set(data);
       console.log(key);
       //console.log(ref.key());
       ref.child('requests').child(key).set({});
     });
   }
});
setInterval(function(){
  ref.on('child_added',function(child)
  {
    if(typeof child !=='undefined' && child !== 'requests')
    {
      var date = new Date(Number(child.Timestamp));
      if(child.Timestamp/(1000*60)>2)
      {
        ref.child(child).set(null);
      }
    }
  });
},60000);
exports.requests = {
  'Appointments-Resources':appointmentsResources,
  'Get-Rooms':sqlInterface.getVenueIdForResources,
  'Arrived-Patient':sqlInterface.checkinPatientToLocation,
  'Call-Patient':sqlInterface.screenName
};

exports.processRequest = function(requestObject,callback)
{
  var request = requestObject.request;
  var parameters = requestObject.parameters;
  var user = requestObject.uid;
  console.log(request);
  console.log(parameters);
  exports.requests[request](user, parameters).then(function(data){
    console.log(data);
    callback({response:'success',data:data});
  }).catch(function(error){
    callback({response:'error', data:error});
  });
};


function appointmentsResources()
{
  return new Promise(function(resolve, reject){
    sqlInterface.getAllCheckinAppointments().then(function(data){
    sqlInterface.getResourcesForDay().then(function(resources){
        var appointments =new CheckinAppointments(data);
        appointments.setResources(resources); 
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

