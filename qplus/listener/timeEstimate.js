var exports = module.exports = {};
var q = require('q');
exports.getEstimate=function(AriaSerNum, Id)
{
  var r = q.defer();
  console.log("Inside get estimate;", 100*Math.random());
  var objectToSend = {};
  if(100*Math.random()>85)
  {
    objectToSend =  {
      response:{
        type:'close'
      },
      info:{
        patientId:'51'
      }
    };
    r.resolve(objectToSend);
  }else{
    objectToSend =  {
      response:{
        type:'success'
      },
      info:{
        patientId:'51'
      },
      preceding:{
        'EN':'Patients before you: 5',
        'FR':'Patients before you: 5'
      },
      estimate:{
        'EN':'Estimated wait: <5 minutes',
        'FR':'Estimated wait: <5 minutes'
      },
      schedule:{
        'EN':'10 minutes ahead of schedule',
        'FR':'10 minutes ahead of schedule'
      }
    }
    r.resolve(objectToSend);
  }
  return r.promise;
}
