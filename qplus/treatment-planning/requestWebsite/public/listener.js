var app=angular.module('MUHCPushNotifications',['ngMaterial']);
app.config(function($mdThemingProvider) {
   // Configure a dark theme with primary foreground yellow
   $mdThemingProvider.theme('docs-dark', 'default')
     .primaryPalette('pink')
     .dark();
 });

app.controller('TablesController',['$scope','$timeout','$filter','$rootScope', function($scope,$timeout,$filter,$rootScope){
  //Enter code here!!
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
    var objectToSend = {};
    $rootScope.canceType = cancer;
    console.log(cancer);
    objectToSend[$rootScope.canceType] = {};
    $.post("http://localhost:3000/login",{CancerType: cancer, Analysis:'SeqFreq'}, function(data){
      console.log(data);
      /*data = JSON.stringify(data);
      data = encryptObject(data, '12345');
      objectToSend[$rootScope.canceType].SeqFreq = data;*/
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

    $.post("http://localhost:3000/login",{CancerType: cancer, Analysis:'StepFreq'}, function(data){
      console.log(data);
      /*data = JSON.stringify(data);
      data = encryptObject(data, '12345');
      objectToSend[$rootScope.canceType].StepFreq=data;*/

      $timeout(function()
      {
          var steps = organizeSteps(data);
          steps = getTotalCount(steps);
          console.log(steps);
          $scope.stepFrequency = organizeSteps(data);

      });

    });

    $.post("http://localhost:3000/login",{CancerType: cancer, Analysis:'MissingFreq'}, function(data){
      /*data = JSON.stringify(data);
      data = encryptObject(data, '12345');
      objectToSend[$rootScope.canceType].MissingFreq = data;
      console.log(objectToSend);
      ref.update(objectToSend);*/
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
