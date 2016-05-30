var http = require('http');

http.request({path:"http://172.26.66.41/devDocuments/david/muhc/qplus/php/getAllPatients.php?DoctorSerNum=4"},function(response) {
  var str = ''
  response.on('data', function (chunk) {
    str +=chunk.toString();
  });

  response.on('end', function () {
    var a = JSON.parse(str);
    console.log(a);
  });
}).end();