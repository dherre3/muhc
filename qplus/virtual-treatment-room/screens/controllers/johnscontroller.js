var myApp = angular.module('waitApp', [ 'ui.bootstrap','ngAudio']);

myApp.controller('waitController', ['$scope','$http','$interval','ngAudio', function($scope,$http,$interval,ngAudio) {

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

    var FirebaseUrl = "https://boiling-fire-1762.firebaseio.com/";
    var firebaseScreenRef = new Firebase(FirebaseUrl); // FB JK
	firebaseScreenRef.once("value",function(snapshot){
	console.log(snapshot.val());
});
 

    //=========================================================================
    // Watch the number of patients in the firebase list. When it changes, 
    // play a sound
    //======================================================================
     


}]);


