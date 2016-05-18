var sqlInterface = require('./sqlInterface.js');
var utilities = require('./utilities.js');
var Q = require('q');
var exports = module.exports = {};
/*
* Sequence Analysis Grouping by cosine similarity
*/
exports.getSequences = function(argument)
{
  var r= Q.defer();
  sqlInterface.runSqlQuery(argument.CancerType, []).then(
   function(rows)
  {
 
        rows = utilities.eliminateAllUselessTasks(rows);        
        var sequencesPerPatient = getSequencesPerPatient(rows);
        /*rows = utilities.eliminateCRRAppointments(rows);
        rows = utilities.clearDupSequencialAliases(rows);
        rows = utilities.eliminateAllTasksAppointments(rows);
        rows = utilities.swapPairs(rows);
        //rows = utilities.clearDupSequencialAliases(rows);*/
        r.resolve(sequencesPerPatient);   
  });
  return r.promise;

};

function getSequencesPerPatient(rows)
{
     var patientSerNum  = rows[0].PatientSerNum;
  var objectSequence = {};
  objectSequence[rows[0].PatientSerNum] =[];
  for (var i = 0; i < rows.length; i++) {
    if(rows[i].PatientSerNum == patientSerNum)
    {
      objectSequence[patientSerNum].push(rows[i]);
    }else{
      patientSerNum = rows[i].PatientSerNum;
      objectSequence[patientSerNum] = [];
      objectSequence[patientSerNum].push(rows[i]);
    }
  }
  return objectSequence;
}