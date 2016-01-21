var mysql       = require('mysql');
var filesystem  =require('fs');
var Q           =require('q');
var queries=require('./queries.js');
var credentials=require('./credentials.js');

/*
*Connecting to mysql database
*
*/
var sqlConfig={
  host:credentials.HOST,
  user:credentials.MYSQL_USERNAME,
  password:credentials.MYSQL_PASSWORD,
  database:credentials.MYSQL_DATABASE
};
var connection = mysql.createConnection(sqlConfig);

function handleDisconnect(myconnection) {
  myconnection.on('error', function(err) {
    console.log('Re-connecting lost connection');
    connection.destroy();
    connection = mysql.createConnection(sqlConfig);
    handleDisconnect(connection);
    connection.connect();
  });
}

handleDisconnect(connection);

function getAppointments(serNum)
{
	
}