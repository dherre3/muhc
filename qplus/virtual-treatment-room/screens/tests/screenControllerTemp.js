var myApp = angular.module('screenApp', ['firebase','ngAudio']);

myApp.controller('screenControllerTemp', ['$scope','$http','$firebaseArray','$interval','ngAudio', function($scope,$http,$firebaseArray,$interval,ngAudio) {

    //=========================================================================
    // Setup the audio using ngAudio 
    //=========================================================================
    $scope.audio = ngAudio.load('sounds/dingding.wav');

    //=========================================================================
    // General useful stuff
    //=========================================================================
    $scope.debug_messages = "none";

    // get the time right now and do it on a regular basis so that the
    // right now time is updated continuouslsy
    $interval(function(){
      $scope.timeNow = new Date().getTime();
    },1000);


    //=========================================================================
    // Set the firebase connection 
    //=========================================================================
    var firebaseScreenRef = new Firebase("https://boiling-fire-1762.firebaseio.com/screen_1"); // FB JK
    var firebaseLogRef = new Firebase("https://boiling-fire-1762.firebaseio.com/logs"); // FB JK
    $scope.messages = $firebaseArray(firebaseScreenRef);
    $scope.logs= $firebaseArray(firebaseLogRef);

    $scope.debug_messages = $scope.debug_messages + " --- log- 0-" + $scope.logs.length;

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
