var sqlInterface = require('./sqlInterface.js');
var utilities = require('./utilities.js');
var Q = require('q');

var exports = module.exports = {};
/*
* Sequence Analysis Grouping by swapping pairs.
*/

exports.groupingByPairSwappingSimple = function(argument)
{
  /**
   * First step, create copy of input
   */
  var r= Q.defer();
  sqlInterface.runSqlQuery(argument.CancerType, []).then(
   function(rows)
  {
        sqlInterface.runSqlQuery(argument.CancerType, []).then(
        function(rows2)
        {   
            //Clear all duplicate sequential entries
            rows = utilities.eliminateCRRAppointments(rows);
            rows2 = utilities.eliminateCRRAppointments(rows2);
            rows2 = utilities. eliminateAllTasksAppointments(rows2);
            rows = utilities. eliminateAllTasksAppointments(rows);

            
            rows = utilities.clearDupSequencialAliases(rows);
            rows2 = utilities.clearDupSequencialAliases(rows2);

            //Step 1: Create copy of array
            var originalArray = rows;
            //Swap incorrect steps
            var swappingArray = utilities.swapPairs(rows2);
           
            
            //
            var sequencePerPatientOriginal = utilities.getSequencePerPatient(originalArray, 'AliasName', true);

            var sequencePerPatientSwapping = utilities.getSequencePerPatient(swappingArray, 'AliasName', true);
            //Create object of distinct sequences
            var objectDistinctSequences = getDistinctSequenceObject(sequencePerPatientSwapping);
            //Add patients to distinct sequences
            objectDistinctSequence = addPatientsToDistinctSequences(sequencePerPatientSwapping,objectDistinctSequences);
            //Grouping sequences pair
            groupingSequencesPair = createGroupingsInSequences(objectDistinctSequence,sequencePerPatientOriginal);
            r.resolve(groupingSequencesPair);        
        });
  });
    return r.promise;
  
}
//exports.groupingByPairSwapping({CancerType:'Breast'});
function getDistinctSequenceObject(objectSequence)
{
    var distinctSequecePatients = {};
    for (var patientSerNum in objectSequence) {
        
        if (!distinctSequecePatients.hasOwnProperty(objectSequence[patientSerNum])) {
             distinctSequecePatients[objectSequence[patientSerNum]] = [];
        }
    }
    return distinctSequecePatients;
}

function addPatientsToDistinctSequences(sequencesSwapping, objectDistinctSequence)
{
    for (var patient in sequencesSwapping) {
        objectDistinctSequence[sequencesSwapping[patient]].push(patient);
    }
    return objectDistinctSequence;  
}
function createGroupingsInSequences(objectDistinctSequence,sequencePerPatientOriginal)
{
    for (var distinctSequence in objectDistinctSequence) {
        var array = objectDistinctSequence[distinctSequence];
        for (var index = array.length-1; index >= 0 ; index--) {
            if(sequencePerPatientOriginal[array[index]] == distinctSequence || sequenceNotAlreadyInArray(array,index,sequencePerPatientOriginal[array[index]]))
            {
                array.splice(index,1);
            }else{
                array[index] = sequencePerPatientOriginal[array[index]];
            }
        }
    }
    return  objectDistinctSequence;
}

function sequenceNotAlreadyInArray(array,index,sequence)
{
     for (var  i= index+1;  i < array.length; i++) {
        if(array[i] == sequence)
        {
            return true;
        }
     }
     return false;
}