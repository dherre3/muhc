var app=angular.module('adminPanelApp');

app.service('ActivityLogService',['api','URLs','$q','$filter',function(api, URLs,$q,$filter){
	var activityLogObject={};
	return{
		getPatientActivityLogFromServer:function()
		{	
			var r=$q.defer();
			api.getFieldFromServer(URLs.getPatientActivityUrl()).then(function(result){
				console.log(result);
				r.resolve(result);
			});
			return r.promise;
		},
		setPatientActivityLogTable:function(log,type)
		{
			activityLogObject={};
			for (var i = log.length - 1; i >= 0; i--) {
				log[i].DateTime=new Date(log[i].DateTime);
				if(typeof activityLogObject[log[i].SessionId]==='undefined')
				{
					activityLogObject[log[i].SessionId]=[];
					activityLogObject[log[i].SessionId].push(log[i]);
				}else{
					activityLogObject[log[i].SessionId].push(log[i]);
				}
				
			};
			for(var key in activityLogObject)
			{
				activityLogObject[key]=$filter('orderBy')(activityLogObject[key],'DateTime',false);
				for (var i = 0; i < activityLogObject[key].length; i++) {
					if(i==0)
					{
						activityLogObject[key].FirstName=activityLogObject[key][i].FirstName;
						activityLogObject[key].LastName=activityLogObject[key][i].LastName;
						activityLogObject[key].PatientId=activityLogObject[key][i].PatientId;
						activityLogObject[key].SessionId=activityLogObject[key][i].SessionId;

					}
					if(activityLogObject[key][i].Request=='Login')
					{
						activityLogObject[key].LoginTime=activityLogObject[key][i].DateTime;
					}else if(activityLogObject[key][i].Request=='Logout')
					{
						activityLogObject[key].LogoutTime=activityLogObject[key][i].DateTime;
					}
				}
			}


			
			

		},
		getPatientSessionActivityFromServer:function(sessionId)
		{
			var r=$q.defer();
			var objectToSend={};
			objectToSend.SessionId=sessionId;
			api.getFieldFromServer(URLs.getPatientSessionActivityUrl(),objectToSend).then(function(result){
				console.log(result);
				r.resolve(result);
			});
			return r.promise;
		},
		getPatientActivityObject:function()
		{
			return activityLogObject;
		}
	};



}]);