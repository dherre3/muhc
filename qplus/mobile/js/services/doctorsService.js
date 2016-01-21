var myApp=angular.module('MUHCApp');
myApp.service('Doctors',function($q,$filter,FileManagerService,$cordovaDevice){
    function copyDoctorObject(object)
    {
      var newObject={};
      for(key in object)
      {
        newObject[key]=object[key];
      }
      return newObject;
    }
    var Doctors=[];
    var Oncologists=[];
    var OtherDoctors=[];
    var PrimaryPhysician=[];
    return{
        setUserContactsOnline:function(doctors)
        {
            var r=$q.defer();
            this.Doctors=[];
            this.Oncologists=[];
            this.OtherDoctors=[];
            this.PrimaryPhysician=[];
            Doctors=[];
            Oncologists=[];
            OtherDoctors=[];
            PrimaryPhysician=[];
            var promises=[];  
            if(typeof doctors!=='undefined'&&doctors){
                var doctorKeyArray=Object.keys(doctors);
                for (var i = 0; i < doctors.length; i++) {  
                  var copyDoctor=copyDoctorObject(doctors[doctorKeyArray[i]]);
                  console.log(doctors[doctorKeyArray[i]]);
                  if(typeof doctors[doctorKeyArray[i]].ProfileImage=='undefined'||doctors[doctorKeyArray[i]].ProfileImage=='')
                  {
                    copyDoctor.ProfileImage='./img/doctor.png';
                  }else{
                    copyDoctor.ProfileImage="../listener/Doctors/"+doctors[doctorKeyArray[i]].ProfileImage;
                  }
                   if(copyDoctor.PrimaryFlag=='1'&&copyDoctor.OncologistFlag=='0'){
                        this.PrimaryPhysician.push(copyDoctor);
                        PrimaryPhysician.push(copyDoctor);
                   }else if(copyDoctor.OncologistFlag=='1')
                   {
                        this.Oncologists.push(copyDoctor);
                        Oncologists.push(copyDoctor);
                   }else{
                     this.OtherDoctors.push(copyDoctor);
                     OtherDoctors.push(copyDoctor);
                   }
                   Doctors.push(copyDoctor);
                   this.Doctors.push(copyDoctor);
                };
                this.Oncologists=$filter('orderBy')(this.Oncologists,'LastName',false);
                this.Doctors=$filter('orderBy')(this.Doctors,'LastName',false);
                this.OtherDoctors=$filter('orderBy')(this.OtherDoctors,'LastName',false);
                Doctors=$filter('orderBy')(Doctors,'LastName',false);
                Oncologists=$filter('orderBy')(Oncologists,'LastName',false);
                OtherDoctors=$filter('orderBy')(OtherDoctors,'LastName',false);
                $q.all(promises).then(function(){
                  r.resolve(doctors);
                });
            }else{
              r.resolve(true);
            }
            return r.promise;
        },
        setUserContactsOffline:function(doctors)
        {
            var r=$q.defer();
            Doctors=[];
            Oncologists=[];
            OtherDoctors=[];
            PrimaryPhysician=[];
            var promises=[];

            /*
            *Add code for offline extraction of doctors photos
            */

            if(typeof doctors!=='undefined'&&doctors){
              var doctorKeyArray=Object.keys(doctors);
              for (var i = 0; i < doctorKeyArray.length; i++) {
                if(doctors[i].PathFileSystem){
                  promises.push(FileManagerService.getFileUrl(doctors[i].PathFileSystem));
                }
              }
              $q.all(promises).then(function(results){
                var tracker=0;
                for (var i = 0; i < doctors.length; i++) {
                  var copyDoctor=copyDoctorObject(doctors[i]);
                  if(doctors[i].PathFileSystem)
                  {
                    copyDoctor.ProfileImage=results[tracker];
                    tracker++;
                  }else{
                    copyDoctor.ProfileImage='./img/doctor.png';
                  }
                   if(copyDoctor.PrimaryFlag=='1'&&copyDoctor.OncologistFlag=='0'){
                        PrimaryPhysician.push(copyDoctor);
                   }else if(copyDoctor.OncologistFlag=='1')
                   {
                        Oncologists.push(copyDoctor);
                   }else{
                     OtherDoctors.push(copyDoctor);
                   }
                   Doctors.push(copyDoctor);
                };
                Oncologists=$filter('orderBy')(Oncologists,'LastName',false);
                Doctors=$filter('orderBy')(Doctors,'LastName',false);
                OtherDoctors=$filter('orderBy')(OtherDoctors,'LastName',false);
                r.resolve(true);
              },function(error){
                for (var i = 0; i < doctors.length; i++) {
                  var copyDoctor=copyDoctorObject(doctors[i]);
                  copyDoctor.ProfileImage='./img/doctor.png';
                   if(copyDoctor.PrimaryFlag=='1'&&copyDoctor.OncologistFlag=='0'){
                        PrimaryPhysician.push(copyDoctor);
                   }else if(copyDoctor.OncologistFlag=='1')
                   {
                        Oncologists.push(copyDoctor);
                   }else{
                     OtherDoctors.push(copyDoctor);
                   }
                   Doctors.push(copyDoctor);
                };
                console.log(error);
        				r.resolve(true);
        			});
            }else{
              r.resolve(true);
            }

            return r.promise;
        },
        isEmpty:function()
        {
          if(this.Doctors.length==0)
          {
            return true;
          }else{
            return false;
          }
        },
        getContacts:function(){
            return Doctors;
        },
        getPrimaryPhysician:function(){
            return PrimaryPhysician;
        },
        getOncologists:function(){
            return Oncologists;
        },
        getOtherDoctors:function(){
            return OtherDoctors;
        },
        getDoctorBySerNum:function(userSerNum){
            for (var i = 0; i < Doctors.length; i++) {
                if(Doctors[i].DoctorSerNum===userSerNum)
                {
                    console.log(Doctors[i]);
                    return Doctors[i];
                }
            };
        }

    }
});
