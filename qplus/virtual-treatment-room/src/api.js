var exports = module.exports = {};
exports.apiMappings = {
    'Call-Patient':{},
    'Patient-Arrived':{},
    'GetRooms':{}
};
//
exports.processRequest = function(request, parameters)
{
    exports.apiMappings[request].Function(parameters).then(function()
    {
        return new Promise(function(resolve,reject){
           resolve({
               'method':'Call-Patient'
               
           });
        });  
    })
};