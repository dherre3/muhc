var helperFunction = require('./helperFunctions.js');
var sqlInterface = require('./sqlInterface.js');

var CheckinAppointments = function(data)
{
    helperFunction.cleanDataCheckinAppointments(data);    
    
    for (var i = 0; i < data.length; i++) {
        data[i].FirstName = data[i].FirstName.split(" ")[0];
        data[i].FirstName = data[i].FirstName[0].toUpperCase() + data[i].FirstName.toLowerCase().substring(1);
        data[i].LastName = data[i].LastName[0].toUpperCase() + data[i].LastName.toLowerCase().substring(1);
        for (var key in data[i]) {
            data[i][key] = String(data[i][key]);
        };
    };
    this.CheckinAppointments = data;
    console.log(data);
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