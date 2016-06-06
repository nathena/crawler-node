/**
 * 加密工具
 * Created by nathena on 15/1/21.
 */


var crypto = require("crypto");

const asekey = "idH6E94vab";
const algorithm = "aes-128-ecb";
const iv = "Y2GP7";
const clearEncoding = "utf8";
const cipherEncoding = "hex";

exports.aseEncode = function(text){

    var cipher = crypto.createCipher(algorithm,asekey,iv);
    var crypted = cipher.update(text,clearEncoding,cipherEncoding);

    crypted+=cipher.final(cipherEncoding);

    return crypted;

}

exports.aseDecode = function(text){

    var decipher = crypto.createDecipher(algorithm,asekey,iv);
    var dec = decipher.update(text,cipherEncoding,clearEncoding);

    dec+=decipher.final(clearEncoding);

    return dec;
}


exports.md5 = function md5(message){

    var md5 = crypto.createHash("md5");
    md5.update(message)

    return md5.digest("hex");
}

exports.sha1 = function sha1(message){
    var sha1 = crypto.createHash("sha1");
    sha1.update(message);

    return sha1.digest("hex");
}

