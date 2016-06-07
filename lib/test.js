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

var mgc = require('mongodb').MongoClient;
mgc.connect("mongodb://127.0.0.1:27017/crawlers",function(err,conn){
    if( err ){
        return resolve(bean);
    }

    conn.collection("t_crawler",function(err,col){
        if( err ){
            conn.close();
            return console.log(err);
        }

        console.log(col.find({"site_url":"http://fangzi.xmfish.com/web/info_hire_9C69FC04-5BD5-35DA-20C4-C5A5810EE505.html#398698"}));
        //col.find({"site_url":"http://fangzi.xmfish.com/web/info_hire_9C69FC04-5BD5-35DA-20C4-C5A5810EE505.html#398698"},function(err,result){
        //    console.log(result);
        //
        //})
    })
})