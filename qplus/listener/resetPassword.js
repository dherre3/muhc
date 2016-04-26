var sqlInterface=require('./sqlInterface.js');
var q=require('q');
var utility=require('./utility.js');
var CryptoJS=require('crypto-js');
var exports=module.exports={};
exports.verifySecurityAnswer=function(requestKey,requestObject,patient)
{
  var r=q.defer();
  var unencrypted=utility.decryptObject(requestObject.Parameters,patient.SSN);
  console.log('unencrypted parameters');
  console.log(unencrypted);
  console.log(patient.PatientSerNum);
  sqlInterface.getSecurityQuestions(patient.PatientSerNum).then(function(questions)
  {

    var flag=false;
    for (var i = 0; i < questions.length; i++) {

        if(unencrypted.Question==questions[i].Question&&questions[i].Answer==unencrypted.Answer)
        {
          console.log(questions[i].Question);
          console.log(questions[i].Answer);
          flag=true;
          break;
        }
    }
    if(flag)
    {
      console.log('boom');
      var firebaseObject={
        type:'UploadToFirebase',
        requestKey:requestKey,
        requestObject:requestObject,
        response:'Success',
        encryptionKey:patient.SSN,
        object:{VerifySecurityAnswer:{type:'Success'}}
      };
      r.resolve(firebaseObject);
    }else{
      var response={
        type:'ResetPasswordError',
        requestKey:requestKey,
        response:'Error',
        reason:'Incorrect answer to security question',
        requestObject:requestObject
      };
      r.resolve(response);
    }
  }).catch(function(error){
    var response={
      type:'ResetPasswordError',
      requestKey:requestKey,
      response:'Error',
      reason:'Incorrect SSN number',
      requestObject:requestObject
    };
    r.resolve(response);
  });
  return r.promise;
};

exports.resetPasswordRequest=function(requestKey, requestObject)
{
  var r=q.defer();
  console.log(requestObject.UserID);
  sqlInterface.getPatientFieldsForPasswordReset(requestObject.UserID).then(function(patient){
    console.log(patient);
    //Check for injection attacks by the number of rows the result is returning
    if(patient.length>1||patient.lenght === 0)
    {
      r.reject('Invalid');
      var response={
        type:'ResetPasswordError',
        requestKey:requestKey,
        response:'Error',
        reason:'No patient matches username, or injection attack',
        requestObject:requestObject
      };
      r.resolve(response);
    }else{
        if(requestObject.Request=='VerifySSN')
        {
          exports.verifySSN(requestKey, requestObject,patient[0]).then(function(response){
            r.resolve(response);
          });
        }else if(requestObject.Request=='SetNewPassword')
        {
        exports.setNewPassword(requestKey, requestObject,patient[0]).then(function(response){
            r.resolve(response);
          });
        }else if(requestObject.Request=='VerifySecurityAnswer'){
          exports.verifySecurityAnswer(requestKey, requestObject,patient[0]).then(function(response){
            r.resolve(response);
          });

        }
      }
}).catch(function(error){
  console.log(error);
  var response={
    type:'ResetPasswordError',
    requestKey:requestKey,
    response:'Error',
    reason:'Invalid arguments for query',
    requestObject:requestObject
  };
  r.resolve(response);
});
  return r.promise;

};
exports.setNewPassword=function(requestKey, requestObject,patient)
{
  var r=q.defer();
  sqlInterface.getSecurityQuestions(patient.PatientSerNum).then(function(questions)
  {
      console.log(questions);
      var flag=false;
      var newPassword='';
      for (var i = 0; i < questions.length; i++) {
        console.log(questions[i].Answer);
        var password={NewPassword:requestObject.Parameters.NewPassword};
        console.log(password);
        password=utility.decryptObject(password,questions[i].Answer);
        console.log(password);
        if(typeof password.NewPassword!=='undefined'&&password.NewPassword!==''){
          console.log(password.NewPassword);
          console.log('I am the truth');
          newPassword=CryptoJS.SHA256(password.NewPassword).toString();
          console.log(newPassword);
          flag=true;
        }
      }
      if(!flag)
      {
        var response={
          type:'ResetPasswordError',
          requestKey:requestKey,
          response:'Error',
          reason:'Invalid answer, rejecting request',
          requestObject:requestObject
        };
        r.resolve(response);
      }else{
        console.log(patient);
        sqlInterface.setNewPassword(newPassword,patient.PatientSerNum, requestObject.Token).then(function(){
          var firebaseObject={
            type:'CompleteRequest',
            response:'Success',
            requestKey:requestKey,
            requestObject:{}
          };
          r.resolve(firebaseObject);
        }).catch(function(response){
          console.log('Invalid setting password');
            //completeRequest(requestKey,{},'Invalid');
            var firebaseObject={
              type:'CompleteRequest',
              Invalid:'Invalid',
              response:'Error',
              requestKey:requestKey,
              reason:response,
              requestObject:{}
            };
            r.resolve(firebaseObject);
        });
      }
    });
    return r.promise;
  };
exports.verifySSN=function(requestKey, requestObject,patient)
{
    var r=q.defer();
    console.log(patient.SSN);
    var unencrypted=utility.decryptObject(requestObject.Parameters,patient.SSN);
    console.log(unencrypted);
    if(typeof unencrypted.SSN!=='undefined'&&unencrypted.SSN!=='')
    {
      //console.log(patient.PatientSerNum);
      sqlInterface.getSecurityQuestions(patient.PatientSerNum).then(function(questions)
      {
        console.log(questions);
        var integer=Math.floor((questions.length*Math.random()));
        console.log(integer);
        questions[integer].type='success';
        var response={ResetPassword:questions[integer]};
        var firebaseObject={
          type:'UploadToFirebase',
          requestKey:requestKey,
          requestObject:requestObject,
          response:'Success',
          encryptionKey:patient.SSN,
          object:response
        };
        console.log(firebaseObject);
        r.resolve(firebaseObject);
      });
    }else{
      var response={
        type:'ResetPasswordError',
        requestKey:requestKey,
        response:'Error',
        reason:'Incorrect SSN number',
        requestObject:requestObject
      };
      r.resolve(response);
    }

  return r.promise;
};
