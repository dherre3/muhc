var filesystem  =require('fs');
var hexRepresentation=filesystem.readFileSync(__dirname + '/Patients/profile51.png','hex' );
console.log(hexRepresentation);
