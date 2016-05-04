var myApp = angular.module('waitApp');

myApp.controller('waitControllerTest', ['$scope','$http', function($scope,$http) {

    //=========================================================================
    // Get list of checked-in patients from Aria - use $interval to request the
    // list regularly (specified in miliseconds)
    //=========================================================================
    // Function to grab the list of patients
    function load_patients(){
      $http.get("http://172.26.66.41/devDocuments/screens/php/getCheckins.php").success(function(data){
        $scope.checkins=data;
      });
      $scope.debug_messages = $scope.debug_messages + "loading checkin data";
    };

    // call the function when the page is loaded so that we have data right away
    load_patients();

    // set the interval for page updates from Aria by polling Aria regularly
    $interval(function(){
      load_patients();
    },10000);



}]);


