firebaseInterfaceService.js
var app = angular.module('MUHCAppListener');

app.service('firebaseInterface',function(){







/**
 * Firebase Interface
 * @module Firebase/Interface
 * @see module:SQL/Interface
 * @requires firebase
 * @requires ./credentials.js
 * 
 * 
 */

var firebaseRef = new Firebase('https://brilliant-inferno-7679.firebaseio.com/VWR');
var exports = module.exports = {};
function authenticate()
{
   firebaseRef.authWithCustomToken(credentials.FIREBASE_SECRET,function(){
       
       
   });
}
exports.FirebaseRequestMappings = {
    'Call-Patient':exports.callPatient,
    'Arrive-Patient':exports.arrivePatient
};
exports.main = function(requestkey, requestobject,data)
{
    var request = requestobject.request;
    exports.FirebaseRequestMappings[request](requestkey, requestobject,data).then(function()
    {
        exports.firebaseRefRequest.child(requestKey).set(null);
    }).catch(function(error){
       exports.firebaseRefRequest.child(requestKey).set(null);
    });
}
authenticate();
exports.firebaseRef = firebaseRef;
exports.firebaseRefRequest = firebaseRef.child('requests');
/**
 * @object
 * @property {string} checkin-appointments -Contains the path to checkin appointments for the Firebase DB
 * @property {string} Resources -Path's for the resources available from checkin appointments and uploads them to Firebase!
 *
 */
var pathsFirebase = {
    'checkin-appointments':'all-checkin-appointments',
    'Resources':'resources'
};
/**
 * Function writes to firebase section for the virtual waiting room
 * @exports Firebase/Interface
 * @method writeToFirebase
 * @param {string} section Describes the section path to write to Firebase
 * @param {data} data Data portion to be written to Firebase
 * @returns {Promise} Returns promise with success or failure status
 */
exports.writeToFirebase = function(section, data)
{
    return new Promise(function(resolve, reject){
       var objectToFirebase = {};objectToFirebase[pathsFirebase[section]] = data;
        authenticate();
        if(pathsFirebase.hasOwnProperty(section))
        {
            firebaseRef.update(objectToFirebase, function(error)
            {
                if(error)
                {
                    reject({response:'error',reason:error});
                }else{
                    resolve({response:'success'});
                }
            });  
        } 
    });
    
};
/**
 * Delete section in Firebase 
 * @exports Firebase/Interface
 * @method deleteSection
 * @param {string} section Specifies the path to be deleted
 * @returns {Promise} Returns promise with success or failure status
 * 
 */
exports.deleteSection = function(section)
{
   if(pathsFirebase.hasOwnProperty(section))
   {
     firebaseRef.child(pathsFirebase[section]).set(null);  
   }
};
exports.arrivePatient = function(requestkey, requestobject,data)
{
    var child_id = patient.PatientSer + "-" + patient.ScheduledActivitySer + "-" + patient.ScheduledStartTime;    

    var patient = data.Patient;
    var destination = data.Destination;//Venue Id;
    var patient_child = firebaseScreenRef.child(child_id);
    return new Promise(function(resolve,reject){
       patient_child.update(
       { 
            PatientStatus: "Arrived" 
       },function(error){
           if(error) reject(error);
           else resolve();
       }); 
        
        
    });
    
};
exports.callPatient = function(requestkey, requestobject,data)
{
    var patient = data.Patient;
    var destination = data.Destination;//Venue Id;
    var child_id = patient.PatientSer + "-" + patient.ScheduledActivitySer + "-" + patient.ScheduledStartTime;  
    var patient_child = firebaseRef.child(getScreenPathFirebase()).child(child_id); 
    return new Promise(function(resolve,reject){
        patient_child.set(
		{ 
			FirstName: patient.FirstName, 
			LastName: patient.LastName, 
			PatientSer: patient.PatientSer, 
			Destination: destination, 
			PatientStatus: "Called", 
			Appointment: patient.Expression1, 
			Resource: patient.ResourceName, 
			ScheduledActivitySer: patient.ScheduledActivitySer,
			Timestamp: Firebase.ServerValue.TIMESTAMP
		},function(error){
           if(error) reject(error);
           else resolve(); 
        });
        
    });
   
};


function getScreenPathFirebase()
{
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    if(dd<10) dd='0'+dd;
    if(mm<10) mm='0'+mm;
    today = mm+'-'+dd+'-'+today.getFullYear();
    return today;
};
return exports;
});