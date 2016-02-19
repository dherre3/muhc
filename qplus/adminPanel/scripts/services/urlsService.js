var app=angular.module('adminPanelApp');

app.service('URLs',function(){
   var basicURL='http://172.26.66.41/devDocuments/david/muhc/qplus/';
   var patientDocumentsURL='http://172.26.66.41/devDocuments/david/muhc/qplus/listener/Documents';
   var doctorImagesURL='http://172.26.66.41/devDocuments/david/muhc/qplus/listener/Doctors';
   var patientImagesURL='http://172.26.66.41/devDocuments/david/muhc/qplus/listener/Patients';
   var basicURLPHP=basicURL+'php/'

   return{
     getBasicURLPHP:function(){
       return basicURLPHP;
     },
     getBasicUrl:function(){
       return basicURL;
     },
     getSendMessageUrl:function(){
       return basicURLPHP+'SendMessage.php';
     },
     getMessagesUrl:function(){
       return basicURLPHP+'GetMessages.php';
     },
     getPatientMessagesUrl:function(){
       return basicURLPHP+'GetPatientMessages.php';
     },
     getPatientDoctorsUrl:function(){
       return basicURLPHP+'GetDoctors.php';
     },
     getPatientAppointmentsUrl:function(){
       return basicURLPHP+'GetAppointments.php';
     },
     getPatientDiagnosisUrl:function(){
       return basicURLPHP+'GetPatientDiagnosis.php';
     },
     getCountOfPatientsUrl:function(){
       return basicURLPHP+'CountPatients.php';
     },
     getUpdateFieldUrl:function(){
       return basicURLPHP+'updateField.php';
     },
     getDocumentsUrl:function(){
       return basicURLPHP+'ObtainUserDocuments.php';
     },
     getUserUrl:function()
     {
       return basicURLPHP+'getUser.php';
     },
     getPatientUserUrl:function()
     {
       return basicURLPHP+'getPatientUser.php';
     },
     getPatientDocumentsUrl:function()
     {
       return patientDocumentsURL;
     },
     getDoctorImagesUrl:function()
     {
       return doctorImagesURL;
     },
     getPatientImageUrl:function()
     {
       return patientImagesURL;
     },
     getUserAuthenticationUrl:function()
     {
       return basicURLPHP+'Authenticate.php';
     },
     getValidatePasswordUrl:function()
     {
      return basicURLPHP+'validatePassword.php';
     },
     getUserInformation:function()
     {
      return basicURLPHP+'getUserFields.php';
     },
     getDoctorImageUrl:function()
     {
      return '/home/VarianFILEDATA/Doctors/';
     },
     readMessageUrl:function()
     {
      return basicURLPHP+'readMessage.php';
     },
     getActivityUrl:function()
     {
      return basicURLPHP+'patientActivity/getActivityLog.php';
     }


   };



 });
