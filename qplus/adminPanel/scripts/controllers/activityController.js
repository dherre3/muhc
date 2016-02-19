var app=angular.module('adminPanelApp');
app.controller('ActivityController',function($scope, $timeout, activityLogService){
	console.log('inside');
	activityLogService.getPatientActivityLogFromServer().then(function(result){
		console.log(result)
	});
});