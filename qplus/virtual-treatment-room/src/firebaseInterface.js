
/**
 * Firebase Interface
 * @module Firebase/Interface
 * @see module:SQL/Interface
 * @requires firebase
 * @requires ./credentials.js
 * 
 * 
 */
var Firebase = require('firebase');
var credentials = require('./credentials.js');
var firebaseRef = new Firebase('https://brilliant-inferno-7679.firebaseio.com/VWR');
var exports = module.exports = {};
function authenticate()
{
   firebaseRef.authWithCustomToken(credentials.FIREBASE_SECRET,function(){});
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