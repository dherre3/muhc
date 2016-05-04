// Define the module in which we will have our controller
//var app = angular.module("myApp", []);

// Controller to control the data of the angular application
// the angular controller is a Javascript object
//function johnController($scope,$http) { <--- this way of doing it is without a module and everything
				  	 // would be global

// this way of defining the contorller keeps all the functions inside it local
//app.controller("johnController", function($scope,$http) {
function johnController($scope,$http) {
    $scope.firstName= "John";
    $scope.lastName= "Doe";

    $scope.moveSwitch = false;

    $scope.showMoveButton = false;

    $scope.test = "hello";

    $scope.fullName = function(){
	return $scope.firstName + " " + $scope.lastName;
    }

    $scope.product = function(){
        return $scope.num1*$scope.num2;
    }

    $scope.callPatient= function(patient){
      patient.called = true;
    }


    $scope.changeName= function(){
    	$scope.firstName= "New";
    	$scope.lastName= "Name";
	$scope.primary = true;
    }

    $http.get("http://www.w3schools.com/website/Customers_JSON.php")
    .success(
	function(response){
		$scope.names = response;
	}
     );

    $http.get("http://172.26.66.41/devDocuments/screens/mmsql.php")
    .success(
	function(response){
		$scope.checkins = response;
	}
     );

}

