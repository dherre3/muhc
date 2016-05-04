/**
 * @module helper/Functions
 * @description Some helper functions to clean data and transform data to right format
 * 
 */
var exports = module.exports = {};

/**
 * @exports helper/Functions
 * @description Deletes duplicate entries in John's code.
 */
exports.cleanDataCheckinAppointments = function(data)
{
    //Go through entries and delete all the repeated entries in John's code
    for (var index = 0; index < data.length; index++) {
        for (var key in data[index]) {
            //If the key can be converted into a number, then delete the entry since its duplicated
            if (!isNaN(Number(key))) {      
               delete data[index][key];
            }
        }
    }
    return data;
};

exports.getDayOfWeek = function(date)
{
    var week = ['Sun','Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat'];
   return week[date.getDay()]; 
   
};