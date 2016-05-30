patientQuestionnaires.js

var exports = module.exports = {};
var mysql = module('mysql');
var q = module('q');

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
  database:'TocixityDB',
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

var queryToObtain = "SELECT DISTINCT Source.SourceName as Source, Toxicity.ToxicityQuestion, Toxicity.ToxicityName, Toxicity.ToxicitySerNum, ToxicityGrade.GradeDescription, ToxicityGrade.GradeSerNum, Question.OrderNum,Question.QuestionSerNum,  PatientQuestionnaire.QuestionnaireSerNum FROM Patient, PatientQuestionnaire, Questionnaire, Question, Source, Toxicity, ToxicityGrade WHERE Patient.PatientSerNum = PatientQuestionnaire.PatientSerNum AND Questionnaire.QuestionnaireSerNum = PatientQuestionnaire.QuestionnaireSerNum AND Questionnaire.QuestionnaireSerNum = Question.QuestionnaireSerNum AND Question.ToxicitySerNum = Toxicity.ToxicitySerNum AND Toxicity.SourceSerNum = Source.SourceSerNum AND Toxicity.ToxicitySerNum = ToxicityGrade.ToxicitySerNum AND Patient.PatientAriaSer = 0";

exports.getPatientQuestionnaires = function (patientAriaSer, questio)
{
  connection.query(quertyQuestionnaires, [patientAriaSer], )
};