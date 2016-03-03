
var sqlInterface=require('./sqlInterface.js');
var utility=require('./utility.js');

var requestSim={};
var username='ac6eaeaa-f725-4b07-bdc0-72faef725985';
var deviceId='browser';
sqlInterface.getPatientDeviceLastActivity(username, deviceId).then(function(result){
  var date=new Date(result.DateTime);
  console.log(result.DateTime);
  date.setDate(date.getDate()+1);
  var today=new Date();
  if(result.Request=='Login')
  {
       console.log(date);
      result.Request='Logout';
      result.DateTime=utility.toMYSQLString(date);
      console.log(result.DateTime);
      sqlInterface.updateLogout(result);
  }
});
