var app=angular.module('MUHCAppListener',[]);
app.controller('MainController',['$scope','$timeout','firebaseInterface','$q',function($scope,$timeout,firebaseInterface,$q){
  $scope.requests=[];
  //console.log(CryptoJS.SHA256('12345').toString());

  $scope.selectTimeline='All';
  setInterval(function(){
    location.reload();
  },1296000000);
  var ref=new Firebase('https://brilliant-inferno-7679.firebaseio.com/VWR');
  ref.auth('9HeH3WPYe4gdTuqa88dtE3KmKy7rqfb4gItDRkPF');
  setInterval(function(){
ref.child('Users').on('value',function(snapshot){
        //console.log(snapshot.val());
        var now=(new Date()).getTime();
        var usersData=snapshot.val();
        for (var user in usersData) {

          for(var device in usersData[user])
          {
            if(typeof usersData[user][device].Timestamp!=='undefined')
            {
              if(now-usersData[user][device].Timestamp>240000)
              {
                console.log('Deleting', user);
                ref.child('Users/'+user+'/'+device).set({});
              }
            }else{
              for(var request in usersData[user][device])
              {
                if(now-usersData[user][device][request].Timestamp>240000)
                {
                  console.log('Deleting', user);
                  ref.child('Users/'+user+'/'+device).set({});
                }
              }
            }
          }
        };
    });
},60000);

  ref.child('requests').on('child_added',function(snapshot){
    console.log(snapshot);
    if(snapshot.val()||typeof snapshot.val() !== null)
    {
      var snap = snapshot.val();
      var keys = Object.keys(snap);
      var req = snap[keys[0]];
      var user = snapshot.key();

      var requestObject = {'user':user, 'request':req.request, 'parameters':req.parameters};
      requestBackend(requestObject).then(function(result){
        console.log(result);
        if(result.response == 'success')
        { 
          console.log(result.data)
          firebaseInterface.respondToRequest(user, req.request, result.data);
        }else{
          console.log(result);
          //firebaseInterface.deleteFromFirebase(request.key(),keys[0]);
        }   
      }); 
    }

  });


   var interval = setInterval(function()
   {

      requestBackend({request:'Appointments-Resources'}).then(function(result){
        if(result.response =='success')
        {
          console.log(result.data.appointments);
          firebaseInterface.writeToFirebase('checkin-appointments', result.data.appointments);
          firebaseInterface.writeToFirebase('Resources', result.data.resources); 
        }else{
          console.log(results.data);
        }
        
      });
   },10000);
  
  function requestBackend(parameters)
  {
    var r = $q.defer();
    $.post("http://172.26.66.41:4000/login",parameters, function(data){
      r.resolve(data);
    });
    return r.promise;
  }

  


  function encryptObject(object,secret)
  {
    /*console.log(object.Appointments[0].ScheduledStartTime);
    var dateString=object.Appointments[0].ScheduledStartTime.toISOString();
    console.log(dateString);*/
    //var object=JSON.parse(JSON.stringify(object));
    if(typeof object=='string')
    {
      var ciphertext = CryptoJS.AES.encrypt(object, secret);
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
            var ciphertext = CryptoJS.AES.encrypt(object[key], secret);
            object[key]=ciphertext.toString();
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
