var mysql       = require('mysql');
var filesystem  =require('fs');
var Q           =require('q');
var groupBy = require('./groupingByPairSwapping.js');
var cosineGroup = require('./groupingByCosineVector.js');
var sqlInterface = require('./sqlInterface.js');
var utilities = require('./utilities.js');
var patientAll = require('./getAllPatientTaskAppointment.js');
var sequencesPerPatient = require('./sequencesPerPatient.js');
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

/*
* Sources
*/
//Primary malignant breast cancer in a female is classified to ICD-9-CM category 174
//Diagnosis Codes http://www.icd10data.com/ICD10CM/Codes/C00-D49
/*
* Actual Scripts for analysis
*/
var cancerMappings =
{
  'Breast':'%C50%',//174 -> 5 results
  'Prostate':'%C61%',//185 -> 5 results
  'Lung':'%C34%',//162 -> 0 results
  'Bladder':'%C67%',//0 -> results
  'Colon':'%C18%',
  'Rectal':'%C20%',
  'Leukimia':'%C95%'
};

var apiCalls =
{
  'SeqFreq':sequenceFrequencyAnalysis,
  'StepFreq':stepFrequencyAnalysis,
  'FixedStepFreq':bestIndexPerPositionAnalysis,
  'MissingFreq':missingFrequencyAnalysis,
  'GroupBySwappingPairsSimple':groupBy.groupingByPairSwappingSimple,
  'GroupByCosine':cosineGroup.groupingByCosineSimilarity,
  'SequencesPerPatient':sequencesPerPatient.getSequences,
  'GetPatient':patientAll.getPatientInformation,
};

var swapPairsMappings = 
{
   'Ct-Sim':'Consult Appointment',
   'READY FOR CONTOUR':'Ct-Sim',
   'READY FOR MD CONTOUR':'READY FOR CONTOUR',
   'READY FOR DOSE CALCULATION':'READY FOR MD CONTOUR',
   'READY FOR PHYSICS QA':'READY FOR DOSE CALCULATION',
   'READY FOR TREATMENT':'READY FOR PHYSICS QA',
   'End of Treament Note Task':'READY FOR TREATMENT'
};
function swapPairs(rows)
{
  for (var index = 0; index < rows.length-1; index++) {
    if(rows[index+1].AliasName == swapPairsMappings[rows[index].AliasName]&&rows[index+1].PatientSerNum == rows[index].PatientSerNum)
    {
      var temp = rows[index+1];
      rows[index+1] = rows[index];
      rows[index] = temp;
    }
  }
  return rows;
}

var exports=module.exports={};
//Query processing function
exports.proccessQuerySequence = function(argument, callback)
{
  console.log('main.js line59', argument);
  if(argument.NewAnalysis&&argument.Analysis == "SequencesPerPatient")
  {
   apiCalls[argument.Analysis](argument).then(function(result){
      callback(result);
    });
  }else if(argument.NewAnalysis&&argument.Analysis == "GetPatient"){
    apiCalls[argument.Analysis](argument.PatientSerNum).then(function(result){
      callback(result);
    });

  }else{
      sqlInterface.runSqlQuery(argument.CancerType, []).then(
    function(rows)
    {
      var result = apiCalls[argument.Analysis](rows, argument.swapPairs);
        callback(result);
    }).catch(function(error){
      console.log(error);
    });
  }
  
};


/*
* API function that obtains the sequence frequency in all patients
*/
function sequenceFrequencyAnalysis(rows, pairs)
{ 
  //Eliminate CRR appointments
  rows = utilities.eliminateAllUselessTasks(rows);

  //Eliminate duplicate aliases
  rows = clearDupSequencialAliases(rows);
  console.log(typeof pairs);
  if(pairs=='true')
  {
   console.log('main.js 109', pairs);   
   rows =  swapPairs(rows);
  }

  //Get the string sequence per patient
  var objectSequence = getSequencePerPatient(rows, 'AliasName', true);

  //Get number of patients
  var numberOfPatients = Object.keys(objectSequence).length;

  //Gets the frequency of sequences
  var frequencyObject = getFrequencyOfSequences(objectSequence);


  //Find total number of unclean sequences for percentage purposes.
  var totalNumberUncleanSequences = Object.keys(frequencyObject).length;

  //Get rid of the sequences with less than 4 steps
  //var cleanSequencesObject = clearIncompletePatients(frequencyObject);

  //Find total number of  sequences for percentage purposes.
  var totalNumberSequences = Object.keys(frequencyObject).length;
  //Find the top 20 sequences
  var topSequences = buildTopSequences(frequencyObject,40);
  console.log('I am done processing');
  var top = {
    NumberOfPatients:numberOfPatients,
    Top :topSequences,
    Total: totalNumberSequences
  };
  return top;
}


/*
* Sequence frequency analysis per step
*/
function stepFrequencyAnalysis(rows, pairs)
{
  //Eliminate CRR appointments
  rows = utilities.eliminateAllUselessTasks(rows);


  //Eliminate duplicate aliases
  rows = clearDupSequencialAliases(rows);
  //Get sequence per patient
if(pairs=='true')
  {
   console.log('main.js 109', pairs);   
   rows =  swapPairs(rows);
  }
  var objectSequence = getSequencePerPatient(rows, 'AliasName', true);
  //Set the frequency per AliasSerNum and position, find the best index for that AliasSerNum
  var orderStepFrequency = getStepFrequencyObject(objectSequence);

  return orderStepFrequency;
}
/*
* Finding the step frequency a second way
*/
function bestIndexPerPositionAnalysis(rows, pairs)
{
     //Eliminate CRR appointments
  rows = utilities.eliminateAllUselessTasks(rows);


  //Eliminate duplicate aliases
  rows = clearDupSequencialAliases(rows);
  //Get sequence per patient
   if(pairs=='true')
  {
   console.log('main.js 109', pairs);   
   rows =  swapPairs(rows);
  }
  var patientNumber = Object.keys(getSequencePerPatient(rows,'AliasName', false)).length;
 
  //Find step frequency deleting
  return getBestIndexSpot(rows);
}

//Helper
function getBestIndexSpot(rows)
{
  //Get the steps
    var steps = Object.keys(getSteps(rows, 'AliasName'));
    //Initialize array of positions
    var array = [];
    for (var i = 0; i < steps.length;i++) {
      //Initialize array for scoring of steps
      var stepsObject = getSteps(rows, 'AliasName');
      //Get patient sequence of remaining rows
      var objectSequence = getSequencePerPatient(rows,'AliasName', false);      
      for (var key in objectSequence) {   
        //Add a counter to the first spot found
        stepsObject[objectSequence[key][0]]++;
      }
      //Find the max object and its score
      var maxObject = findMaxAlias(stepsObject);
      maxObject.Number = (maxObject.Number*100)/Object.keys(objectSequence).length;
      //push max object
      array.push(maxObject);
      //Delete the rows with that alias and repeat
      rows = deleteAliasFromData(rows, maxObject.Alias); 
    }        
    return array;    
}
function deleteAliasFromData(rows, alias)
{
  var length = rows.length-1;
  for (var index = length; index >=0 ; index--) {
    if(rows[index].AliasName == alias)
    {
      rows.splice(index,1);
    }
  }
  return rows;
}


function findInstanceOfAlias(rows, alias)
{
  for (var index = 0; index < rows.length; index++) {
    if(rows[index].AliasName == alias)
    {
      return true;
    }  
  }
  return false;
  
}
function findMaxAlias(stepsObject)
{
  var max = 0;
  var maxAlias = '';
  for (var key in stepsObject) {
    if(stepsObject[key]>max)
    {
      maxAlias = key;
      max = stepsObject[key];
    }
  }
  return {Alias: maxAlias, Number:max};
}
function initObject(steps)
{
  var object = {};
  for (var index = 0; index < steps.length; index++) {
    object[(index+1)] = emptyArray(steps.length);
    
  }
}

/*
* Missing Steps Analysis
*/
function missingFrequencyAnalysis(rows,pairs)
{
  //Eliminate CRR appointments
  //rows = eliminateCRRAppointments(rows);
  rows = utilities.eliminateAllUselessTasks(rows);


  //Eliminate duplicate aliases
  rows = clearDupSequencialAliases(rows);
  if(pairs=='true')
  {
   rows =  swapPairs(rows);
  }
  //Get sequence per patient
  var patientSequences = getSequencePerPatient(rows, 'AliasName', false);

  //Initializes the object by finding all the distinct steps
  var missingStepsPatientNumber = getSteps(rows, 'AliasName');

  //Find frequency of missing steps per treatment plan
  missingStepsPatientNumber = populateMissingStepsPatientObject(missingStepsPatientNumber, patientSequences);
  return missingStepsPatientNumber;
}
function populateMissingStepsPatientObject(missingStepsObject, patientSequences)
{
  var steps = Object.keys(missingStepsObject);
  for (var patient in patientSequences) {

    var sequence = patientSequences[patient];
    for (var i = 0; i < steps.length; i++) {
      if(sequence.indexOf(steps[i]) == -1)
      {
        missingStepsObject[steps[i]]++;
      }
    }
  }
  return missingStepsObject;
}
function getSteps(rows, type)
{
  var object = {};
  for (var i = 0; i < rows.length; i++) {
    if(!object.hasOwnProperty(rows[i][type]))
    {
      object[rows[i][type]] = 0;
    }
  }
  return object;
}

//Finds the frequency of each AliasSerNum per position, or per step
function getStepFrequencyObject(objectSequence)
{
  var max = findMaximumNumberOfStepsPerPatient(objectSequence);
  var objectOfStepFrequencies = {};
  for (var patientSer in objectSequence) {
    var array = objectSequence[patientSer].split(",");
    for (var j = 0; j < array.length; j++) {
        if(!objectOfStepFrequencies.hasOwnProperty(array[j]))
        {
          objectOfStepFrequencies[array[j]] = {};
          var emptyArray = createEmptyArray(max);
          objectOfStepFrequencies[array[j]].Array = emptyArray;
          objectOfStepFrequencies[array[j]].Array[j] = 1;
        }else{
          objectOfStepFrequencies[array[j]].Array[j]++;
        }
    }
  }
  //Finding the most common spot for each Alias
  for (var alias in objectOfStepFrequencies) {
    //Find the max index for that particular alias
    var maxIndex = maxArray(objectOfStepFrequencies[alias].Array);
    var index = objectOfStepFrequencies[alias].Array.indexOf(maxIndex);
    objectOfStepFrequencies[alias].BestIndex = index;
  }
  return objectOfStepFrequencies;
}


function maxArray(a) {
  var max=a[0]; for(var i=0,j=a.length;i<j;i++){max=a[i]>max?a[i]:max;}
  return max;
}
function createEmptyArray(number)
{
   var array = [];
   for (var i = 0; i < number; i++) {
     array.push(0);
   }
   return array;

}
function findMaximumNumberOfStepsPerPatient(objectSequence)
{
  var max = 0;
  for (var patientSer in objectSequence) {
    var array = objectSequence[patientSer].split(",");
    if(array.length > max)
    {
      max = array.length;
    }
  }
  return max;
}
function eliminateCRRAppointments(rows)
{
  for (var i = rows.length-1;i >=0; i--) {

    if(rows[i].AliasName == 'CRR')
    {
      rows.splice(i,1);
    }
  }

  return rows;
}

function clearDupSequencialAliases(rows)
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
}


function getSequencePerPatient(rows, field, string)
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
}

function getFrequencyOfSequences(objectSequence)
{
  var frequencyObject = {};
  for (var key in objectSequence) {
    if(!frequencyObject.hasOwnProperty(objectSequence[key]))
    {
      frequencyObject[objectSequence[key]] = 1;
    }else{
      frequencyObject[objectSequence[key]] ++;
    }
  }
  return frequencyObject;
}

function clearIncompletePatients(frequencyObject)
{
   var cleanObject = JSON.stringify(frequencyObject);
   cleanObject = JSON.parse(cleanObject);
   for (var key in cleanObject) {
     var arrayKeys = key.split(",");
     if (arrayKeys.length < 4) {
       delete cleanObject[key];
     }
   }
   return cleanObject;
}
function deleteSequence(frequencyObject, sequencesArray)
{
  for (var i = 0; i < sequencesArray.length; i++) {
    delete frequencyObject[sequencesArray[i]];
  }
}
function findMaximumFrequence(frequencyObject)
{
  var maxObject = {Value:0};
  for (var sequence in frequencyObject) {
    if (frequencyObject[sequence] >= maxObject.Value)
    {
      maxObject.Value = frequencyObject[sequence];
    }
  }
  var maxArrayFrequencies = [];
  for (var seq in frequencyObject)
  {
    if (frequencyObject[seq] == maxObject.Value)
    {
      maxArrayFrequencies.push(seq);
    }
  }
  maxObject.maxArrayFrequencies = maxArrayFrequencies;
  return maxObject;
}

function buildTopSequences(frequencyObject, numberOfSequences)
{
  var top10 = [];
  for (var i = 0; i < numberOfSequences; i++) {
    var maxObject = findMaximumFrequence(frequencyObject);
    top10.push(maxObject);
    deleteSequence(frequencyObject,maxObject.maxArrayFrequencies);
  }
  return top10;
}
function numberOfPatients(rows)
{
  var count = 0;
  var serNum = 0;
  for (var i = 0; i < rows.length; i++) {
    if(rows[i].PatientSerNum !== serNum)
    {
      count++;
      serNum = rows[i].PatientSerNum;
    }
  }
  return count;
}

function FrequencyAnalysis(rows)
{
  this.rawData = rows;
  this.sequenceObjectPerPatient = {};
  this.numberOfPatients = -1;

  //Gets the sequence object where the keys are the patient ser num
  this.getSequenceObjectPerPatient = function(field, string)
  {
    if(Object.keys(this.sequenceObjectPerPatient).length === 0)
    {
      var patientSerNum  = this.rawData[0].PatientSerNum;
      var objectSequence = {};
      objectSequence[this.rawData[0].PatientSerNum] =[];
      var count = 0;
      var serNum = 0;
      for (var i = 0; i < rows.length; i++) {
        if(this.rawData[i].PatientSerNum == patientSerNum)
        {
          objectSequence[patientSerNum].push(this.rawData[i][field]);
        }else{
          if(string)
          {
            objectSequence[patientSerNum] = objectSequence[patientSerNum].toString();
          }
          patientSerNum = this.rawData[i].PatientSerNum;
          objectSequence[patientSerNum] = [];
          objectSequence[patientSerNum].push(this.rawData[i][field]);
        }
      }
      if(string)
      {
        objectSequence[patientSerNum] = objectSequence[patientSerNum].toString();
      }
      this.sequenceObjectPerPatient = objectSequence;
      return objectSequence;
    }else{
      return this.sequenceObjectPerPatient;
    }
  };
  this.getNumberOfPatients = function()
  {
    if(typeof this.numberOfPatients == 'undefined')
    {
      var count = 0;
      var serNum = 0;
      for (var i = 0; i < rows.length; i++) {
        if(this.rawData[i].PatientSerNum !== serNum)
        {
          count++;
          serNum = this.rawData[i].PatientSerNum;
        }
      }
      this.numberOfPatients = count;
      return count;
    }else{
      return this.numberOfPatients;
    }

  };

}
function runSqlQuery(query, parameters, processRawFunction)
{
  var r=Q.defer();
  connection.query(query, function(err,rows,fields){
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
}
