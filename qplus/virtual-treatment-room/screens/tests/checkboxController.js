var myApp = angular.module('checkboxApp', ['checklist-model', 'firebase', 'ui.bootstrap']);

myApp.controller('checkboxController', ['$scope','$http','$firebaseArray','$interval', function($scope,$http,$firebaseArray,$interval) {


  $http.get("http://172.26.66.41/devDocuments/screens/php/getResources.php").success(function (data) {
        $scope.Resources = data; // must be within success function to automatically call $apply
    });

  $scope.user = {
    Resources: ['user']
  };


  $scope.checkAll = function() {
    $scope.user.Resources = angular.copy($scope.Resources);
  };
  $scope.uncheckAll = function() {
    $scope.user.Resources = [];
  };
  $scope.checkFirst = function() {
    $scope.user.Resources.splice(0, $scope.user.Resources.length); 
    $scope.user.Resources.push('guest');
  };


}]);
