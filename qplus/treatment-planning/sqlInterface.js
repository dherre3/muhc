var mysql       = require('mysql');
var filesystem  =require('fs');
var Q           =require('q');
var credentials = require('./credentials.js');

/*var sqlConfig={
  port:'/Applications/MAMP/tmp/mysql/mysql.sock',
  user:'root',
  password:'root',
  database:'sequencesTreatment',
  dateStrings:true
};*/
var sqlConfig={
  host:credentials.HOST,
  user:credentials.MYSQL_USERNAME,
  password:credentials.MYSQL_PASSWORD,
  database:credentials.MYSQL_DATABASE,
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
  var sql = connection.query(obtainCancerQuery(cancerType), function(err,rows,fields){
    if (err) {
      console.log(rows);
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
  console.log(sql.sql);
  return r.promise;
};
exports.obtainSGASTask = function()
{
  var r = Q.defer();
 var query =  connection.query(obtainSGASTaskQuery(),function(err,rows,fields)
  {
    console.log(err);
    if(err) r.reject(err);
    r.resolve(rows);
  });
 console.log(query);
  return r.promise;
};

exports.getPatientInformation = function(patientSerNum)
{
  var r = Q.defer();
  connection.query(obtainPatientAllQuery(patientSerNum),function(err, rows,fields)
  {
     if(err) r.reject(err);
     r.resolve(rows);
  });
  return r.promise;
};
exports.getDiagnosisPatientInformation = function(patientSerNum)
{
  var r = Q.defer();
  connection.query(obtainDiagnosisAllPatient(patientSerNum),function(err, rows,fields)
  {
     if(err) r.reject(err);
     r.resolve(rows);
  });
  return r.promise;
};


function obtainPatientAllQuery(patientSerNum)
{
  return "SELECT Appointment.AppointmentSerNum as StageSerNum, Appointment.PatientSerNum, Appointment.DiagnosisSerNum, Priority.PriorityCode, Appointment.ScheduledStartTime as DateTime, Appointment.AliasSerNum, Alias.AliasName as AliasName from Priority, Alias, Appointment, Diagnosis where Appointment.DiagnosisSerNum = Diagnosis.DiagnosisSerNum AND Alias.AliasSerNum = Appointment.AliasSerNum  AND Appointment.PatientSerNum = Priority.PatientSerNum AND (Priority.PriorityCode = 'SGAS_P3' OR Priority.PriorityCode = 'SGAS_P4') AND Appointment.PatientSerNum = "+patientSerNum+" union all SELECT Task.TaskSerNum, Task.PatientSerNum, Task.DiagnosisSerNum, Priority.PriorityCode, Priority.CreationDate, Task.AliasSerNum, Alias.AliasName as AliasName from Priority, Task, Diagnosis, Alias  where Task.DiagnosisSerNum = Diagnosis.DiagnosisSerNum AND Alias.AliasSerNum = Task.AliasSerNum AND Task.PatientSerNum = Priority.PatientSerNum AND (Priority.PriorityCode = 'SGAS_P3' OR Priority.PriorityCode = 'SGAS_P4') AND Task.PatientSerNum = "+patientSerNum+" UNION ALL SELECT 0, PatientSerNum, 0,PriorityCode, CreationDate, '-', 'Medically Ready'  FROM Priority WHERE PriorityCode IN ('SGAS_P3', 'SGAS_P4') AND PatientSerNum = "+patientSerNum+"  Order by PatientSerNum, DateTime;";
}

function obtainDiagnosisAllPatient(patientSerNum)
{
  return "SELECT * FROM Diagnosis WHERE PatientSerNum = "+patientSerNum+";";
}












function obtainQueryWithoutSGAS(cancerType)
{
  return "SELECT Appointment.AppointmentSerNum as StageSerNum, Appointment.PatientSerNum, Appointment.DiagnosisSerNum, Priority.PriorityCode, Appointment.ScheduledStartTime as DateTime, Appointment.AliasSerNum, Alias.AliasName as AliasName from Priority, Alias, Appointment, Diagnosis where Appointment.DiagnosisSerNum = Diagnosis.DiagnosisSerNum AND Diagnosis.DiagnosisCode LIKE  '"+regex+"' AND Alias.AliasSerNum = Appointment.AliasSerNum  AND Appointment.PatientSerNum = Priority.PatientSerNum AND (Priority.PriorityCode = 'SGAS_P3' OR Priority.PriorityCode = 'SGAS_P4') AND Appointment.ScheduledStartTime  > '2015-06-02' union all SELECT Task.TaskSerNum, Task.PatientSerNum, Task.DiagnosisSerNum, Priority.PriorityCode, Task.CreationDate, Task.AliasSerNum, Alias.AliasName as AliasName from Priority, Task, Diagnosis, Alias  where Task.DiagnosisSerNum = Diagnosis.DiagnosisSerNum AND Diagnosis.DiagnosisCode LIKE '"+regex+"' AND Alias.AliasSerNum = Task.AliasSerNum AND Task.PatientSerNum = Priority.PatientSerNum AND (Priority.PriorityCode = 'SGAS_P3' OR Priority.PriorityCode = 'SGAS_P4') AND Task.CreationDate > '2015-06-02' AND Task.PatientSerNum NOT IN (SELECT App.PatientSerNum from Task as App WHERE App.CreationDate < '2015-06-02') Order by PatientSerNum, DateTime";
}
function obtainCancerQuery (cancerType)
{
  var regex = exports.cancerMappings[cancerType];
  return "SELECT Appointment.AppointmentSerNum as StageSerNum, Appointment.PatientSerNum, Appointment.DiagnosisSerNum, Priority.PriorityCode, Appointment.ScheduledStartTime as DateTime, Appointment.AliasSerNum, Alias.AliasName as AliasName from Priority, Alias, Appointment, Diagnosis where Appointment.DiagnosisSerNum = Diagnosis.DiagnosisSerNum AND Diagnosis.DiagnosisCode LIKE  '"+regex+"' AND Alias.AliasSerNum = Appointment.AliasSerNum  AND Appointment.PatientSerNum = Priority.PatientSerNum AND (Priority.PriorityCode = 'SGAS_P3' OR Priority.PriorityCode = 'SGAS_P4') AND Appointment.ScheduledStartTime  > '2015-06-02' union all SELECT Task.TaskSerNum, Task.PatientSerNum, Task.DiagnosisSerNum, Priority.PriorityCode, Task.CreationDate, Task.AliasSerNum, Alias.AliasName as AliasName from Priority, Task, Diagnosis, Alias  where Task.DiagnosisSerNum = Diagnosis.DiagnosisSerNum AND Diagnosis.DiagnosisCode LIKE '"+regex+"' AND Alias.AliasSerNum = Task.AliasSerNum AND Task.PatientSerNum = Priority.PatientSerNum AND (Priority.PriorityCode = 'SGAS_P3' OR Priority.PriorityCode = 'SGAS_P4') AND Task.CreationDate > '2015-06-02' UNION ALL SELECT 0, PatientSerNum, 0,PriorityCode, CreationDate, '-', 'Medically Ready'  FROM Priority WHERE CreationDate > '2015-06-02' AND PriorityCode IN ('SGAS_P3', 'SGAS_P4') AND PrioritySerNum IN (SELECT DISTINCT * FROM (SELECT DISTINCT Appointment.PrioritySerNum FROM Appointment, Diagnosis WHERE Diagnosis.DiagnosisCode LIKE '%C50%' AND Appointment.DiagnosisSerNum = Diagnosis.DiagnosisSerNum AND Appointment.ScheduledStartTime > '2015-06-02' UNION ALL SELECT DISTINCT Task.PrioritySerNum FROM Task, Diagnosis WHERE Diagnosis.DiagnosisCode LIKE '%C50%' AND Task.DiagnosisSerNum = Diagnosis.DiagnosisSerNum AND Task.CreationDate > '2015-06-02') as dummy ORDER BY PatientSerNum) Order by PatientSerNum, DateTime;";
  
  
  
  
  
  /*
  /*return "SELECT Appointment.AppointmentSerNum as StageSerNum, Appointment.PatientSerNum, Appointment.DiagnosisSerNum, Appointment.PrioritySerNum, Appointment.ScheduledStartTime as DateTime, Appointment.AliasExpressionSerNum, Alias.AliasName from Alias, Appointment, Diagnosis where Appointment.DiagnosisSerNum = Diagnosis.DiagnosisSerNum AND Appointment.ScheduledStartTime > '2015-06-02' AND Diagnosis.DiagnosisCode LIKE  '"+regex+"' AND Alias.AliasSerNum = Appointment.AliasSerNum  union all SELECT Task.TaskSerNum, Task.PatientSerNum, Task.DiagnosisSerNum, Task.PrioritySerNum, Task.CreationDate, Task.AliasExpressionSerNum, Alias.AliasName from Task, Diagnosis, Alias  where Task.DiagnosisSerNum = Diagnosis.DiagnosisSerNum AND Diagnosis.DiagnosisCode LIKE '"+regex+"' AND Alias.AliasSerNum= Task.AliasSerNum AND Task.CreationDate > '2015-06-02' Order by PatientSerNum, DateTime";
  /*
  "SELECT Appointment.AppointmentSerNum as StageSerNum, Appointment.PatientSerNum, Appointment.DiagnosisSerNum, Appointment.PrioritySerNum, Appointment.ScheduledStartTime as DateTime, Appointment.AliasExpressionSerNum, AliasExpression.ExpressionName as AliasName from AliasExpression, Appointment, Diagnosis where Appointment.DiagnosisSerNum = Diagnosis.DiagnosisSerNum AND Diagnosis.DiagnosisCode LIKE  '"+regex+"' AND AliasExpression.AliasExpressionSerNum = Appointment.AliasExpressionSerNum  union all SELECT Task.TaskSerNum, Task.PatientSerNum, Task.DiagnosisSerNum, Task.PrioritySerNum, Task.CreationDate, Task.AliasExpressionSerNum, AliasExpression.ExpressionName as AliasName from Task, Diagnosis, AliasExpression  where Task.DiagnosisSerNum = Diagnosis.DiagnosisSerNum AND Diagnosis.DiagnosisCode LIKE '"+regex+"' AND AliasExpression.AliasExpressionSerNum = Task.AliasExpressionSerNum Order by PatientSerNum, DateTime"
  */
}

function obtainSGASTaskQuery(cancerType)
{
   var regex = exports.cancerMappings[cancerType];
  //Cannot Garantee that this will be for each individual diagnosis
  return "SELECT PatientSerNum, CreationDate as DateTime, DueDateTime, PriorityCode as AliasName FROM Priority WHERE CreationDate > '2015-06-02' AND PriorityCode IN ('SGAS_P3', 'SGAS_P4') AND PatientSerNum IN (SELECT DISTINCT * FROM (SELECT DISTINCT Diagnosis.PatientSerNum FROM Appointment, Diagnosis WHERE Diagnosis.DiagnosisCode LIKE '"+regex+"' AND Appointment.DiagnosisSerNum = Diagnosis.DiagnosisSerNum AND Appointment.ScheduledStartTime > '2015-06-02' UNION ALL SELECT DISTINCT Diagnosis.PatientSerNum FROM Task, Diagnosis WHERE Diagnosis.DiagnosisCode LIKE '"+regex+"' AND Task.DiagnosisSerNum = Diagnosis.DiagnosisSerNum AND Task.CreationDate > '2015-06-02') as dummy ORDER BY PatientSerNum)ORDER BY PatientSerNum, PriorityCode;";
}