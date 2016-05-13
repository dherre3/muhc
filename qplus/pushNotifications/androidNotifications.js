var gcm = require('node-gcm');
 
// Create a message 
// ... with default values 
var message = new gcm.Message();
 
// ... or some given values 
var message = new gcm.Message({
	data: {
		key1: 'message1',
		key2: 'message2'
	},
	notification: {
		title: "Hello, World",
		icon: "ic_launcher",
		body: "This is a notification that will be displayed ASAP."
	}
});
 
// Change the message data 
// ... as key-value 
message.addData('key1','message1');
message.addData('key2','message2');
 
// ... or as a data object (overwrites previous data object) 
message.addData({
	key1: 'message1',
	key2: 'message2'
});
 
// Set up the sender with you API key 
var sender = new gcm.Sender('AIzaSyBir-27KljXjfETD_DbOkXQ0U4UV3ozfc0');
 
// Add the registration tokens of the devices you want to send to 
var registrationTokens = [];
registrationTokens.push('cnoOQ6ibI9Y:APA91bEQK8cGikDkD7UyNEPi5xPXFWDMZo4bbGx0QycwTSWIO_ar_T3gNUNpyt06gE2xYXDIe5hZIS4YS_69kDyhrdSBV_Tp4p4ziFAY0f0sVQ6zGqwf2cjf4iN66OMfj6JeQFp15H8z');
//registrationTokens.push('regToken2');
 
// Send the message 
// ... trying only once 
sender.sendNoRetry(message, { registrationTokens: registrationTokens }, function(err, response) {
  if(err) console.error(err);
  else    console.log(response);
});
 
// ... or retrying 
sender.send(message, { registrationTokens: registrationTokens }, function (err, response) {
  if(err) console.error(err);
  else    console.log(response);
});