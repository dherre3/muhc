var credentials=require('./credentials.js');
var sqlInterface=require('./sqlInterface.js');
var queries=require('./queries.js');
var Firebase    =require('firebase');
//var q=require('Q');



sqlInterface.runSqlQuery("SELECT Document.FinalFileName, Alias.AliasName_EN, Alias.AliasName_FR, Document.ReadStatus, Alias.AliasDescription_EN, Alias.AliasDescription_FR, Document.DocumentSerNum, Document.DateAdded FROM Document, Patient, Alias, AliasExpression, Users WHERE Document.AliasExpressionSerNum=AliasExpression.AliasExpressionSerNum AND Document.ValidEntry='Y' AND AliasExpression.AliasSerNum=Alias.AliasSerNum AND Patient.PatientSerNum=Document.PatientSerNum AND Users.UserTypeSerNum=Patient.PatientSerNum AND Users.Username LIKE ? AND (Document.LastUpdated > ? OR Alias.LastUpdated > ?);"
,[ 'ac6eaeaa-f725-4b07-bdc0-72faef725985',
  new Date('Mon Mar 21 2016 11:14:18 GMT-0400 (EDT)'),
  new Date('Mon Mar 21 2016 11:14:18 GMT-0400 (EDT)') ]
).then(function(res){
  console.log(res);
})
/*sqlInterface.getPatientTableFields('ac6eaeaa-f725-4b07-bdc0-72faef725985','2015-12-14 11:16:16',['Patient','Documents']).then(function(result){
  console.log(result);
});
testParameters('david',12312312,['1131','312312']);
testParameters('david',['1131','312312']);
testParameters('david',12312312);
testParameters('david');

function testParameters(userId, timestamp, array)
{
  if(arguments.length==3)
  {
    console.log('all three parameters, update only some fields')
  }else if(arguments.length==2)
  {
    if(typeof arguments[1] === 'object' && arguments[1].constructor === Array)
    {
      console.log('array')
    }else{
      console.log('timestamp')
    }
  }else{
    console.log('User name grab all fields');
  }
}*/


//if(variable.constructor === Array)

//processSelectRequest('Tasks','ac6eaeaa-f725-4b07-bdc0-72faef725985','2015-12-14 11:16:16');


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
      r.resolve(rows);
    },function(err)
    {
      console.log(err);
      r.reject(err);
    });
  return r.promise;
}

*/
