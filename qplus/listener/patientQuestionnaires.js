var exports = module.exports = {};
var mysql = require('mysql');
var q = require('q');
var credentials = require('./credentials.js');

/*var sqlConfig={
  port:'/Applications/MAMP/tmp/mysql/mysql.sock',
  user:'root',
  password:'root',
  database:'ToxicityDB',
  dateStrings:true
};
/*
*Connecting to mysql database
*/
var sqlConfig={
  host:credentials.HOST,
  user:credentials.MYSQL_USERNAME,
  password:credentials.MYSQL_PASSWORD,
  database:'QuestionnaireDB',
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


var queryQuestions = "SELECT DISTINCT PatientQuestionnaire.QuestionnaireSerNum, Questionnaire.QuestionnaireName, QuestionnaireQuestion.OrderNum, Question.QuestionSerNum, Question.QuestionQuestion as QuestionText_EN, Question.QuestionName as Asseses_EN, Question.QuestionName_FR as Asseses_FR, Question.QuestionQuestion_FR as QuestionText_FR, QuestionType.QuestionType, QuestionType.QuestionTypeSerNum FROM PatientQuestionnaire, Questionnaire, Question, QuestionType, Patient, QuestionnaireQuestion WHERE Patient.PatientSerNum = PatientQuestionnaire.PatientSerNum AND PatientQuestionnaire.QuestionnaireSerNum = Questionnaire.QuestionnaireSerNum AND QuestionnaireQuestion.QuestionnaireSerNum = Questionnaire.QuestionnaireSerNum AND QuestionnaireQuestion.QuestionSerNum = Question.QuestionSerNum AND Question.QuestionTypeSerNum = QuestionType.QuestionTypeSerNum AND Patient.PatientAriaSer = ? AND PatientQuestionnaire.QuestionnaireSerNum IN ? ORDER BY QuestionnaireSerNum, OrderNum";
var queryQuestionChoices = "SELECT QuestionSerNum, MCSerNum as OrderNum, MCDescription as ChoiceDescription_EN, MCDescription_FR as ChoiceDescription_FR  FROM QuestionMC WHERE QuestionSerNum IN ? UNION ALL SELECT * FROM QuestionCheckbox WHERE QuestionSerNum IN ? UNION ALL SELECT * FROM QuestionMinMax WHERE QuestionSerNum IN ? ORDER BY QuestionSerNum, OrderNum DESC";
exports.getPatientQuestionnaires = function (rows)
{
  console.log(queryQuestions);
  var r = q.defer();
  console.log(rows);
  if(rows.length!== 0)
  {
    var fields = rows[0];
    var patientAriaSer = fields.PatientAriaSer;
    var questionnaireDBSerNumArray = getQuestionnaireSerNums(rows);
    var r = q.defer();
    var quer = connection.query(queryQuestions, [patientAriaSer, [questionnaireDBSerNumArray]], function(err,  questions, fields){
      if(err) r.reject(err);

      console.log('line 58', quer.sql);
      getQuestionChoices(questions).then(function(questionChoices){
        r.resolve(questionChoices);
      }).catch(function(err){
        r.reject(err);
      })
    });  
  }else{
    r.resolve([]);
  }
  return r.promise;
};

function getQuestionnaireSerNums(rows)
{
  var array = [];
  for (var i = 0; i < rows.length; i++) {
    array.push(rows[i].QuestionnaireDBSerNum);
  };
  return array;
}
function getQuestionChoices(rows)
{
  var r = q.defer();
  console.log('line 82 Questions', rows)
  var array = [];
  for (var i = 0; i < rows.length; i++) {
    array.push(rows[i].QuestionSerNum);
  };
  connection.query(queryQuestionChoices,[[array],[array],[array]],function(err,choices,fields){
    console.log(err);
    if(err) r.reject(err);
    var questions = attachChoicesToQuestions(rows,choices);
    //console.log(questions);
    r.resolve(questions);
  });
  return r.promise;
}
function attachChoicesToQuestions(questions,choices)
{

  for (var i = 0; i < questions.length; i++) {
    for (var j = choices.length - 1; j >= 0; j--) {
      if(questions[i].QuestionSerNum == choices[j].QuestionSerNum)
      {
        if(!questions[i].hasOwnProperty('Choices'))
        {
          questions[i].Choices = [];
        }
        questions[i].Choices.push(choices[j]);
        choices.splice(j,1);
      }
    };
  };
  return questions;
}