var app=angular.module('adminPanelApp');

/**
 * @ngdoc function
 * @name adminPanelApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the adminPanelApp
 */

app.controller('MainController',function ($rootScope, $scope, User,LoginModal,$timeout) {
  $rootScope.userExpiration=3600;
  if($rootScope.loggedin){
    $rootScope.home=true;
    $rootScope.about=false;
  }else{
    $rootScope.home=false;
    $rootScope.about=true;
  }
  ($rootScope.NumberOfNewMessages>1)?$scope.messages='messages':$scope.messages='message';

  $scope.logout=function()
  {
    $rootScope.loggedin=false;
    $rootScope.home=false;
    $rootScope.about=true;
    $rootScope.currentUser=undefined;
    $rootScope.NumberOfNewMessages=0;
    window.localStorage.removeItem('OpalAdminPanelUser');
    location.reload();

  }
$rootScope.isUserCheckedIn=function()
{
  var user=window.localStorage.getItem('OpalAdminPanelUser');
  if(user)
  {
    user=JSON.parse(user);
    console.log(user);
    var date=new Date(user.expires);
    var diff=(new Date()-date)/1000;

    console.log(diff);
    if(diff>$rootScope.userExpiration)
    {
      return false;
    }else{
      return true;
    }    
  }
}
$rootScope.checkSession=function()
{
  var user=window.localStorage.getItem('OpalAdminPanelUser');
  if(user)
  {
    user=JSON.parse(user);
    console.log(user);
    var date=new Date(user.expires);
    var diff=(new Date()-date)/1000;

    console.log(diff);
    if(diff>$rootScope.userExpiration)
    {
      window.localStorage.removeItem('OpalAdminPanelUser');
      location.reload();
    }    
  }
}

User.getNumberOfPatientsForUserFromServer().then(function(data){
  console.log(data);
  if(User.getUserFields()==undefined){
    $rootScope.loggedin=false;
  }
  $rootScope.TotalNumberOfPatients=data[0].TotalNumberOfPatients;
  });
$scope.signin=function(){
  LoginModal()
  .then(function () {
        $timeout(function(){
          $rootScope.NumberOfDoctorPatients=User.getNumberOfDoctorPatients();
          console.log($scope.NumberOfDoctorPatients);
        });
  });

}


});
