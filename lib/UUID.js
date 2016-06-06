/**
 * Created by nathena on 15/7/13.
 */
var uuid = require('node-uuid');

var charPool = "abcdefghigklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",len = charPool.length;
var numPool = "1234567890",numLen = numPool.length;

exports.generateUUID = function(num){
    if( num < 4 ){
        throw new InvalidParamError("随机数不能太小，最小为4");
    }

    var code = [];
    for(var i=0;i<num;i++){
        code.push(random());
    }

    return code.join("");

    function random(){
        var index = Math.floor(len*Math.random(len));
        return charPool[index];
    }
}

exports.generate = function(num){
    if( num < 4 ){
        throw new InvalidParamError("随机数不能太小，最小为4");
    }

    var code = [];
    for(var i=0;i<num;i++){
        code.push(random());
    }

    return code.join("");

    function random(){
        var index = Math.floor(numLen*Math.random(numLen));
        return numPool[index];
    }
}


exports.uuid = function(){
    return uuid.v1().replace(/\-/g,"");
}