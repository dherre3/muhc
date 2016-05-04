var myApp = angular.module('screenApp', ['firebase','ngAudio']);

myApp.controller('screenController', ['$scope','$http','$firebaseArray','$interval','ngAudio', function($scope,$http,$firebaseArray,$interval,ngAudio) {
    //=========================================================================
    // General useful stuff
    //=========================================================================
    $scope.debug_messages = "none";

    //=========================================================================
    // Setup the audio using ngAudio 
    //=========================================================================
    $scope.audio = ngAudio.load('sounds/dingding.wav');

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
    $scope.messages = $firebaseArray(firebaseScreenRef);

    //=========================================================================
    // Watch the number of patients in the firebase list. When it changes, 
    // play a sound
    //=========================================================================
    $scope.$watch(function(scope) { return scope.messages.length},
      function(newValue, oldValue) {
        if(newValue > oldValue) {
          $scope.audio.play();
        }
      }
    );

    //=========================================================================
    // Function to play a sound 
    //=========================================================================
    $scope.playSound= function(){
    }
}]);

