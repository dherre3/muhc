//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//
angular.module('MUHCApp').controller('LoadingController', ['$state', 'UpdateUI',function ($state, UpdateUI) {
		console.log('Im doing it');
		console.log(UpdateUI);
		modal.show();
			var updateUI=UpdateUI.updateUserFields();
			updateUI.then(function(){
				$state.go('Home');
				modal.hide();
			});

		/*setTimeout(function(){
			if(typeof Patient.getFirstName()=='undefined'){
				var user=window.localStorage.getItem('UserAuthorizationInfo');
				user=JSON.parse(user);
				storage=window.localStorage.getItem(user.UserName);
				var mod=undefined;
				if(ons.platform.isAndroid())
				{
					mod='material'
				}
				modal.hide();
				if(storage){

				    ons.notification.confirm({
				      message: 'Problems with server, try again later!',
				      modifier: mod,
				      callback: function(idx) {

						$state.go('login');
						}
				    });


			}else{
				ons.notification.confirm({
					message: 'Problems with server, could not fetch data, try again later?',
					modifier: mod,
					callback: function(idx) {
						$state.go('logOut');
					}
				});
			}
		}
		},15000);*/
}]);
