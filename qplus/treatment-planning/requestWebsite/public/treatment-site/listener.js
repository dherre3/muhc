var app=angular.module('MUHCPushNotifications',['ngMaterial', 'ui.router','firebase']);
app.config(function($mdThemingProvider) {
   // Configure a dark theme with primary foreground yellow
   $mdThemingProvider.theme('docs-dark', 'default')
     .primaryPalette('pink')
     .dark();
 });
 // let's create a re-usable factory that generates the $firebaseAuth instance
app.factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {
    var ref = new Firebase("https://brilliant-inferno-7679.firebaseio.com/");
    return $firebaseAuth(ref);
  }
]);
 app.config(function($stateProvider, $urlRouterProvider) {
   //
   // For any unmatched url, redirect to /state1
   $urlRouterProvider.otherwise("/login");
   //
   // Now set up the states
   $stateProvider
     .state('login', {
       url: "/login",
       templateUrl: "views/login.html",
       controller:'LoginController',
       resolve: {
          // controller will not be loaded until $waitForAuth resolves
          // Auth refers to our $firebaseAuth wrapper in the example above
          "currentAuth": ["Auth", function(Auth) {
            // $waitForAuth returns a promise so the resolve waits for it to complete
            return Auth.$waitForAuth();
          }]
        }
     })
     .state('main', {
       url: "/main",
       templateUrl: "views/main.html",
       controller:'TablesController',
       resolve: {
          // controller will not be loaded until $requireAuth resolves
          // Auth refers to our $firebaseAuth wrapper in the example above
          "currentAuth": ["Auth", function(Auth) {
            // $requireAuth returns a promise so the resolve waits for it to complete
            // If the promise is rejected, it will throw a $stateChangeError (see above)
            return Auth.$requireAuth();
          }]
        }
     })
   });
   app.run(["$rootScope", "$state", function($rootScope, $state) {
   $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
     // We can catch the error thrown when the $requireAuth promise is rejected
     // and redirect the user back to the home page
     if (error === "AUTH_REQUIRED") {
       console.log('error with auth');
       $state.go("login");
     }
   });
   }]);
app.controller('TablesController',['$scope','$timeout','$filter','$rootScope', 'Credentials', function($scope,$timeout,$filter,$rootScope, Credentials){
  //Enter code here!!
  var password = Credentials.getCredentials();
  $scope.cancerTypes = ['Breast', 'Prostate', 'Lung', 'Bladder','Colon','Rectal','Leukimia'];
  var nonEmpty = 0;
  var totalP = 0;
  $scope.cancerType = 'Breast';
  $scope.printTable = function()
  {
      var divToPrint=document.getElementById("printTable");
     newWin= window.open("");
     newWin.document.write(divToPrint.outerHTML);
     newWin.print();
     newWin.close();
  };
  var ref = new Firebase('https://brilliant-inferno-7679.firebaseio.com/sequences');
  ref.auth('9HeH3WPYe4gdTuqa88dtE3KmKy7rqfb4gItDRkPF');
  $scope.fetchCancerTypeData = function(cancer)
  {
    $rootScope.canceType = cancer;
    console.log(cancer);
    ref.child(cancer+'/SeqFreq').once('value',function(snap)
    {
      var data = snap.val();
      data = decryptObject(data, password);
      data = JSON.parse(data);
      console.log(data);
      data = formatSequencesInArray(data);
      console.log(totalP);
      $timeout(function()
      {
        $rootScope.patientNumber = data.NumberOfPatients;
        $scope.nonEmptyFrequencies = nonEmpty;
        $scope.sequences = data.Top;
        graphFrequencyPlot(data.Top);
        $scope.sequenceTotal = data.Total;
      });
    });
    ref.child(cancer+'/StepFreq').once('value',function(snap)
    {
      var data = snap.val();
      data = decryptObject(data, password);
      data = JSON.parse(data);
      console.log(data);
      $timeout(function()
      {
          var steps = organizeSteps(data);
          steps = getTotalCount(steps);
          console.log(steps);
          $scope.stepFrequency = organizeSteps(data);

      });
    });
    ref.child(cancer+'/MissingFreq').once('value',function(snap)
    {
      var data = snap.val();
      data = decryptObject(data, password);
      data = JSON.parse(data);
      $timeout(function()
      {
        $scope.missingSteps = data;
      });
    });
  };
  $scope.items = [1,2,3,4,5];
  $scope.items = ['Consult Appointment','Ct-Sim'];
$scope.selected = [];
$scope.toggle = function (item, list) {
  var idx = list.indexOf(item);
  if (idx > -1) {
    list.splice(idx, 1);
  }
  else {
    list.push(item);
  }
};
$scope.exists = function (item, list) {
  return list.indexOf(item) > -1;
};
$scope.isIndeterminate = function() {
  return ($scope.selected.length !== 0 &&
      $scope.selected.length !== $scope.items.length);
};
$scope.isChecked = function() {
  return $scope.selected.length === $scope.items.length;
};
$scope.toggleAll = function() {
  if ($scope.selected.length === $scope.items.length) {
    $scope.selected = [];
  } else if ($scope.selected.length === 0 || $scope.selected.length > 0) {
    $scope.selected = $scope.items.slice(0);
  }
};
  $scope.fetchCancerTypeData('Breast');
  $scope.clearHistogram = function()
  {
    $scope.histogramPlot=$scope.histogramPlot?false:true;
    $scope.isHistogramClear = true;
    $('#chartStep').html('');
  };

  function graphFrequencyPlot(top)
  {
    var array = [];
    for (var i = 0; i < top.length/2+5; i++) {
      var object = [top[i].maxArrayFrequencies.length, top[i].Value];
      array.push(object);
    }
    console.log(array);
    $('#freqPlot').highcharts({
      chart: {
          type: 'scatter',
          zoomType: 'xy'
      },
      title: {
          text: 'Frequency and number of sequences'
      },
      subtitle: {
          text: $rootScope.cancerType
      },
      xAxis: {
          title: {
              enabled: true,
              text: 'Number of Sequences'
          },
          startOnTick: true,
          endOnTick: true,
          showLastLabel: true
      },
      yAxis: {
          title: {
              text: 'Frequency'
          }
      },
      legend: {
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'top',
          x: 100,
          y: 70,
          floating: true,
          backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
          borderWidth: 1
      },
      plotOptions: {
          scatter: {
              marker: {
                  radius: 3,
                  states: {
                      hover: {
                          enabled: true,
                          lineColor: 'rgb(100,100,100)'
                      }
                  }
              },
              states: {
                  hover: {
                      marker: {
                          enabled: false
                      }
                  }
              },
              tooltip: {
                  headerFormat: '<b>{series.name}</b><br>',
                  pointFormat: ' number of sequences: {point.x}, Each sequence occurred {point.y} times'
              }
          }
      }, series:[{
          name: 'Sequence Frequency',
          color: 'rgba(119, 152, 191, .5)',
          data: array
      }]
  });

  }
  $scope.paintStepHistogram = function(alias)
  {
    $scope.isHistogramClear = false;
    $scope.histogramPlot=$scope.histogramPlot?false:true;
    var arrayPoints = [];
    var aliasArray = alias.Array;
    for (var i = 0; i < aliasArray.length; i++) {
      var object = {
        name:'Spot: '+ i,
        y:aliasArray[i]
      };
      arrayPoints.push(object);
    }

    $('#chartStep').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: 'Histogram '+$scope.cancerType + " - "+ alias.AliasName
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Spot in sequence'
            }
        },
        yAxis: {
            title: {
                text: 'Frequency of Alias in spot'
            }

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true
                    //format: '{point.y:.1f}%'
                }
            }
        },

        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>'
        },

        series: [{
            name: alias.AliasName,
            colorByPoint: true,
            data:arrayPoints
        }]
    });

  };





  //Orders steps by their best index
  function organizeSteps(objectSteps)
  {
    var stepArray = [];
    for (var key in objectSteps) {
      objectSteps[key].AliasName = key;
      stepArray.push(objectSteps[key]);
    }
    stepArray = $filter('orderBy')(stepArray, 'BestIndex');
    return stepArray;
  }
  //Gets the total account for the array of each step
  function getTotalCount(steps)
  {
    for (var i = 0; i < steps.length; i++) {
      var total = 0;
      for (var j = 0; j < steps[i].Array.length; j++) {
        total += steps[i].Array[j];
      }
      steps[i].TotalPatients = total;
    }
    return steps;
  }
  function formatSequencesInArray(data)
  {
    for (var i = 0; i < data.Top.length; i++) {
      data.Top[i].PatientCount = data.Top[i].maxArrayFrequencies.length*data.Top[i].Value;
      totalP += data.Top[i].maxArrayFrequencies.length*data.Top[i].Value;
      for (var j = 0; j < data.Top[i].maxArrayFrequencies.length; j++) {
        nonEmpty++;
        var stepCount = 0;
        data.Top[i].maxArrayFrequencies[j] = data.Top[i].maxArrayFrequencies[j].split(",").map(function(step){
          stepCount++;
          return " " + stepCount+". "+ step;
        });
        data.Top[i].maxArrayFrequencies[j] = data.Top[i].maxArrayFrequencies[j].toString();
      }
    }
    return data;
  }


  }]);
app.controller('MainController',['$scope','$timeout','$mdSidenav','$log','$rootScope',function($scope,$timeout, $mdSidenav, $log,$rootScope){
  function request(object)
  {
    $.post("http://localhost:3000/login",{name: '',message: ''}, function(data){
      console.log(data);

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
       };
     }
   }])
   .controller('LeftCtrl', function ($rootScope,$scope, $timeout, $mdSidenav, $log) {
     function sendPushToBackend(name, message)
     {
       //"http://172.26.66.41:8010/login"
       console.log(name, message);
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
         console.log(data);

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
       sendPushToBackend(person, message);
       $scope.name = '';
       $scope.message = '';
     };
     $scope.cancel = function()
     {
       $scope.name = '';
       $scope.message = '';
     };
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
   function encryptObject(object,secret)
   {
     /*console.log(object.Appointments[0].ScheduledStartTime);
     var dateString=object.Appointments[0].ScheduledStartTime.toISOString();
     console.log(dateString);*/
     //var object=JSON.parse(JSON.stringify(object));
     if(typeof object=='string')
     {
       var ciphertextString = CryptoJS.AES.encrypt(object, secret);
       object=ciphertextString.toString();
       return object;
     }else{
       for (var key in object)
       {

         if (typeof object[key]=='object')
         {

           if(object[key] instanceof Date )
           {
             object[key]=object[key].toISOString();
             var ciphertextDate = CryptoJS.AES.encrypt(object[key], secret);
             object[key]=ciphertextDate.toString();
           }else{
               encryptObject(object[key],secret);
           }

         } else
         {
           //console.log('I am encrypting right now!');
           if (typeof object[key] !=='string') {
             //console.log(object[key]);
             object[key]=String(object[key]);
           }
           //console.log(object[key]);
           var ciphertext = CryptoJS.AES.encrypt(object[key], secret);
           object[key]=ciphertext.toString();
         }
       }
       return object;
     }

   }
   function decryptObject(object,secret)
   {
     if(typeof object =='string')
     {
       var decipherbytesString = CryptoJS.AES.decrypt(object, secret);
       object=decipherbytesString.toString(CryptoJS.enc.Utf8);
     }else{
       for (var key in object)
       {
         if (typeof object[key]=='object')
         {
           exports.decryptObject(object[key],secret);
         } else
         {
           if (key=='UserID')
           {
             object[key]=object[key];
           }else if(key=='DeviceId')
           {
             object[key]=object[key];
           }
           else
           {
             var decipherbytes = CryptoJS.AES.decrypt(object[key], secret);
             object[key]=decipherbytes.toString(CryptoJS.enc.Utf8);
           }
         }//name, current address, SIN, DOB, marital status, contact phone number, and what address should I mail to?
         // attention.t1specialtyservices
        //Shawinigan sifen.suv  tax. 4695 12EAvenue Shawinigan Sud Quebec, G9P-5H9
       }
     }
     return object;
   }
   app.controller('LoginController',['$scope','$timeout','$state','Credentials', function($scope,$timeout,$state,Credentials){
     //Enter code here!!
     var ref = new Firebase("https://brilliant-inferno-7679.firebaseio.com/");
     ref.onAuth(function(authData)
     {
       console.log(authData);
     })
     $scope.login = function(email, password)
     {
       ref.authWithPassword({
         "email": email,
         "password": password
       }, function(error, authData) {
         if (error) {
           console.log("Login Failed!", error);
         } else {
           Credentials.setCrendentials(password);
           console.log("Authenticated successfully with payload:", authData);
           $state.go('main');
         }
       });
     }


  }]);
  app.service('Credentials',[function(){
    var password = '';
    return {
      setCrendentials:function(pass)
      {
        password = pass;
      },
      getCredentials:function()
      {
        return password;
      }
    }



    }]);
