var exports = module.exports = {};
exports.translationMappings = {
    "CRR":"1",
   "Consult Appointment":"2",
   "Ct-Sim":"3",
   "End of Treament Note Task":"9",
   "READY FOR MD CONTOUR":"5",
   "READY FOR CONTOUR":"4",
   "READY FOR PHYSICS QA":"7",
   "READY FOR TREATMENT":"8",
   "READY FOR DOSE CALCULATION":"6",
   "Treatment Appointment":"10"
};
exports.swapPairsMappings = 
{
   'Ct-Sim':'Consult Appointment',
   'READY FOR CONTOUR':'Ct-Sim',
   'READY FOR MD CONTOUR':'READY FOR CONTOUR',
   'READY FOR DOSE CALCULATION':'READY FOR MD CONTOUR',
   'READY FOR PHYSICS QA':'READY FOR DOSE CALCULATION',
   'READY FOR TREATMENT':'READY FOR PHYSICS QA',
   'End of Treament Note Task':'READY FOR TREATMENT'
};
exports.swapPairs = function(rows)
{
  for (var index = 0; index < rows.length-1; index++) {
    if(rows[index+1].AliasName == exports.swapPairsMappings[rows[index].AliasName]&&rows[index+1].PatientSerNum == rows[index].PatientSerNum)
    {
      var temp = rows[index+1];
      rows[index+1] = rows[index];
      rows[index] = temp;
    }
  }
  return rows;
};

exports.getSequencePerPatient = function(rows, field, string)
{
  var patientSerNum  = rows[0].PatientSerNum;
  var objectSequence = {};
  objectSequence[rows[0].PatientSerNum] =[];
  var count = 0;
  var serNum = 0;
  for (var i = 0; i < rows.length; i++) {
    if(rows[i].PatientSerNum == patientSerNum)
    {
      objectSequence[patientSerNum].push(rows[i][field]);
    }else{
      if(string)
      {
        objectSequence[patientSerNum] = objectSequence[patientSerNum].toString();
      }
      patientSerNum = rows[i].PatientSerNum;
      objectSequence[patientSerNum] = [];
      objectSequence[patientSerNum].push(rows[i][field]);
    }
  }
  if(string)
  {
    objectSequence[patientSerNum] = objectSequence[patientSerNum].toString();
  }
  return objectSequence;
};
/**
 * Obtains the array of unique sequences
 * 
 * 
 */
exports.getArrayOfDistinctSequences = function(objectPatientSequence,asString)
{
    var uniqueSequencesObject ={};
    var array = [];
     for (var key in objectPatientSequence) {
         if (!uniqueSequencesObject.hasOwnProperty(objectPatientSequence[key])) {
             array.push(objectPatientSequence[key]);
             uniqueSequencesObject[objectPatientSequence[key]] = 1;
         }
     }
     return array;
};
exports.uselessAliases = {'2':'Consult Appointment','5':'End of Treatment Note Task',  '23':'Treatment Appointment', '24':'CRR', '25':'Consult Redirected','26':'Plus TX Code', '27':'Initial TX Code', 
'6':'End of Treatment Note Task', '40':'Follow-up Appointments','41':'Intra-Treatment Appointment','42':'','43':'','45':'', '48':'Machine Warmup Morning Appt', '49':'All Tasks'};
exports.eliminateAllUselessTasks = function (rows)
{
  for (var i =  rows.length-1; i >= 0; i--) {
    if(exports.uselessAliases.hasOwnProperty(rows[i].AliasSerNum))
    {
      rows.splice(i,1);
    }  
  } 
  return rows;
};
exports.clearDupSequencialAliases = function(rows)
{
  var current = -1;
  var patientSerNum = -1;
  for (var i = rows.length-1; i >= 0; i--) {
    if(patientSerNum == rows[i].PatientSerNum && rows[i].AliasName == current)
    {
      rows.splice(i,1);
    }else{
      current = rows[i].AliasName;
      patientSerNum = rows[i].PatientSerNum;
    }
  }
  return rows;
};

exports.eliminateCRRAppointments = function (rows)
{
  for (var i = rows.length-1;i >=0; i--) {

    if(rows[i].AliasName == 'CRR')
    {
      rows.splice(i,1);
    }
  }

  return rows;
}
exports.eliminateAllTasksAppointments = function (rows)
{
  for (var i = rows.length-1;i >=0; i--) {

    if(rows[i].AliasName == 'All Tasks')
    {
      rows.splice(i,1);
    }
  }

  return rows;
}