var helperFunction = require('./helperFunctions.js');
var sqlInterface = require('./sqlInterface.js');

var CheckinAppointments = function(data)
{
    //helperFunction.cleanDataCheckinAppointments(data);    
    this.CheckinAppointments = data;
    this.Resources = []; 
    this.setResources = function(data)
    {
        var array = [];
        for (var index = 0; index < data.length; index++) {
            array.push(data[index].ResourceName);
            // this.resources.push(data[index].ResourceName);
        } 
        this.Resources = array;
    };
    this.setResources(data);

};

module.exports = CheckinAppointments;