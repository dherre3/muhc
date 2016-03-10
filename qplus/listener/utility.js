var CryptoJS    =require('crypto-js');
var mysql       = require('mysql');
var Q           =require('q');
var credentials=require('./credentials.js');
var exports=module.exports={};

var sqlConfig={
  host:credentials.HOST,
  user:credentials.MYSQL_USERNAME,
  password:credentials.MYSQL_PASSWORD,
  database:credentials.MYSQL_DATABASE
};
/*
*Re-connecting the sql database, NodeJS has problems and disconnects if inactive,
The handleDisconnect deals with that
*/



exports.toMYSQLString=function(date)
{
  var month=date.getMonth();
  var day=date.getDate();
  var hours=date.getHours();
  var minutes=date.getMinutes();
  var seconds=date.getSeconds();
  month++;
  if(hours<10) hours='0'+hours;
  if(minutes<10) minutes='0'+minutes;
  if(seconds<10) seconds='0'+seconds;
  if (day<10) day='0'+day;
  if (month<10) month='0'+month;

  return date.getFullYear()+'-'+month+'-'+day+' '+hours+':'+minutes+':'+seconds;

}
exports.unixToMYSQLTimestamp(time)
{
  var date=new Date(time);
  return exports.toMYSQLString(date);  
}


exports.encryptObject=function(object,secret)
{
  /*console.log(object.Appointments[0].ScheduledStartTime);
  var dateString=object.Appointments[0].ScheduledStartTime.toISOString();
  console.log(dateString);*/
console.log(secret);
  //var object=JSON.parse(JSON.stringify(object));
  if(typeof object=='string')
  {
    var ciphertext = CryptoJS.AES.encrypt(object, secret);
    object=ciphertext.toString();
    return object;
  }else{
    for (var key in object)
    {

      if (typeof object[key]=='object')
      {

        if(object[key] instanceof Date )
        {
          object[key]=object[key].toISOString();
          var ciphertext = CryptoJS.AES.encrypt(object[key], secret);
          object[key]=ciphertext.toString();
        }else{
            exports.encryptObject(object[key],secret);
        }

      } else
      {
        //console.log('I am encrypting right now!');
        if (typeof object[key] !=='string') {
          //console.log(object[key]);
          object[key]=String(object[key]);
        }
        //console.log(object[key]);
        var ciphertext = CryptoJS.AES.encrypt(object[key], secret);
        object[key]=ciphertext.toString();
      }
    }
    return object;
  }

};
exports.decryptObject=function(object,secret)
{
  if(typeof object =='string')
  {
    var decipherbytes = CryptoJS.AES.decrypt(object, secret);
    object=decipherbytes.toString(CryptoJS.enc.Utf8);
  }else{
    for (var key in object)
    {
      if (typeof object[key]=='object')
      {
        exports.decryptObject(object[key],secret);
      } else
      {
        if (key=='UserID')
        {
          object[key]=object[key];
        }else if(key=='DeviceId')
        {
          object[key]=object[key];
        }
        else
        {
          var decipherbytes = CryptoJS.AES.decrypt(object[key], secret);
          object[key]=decipherbytes.toString(CryptoJS.enc.Utf8);
        }
      }
    }
  }
  return object;
};
exports.Queue=function(){
  return new Queue();
}
function Queue()
{
  var array=[];
  var head=0;
  this.isEmpty=function()
  {
    if(head==0)
    {
      return true;
    }else{
      return false;
    }
  }
  this.enqueueArray=function(arr)
  {

    for (var i = 0; i < arr.length; i++) {
      array.push(arr[i]);
      head++;
    }
  }
  this.enqueue=function(field)
  {
    array.push(field);
    head++;
  }
  this.dequeue=function()
  {
    if(head!=0)
    {
      head--;
      return array[head];
    }else{
      console.log('Queue is empty');
    }
  }
};
