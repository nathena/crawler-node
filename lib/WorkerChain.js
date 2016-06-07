/**
 * Created by nathena on 16/6/1.
 */
require("./base");
var util   = require("util");
var config = require("./../config");
var httpUnit = require("./HttpUnit");

//var dbFactory = require("./MySqlc");
//var db = dbFactory.createDb(config.db_mysqlConfig);

var mgc = require('mongodb').MongoClient;

var options = {}
options["User-Agent"] = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:46.0) Gecko/20100101 Firefox/46.0";
options["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
options["Accept-Language"] = "zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3";
//options["Accept-Encoding"] = "gzip, deflate";
options["Connection"] = "keep-alive";
options["Cache-Control"] = "max-age=0";


var chainLoop = exports.chainLoop = function(_promises){

    var results = [];
    var index = _promises.length;
    var i = 0;
    if( index == 0 ){
        return Promise.reject(" ... chainLoop index "+index);
    }

    return loopPromise();

    function loopPromise(){
        return new Promise(function(resolve){

            Promise.resolve(_promises[i]).then(_resolve,_reject);

            function _resolve(data){
                results.push(data);
                _ifFinish();
            }

            function _reject(msg){
                logger.debug(msg);
                _ifFinish();
            }

            function _ifFinish(){
                i++;
                if( i == index ){
                    return resolve(results);
                }
                resolve(loopPromise())
            }
        })
    }
}

var request = exports.request = function request(url,cfg){
    cfg = cfg || {}
    for( var i in cfg ){
        options[i] = cfg[i];
    }
    var promise = new Promise(function(resolve,reject){
        httpUnit.get(url,options,function(err,res,body){
            if(err){
                return reject(err);
            }
            if( 200 == res.statusCode ){
                resolve([body,res.request.href]);
            }else{
                reject(" 服务器异常 => "+res.statusCode+" "+body);
            }
        });
    })
    return promise;
}

var mapRequest = exports.mapRequest = function(obj,url,cfg){
    cfg = cfg || {}
    for( var i in cfg ){
        options[i] = cfg[i];
    }
    var promise = new Promise(function(resolve,reject){
        httpUnit.get(url,options,function(err,res,body){
            if(err){
                return reject(err);
            }
            if( 200 == res.statusCode ){
                resolve([obj,body,res.request.href]);
            }else{
                reject(" 服务器异常 => "+res.statusCode+" "+url);
            }
        });
    })
    return promise;
}

var requests = exports.requests = function(urls){

    var cfgs = Array.prototype.slice.call(arguments,1);
    var cfg = cfgs[0] || null;

    var promises = [];
    urls.forEach(function(url,index){
        promises.push(request(url,cfgs[index] || cfg));
    })

    return chainLoop(promises);
}

var mapRequests = exports.mapRequests = function(objs,urls){

    var cfgs = Array.prototype.slice.call(arguments,2);
    var cfg = cfgs[0] || null;

    var promises = [];
    urls.forEach(function(url,index){
        promises.push(mapRequest(objs[index],url,cfgs[index] || cfg));
    })

    return chainLoop(promises);
}

var store = exports.store = function(bean,schema){

    if( !bean["title"] ){
        logger.debug(" .... >> "+bean["site_url"] );
        return bean;
    }
    var sql = "select * from `"+schema+"` where site_url = :site_url limit 1";
    var params = {"site_url":bean["site_url"]};

    var _statement;
    return db.execCommand(sql,params).then(function(statement){
        _statement = statement;
        var data = statement.value;
        if( data.length> 0  ){
            if( data[0]["pub_date"] == bean["pub_date"]){
                logger.debug("数据相同.."+bean["title"]+" >> "+bean["site_url"]+" : "+bean["pub_date"]);
                return statement;//数据相同不写入
            }
            bean["up"] = 1;
        }else{
            bean["up"] = 0;
        }
        return statement.insert(schema,bean);

    }).then(function(data){
        _statement.dbConnection.release();
        _statement = null;
        return bean;
    }).catch(function(msg){
        logger.debug("....catch "+msg);
        _statement.dbConnection.release();
        _statement = null;
        return bean;
    })
}

var storeMongo = exports.storeMongo = function(bean,schema){

    if( !bean["title"] ){
        logger.debug(" .... >> "+bean["site_url"] );
        return bean;
    }

    return new Promise(function(resolve){
        mgc.connect(config.mongoClient,function(err,conn){
            if( err ){
                return resolve(bean);
            }

            conn.collection(schema,function(err,col){
                if( err ){
                    conn.close();
                    return resolve(bean);
                }

                col.find({"site_url":bean["site_url"]}).sort({"create_time":-1}).limit(1).toArray(function(err,result){
                    if( err ){
                        conn.close();
                        return resolve(bean);
                    }

                    if( result.length >0  ){
                        result = result[0];
                        if( result["pub_date"] == bean["pub_date"] ){
                            logger.debug("数据相同.."+bean["title"]+" >> "+bean["site_url"]+" : "+bean["pub_date"]);
                            conn.close();
                            return resolve(bean);
                        }
                        bean["up"] = 1;
                    }else{
                        bean["up"] = 0;
                    }

                    col.insert(bean,function(err,result){
                        if( err ){
                            conn.close();
                            return resolve(bean);
                        }
                        conn.close();
                        logger.debug("mongodb => "+result);
                        return resolve(bean);
                    })
                })
            })
        })
    })
}

var all = exports.all = function(workers){
    return Promise.all(workers);
}

var resolve = exports.resolve = function(val){
    return Promise.resolve(val);
}

exports.start = function(name,urls,options,parserList,parserDetail,_storeScheme){

    var detailReqData = []
        ,s= 0
        ,e= 3
        ,_cralweredData = {}
        ,_preCralweredData = {}
        ,storeScheme = _storeScheme || "t_crawler";

    ( function run(){

        logger.debug("..... start "+name);

        detailReqData = [],s= 0,e=3;
        //list
        requests(urls,options)
            .then(function(datas){
                if( datas.length == 0 )return Promise.reject("获取列表数据为空.."+name)
                return parserList(datas);
            })
            .then(function(data){
                if( data.length == 0 )return Promise.reject("获取列表分析数据为空.."+name);
                logger.debug("....start "+name+" opRequestChain  "+ " >> "+ data.length);
                detailReqData = data;
                _preCralweredData = {};
                return opRequestChain();
            })
            .then(function(data){
                logger.debug("....end ... "+name+" >> "+data);
                if( data){
                    _cralweredData = _preCralweredData;
                }
                setTimeout(function(){
                    logger.debug(".....restart "+name);
                    run();
                },1000*60*2);
            })
            .catch(function(err){
                logger.error(".....error "+name+" "+err);
                setTimeout(function(){
                    logger.debug(".....restart "+name);
                    run();
                },1000*60*2);
            });
    })();

    function opRequestChain(datas){

        if( datas ){
            datas.forEach(function(data){
                logger.debug(".....cached "+data["site_url"]);
                _preCralweredData[data["site_url"]] = data;
            })
        }

        return Promise.resolve(detailReqData).then(function(data){
            data = detailReqData.slice(s,e);
            s = e,e = e+3;
            logger.debug(".... opRequestChain  "+name+ " >> "+ data.length+" s:"+s+",e:"+e);
            if( data.length > 0 ){
                return opRequestDetail(data);
            }else{
                return _preCralweredData;
            }
        })
    }

    function opRequestDetail(data){

        return Promise.resolve(data)
            .then(function(data){
            return requests(data);
            })
            .then(function(datas){
                if( datas.length == 0 )return Promise.reject("获取详情数据为空.."+name);
                return parserDetail(datas,_cralweredData);
            })
            .then(function(datas){
                //store
                if( data.length>0 ){
                    var workers = [];
                    for(var i=0;i<datas.length;i++){
                        workers.push( storeMongo( datas[i],storeScheme ) );
                    }
                    return all(workers);
                }
                return Promise.reject("没有新的数据可以抓取");
            })
            .then(function(datas){
                logger.debug(".....requested "+name+" datas >>> "+datas.length);
                return new Promise(function(resolve){
                    setTimeout(function(){
                        logger.debug(".....re request "+name);
                        resolve(opRequestChain(datas));
                    },3000);
                })
            })
    }
}