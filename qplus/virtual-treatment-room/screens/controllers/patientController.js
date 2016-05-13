var myApp = angular.module('screenApp', ['checklist-model','firebase', 'ui.bootstrap']);
var numSimilarNames = 10;

myApp.controller('screenController', ['$scope','$modal','$http','$firebaseArray','$interval', function($scope,$modal,$http,$firebaseArray,$interval) {

    //=========================================================================
    // General useful stuff
    //=========================================================================
    $scope.debug_messages = "none";

    // get the time right now and do it on a regular basis so that the
    // right now time is updated continuouslsy
    $interval(function(){
      $scope.timeNow = new Date().getTime();
    },1000);

    //=========================================================================
    // Set the firebase connection 
    //=========================================================================
    // Get today's date as we create a new firebase each day so as to log events
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
      dd='0'+dd
    } 

    if(mm<10) {
      mm='0'+mm
    } 

    today = mm+'-'+dd+'-'+yyyy;

    var FirebaseUrl = "https://boiling-fire-1762.firebaseio.com/" + today;
    var firebaseScreenRef = new Firebase(FirebaseUrl); // FB JK

    firebaseScreenRef.auth("I2hS9696WgCE5HykgGXtHA39xjX4Yx21r8wzoFaF", function(error, result) {
      if (error) {
        console.log("Authentication Failed!", error);
      } else {
        console.log("Authenticated successfully with payload:", result.auth);
        console.log("Auth expires at:", new Date(result.expires * 1000));
      }
    });

    $scope.screenRows = $firebaseArray(firebaseScreenRef);

    $scope.debug_messages = $scope.debug_messages + " --- log- 0-";

    //=========================================================================
    // Get the list of possible destinations to which the patients may be called to 
    //=========================================================================
    $http.get("http://172.26.66.41/devDocuments/screens/php/getVenues.php").success(function (data) {
        $scope.venues= data; // must be within success function to automatically call $apply
    });

    //=========================================================================
    // Get list of checked-in patients from Aria - use $interval to request the
    // list regularly (specified in miliseconds)
    //=========================================================================
    // Function to grab the list of patients
    function load_patients(){
      $http.get("http://172.26.66.41/devDocuments/screens/php/getCheckins.php").success(function(data){
        $scope.checkins=data;
      });
    };

    // call the function when the page is loaded so that we have data right away
    load_patients();

    // set the interval for page updates from Aria by polling Aria regularly
    $interval(function(){
      load_patients();
    },10000);

    //=========================================================================
    // Function to check if any other patients are checked in with similar names
    //=========================================================================
//    function similarCheckIns(patient){
//      $http({
//	url: "http://172.26.66.41/devDocuments/screens/php/similarCheckIns.php",
//	  method: "GET",
//	  params: {FirstName: patient.FirstName, 
//		   LastNameFirstThree: patient.SSN 
//                  }
//        }).success(function(data){
//        patient.numSimilarNames=data;
//      });
//    }

    //=========================================================================
    // Function to call the patient - message to screen and SMS
    //=========================================================================
    $scope.callPatient= function(patient){

      // Mark the patient as "called"
      patient.called = true;

      //-----------------------------------------------------------------------
      // First, check that there are no other patients with similar names 
      // checked in. If there are, we will need to display extra identifier information
      // to ensure that the correct patient is called
      // Since we need the answer of how many other patients there are before
      // semding the data to the screens we need to put the update to Firebase 
      // inside the $http function 
      //-----------------------------------------------------------------------
      $http({
	url: "http://172.26.66.41/devDocuments/screens/php/similarCheckIns.php",
	  method: "GET",
	  params: {FirstName: patient.FirstName, 
		   LastNameFirstThree: patient.SSN 
                  }
        }).then(function(response) {

      	$scope.numNames = response.data;
        console.log($scope.numNames);

        //-----------------------------------------------------------------------
        // Message to screens - add this patient's details to our firebase
        // First create a child for this patient and then fill the data
        //-----------------------------------------------------------------------
        var child_id = patient.PatientSer + "-" + patient.ScheduledActivitySer + "-" + patient.ScheduledStartTime;    

        if($scope.numNames == 1){
          
	  patient.LastName = patient.SSN + "*****"; // first three digits of last name 

        }else{
	  // The Medicare number has 50 added on to the month of birth for women
          // If > 50, then subtract off 50
	  if(patient.MONTHOFBIRTH > 50){patient.MONTHOFBIRTH-=50;}

          if(patient.MONTHOFBIRTH == 1){patient.MONTHOFBIRTH = "Jan";}
          if(patient.MONTHOFBIRTH == 2){patient.MONTHOFBIRTH = "Fev / Feb";}
          if(patient.MONTHOFBIRTH == 3){patient.MONTHOFBIRTH = "Mar";}
          if(patient.MONTHOFBIRTH == 4){patient.MONTHOFBIRTH = "Avr / Apr";}
          if(patient.MONTHOFBIRTH == 5){patient.MONTHOFBIRTH = "Mai / May";}
          if(patient.MONTHOFBIRTH == 6){patient.MONTHOFBIRTH = "Jui / Jun";}
          if(patient.MONTHOFBIRTH == 7){patient.MONTHOFBIRTH = "Jul";}
          if(patient.MONTHOFBIRTH == 8){patient.MONTHOFBIRTH = "Aou / Aug";}
          if(patient.MONTHOFBIRTH == 9){patient.MONTHOFBIRTH = "Sep";}
          if(patient.MONTHOFBIRTH == 10){patient.MONTHOFBIRTH = "Oct";}
          if(patient.MONTHOFBIRTH == 11){patient.MONTHOFBIRTH = "Nov";}
          if(patient.MONTHOFBIRTH == 12){patient.MONTHOFBIRTH = "Dec";}

          patient.LastName = patient.SSN + " (Naissance / Birthday: " + patient.DAYOFBIRTH + " " + patient.MONTHOFBIRTH + ")";
 	}        

        //-----------------------------------------------------------------------
        // Message to screens - add this patient's details to our firebase
        // First create a child for this patient and then fill the data
        //-----------------------------------------------------------------------
        var patient_child = firebaseScreenRef.child(child_id); 
        patient_child.set(
		{ 
			FirstName: patient.FirstName, 
			LastName: patient.LastName, 
			PatientSer: patient.PatientSer, 
			Destination: $scope.PatientDestination.VenueId, 
			PatientStatus: "Called", 
			Appointment: patient.Expression1, 
			Resource: patient.ResourceName, 
			ScheduledActivitySer: patient.ScheduledActivitySer,
			Timestamp: Firebase.ServerValue.TIMESTAMP
		});
        $scope.debug_messages = $scope.debug_messages + " --- going to log--";

        $scope.debug_messages = $scope.debug_messages + " --- adding to log --";
      });

      //-----------------------------------------------------------------------
      // Send the patient an SMS message
      //-----------------------------------------------------------------------
      // Prepare SMS message
      var SMS_phoneNumber= "5144758943"; // JK
      //var SMS_phoneNumber= "5148675276"; // TH
      //var SMS_phoneNumber= "5148251992"; // AJ 
      $scope.SMS_message = "Cedars Cancer Centre: " + patient.FirstName + " " + patient.LastName + ", please go to " + $scope.PatientDestination.VenueId + " for your appointment. You will be seen shortly. Thank you.";
      //var SMS_licencekey = "f0d8384c-ace2-46ef-8fa4-6e54d389ff51";
      //var SMS_gatewayURL = "https://sms2.cdyne.com/sms.svc/SecureREST/SimpleSMSsend";
      //var SMS = SMS_gatewayURL + "?PhoneNumber=" + SMS_phoneNumber + "&Message=" + $scope.SMS_message + "&LicenseKey=" + SMS_licencekey;
    
      $scope.debug_messages = $scope.debug_messages + " SMS: " + SMS;

      //MUHC SMS server as per Mehyrary
      var SMS = "http://172.26.66.41/devDocuments/mehryar/SMS/sendSMS.php?TelNumForSMS=1"+SMS_phoneNumber+"&Message="+$scope.SMS_message;

      // Send SMS message
//      $http.get(SMS)
//      .success(
//	function(response){
//		$scope.SMS_response = response;
//      		$scope.debug_messages = SMS + " <br>" + $scope.debug_messages + " SMS response: " + $scope.SMS_response;
//	}
//      );
    } // end callPatient() function

    //=========================================================================
    // Function to set patient as "arrived"  
    //=========================================================================
    $scope.arrivedPatient= function(patient){

	$scope.debug_messages = $scope.debug_messages + " --- arriving patient with index: " + $scope.screenRows.$indexFor(patient.PatientSer);

      var child_id = patient.PatientSer + "-" + patient.ScheduledActivitySer + "-" + patient.ScheduledStartTime;    

      var patient_child = firebaseScreenRef.child(child_id);
      patient_child.update(
        { 
	  PatientStatus: "Arrived" 
        }
      );

      // Check the patient into the current location
      $http({
	url: "http://172.26.66.41/devDocuments/screens/php/checkInPatient.php",
	method: "GET",
	params: {CheckinVenue: $scope.PatientDestination.VenueId2, 
		 ScheduledActivitySer: patient.ScheduledActivitySer, 
		 location: $scope.PatientDestination.VenueId2 
		} 
      }); 


      // Remove patient from screens via Firebase
      // First get this patient's index using his/her Id 
      //$scope.screenRows.$remove($scope.screenRows.$indexFor(patient.PatientSer));
    }

    //=========================================================================
    // Remove an item from the screen - different to setting patient as arrived
    // This works directly on the screen list
    //=========================================================================
    $scope.removeItem = function (index){
      
       $scope.debug_messages = $scope.debug_messages + "<br>removing index: " + index;

       // Firebase: Remove item from the list
       $scope.screenRows.$remove(index);
    }

    //=========================================================================
    // Set up for exam room modal - need to have it in this main controller
    //=========================================================================
    $http({
	url: "http://172.26.66.41/devDocuments/screens/php/getExamRooms.php",
	method: "GET",
	params: {IntermediateVenue: "S1 CLINIC"} 
    }).success(function (data) {
        $scope.items = data; // must be within success function to automatically call $apply
    });


    $scope.openExamRoom = function (size, patient) {


      var modalInstance = $modal.open({
        animation: true,
        templateUrl: 'ExamRoomModal.html',
        controller: 'ExamRoomModalInstanceCtrl',
        size: size,
        resolve: {
          items: function () {
            return $scope.items;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;

        $scope.debug_messages = $scope.debug_messages + " --- assigning patient to: " +selectedItem ;
        $scope.debug_messages = $scope.debug_messages + " --- assigning patient to: " +selectedItem + " ScheduledActivitySer: " + patient.ScheduledActivitySer;

        // Check the patient into the current location
        $http({
          url: "http://172.26.66.41/devDocuments/screens/php/checkInPatient.php",
          method: "GET",
          params: {CheckinVenue: $scope.selected, 
	  	   ScheduledActivitySer: patient.ScheduledActivitySer, 
		   location: $scope.selected 
		  } 
        }); 
       
        // Update status to RoomAssigned
        var child_id = patient.PatientSer + "-" + patient.ScheduledActivitySer + "-" + patient.ScheduledStartTime;    
        var patient_child = firebaseScreenRef.child(child_id);
        patient_child.update(
		{ 
			PatientStatus: "RoomAssigned" 
		});

 

      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };

}]);

//=============================================================================
// Exam room selection modal controller
//=============================================================================
myApp.controller('ExamRoomModalInstanceCtrl', function ($scope, $modalInstance, items) {

  $scope.items = items;
  $scope.selected = {
  };

  $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});

//=============================================================================
// Resource selection modal controller
//=============================================================================
myApp.controller('ModalDemoCtrl', function ($scope, $modal, $log, $http) {

  // initialise the user variable in the parent scope - this will hold the resources for
  // the current user
  $scope.$parent.$parent.user = {
  };

  // Get the list of all resources from Aria
  $http.get("http://172.26.66.41/devDocuments/screens/php/getResources.php").success(function (data) {
        $scope.Resources = data; // must be within success function to automatically call $apply
  });


  $scope.open = function (size) {

    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        Resources: function () {
          return $scope.Resources;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.user= selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

});

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

myApp.controller('ModalInstanceCtrl', function ($scope, $modalInstance, Resources) {

  $scope.Resources = Resources; // get the list of resources from the main controller above and provide 
				// it to the scope

  // User clicks ok - return the list of selected Resources
  $scope.ok = function () {
    $modalInstance.close($scope.user);
  };

  // User clicks cancel - return nothing
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  // Initially selected resource - even if nothing is initially selected we should initial the array here
  $scope.user = $scope.$parent.user;

  $scope.allChecked = false;

  $scope.checkAll = function() {
    if(!$scope.allChecked) {
      $scope.user.Resources = angular.copy($scope.Resources);
      $scope.allChecked = true;
    } else {
      $scope.user.Resources = [];
      $scope.allChecked = false;
    }
  };

  $scope.uncheckAll = function() {
    $scope.user.Resources = [];
  };



});

//======================================================================
// Custom filter for resources
//======================================================================
// Setup the filter
myApp.filter('resourceFilter', function() {

  // Create the return function and set the required parameter name to **input**
  return function(input,selectedResource) {

    var out = [];

    // Using the angular.forEach method, go through the array of data and perform the 
    // operation of figuring out if the patient is assigned to a selected Resource 
    angular.forEach(input, function(patient) {

      if (patient.ResourceName === selectedResource) {
        out.push(patient)
      }
      
    })

    return out;
  }

});

//======================================================================
// Custom filter for resources
//======================================================================
// Setup the filter
myApp.filter('multiResourceFilter', function() {

  // Create the return function and set the required parameter name to **input**
  return function(input,machines) {

//console.log(machines);
    var out = [];

    // Using the angular.forEach method, go through the array of data and perform the 
    // operation of figuring out if the patient is assigned to a selected Resource 
    angular.forEach(input, function(patient) {

      for(var currentResource=0;currentResource<machines.length;currentResource++) {

        if (patient.ResourceName == machines[currentResource]) {
          out.push(patient)
        }

      }

    })

    return out;
  }

});
