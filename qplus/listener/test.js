var credentials=require('./credentials.js');
var sqlInterface=require('./sqlInterface.js');
var queries=require('./queries.js');
var Firebase    =require('firebase');
//var q=require('Q');

sqlInterface.updateReadStatus('ac6eaeaa-f725-4b07-bdc0-72faef725985',{Field:'TxTeamMessages',Id:'2'}).then(function(result)
{
  console.log(result);
}).catch(function(error)
{
  console.log(error);
})

/*sqlInterface.runSqlQuery("SELECT Records.RecordSerNum, Records.DateAdded, Records.ReadStatus, EduMat.EducationalMaterialSerNum, EduMat.EducationalMaterialType_EN, EduMat.EducationalMaterialType_FR, EduMat.Name_EN, EduMat.Name_FR, EduMat.URL_EN, EduMat.URL_FR, EduMat.PhaseInTreatment, EduMat.DateAdded FROM EducationalMaterialTOC as TOC, Records as Records, EducationalMaterial  as EduMat, Patient WHERE EduMat.EducationalMaterialSerNum=Records.EducationalMaterialSerNum AND TOC.EducationalMaterialSerNum=EduMat.EducationalMaterialSerNum AND Patient.PatientSerNum = Records.PatientSerNum AND Patient.PatientSerNum=Users.UserTypeSerNum AND Users.Username = 'ac6eaeaa-f725-4b07-bdc0-72faef725985'  AND (EduMat.LastUpdated > ? OR Records.LastUpdated > ? OR TOC.LastUpdated > ?);",
[ 'ac6eaeaa-f725-4b07-bdc0-72faef725985',
  new Date('Wed Dec 31 1969 19:00:00 GMT-0500 (EST)'),
  new Date('Wed Dec 31 1969 19:00:00 GMT-0500 (EST)'),
  new Date('Wed Dec 31 1969 19:00:00 GMT-0500 (EST)')]
).then(function(res){
  console.log(res);
})*/


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
