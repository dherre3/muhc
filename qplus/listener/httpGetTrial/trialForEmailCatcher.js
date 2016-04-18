var http = require('http');
var options = {
    path: 'http://medphys/devDocuments/screens/php/checkInPatient.php?CheckinVenue=8225&ScheduledActivitySer=1668402'
  }
    var x = http.request(options,function(res){
        res.on('data',function(data){
            console.log(data.toString());
        });
    }).end();
