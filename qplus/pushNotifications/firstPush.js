pushNotifier = require("./pushNotifier");
pushNotifier.init();
//use valid device token to get it working
pushNotifier.process({token:'<c4b30833 9d8088c9 c3f8f006 c56566c5 9d23da97 b6ed3964 daf99ca2 66a1f34c>', message:'Test message', from: 'sender'});
