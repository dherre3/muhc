angular.module('myModule',['ngAudio'])
 .controller('audioDemo',function($scope,ngAudio){
 	$scope.audio = ngAudio.load('sounds/dingding.wav');
})
