
var app=angular.module('adminPanelApp');
app.controller('RegistrationController',['$scope','$http', 'URLs','api', '$timeout',function($scope,$http,URLs,api,$timeout){
  /**
  * @ngdoc controller
  * @name AdminPanel.controller:registerCtrl
  * @requires $http
  * @requires $scope
  * @description
  * Controller for the patient registration view.
  */
  $scope.message="";
  $scope.patientFound=false;
  $scope.$watch('SSN',function(newValue, oldValue){
      if(newValue!==oldValue)
      {
        $scope.alert={};
      }

  });
 $scope.alert={};
//for testing purposes;
 /*$scope.completeRequest=function()
  {
    $scope.uid='asda-asdas-das';
    var EnableSMS=0;
    //var objectToSend=$scope.ariaResponse[0];
    objectToSend={};
    objectToSend.EnableSMS=1;
    objectToSend.Language='EN';
    objectToSend.PatientFirstName="David";
    objectToSend.PatientLastName="Herrera";
    objectToSend.Email="da@gmail.com";
    objectToSend.SSN='DEMZ98552411';
    objectToSend.PatientSer=123123;
    objectToSend.LoginId="asda-asdas-dasas";
    objectToSend.PatientId=123123;
    objectToSend.TelNumForSMS=5146419404;
    api.getFieldFromServer(URLs.getBasicURLPHP()+'MysqlRegister.php',objectToSend).then(function(response){
      console.log(response);
      $timeout(function(){
        $scope.alert.type=response.Type;
        $scope.alert.message=response.Response;
      });

    });

  }*/
  $scope.FindPatient= function (ssn) {
    /**
   * @ngdoc method
   * @name FindPatient
   * @methodOf AdminPanel.controller:registerCtrl
   * @description
   * .Looks for the patient in the ARIA database based on it's Medicare SSN number.It resets the form values to empty if patient is found and sets the $scope.patientFound to true.
   * @param {Object} ssn Patient's SSN
   * @returns {String} $scope.patientFound
   */

   $scope.message="";
     if ($scope.SSN.length>11){
        var msURL=URLs.getBasicURLPHP()+"FindPatient.php";
        api.getFieldFromServer(msURL,{PatientSSN:ssn}).then(function(response)
        {
          $scope.ariaResponse=response;
          console.log(response);
          if(response.response=="Patient has already been registered!")
          {
            $scope.patientFound=false;
            $scope.alert.type="warning";
            $scope.alert.message=response.response;
            $scope.patientRegistered=true;
          }
          else if ($scope.ariaResponse!=="PatientNotFound" ) {
            $scope.Alias="";
            $scope.message = "";
            $scope.Email="";
            $scope.EmailConfirm="";
            $scope.PasswordConfirm="";
            $scope.TelNumForSMS="";
            $scope.patientFound=true;
            var PatientSSN=$scope.SSN;
              $scope.Language="EN";
            }else if($scope.SSN!==''){
             $scope.patientFound=false;
             $scope.message="SSN is invalid ! ";
            } else {
              $scope.message = "SSN was not found!\n please consult the reception.";
              $scope.patientFound=false;
            }
        });
      }
  };


  $scope.Register=function()
  {
    /**
   * @ngdoc method
   * @name Register
   * @methodOf AdminPanel.controller:registerCtrl
   * @description
   * .Creates and account in firebase and MySQL for the patient with the information provided in the HTML form.
   * @returns {String} $scope.message
   */
   $scope.message = "";
   $scope.alert={};

    if ($scope.Email!==$scope.EmailConfirm) {
      $timeout(function(){



   });
      $scope.alert.type='danger';
      $scope.alert.message="Emails do not match!";

    }
    else if ($scope.Password !== $scope.PasswordConfirm ) {
      $timeout(function(){



   });
      $scope.alert.type='danger';
      $scope.alert.message="Passwords do not match!";    }
    else if ($scope.TelNumForSMS && $scope.TelNumForSMS.length !==10 ) {
      $timeout(function(){



   });
      $scope.alert.type='danger';
      $scope.alert.message="Enter a valid phone number!";
    }
    else {
      $scope.message="";
      //Register to FireBase
            var FB=new Firebase("https://luminous-heat-8715.firebaseio.com/");
            FB.createUser({
              email : $scope.Email,
              password: $scope.Password
            },function(error,userData)
            {
              if (error)
              {
                switch(error.code){
                case "EMAIL_TAKEN":
                $timeout(function(){
                  $scope.alert.type='danger';
                  $scope.alert.message="Email is already registered !";
                });

                break;
                case "INVALID_EMAIL":
                $timeout(function(){
                  $scope.alert.type='danger';
                  $scope.alert.message="Invalid email, please enter a valid email!";
                });

                break;
                default :
                $timeout(function(){
                  $scope.alert.type='danger';
                  $scope.alert.message="Error has occurred creating user. Please check internet connection!";
                  });
                }
              } else {
                // Register to MySQL

                var EnableSMS=0;
                var objectToSend=$scope.ariaResponse[0];
                objectToSend.TelNumForSMS=$scope.TelNumForSMS;
                objectToSend.LoginId=userData.uid;
                objectToSend.EnableSMS=($scope.TelNumForSMS) ?1:0;
                objectToSend.Email=$scope.Email;
                objectToSend.Language=$scope.Language;
                api.getFieldFromServer(URLs.getBasicURLPHP()+'MysqlRegister.php',objectToSend).then(function(response){
                  console.log(response);
                  $timeout(function(){
                    $scope.alert.type=response.Type;
                    $scope.alert.message=response.Response;
                  });

                });
              }
            });
        console.log($scope.alert);
        }
    }
}]);
