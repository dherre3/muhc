var express        =         require("express");
var bodyParser     =         require("body-parser");
var agent = require('../pushNotifications/apnagent-playground-skeleton/agent/_header')

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
app.use(express.static('./requestWebsite'));
app.get('/request',function(req,res,next){
  console.log(req.body);
  res.sendfile("./requestWebsite/index.html");
});
var usersMap = {
  'John': '<5560be74 0386d013 13202abe 435dc700 64660923 cf6ff2b5 6a770d4c 705c916a>',
  'Ackeem':'<91335407 6d2b4ace 0ecb4659 2613fa27 1a9fc13a 28a62811 d1a4f02d b15ef70f>',
  'David':'<065d6f42 deca7a36 ee57c143 84b03197 2622b321 3819116b 65dd69de 09390542>'
};
app.post('/login',function(req,res,next){
  var requestKey=req.body.key;
  var name = req.body.name;
  var message = req.body.message;
  var request=req.body.objectRequest;
  console.log(name);
  console.log(usersMap[name]);
  console.log(message);
  agent.createMessage()
  .device(usersMap[name])
  .alert(message)
  .sound('magic.wav')
  .send();

});

app.listen(3000,function(){
  console.log("Started on PORT 3000");
})
