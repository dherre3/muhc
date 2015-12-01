var utility=require('./utility.js');
var sqlInterface=require('./sqlInterface.js');
var filesystem  =require('fs');
var Firebase =require('firebase');
function sayHelloWorld()
{
  console.log('Hello World');
}
//Testing queue object

/*var queue=utility.Queue();

queue.enqueueArray(a);

while(!queue.isEmpty())
{
  var b=queue.dequeue();
  console.log(b);
}*/
var ref=new Firebase('https://brilliant-inferno-7679.firebaseio.com/.info/connected');
ref.on("value",function(snap)
{
  if(snap.val()==true)
  {
    console.log('connected');
  }else{
    console.log('disconnected');
  }
});
var ref2=new Firebase('https://brilliant-inferno-7679.firebaseio.com/');
ref2.onDisconnect().set('I disconnected');
