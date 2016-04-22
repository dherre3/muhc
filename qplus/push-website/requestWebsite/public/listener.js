var app=angular.module('MUHCPushNotifications',['ngMaterial']);
app.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
  .primaryPalette('blue')
  .accentPalette('orange').dark();
});
app.controller('MainController',['$scope','$timeout','$mdSidenav','$log','$rootScope',function($scope,$timeout, $mdSidenav, $log,$rootScope){
  function request(object)
  {
    $.post("http://172.26.66.41:8010/login",{key: request.key(),objectRequest: request.val()}, function(data){
      if(data.type=='UploadToFirebase')
      {
        uploadToFirebase(data.requestKey, data.encryptionKey,data.requestObject, data.object);
      }else if(data.type=='CompleteRequest')
      {
        completeRequest(data.requestKey,data.requestObject,data.Invalid);
      }else if(data.type=='ResetPasswordError')
      {
        resetPasswordError(data.requestKey,data.requestObject);
      }

    });
  }


  var imagePath = '';
  $rootScope.todos = [];

  $scope.toggleLeft = buildDelayedToggler('left');
     $scope.toggleRight = buildToggler('right');
     $scope.isOpenRight = function(){
       return $mdSidenav('right').isOpen();
     };
     /**
      * Supplies a function that will continue to operate until the
      * time is up.
      */
     function debounce(func, wait, context) {
       var timer;
       return function debounced() {
         var context = $scope,
             args = Array.prototype.slice.call(arguments);
         $timeout.cancel(timer);
         timer = $timeout(function() {
           timer = undefined;
           func.apply(context, args);
         }, wait || 10);
       };
     }
     /**
      * Build handler to open/close a SideNav; when animation finishes
      * report completion in console
      */
     function buildDelayedToggler(navID) {
       return debounce(function() {
         // Component lookup should always be available since we are not using `ng-if`
         $mdSidenav(navID)
           .toggle()
           .then(function () {
             $log.debug("toggle " + navID + " is done");
           });
       }, 200);
     }
     function buildToggler(navID) {
       return function() {
         // Component lookup should always be available since we are not using `ng-if`
         $mdSidenav(navID)
           .toggle()
           .then(function () {
             $log.debug("toggle " + navID + " is done");
           });
       }
     }
   }])
   .controller('LeftCtrl', function ($rootScope,$scope, $timeout, $mdSidenav, $log) {
     function sendPushToBackend(name, message)
     {
       //"http://172.26.66.41:8010/login"
       $.post("http://localhost:3000/login",{name: name,message: message}, function(data){
         if(data.type=='UploadToFirebase')
         {
           uploadToFirebase(data.requestKey, data.encryptionKey,data.requestObject, data.object);
         }else if(data.type=='CompleteRequest')
         {
           completeRequest(data.requestKey,data.requestObject,data.Invalid);
         }else if(data.type=='ResetPasswordError')
         {
           resetPasswordError(data.requestKey,data.requestObject);
         }

       });
     }
     $scope.sendPush = function(person, message)
     {
       var date = new Date();
       person = person.replace(/'/g,"");
       $rootScope.todos.push({
         who:person,
         when:date,
         notes:message
       });
       sendPushToBackend(person, message)
       $scope.name = '';
       $scope.message = '';
     }
     $scope.cancel = function()
     {
       $scope.name = '';
       $scope.message = '';
     }
     $scope.close = function () {
       // Component lookup should always be available since we are not using `ng-if`
       $mdSidenav('left').close()
         .then(function () {
           $log.debug("close LEFT is done");
         });
     };
   })
   .controller('RightCtrl', function ($scope, $timeout, $mdSidenav, $log) {
     $scope.close = function () {
       // Component lookup should always be available since we are not using `ng-if`
       $mdSidenav('right').close()
         .then(function () {
           $log.debug("close RIGHT is done");
         });
     };
   });
