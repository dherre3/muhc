var CryptoJS    =require('crypto-js');
var keysave=require('./key-save.js');
var exports=module.exports={};
exports.encryptObject=function(object)
{
  /*console.log(object.Appointments[0].ScheduledStartTime);
  var dateString=object.Appointments[0].ScheduledStartTime.toISOString();
  console.log(dateString);*/

  //var object=JSON.parse(JSON.stringify(object));
  if(typeof object=='string')
  {
    console.log('Im a string');
    var ciphertext = CryptoJS.AES.encrypt(object, keysave.masterKey);
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
          var ciphertext = CryptoJS.AES.encrypt(object[key], keysave.masterKey);
          object[key]=ciphertext.toString();
        }else{
            exports.encryptObject(object[key]);
        }

      } else
      {
        //console.log('I am encrypting right now!');
        if (typeof object[key] !=='string') {
          //console.log(object[key]);
          object[key]=String(object[key]);
        }
        //console.log(object[key]);
        var ciphertext = CryptoJS.AES.encrypt(object[key], keysave.masterKey);
        object[key]=ciphertext.toString();
      }
    }
    return object;
  }

};
exports.decryptObject=function(object)
{
  if(typeof object =='string')
  {
    var decipherbytes = CryptoJS.AES.decrypt(object, keysave.masterKey);
    object=decipherbytes.toString(CryptoJS.enc.Utf8);
  }else{
    for (var key in object)
    {
      if (typeof object[key]=='object')
      {
        exports.decryptObject(object[key]);
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
          var decipherbytes = CryptoJS.AES.decrypt(object[key], keysave.masterKey);
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
