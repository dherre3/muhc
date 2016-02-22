var appModule=angular.module('CredentialsAdminPanel',[]);
appModule.service('Credentials',[function(){

  //Hospital!!
  this.basicURL='http://172.26.66.41/devDocuments/david/muhc/qplus/';
  this.patientDocumentsURL='http://172.26.66.41/devDocuments/david/muhc/qplus/listener/Documents';
  this.doctorImagesURL='http://172.26.66.41/devDocuments/david/muhc/qplus/listener/Doctors';
  this.patientImagesURL='http://172.26.66.41/devDocuments/david/muhc/qplus/listener/Patients';
  this.url='http://172.26.66.41/devDocuments/david/muhc/qplus/php/mobile/fetchPatientData.php';
  this.mobileAppDataURL='http://172.26.66.41/devDocuments/david/muhc/qplus/php/mobile/fetchPatientData.php';
  this.mobileAppFolder='http://172.26.66.41/devDocuments/david/muhc/qplus/mobile';


  //Local version
  /*this.basicURL='http://localhost:8888/muhc/copyServer/qplus/';
  this.patientDocumentsURL='http://localhost:8888/muhc/copyServer/qplus/listener/Documents';
  this.doctorImagesURL='http://localhost:8888/muhc/copyServer/qplus/listener/Doctors';
  this.patientImagesURL='http://localhost:8888/muhc/copyServer/qplus/listener/Patients';
  this.mobileAppDataURL='http://localhost:8888/muhc/copyServer/qplus/php/mobile/fetchPatientData.php';
  this.mobileAppFolder='http://localhost:8888/muhc/copyServer/qplus/mobile';*/



  }]);
appModule.directive('loadApp', function() {
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {
            var url = scope.$eval(attrs.src);
            element.replaceWith('<object type="text/html" data="'+url+'" style="width:100%; height:100%; border:1px solid lightgrey;border-radius:2px">');
        }
    };
});
