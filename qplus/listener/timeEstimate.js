var exports = module.exports = {};
var q = require('q');
exports.getEstimate=function(AriaSerNum, Id)
{
  var r = q.defer();
  console.log("Inside get estimate;", 100*Math.random());
  if(100*Math.random()>85)
  {
    r.resolve('Closed');
  }else{
    r.resolve({'EN':'Esimated time <5', 'FR':'asdas time <5'});
  }
  return r.promise;
}
