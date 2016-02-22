var app=angular.module('adminPanelApp');
app.controller('ActivityController',function($scope, $timeout, ActivityLogService){
	console.log('inside');
	ActivityLogService.getPatientActivityLogFromServer().then(function(result){
		console.log(result);
		ActivityLogService.setPatientActivityLogTable(result);
		$scope.activityLogObject=ActivityLogService.getPatientActivityObject();
		var keys=Object.keys($scope.activityLogObject);
	});
	$scope.searchActivity=function(session)
	{
		if(session.expanded)
	   	{
	   		session.expanded=false;
	   	}else{
	   		session.expanded=true;
	   	}
	   	
		if(typeof session!=='undefined')
		{
			ActivityLogService.getPatientSessionActivityFromServer(session.SessionId).then(function(){

		});
		}
	}
});