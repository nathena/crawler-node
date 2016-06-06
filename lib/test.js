/**
 * Created by nathena on 16/6/2.
 */

var cfg = {
    "host": "127.0.0.1",
    "user": "root",
    "password": "",
    "database": "crawler",
    "dateStrings":true,
    "charset": "utf8mb4",
    debug:false,
    connectionLimit:"2",
    //queueLimit:"3"
}

var db = require("./MySqlc");
db = db(cfg);
for(var i=0;i<15;i++){
    db.execCommand("select 1").then(function(statements){
        //console.log( statements.name );
        //console.log( statements.value );
        return statements.execCommand();
    }).then(function(statements){
        console.log( statements.name );
        statements.dbConnection.release();
    }).catch(function(msg){
        console.log( "err "+msg);
    })
}

//var mysql = require('mysql');
//var pool  = mysql.createPool(cfg);
//pool.on('connection', function () {
//    console.log(" on start connection pool ");
//});
//pool.on('enqueue', function () {
//    console.log('Waiting for available connection slot');
//});
//
//pool.getConnection(function(err, connection) {
//    // Use the connection
//    connection.query( 'SELECT 2 + 1 AS solution', function(err, rows) {
//        // And done with the connection.
//        connection.release();
//        console.log('The solution2 is: ', rows[0].solution);
//        // Don't use the connection here, it has been returned to the pool.
//        connection.query( 'SELECT 2 + 2 AS solution', function(err, rows) {
//            // And done with the connection.
//            //connection.release();
//            console.log('The solution2 is: ', rows[0].solution);
//            // Don't use the connection here, it has been returned to the pool.
//            connection.query( 'SELECT 2 + 3 AS solution', function(err, rows) {
//                // And done with the connection.
//                //connection.release();
//                console.log('The solution2 is: ', rows[0].solution);
//                // Don't use the connection here, it has been returned to the pool.
//            });
//        });
//    });
//});