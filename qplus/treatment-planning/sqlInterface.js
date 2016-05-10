var mysql       = require('mysql');
var filesystem  =require('fs');
var Q           =require('q');

var sqlConfig={
  port:'/Applications/MAMP/tmp/mysql/mysql.sock',
  user:'root',
  password:'root',
  database:'sequencesTreatment',
  dateStrings:true
};

/*
*Re-connecting the sql database, NodeJS has problems and disconnects if inactive,
The handleDisconnect deals with that
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


var exports = module.exports = {};
exports.cancerMappings =
{
  'Breast':'%C50%',//174 -> 5 results
  'Prostate':'%C61%',//185 -> 5 results
  'Lung':'%C34%',//162 -> 0 results
  'Bladder':'%C67%',//0 -> results
  'Colon':'%C18%',
  'Rectal':'%C20%',
  'Leukimia':'%C95%'
};
exports.runSqlQuery = function(cancerType, parameters, processRawFunction)
{
  var r=Q.defer();
  connection.query(obtainCancerQuery(cancerType), function(err,rows,fields){
    if (err) {
      console.log(err);
      
      r.reject(err);
    }
    if(typeof rows !=='undefined')
    {

      if(processRawFunction&&typeof processRawFunction !=='undefined')
      {
        processRawFunction(rows).then(function(result)
        {
          r.resolve(result);
        });
      }else{
        r.resolve(rows);
      }
    }else{
      r.resolve([]);
    }
  });
  return r.promise;
};

function obtainCancerQuery (cancerType)
{
  var regex = exports.cancerMappings[cancerType];
  return "SELECT Appointment.AppointmentSerNum as StageSerNum, Appointment.PatientSerNum, Appointment.DiagnosisSerNum, Appointment.PrioritySerNum, Appointment.ScheduledStartTime as DateTime, Appointment.AliasSerNum, Alias.AliasName from Alias, Appointment, Diagnosis where Appointment.DiagnosisSerNum = Diagnosis.DiagnosisSerNum AND Diagnosis.DiagnosisCode LIKE  '"+regex+"' AND Alias.AliasSerNum = Appointment.AliasSerNum  union all SELECT Task.TaskSerNum, Task.PatientSerNum, Task.DiagnosisSerNum, Task.PrioritySerNum, Task.CreationDate, Task.AliasSerNum, Alias.AliasName from Task, Diagnosis, Alias  where Task.DiagnosisSerNum = Diagnosis.DiagnosisSerNum AND Diagnosis.DiagnosisCode LIKE '"+regex+"' AND Alias.AliasSerNum= Task.AliasSerNum Order by PatientSerNum, DateTime";
  /*return "SELECT Appointment.AppointmentSerNum as StageSerNum, Appointment.PatientSerNum, Appointment.DiagnosisSerNum, Appointment.PrioritySerNum, Appointment.ScheduledStartTime as DateTime, Appointment.AliasExpressionSerNum, Alias.AliasName from Alias, Appointment, Diagnosis where Appointment.DiagnosisSerNum = Diagnosis.DiagnosisSerNum AND Appointment.ScheduledStartTime > '2015-06-02' AND Diagnosis.DiagnosisCode LIKE  '"+regex+"' AND Alias.AliasSerNum = Appointment.AliasSerNum  union all SELECT Task.TaskSerNum, Task.PatientSerNum, Task.DiagnosisSerNum, Task.PrioritySerNum, Task.CreationDate, Task.AliasExpressionSerNum, Alias.AliasName from Task, Diagnosis, Alias  where Task.DiagnosisSerNum = Diagnosis.DiagnosisSerNum AND Diagnosis.DiagnosisCode LIKE '"+regex+"' AND Alias.AliasSerNum= Task.AliasSerNum AND Task.CreationDate > '2015-06-02' Order by PatientSerNum, DateTime";
  /*
  "SELECT Appointment.AppointmentSerNum as StageSerNum, Appointment.PatientSerNum, Appointment.DiagnosisSerNum, Appointment.PrioritySerNum, Appointment.ScheduledStartTime as DateTime, Appointment.AliasExpressionSerNum, AliasExpression.ExpressionName as AliasName from AliasExpression, Appointment, Diagnosis where Appointment.DiagnosisSerNum = Diagnosis.DiagnosisSerNum AND Diagnosis.DiagnosisCode LIKE  '"+regex+"' AND AliasExpression.AliasExpressionSerNum = Appointment.AliasExpressionSerNum  union all SELECT Task.TaskSerNum, Task.PatientSerNum, Task.DiagnosisSerNum, Task.PrioritySerNum, Task.CreationDate, Task.AliasExpressionSerNum, AliasExpression.ExpressionName as AliasName from Task, Diagnosis, AliasExpression  where Task.DiagnosisSerNum = Diagnosis.DiagnosisSerNum AND Diagnosis.DiagnosisCode LIKE '"+regex+"' AND AliasExpression.AliasExpressionSerNum = Task.AliasExpressionSerNum Order by PatientSerNum, DateTime"
  */
}