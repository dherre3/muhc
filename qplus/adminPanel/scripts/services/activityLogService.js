var app=angular.module('adminPanelApp');

app.service('activityLogService',['api','URLs','$q',function(api, URLs,$q){
	var activityLogArray=[];
	return{
		getPatientActivityLogFromServer:function()
		{	
			var r=$q.defer();
			api.getFieldFromServer(URLs.getActivityUrl()).then(function(result){
				console.log(result);
				r.resolve(result);
			});
			return r.promise;
		},
		setPatientActivityLog:function(log,type)
		{
			if(type=='more')
			{

			}else{
				activityLogArray=[];
				for (var i = log.length - 1; i >= 0; i--) {
					log[i].DateTime=new Date(log[i].DateTime);
					if(log[i].Request=='Login'&&loginFlag)
					{	
						loginFlag=false;
					}else if(log[i].Request=='Logout')
					{

					}
				};

			}

		}
	};



}]);