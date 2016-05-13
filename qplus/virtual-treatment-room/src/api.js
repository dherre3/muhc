var exports = module.exports = {};
var sqlInterface = require('./sqlInterface.js');
exports.apiMappings = {
    'Call-Patient':sqlInterface.screenName,
    'Patient-Arrived':sqlInterface.checkinPatientToLocation,
    'Get-Rooms':sqlInterface.getExamRooms,
    'Get-Resources':sqlInterface.getResourcesForDay
};
//
exports.processRequest = function(request, parameters)
{
    return exports.apiMappings[request].Function(parameters);
};

/**
 * @module API
 * @method call Patient
 * @param {object} request Request containing appointment information and patient
 * 
 * 
 */
