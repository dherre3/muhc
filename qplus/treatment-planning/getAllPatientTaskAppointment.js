var sqlInterface = require('./sqlInterface.js');
var utilities = require('./utilities.js');
var Q = require('q');
var exports = module.exports = {};

exports.getPatientInformation = function (patientSerNum)
{
    var r = Q.defer();
  sqlInterface.getPatientInformation(patientSerNum).then(function(rows)
  {   
      sqlInterface.getDiagnosisPatientInformation(patientSerNum).then(function(diagnosis){
        r.resolve({'Diagnosis':diagnosis, 'Fields':rows});   
      }).catch(function(error){
        r.reject(error); 
      });
  }).catch(function(error){
     r.reject(error);
  });
  
  return r.promise;
};