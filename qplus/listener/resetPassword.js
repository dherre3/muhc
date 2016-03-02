var exports=module.exports={};
exports.resetPasswordRequest=function(requestKey, requestObject)
{
  var r=q.defer();
  sqlInterface.getPatientFieldsForPasswordReset(requestObject.UserID).then(function(patient){
    console.log(patient);
    console.log(patient.SSN);
    if(requestObject.Request=='VerifySSN'){
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
    }else{
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
            newPassword=CryptoJS.SHA256(password.NewPassword).toString();
            console.log(newPassword);
            console.log('I am the truth');
            flag=true;
          }
        }
        if(!flag)
        {
          //completeRequest(requestKey,{},'Invalid');
          console.log('Invalid flag');
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
    }
  }).catch(function(response){
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
  return r.promise;
}
