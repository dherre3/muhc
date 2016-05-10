var Firebase = require('firebase');

var ref = new Firebase('https://cofindme.firebaseio.com/');

setInterval(function()
{
   ref.push({david:(new Date()).toISOString()},function(error){
       console.log(error);
   });
},2000); 