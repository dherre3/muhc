var express        =         require("express");
var bodyParser     =         require("body-parser");
var main = require('./main.js');

var app            =         express();
app.use(bodyParser.urlencoded({ extended: true }));
app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });
app.get('/',function(req,res,next){
  res.sendfile("./requestWebsite/public/index.html");
});
app.use(express.static('./requestWebsite/public'));
app.get('/request',function(req,res,next){
  console.log(req.body);
  res.sendfile("./requestWebsite/index.html");
});

app.post('/login',function(req,res,next){
  main.proccessQuerySequence(req.body, function(result)
  {
    res.send(result);
  });
});

app.listen(3000,function(){
  console.log("Started on PORT 3000");
});
