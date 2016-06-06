/**
 * Created by nathena on 15/7/8.
 */

// 移动文件需要使用fs模块
var fs = require('fs');
var path = require('path');
var Validator = require("./validator");
var crypto = require("./crypto");
var cfg = require("../config");

exports.password = function(salt,textPassword){
    return crypto.md5(salt+textPassword);
}


exports.mkdirsSync = function mkdirsSync(dirname, mode){
    console.log(dirname);
    if(fs.existsSync(dirname)){
        return true;
    }else{
        if(mkdirsSync(path.dirname(dirname), mode)){
            fs.mkdirSync(dirname, mode);
            return true;
        }
    }
}

exports.upload = function(file,dirPrefix,targetDir,callback){

    if( Validator.IsNull(targetDir) ){
        return callback(new InvalidParamError());
    }

    var tmp_path = file.path;
    // 指定文件上传后的目录 ，并 用时间戳重命名。
    var filename = new Date().getTime() + path.extname(tmp_path);

    var target_path = targetDir + '/' + filename;

    var full_target_dir = dirPrefix+targetDir;
    var full_target_path = dirPrefix+target_path;

    try{
        if (fs.existsSync(full_target_dir)) {
            console.log('已经创建过此更新目录了');
        } else {
            mkdirsSync(full_target_dir,"0777");
        }
    }catch(err) {
        logger.debug('uploader.upload: create direction error ==>'+err);
        return callback(err);
    }


    var is = fs.createReadStream(tmp_path);
    var os = fs.createWriteStream(full_target_path);

    is.pipe(os);
    is.on('end',function(){
        callback(null,{code:0,msg:'File uploaded!',path:target_path} );
        fs.unlinkSync(tmp_path);
    });
}

exports.render = function(res,tmp,data){

    data = data || {};
    data.static_uri = cfg.site_static_host;
    data.upload_uri = cfg.site_static_host;

    res.render(tmp,data);
}

exports.renderJson = function(res,data){

    data = data || {};
    data.static_uri = cfg.site_static_host;
    data.upload_uri = cfg.site_static_host;

    res.json(data);
}