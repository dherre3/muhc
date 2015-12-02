var app=angular.module('adminPanelApp');
app.controller('LoginModalController',function ($scope, $modalInstance,$rootScope,$http,User, api, Messages, $timeout, AllPatients,URLs) {

    /**
  * @ngdoc controller
  * @name AdminPanel.controller:loginModalController
  * @requires $http
  * @requires $rootScope
  * @requires $modalInstance
  * @description
  * Controller for the login modal.
  */
    $rootScope.alerts={};
    $rootScope.user= {};
    checkForUserAlreadyLoggedIn();
    
    function checkForUserAlreadyLoggedIn()
    {
      var user=window.localStorage.getItem('OpalAdminUser');
      user=JSON.parse(user);
      signinUser(user);
    }
    function signinUser(response)
    {
      if(response.AdminSerNum)
      {
        $rootScope.userType='Admin';
      }else if(response.DoctorSerNum){
        $rootScope.userType='Doctor';
        console.log($rootScope.userType);
      }else{
        $rootScope.userType='Staff';
      }
      $rootScope.alerts["LoginAlert"]={};
      response.Username=username;
      User.setUserFields(response,username,password);
      User.getNumberOfPatientsForUserFromServer().then(function(data){
        $rootScope.loggedin=true;
        $rootScope.TotalNumberOfPatients=data[0].TotalNumberOfPatients;
        if($rootScope.userType=='Doctor')
        {
          User.setNumberOfDoctorPatients(data[1].TotalNumberOfDoctorPatients);
          $rootScope.TotalNumberOfDoctorPatients=User.getNumberOfDoctorPatients();
        }

        api.getAllPatients().then(function(result){
          AllPatients.setPatients(result);
          Messages.getMessagesFromServer().then(function(messagesFromService){
          Messages.setMessages(messagesFromService);
        });
      });

      });
      $modalInstance.close(response);
      if(User.getUserFields().UserRole=='Admin'){
        $rootScope.admin=true;
      }else {
        $timeout(function(){
          $rootScope.admin=false;
        })

      }
    }
    $rootScope.login = function (username,password)
    {
      /**
     * @ngdoc method
     * @name login
     * @methodOf AdminPanel.controller:loginModalController
     * @description
     * Logs the user in instantly if the super user credentials are used. For other users it will authenticate them using the admin table in MySQL and saves admin's information to $rootScope.
     * @param {String} username username specified by the user.
     * @param {String} password password specified by the user.
     * @returns {Object} $rootScope.Admin
     */


      // Authentication for superuser
      if (username==="root" && $rootScope.user.users[username]===password)
        {
          $rootScope.alerts["LoginAlert"]={};
          $modalInstance.close(username);
        }
      // Authentication for normal users
      else if (typeof username !== 'undefined' )
      {
        api.getFieldFromServer(URLs.getUserAuthenticationUrl(),{Username:username, Password:password}).then(function(response)
        {
          console.log(response);
          window.localStorage.setItem('OpalAdminUser',response);
          if ( response.AdminSerNum ||response.DoctorSerNum||response.StaffSerNum)
          {
            signinUser(response);
          }
          else if (response =="Invalid Password")
          {
            console.log('asdas2');
            $rootScope.alerts["LoginAlert"]={};
            $rootScope.alerts["LoginAlert"].type="danger";
            $rootScope.alerts["LoginAlert"].message="Incorrect password!";
          }
          else if ( response == "User not found")
          {
            console.log('asdas3');
            $rootScope.alerts["LoginAlert"]={};
            $rootScope.alerts["LoginAlert"].type="danger";
            $rootScope.alerts["LoginAlert"].message="Username not found!";
          }
        });
      }
      else
      {
        $rootScope.alerts["LoginAlert"]={};
        $rootScope.alerts["LoginAlert"].type="danger";
        $rootScope.alerts["LoginAlert"].message="Credentials are not valid!";
      }
    };

    $rootScope.cancel = function ()
    {
      /**
     * @ngdoc method
     * @name cancel
     * @methodOf AdminPanel.controller:loginModalController
     * @description
     * Cancels login and closes the modal.
     */
      $modalInstance.dismiss('cancel');
    };
});
