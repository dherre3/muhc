var exports = module.exports = {};

var sqlInterface = require('./sqlInterface.js');
var utilities = require('./utilities.js');
var Q = require('q');

/*
* Sequence Analysis Grouping by cosine similarity
*/
exports.groupingByCosineSimilarity = function(argument)
{
  var r= Q.defer();
  sqlInterface.runSqlQuery(argument.CancerType, []).then(
   function(rows)
  {
       /*rows = utilities.eliminateCRRAppointments(rows);
       rows = utilities.clearDupSequencialAliases(rows);
       rows = utilities.eliminateAllTasksAppointments(rows);
       rows = utilities.swapPairs(rows);
       //rows = utilities.clearDupSequencialAliases(rows);
       
       var sequencePerPatient = utilities.getSequencePerPatient(rows, 'AliasName', true);
       var arrayOfDistinctSequences = utilities.getArrayOfDistinctSequences(sequencePerPatient);
       var scoreObject = getSequenceTupleSimarityScoreObject(arrayOfDistinctSequences);
       //var objectSequence = getSequenceGroupings(arrayOfDistinctSequences, scoreObject, 0.54);        
       r.resolve(objectSequence);    */
       r.resolve([]);   
  });
  return r.promise;

};
exports.groupingByCosineSimilarity({CancerType:'Breast'});
function getSequenceGroupings(arrayOfDistinctSequences, scoreObject, score)
{
    var objectScore = {};    
    for (var i = 0; i < arrayOfDistinctSequences.length; i++) {
        objectScore[arrayOfDistinctSequences[i]] = [];
        for (var j = 0; j < arrayOfDistinctSequences.length; j++) {
            if(j!==i)
            {
                 var tuple = scoreObject.hasOwnProperty('('+arrayOfDistinctSequences[i]+' - '+arrayOfDistinctSequences[j]+')')?'('+arrayOfDistinctSequences[i]+' - '+arrayOfDistinctSequences[j]+')':'('+arrayOfDistinctSequences[j]+' - '+arrayOfDistinctSequences[i]+')';                 
                 if(scoreObject[tuple]<= score)
                 {
                     objectScore[arrayOfDistinctSequences[i]].push(arrayOfDistinctSequences[j]);
                 }  
            }    
        }
    }
    return objectScore;
}
function getSequenceTupleSimarityScoreObject(arrayOfDistinctSequences)
{
    var objectScore = {};    
    for (var i = 0; i < arrayOfDistinctSequences.length; i++) {
        for (var j = i+1; j < arrayOfDistinctSequences.length; j++) {
            var tuple = '('+arrayOfDistinctSequences[i]+' - '+arrayOfDistinctSequences[j]+')';
            var score = getCosineSimilarityScore(arrayOfDistinctSequences[i],arrayOfDistinctSequences[j]);
            objectScore[tuple] = score;   
        }
    }
    return objectScore;    
}

function getCosineSimilarityScore(sequence1,sequence2)
{
    var seq1 = sequence1.split(',');
    var seq2 = sequence2.split(',');
    seq1 = translateSequenceAlias(seq1);
    seq2 = translateSequenceAlias(seq2);
    var dotProductScore = vectorDotProduct(seq1,seq2);
    var magSeq1 = vectorMagnitude(seq1);
    var magSeq2 = vectorMagnitude(seq2);
    return 1 - ((Math.acos((dotProductScore)/(magSeq1*magSeq2)))/Math.PI);
}
function translateSequenceAlias(sequence)
{
    var array = [];
    for (var i = 0; i < sequence.length; i++) {
        array.push(utilities.translationMappings[sequence[i]]);
    }
    return array;
}
function vectorDotProduct(sequence1,sequence2)
{
    var sum = 0;
    var max = (sequence1.length>sequence2.length)? sequence1.length:sequence2.length;    
    for (var i = 0; i < max; i++) {
        if(i > sequence2.length-1 || i > sequence1.length-1 )
        {
            break;
        }else{
            sum += Number(sequence1[i])*Number(sequence2[i]);   
        }       
    }
    return sum;
}
function vectorMagnitude(seq)
{
    var sum = 0;
    for (var i = 0; i < seq.length; i++) {
       sum += Math.pow(Number(seq[i]),2);
    }   
    return Math.sqrt(sum);
}