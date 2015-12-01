var app=angular.module('MUHCAppListener',[]);
app.controller('MainController',['$scope','$timeout',function($scope,$timeout){
  $scope.requests=[];
  setInterval(function(){
    location.reload();
  },1296000000);
  function uploadToFirebase(requestKey,requestObject,object)
  {

    console.log('I am about to go to into encrypting');
    //console.log(request);
    if(typeof object=='undefined')
    {
      completeRequest(requestKey, requestObject);
    }else{
      object=encryptObject(object);
      var deviceId=requestObject.DeviceId;
      var UserID=requestObject.UserID;
      var userFieldsPath='Users/'+UserID+'/'+deviceId;
        console.log('I am about to write to firebase');
      ref.child(userFieldsPath).update(object, function(){
        console.log('I just finished writing to firebase');
        completeRequest(requestKey, requestObject);
        //logRequest(requestObject);
      });
    }
  }
  function completeRequest(requestKey, requestObject, invalid)
  {
    $scope.selectTimeline="All";
    //Clear request
    $timeout(function(){
      if(invalid)
      {
        $scope.requests.push({request:requestObject,time:new Date(), response:'Failure'});
      }else{
        $scope.requests.push({request:requestObject,time:new Date(), response:'Success'});
      }
    });


    ref.child('requests').child(requestKey).set(null);
    //Log Request
    if(invalid!==undefined)
    {
      //api.logRequest(requestObject);
    }else{
      requestObject.reason='Error wrong arguments';
      //api.logRequest(requestObject);
    }


  }
  var ref=new Firebase('https://brilliant-inferno-7679.firebaseio.com/');
  ref.child('requests').on('child_added',function(request){
    $.post("http://localhost:3000/login",{key: request.key(),objectRequest: request.val()}, function(data){
      uploadToFirebase(data.key, data.requestObject,data.objectToFirebase);
    });
  });
  function encryptObject(object)
  {
    /*console.log(object.Appointments[0].ScheduledStartTime);
    var dateString=object.Appointments[0].ScheduledStartTime.toISOString();
    console.log(dateString);*/

    //var object=JSON.parse(JSON.stringify(object));
    if(typeof object=='string')
    {
      var ciphertext = CryptoJS.AES.encrypt(object, '12345');
      object=ciphertext.toString();
      return object;
    }else{
      for (var key in object)
      {

        if (typeof object[key]=='object')
        {

          if(object[key] instanceof Date )
          {
            object[key]=object[key].toISOString();
            var ciphertext = CryptoJS.AES.encrypt(object[key], '12345');
            object[key]=ciphertext.toString();
          }else{
              encryptObject(object[key]);
          }

        } else
        {
          //console.log('I am encrypting right now!');
          if (typeof object[key] !=='string') {
            //console.log(object[key]);
            object[key]=String(object[key]);
          }
          //console.log(object[key]);
          var ciphertext = CryptoJS.AES.encrypt(object[key], '12345');
          object[key]=ciphertext.toString();
        }
      }
      return object;
    }

  };

  }]);
  app.filter('filterRequests', function() {
  return function( items, option) {
    var filtered = [];
    var date=new Date();
    if(option=='Today')
    {
      var date=date.setHours(0,0,0,0);
    }else if(option=='All')
    {
      date=new Date('1980');
    }else if(option=='Last 7 days')
    {
      date.setDate(date.getDate()-7);
    }else if(option=='Last 15 days')
    {
        date.setDate(date.getDate()-15);
    }
    angular.forEach(items, function(item) {
      if(item.time>date)
      {
        filtered.push(item);
      }
    });
    return filtered;
  };
});
