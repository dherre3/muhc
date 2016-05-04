var myApp = angular.module('waitApp', ['firebase', 'ui.bootstrap','ngAudio']);

myApp.controller('waitControllerTest', ['$scope','$http','$firebaseArray','$interval','ngAudio', function($scope,$http,$firebaseArray,$interval,ngAudio) {

    //=========================================================================
    // General useful stuff
    //=========================================================================
    $scope.debug_messages = "none";

    //=========================================================================
    // Setup the audio using ngAudio 
    //=========================================================================
    //$scope.audio = ngAudio.load('sounds/dingding.wav');
    //$scope.audio = ngAudio.load('sounds/chime.wav');
    $scope.audio = ngAudio.load('sounds/magic.wav');

    // get the time right now and do it on a regular basis so that the
    // right now time is updated continuouslsy
    $interval(function(){
      $scope.timeNow = new Date().getTime();
    },1000);

    //=========================================================================
    // Set the firebase connection 
    //=========================================================================
    // Get today's date as we create a new firebase each day so as to log events
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
      dd='0'+dd
    } 

    if(mm<10) {
      mm='0'+mm
    } 

    today = mm+'-'+dd+'-'+yyyy;

    var FirebaseUrl = "https://boiling-fire-1762.firebaseio.com/" + today;

    var firebaseScreenRef = new Firebase(FirebaseUrl); // FB JK

    $scope.screenRows = $firebaseArray(firebaseScreenRef);

    //=========================================================================
    // Watch the number of patients in the firebase list. When it changes, 
    // play a sound
    //=========================================================================
    $scope.$watch(function(scope) { return scope.screenRows.length},
      function(newValue, oldValue) {
        if(newValue > oldValue) {
          $scope.audio.play();
        }
      }
    );

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


