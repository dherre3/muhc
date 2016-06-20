var request = require('request');
request("http://172.26.66.41/devDocuments/screens/php/checkInPatient.php/?CheckinVenue=RT%20TX%20ROOM%203&ScheduledActivitySer=1670092", function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log("hello",JSON.parse(body.length) // Show the HTML for the Google homepage. 
  }
});
// http.request({path:"http://172.26.66.41/devDocuments/david/muhc/qplus/php/getAllPatients.php?DoctorSerNum=4"},function(response) {
//   var str = ''
//   response.on('data', function (chunk) {
//     str +=chunk.toString();
//   });

//   response.on('end', function () {
//     var a = JSON.parse(str);
//     console.log(a);
//   });
// }).end();