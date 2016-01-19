/*
*Code by David Herrera May 20, 2015
*Github: dherre3
*Email:davidfherrerar@gmail.com
*/
var myApp=angular.module('MUHCApp')

    /**
*@ngdoc controller
*@name MUHCApp.controller:LoginController
*@scope
*@requires $scope
*@requires MUHCApp.services:UserAuthorizationInfo
*@requires $state
*@description
*Uses Firebase authWithPassword method. The authWithPassword() inputs promise response
    *if error is defined, i.e authentication fails, it clears fields displays error for user via displayChatMessage() method, if authenticated
    *takes credentials and places them in the UserAuthorizationInfo service, it also sends the login request to Firebase,
    *and finally it redirects the app to the loading screen.
*/
myApp.controller('LoginController', [ '$state', 'UserAuthorizationInfo', function ($state, UserAuthorizationInfo) {
  //$scope.platformBoolean=(ons.platform.isAndroid()&&ons.platform.isIOS());
  var usernameLocalStorage=window.localStorage.getItem('OpalAdminPanelPatient');
  console.log(UserAuthorizationInfo);
  UserAuthorizationInfo.setUsername(usernameLocalStorage);
  $state.go('loading');
  console.log(UserAuthorizationInfo.getUsername());
  console.log('Going into loading');

}]);