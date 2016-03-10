
var sqlInterface=require('./sqlInterface.js');
var queries=require('./queries.js');
var q=require('Q');



function processSelectRequest(table, userId, timestamp)
{
  var r=q.defer();
  var requestMappingObject=sqlInterface.requestMappings[table];
  if(typeof timestamp=='undefined')
  {
    var date=new Date(0);
  }else{
    var date=new Date(timestamp);
  }
  sqlInterface.runSqlQuery(requestMappingObject.sql, [userId,date],
    requestMappingObject.processFunction).then(function(rows)
    {
      console.log(rows);
      r.resolve(rows);
    },function(err)
    {
      console.log(err);
      r.reject(err);
    });
  return r.promise;
}
//processSelectRequest('Messages','ac6eaeaa-f725-4b07-bdc0-72faef725985');
processSelectRequest('Messages','ac6eaeaa-f725-4b07-bdc0-72faef725985','2015-12-14 11:16:16');


/*var requestSim={};
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
*/
