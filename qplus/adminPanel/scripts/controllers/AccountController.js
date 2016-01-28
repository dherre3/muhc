app.controller('AccountController',function ($rootScope, URLs,$scope,User, $timeout, fieldsValidate) {

  

 
  setUpAccountSettings();
  $scope.update=function(key, value)
  {
    $rootScope.checkSession()
    console.log(value);
    var result=fieldsValidate.validateString(key,value);
    $timeout(function(){
      $scope.alert={};
      $scope.alert[key]=result;
      $scope.alert[key].show=true;
    });
    if(result.type=='success')
    {
      User.updateFieldInServer(key, value);
      User.updateUserField(key,value);
      $scope.closeAllOtherFields();
    }
  };
  $scope.updatePassword=function(){
    $rootScope.checkSession();
    fieldsValidate.validatePassword($scope.password.oldValue,$scope.password.newValue).then(function(result){
      $timeout(function(){
        $scope.alert={};
        $scope.alert['Password']=result;
        $scope.alert['Password'].show=true;
      });
      if(result.type=='success')
      {
        User.updateFieldInServer('Password', $scope.password.newValue);
        User.updateUserField('Password',$scope.password.newValue);
        $scope.closeAllOtherFields()
      }
      console.log(result);
    })


  };
  $scope.$watch('uploadProfilePic',function(){
    console.log($scope.uploadProfilePic);
  });

  $scope.cancelEdit=function(value)
  {
    $scope.value.Edit=false;
    $scope.value.newValue=value.Value;
    $scope.alert[key].show=false;
    $scope.accountFields.Password.Edit=false;
    $scope.accountFields.Password.newValue=accountFields.Password.Value;
    $scope.alert['Password'].show=false;
    $scope.accountFields.Username.Edit=false;
    $scope.accountFields.Username.newValue=accountFields.Username.Value;
    $scope.alert['username'].show=false;
  }
  $scope.updateUsername=function(){
      var result=fieldsValidate.validateString('Username',  $scope.username.newValue);
      $timeout(function(){
        $scope.alert={};
        $scope.alert['Username']=result;
        $scope.alert['Username'].show=true;
      });
      if(result.type=='success')
      {
        User.updateFieldInServer('Username', $scope.username.newValue);
        User.updateUserField('Username',$scope.username.newValue);
        $scope.closeAllOtherFields();
      }
  }
  $scope.closeAllOtherFields=function(fieldName)
  {
    for (field in $scope.accountFields) {
      if(field!==fieldName){
        $scope.accountFields[field].Edit=false;
      }
    }
  }
  function setUpAccountSettings()
  {
    var userFields=User.getUserFields();
    $scope.userFields=userFields;
    console.log(userFields);
    var accountObject={};
    for (var key in userFields) {
      if(key!=='Image'&&key!=='UserTypeSerNum'&&key!=='DoctorAriaSer'&&key!=='Role'&&key!=='StaffID')
      {
        accountObject[key]=
        {
          'Value':userFields[key],
          'Edit':false,
          'newValue':userFields[key]
        }
      }else if(key=='Image')
      {
        accountObject[key]=
        {
          'Value':URLs.getDoctorImageUrl()+userFields[key],
          'Edit':false,
          'newValue':URLs.getDoctorImageUrl()+userFields[key]
        }
      }else if(key=='Password')
      {
        accountObject[key]=
        {
          'Value':'',
          'Edit':false,
          'newValue':''
        }
      }
    };
    $scope.accountFields=accountObject;
  }
});
