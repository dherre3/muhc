var myApp=angular.module('MUHCApp');
/**
*
*
*
**/
myApp.service('RequestToServer',function(UserAuthorizationInfo, EncryptionService, $http,$q,$cordovaNetwork){
    function getIdentifierWeb()
    {
      var r=$q.defer();
      /*$http({
        method:'GET',
        url:'https://depdocs.com/opal/getPublicIpAddress.php'}).then(function(data){
          data=data.data;
          data=data.substring(2, data.length-2);
          var uniqueIdentifier=JSON.parse(data);
          var uuid=String(uniqueIdentifier.query);
          uuid=uuid.replace(/\./g, "-");
          console.log(uuid);
          r.resolve(uuid);
        });*/
    $http({
        method: 'GET',
        url: 'http://ip-api.com/json/?callback=?'
        }).then(function(data){
          data=data.data;
          data=data.substring(2, data.length-2);
          var uniqueIdentifier=JSON.parse(data);
          var uuid=String(uniqueIdentifier.query);
          uuid=uuid.replace(/\./g, "-");
          console.log(uuid);
          r.resolve(uuid);
        });
      return r.promise;
    }
    var identifier='';
    return{
        sendRequest:function(typeOfRequest,content){
          ons.notification.alert({
              message: "Your action will not reflect in the patient's app",
              modifier: undefined
            });
        },
        setIdentifier:function()
        {
          var r=$q.defer();
          var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
          if(app){
            identifier=device.uuid;
            r.resolve(device.uuid);
          }else{
            getIdentifierWeb().then(function(uuid){
              console.log(uuid);
              identifier=uuid;
              r.resolve(uuid);
            });
          }
          return r.promise;
        },
        getIdentifier:function()
        {
          return identifier;
        }
    };



});
