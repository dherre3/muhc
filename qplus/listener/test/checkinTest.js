var Firebase    =require('firebase');
var utility=require('../utility.js');
var credentials=require('../credentials.js');
var q = require('Q');
var ref=new Firebase(credentials.FIREBASE_URL);
//Password dummy user
var password = '12345';
var pathToWrite = 'Users/ac6eaeaa-f725-4b07-bdc0-72faef725985/browser/Field';
//Test1 success
var test1 = {
  response:{
    type:'success'
  },
  info:{
    patientId:'51'
  },
  preceding:{
    'EN':'2 patients ahead of you',
    'FR':'2 patients ahead of you'
  },
  estimate:{
    'EN':'20 - 30',
    'FR':'20 - 30'
  },
  schedule:{
    'EN':'Approximately 10 minutes ahead of schedule',
    'FR':'Approximately 10 minutes ahead of schedule'
  }
}
//
//Test app checkin
ref.authWithCustomToken(credentials.FIREBASE_SECRET,function()
{
    //processRequest();
    ref.child('Users/ac6eaeaa-f725-4b07-bdc0-72faef725985/browser/Field/CheckinUpdate').set(null);
});

function processRequest()
{
  ref.child('requests').on('child_added', function(snap)
  {
    var value = snap.val();
    var request = utility.decryptObject(value.Request, password);
    var param = utility.decryptObject(value.Parameters,password);
    var object = {};
    object[request]={};
    if(request == 'CheckCheckin')
    {
      requestCheckin('CheckCheckin',{response:'failure', AppointmentSerNum:'23'})
    }else if(request == 'CheckinUpdate')
    {
      requestCheckin('CheckinUpdate', test1 )
    }else if(request == 'Checkin')
    {
      requestCheckin('Checkin', {response:'success'})
    }
  })
}

function requestCheckin(request, object)
{
  var objectToSend = {};
  objectToSend[request] = object
  objectToSend = utility.encryptObject(objectToSend, password);
  ref.child(pathToWrite).set(objectToSend)
}
//Testing App for responses

//Testing Checkin
//test1 successful checkin
requestCheckin('Checkin', {response:'success'})

//test2 unsuccessful checkin
requestCheckin('Checkin', {response:'failure'})

//Testing CheckCheckin

requestCheckin('CheckCheckin',{response:'success', AppointmentSerNum:'23'})
requestCheckin('CheckCheckin',{response:'failure', AppointmentSerNum:'23'})

//Testing CheckinUpdate

//Test1 success
var test1 = {
  response:{
    type:'success'
  },
  info:{
    patientId:'51'
  },
  preceding:{
    'EN':'2 patients ahead of you',
    'FR':'2 patients ahead of you'
  },
  estimate:{
    'EN':'20 - 30',
    'FR':'20 - 30'
  },
  schedule:{
    'EN':'Approximately 10 minutes ahead of schedule',
    'FR':'Approximately 10 minutes ahead of schedule'
  }
}
/*//Test2, close response
test1.response.type ='close';
var test2 = test1;
//Test3, error
test1.response.type ='error';
test1.response.reason ='Unable to obtain estimate';*/

//Testing CheckinUpdate
requestCheckin('CheckinUpdate', test1)

//Testing CheckCheckin
