var myApp = angular.module('patientAliasApp', ['ui.bootstrap']);

myApp.controller('patientAliasController', ['$scope','$http','$interval', function($scope,$http,$interval) {

    //=========================================================================
    // General useful stuff
    //=========================================================================
    $scope.debug_messages = "none";
    $scope.patientFound = false;

    //=========================================================================
    // Get the patient's information from Aria 
    //=========================================================================
    $scope.getAriaPatientInfo = function() {
      var findPatientUrl = "http://172.26.66.41/devDocuments/screens/php/getAriaPatientInfo.php?SSN=" + $scope.SSN;

      $scope.debug_messages = $scope.debug_messages + findPatientUrl;


      $http.get(findPatientUrl).success(function (data) {
        $scope.patientData = data; 
        $scope.patientFound = true;
      });

      $scope.debug_messages = $scope.debug_messages + $scope.patientData.LastName;

    }

    //=========================================================================
    // Function to set the patientAlias information in MySQL 
    //=========================================================================
    $scope.registerPatientAlias = function(patient){

      // Mark the patient as "called"
      patient.called = true;

      //-----------------------------------------------------------------------
    } 




}]);

