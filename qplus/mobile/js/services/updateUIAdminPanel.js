var myApp=angular.module('MUHCApp');
myApp.service('UpdateUI',['$http', 'Patient','Doctors','Appointments','Messages','Documents','UserPreferences', 'UserAuthorizationInfo', '$q', 'Notifications', 'UserPlanWorkflow','$cordovaNetwork', 'Notes', 'LocalStorage','RequestToServer','$filter','LabResults',
  function ($http, Patient,Doctors, Appointments,Messages, Documents, UserPreferences, UserAuthorizationInfo, $q, Notifications, UserPlanWorkflow,$cordovaNetwork,Notes,LocalStorage,RequestToServer,$filter,LabResults) {
  //Enter code here!!
  function updateAllServices(dataUserObject,mode){
      console.log(mode);
      var promises=[];
      console.log(dataUserObject);
        var documents=dataUserObject.Documents;
        var documentProm=Documents.setDocumentsOnline(documents);
        var doctors=dataUserObject.Doctors;
        var doctorProm=Doctors.setUserContactsOnline(doctors);
        var patientFields=dataUserObject.Patient;
        var patientProm=Patient.setUserFieldsOnline(patientFields, dataUserObject.Diagnosis);
        console.log(patientProm);
        promises=[doctorProm,documentProm,patientProm];
        $q.all(promises).then(function(){
        console.log('I am inside!!!');
        console.log(dataUserObject);
        Messages.setUserMessages(dataUserObject.Messages);
        Notifications.setUserNotifications(dataUserObject.Notifications);
        UserPlanWorkflow.setTreatmentPlan(dataUserObject.Tasks, dataUserObject.Appointments);
        var plan={
            '1':{'Name':'CT for Radiotherapy Planning','Date':'2015-10-19T09:00:00Z','Description':'stage1','Type': 'Appointment'},
            '2':{'Name':'Physician Plan Preparation','Date':'2015-10-21T09:15:00Z','Description':'stage2','Type':'Task'},
            '3':{'Name':'Calculation of Dose & Physician Review','Date':'2015-10-23T09:15:00Z','Description':'stage3','Type':'Task'},
            '4':{'Name':'Quality Control','Date':'2015-10-28T10:15:00Z','Description':'stage5','Type':'Task'},
            '5':{'Name':'Scheduling','Date':'2015-10-30T09:15:00Z','Description':'stage6','Type':'Task'},
            '6':{'Name':'First Treatment','Date':'2015-11-02T09:15:00Z','Description':'stage6','Type':'Task'}
        };
        var newDate=new Date();
        var valAdded=-6;

        for (var key in plan) {
          var tmp=new Date(newDate);
          tmp.setDate(tmp.getDate()+valAdded);
          valAdded+=2;
          plan[key].Date=$filter('formatDateToFirebaseString')(tmp);
        }
          LabResults.setTestResults(dataUserObject.LabTests);
          console.log(plan);
          UserPlanWorkflow.setUserPlanWorkflow(plan);
          UserPreferences.setUserPreferences(dataUserObject.Patient.Language,dataUserObject.Patient.EnableSMS);
          Appointments.setUserAppointments(dataUserObject.Appointments);
          Notes.setNotes(dataUserObject.Notes);
          console.log(dataUserObject);
          if(mode=='Online')
          {
            LocalStorage.WriteToLocalStorage('All',dataUserObject);
          }

      });

  }
  return {
    updateUserFields:function()
    {
      var username=UserAuthorizationInfo.getUsername();
      var url='http://172.26.66.41/devDocuments/david/muhc/qplus/php/mobile/fetchPatientData.php';
      var r=$q.defer();
      var req = {
       method: 'POST',
       url: url,
       headers: {
         'Content-Type': undefined
       },
       data: username
      }

      $http(req).then(function(data){
          console.log(data);
          r.resolve(updateAllServices(data.data));

      }, function(error){
        r.reject(error);

      });
      return r.promise;
    }
      



  };



  }]);
