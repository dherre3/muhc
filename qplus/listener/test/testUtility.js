var utility=require('../utility.js');
var sqlInterface=require('../sqlInterface.js');
var filesystem  =require('fs');
var Firebase =require('firebase');
var CryptoJS=require('crypto-js');
var requestObject={
	Token:'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2IjowLCJkIjp7InByb3ZpZGVyIjoicGFzc3dvcmQiLCJ1aWQiOiJhNTFmYmExOC0zODEwLTQ4MDgtOTIzOC00ZDBlNDg3Nzg1YzgifSwiaWF0IjoxNDU2Mzc2MDU4fQ.mvz1ZSosHwKT0Y-uz1AOPulnheu98PDuYnXZ1dH8XsA',
	Request:'Logout',
	Username:'ac6eaeaa-f725-4b07-bdc0-72faef725985',
	DeviceId:'browser'
};

sqlInterface.updateLogout(requestObject).then(function(result)
{
	console.log(result.affectedRows);
});
//Testing queue object

/*var queue=utility.Queue();

queue.enqueueArray(a);

while(!queue.isEmpty())
{
  var b=queue.dequeue();
  console.log(b);
}*/
/*sqlInterface.getUsersPassword('ec00959e-7291-469b-87c8-1d302a676371').then(function(pass){
  console.log(pass);
  var a=CryptoJS.AES.encrypt('David',pass).toString();
  var b=CryptoJS.AES.decrypt(a,pass).toString(CryptoJS.enc.Utf8);
  console.log(b);

});*/
//var a=CryptoJS.AES.encrypt('SU','HERD91052016').toString();
//console.log(CryptoJS.AES.decrypt("U2FsdGVkX19BHMosuJuvy8SoLVUJjEX1m/0UzXDm6nfJauQJbDQjbLOoIf6igH07uLWBJQZQHwTFXJGUkhK/fA==",'d4ee71e271a4e01f9de703add199686d0c98d115802945841a501242b6ccc063'));
