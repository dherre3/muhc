var myApp=angular.module('MUHCApp');

myApp.service('Patient',['UserPreferences','$q','$cordovaFileTransfer','$cordovaDevice','FileManagerService','$filter',function(UserPreferences,$q, $cordovaFileTransfer, $cordovaDevice,FileManagerService,$filter){
    var profileImage='';
    return{
        setUserFieldsOnline:function(patientFields,diagnosis){
            var r=$q.defer();
            console.log(patientFields);
            patientFields=patientFields[0]; 
            this.FirstName=patientFields.FirstName;
            this.LastName=patientFields.LastName;
            this.Alias=patientFields.Alias;
            this.TelNum=patientFields.TelNum;
            this.Email=patientFields.Email;
            this.Diagnosis=diagnosis;
            this.Alias=patientFields.Alias;
            this.UserSerNum=patientFields.PatientSerNum;
            
            if(patientFields.ProfileImage&& typeof patientFields.ProfileImage!=='undefined'&& patientFields.ProfileImage!=='')
            {
              console.log(typeof patientFields.ProfileImage);
              var words=CryptoJS.enc.Hex.parse(patientFields.ProfileImage);
              patientFields.ProfileImage=CryptoJS.enc.Base64.stringify(words);
              this.ProfileImage='data:image/jpg;base64,'+patientFields.ProfileImage;
              console.log(this.ProfileImage);
              profileImage=this.ProfileImage;
            }else{
              profileImage='./img/patient.png';
            }
            console.log(profileImage)
            r.resolve(patientFields);
              
            return r.promise;
        },
        setUserFieldsOffline:function(patientFields,diagnosis)
        {
          var r=$q.defer();
          this.FirstName=patientFields.FirstName;
          this.LastName=patientFields.LastName;
          this.Alias=patientFields.Alias;
          this.TelNum=$filter('phone-number')(patientFields.TelNum);
          this.Email=patientFields.Email;
          this.Diagnosis=diagnosis;
          this.UserSerNum=patientFields.PatientSerNum;
          this.ProfileImage=patientFields.ProfileImage;
          this.Alias=patientFields.Alias;
          if(patientFields.PathFileSystem)
          {
            var promise=[FileManagerService.getFileUrl(patientFields.PathFileSystem)];
            $q.all(promise).then(function(result){
              console.log(result);
              patientFields.ProfileImage=result[0];
              profileImage=result[0];
              console.log(profileImage);
              r.resolve(patientFields);
            },function(error){
              console.log(error);
              r.resolve(patientFields);
            });
          }else{
            this.ProfileImage='./img/patient.png';
            r.resolve(patientFields);
          }
          return r.promise;
        },
        setDiagnosis:function(diagnosis){
            this.Diagnosis=diagnosis;
        },
        setFirstName:function(name){
            this.FirstName=name;
        },
        setLastName:function(name){
            this.LastName=name;
        },
        setAlias:function(name){
            this.Alias=name;
        },
        setTelNum:function(telephone){
            this.TelNum=telephone;
        },
        setEmail:function(email){
            this.Email=email;
        },
        getDiagnosis:function(){
            return this.Diagnosis;
        },
        getFirstName:function(){
            return this.FirstName;
        },
        getLastName:function(){
            return this.LastName;
        },
        getAlias:function(){
            return this.Alias;
        },
        getTelNum:function(){
            return this.TelNum;
        },
        getEmail:function(){
            return this.Email;
        },
        getUserSerNum:function(){
            return this.UserSerNum;
        },
        setProfileImage:function(img){
            console.log('why?')
            this.ProfileImage='data:image/png;base64,'+img;
        },
        getProfileImage:function(){
            return profileImage;
        },
        getStatus:function(){
            return this.Status;
        }
    };
}]);
