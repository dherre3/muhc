var express        =         require("express");
var bodyParser     =         require("body-parser");
var mainRequestApi=require('./main.js');
var resetPasswordApi=require('./resetPassword.js');

var app            =         express();
app.use(bodyParser.urlencoded({ extended: true }));
app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });
app.get('/',function(req,res,next){
  res.sendfile("./requestWebsite/index.html");
});
app.use(express.static('./requestWebsite/public'));
app.get('/request',function(req,res,next){
  console.log(req.body);
  res.sendfile("./requestWebsite/index.html");
});
app.post('/login',function(req,res,next){
  var requestKey=req.body.key;
  var request=req.body.objectRequest;
  var requestObject={};
  requestObject=request;
  console.log(requestObject);
  console.log(requestKey);
    console.log(requestObject);

    if(requestObject.Request=='VerifySSN'||requestObject.Request=='SetNewPassword'||requestObject.Request=='VerifySecurityAnswer')
    {
      console.log(requestObject);
      resetPasswordApi.resetPasswordRequest(requestKey,requestObject).then(function(results)
      {
        console.log('Reset Password ');
        console.log(results);
        res.send(results);
      });

    }else{
      mainRequestApi.apiRequest(requestKey, requestObject).then(function(results){
        console.log('Api call from server.js')
        console.log(results);
        res.send(results);
      })

    }
     /*requestObject.Request=utility.decryptObject(requestObject.Request);
     console.log(requestObject.Request);
     requestObject.Parameters=utility.decryptObject(requestObject.Parameters);
    if(requestObject.Request=='Login'||requestObject.Request=='Refresh')
    {
      updateClient.update(requestObject).then(function(objectToFirebase)
      {
          var firebaseObject={};
          firebaseObject.key=requestKey;
          firebaseObject.requestObject=requestObject;
          firebaseObject.objectToFirebase=objectToFirebase;
          res.send(firebaseObject);
          //uploadToFirebase(requestKey, requestObject, objectToFirebase);

      }).catch(function(response){
          var firebaseObject={};
          firebaseObject.key=requestKey;
          firebaseObject.requestObject=requestObject;
          res.send(firebaseObject);
      });
    }else
    {
      updateServer.update(requestObject).then(function(requestObject)
      {
          console.log(requestObject);
          var firebaseObject={};
          firebaseObject.key=requestKey;
          firebaseObject.requestObject=requestObject;
          res.send(firebaseObject);

      }).catch(function(response){
        console.log(requestObject);
        console.log(requestObject);
        var firebaseObject={};
        firebaseObject.key=requestKey;
        firebaseObject.requestObject=requestObject;
        res.send(firebaseObject);
      });
   }*/


});

app.listen(8020,function(){
  console.log("Started on PORT 8020");
})
