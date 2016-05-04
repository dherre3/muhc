var chai = require('chai');
var expect = require('chai').expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var sqlInterface = require('../src/sqlInterface.js');
chai.use(sinonChai);

describe('Get all checkin appointments',function()
{
   it('Gets all checkin appointments',function(done)
   {
       sqlInterface.getAllCheckinAppointments().then(function(data){
           expect(data).to.not.be.empty();
           done();
       }).catch(function(error)
       {
           console.log(error);
           done();
       });
       
       
   });
});

//Testing the clean data function

describe('Cleans all the duplicated data from John\' scripts',function()
{
   it('helperFunctions.cleanDataCheckinAppointments()',function()
   {
      var test1 = {'1':'david','2':'herrera'}; 
   });
});
