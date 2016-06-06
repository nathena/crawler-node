/**
 * Created by nathena on 15/7/13.
 */
var request = require("request");
var fs = require("fs");


/**
 * callback = function(content,status,headers);
 *
 * getFile.callback = function(err);
 */

exports.get = function(url,reqheaders,callback){

    reqheaders = reqheaders || {};

    var options = {url:url,headers:reqheaders}
    if( reqheaders.hasOwnProperty("encoding") ){
        options["encoding"] = reqheaders["encoding"];
    }

    request(options,function(err,response,body){
        callback(err,response,body);
    })
}

exports.post = function(url,data,reqheaders,callback){

    request.post({url:url,form:data,headers:reqheaders},function(err,response,body){
        callback(err,response,body);
    })
}

exports.put = function(url,data,reqheaders,callback){

    request.put({url:url,form:data,headers:reqheaders},function(err,response,body){
        callback(err,response,body);
    })
}


exports.delete = function(url,reqheaders,callback){

    request.del({url:url,headers:reqheaders},function(err,response,body){
        callback(err,response,body);
    })
}

exports.postFile = function(url,data,reqheaders,callback){

    request.post({url:url,formData:data,headers:reqheaders},function(err,response,body){
        callback(err,response,body);
    });
}

exports.getFile = function(url,output,callback){

    var r = request(url).pipe(fs.createWriteStream(output));

    r.on('end', function () {
        callback(null,"ok");
    }).on("error",function(){
        callback(err);
    });
}
