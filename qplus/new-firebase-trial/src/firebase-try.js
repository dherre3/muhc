var firebase = require('firebase');
firebase.initializeApp({
    serviceAccount:"../Opal-08727a9739a1.json",
    databaseURL:"https://brilliant-inferno-7679.firebaseio.com"
});

var db = firebase.database();

var ref = db.ref('NF');
ref.set({'David':'jee;p'});
