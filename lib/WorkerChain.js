/**
 * Created by nathena on 16/6/1.
 */
require("./base");
var util   = require("util");
var parserUrl = require("url");
var req = require("request");
var mgc = require('mongodb').MongoClient;
var dateTime = require("./DateTimeUtil");
var uuid = require("./UUID");
var config = require("./../config");

var options = {}
options["User-Agent"] = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:46.0) Gecko/20100101 Firefox/46.0";
options["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
options["Accept-Language"] = "zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3";
//options["Accept-Encoding"] = "gzip, deflate";
options["Connection"] = "keep-alive";
options["Cache-Control"] = "max-age=0";

var request = exports.request = function request(url,worker){

    var promise = new Promise(function(resolve,reject){

        worker["options"] = worker["options"] || {};

        var options = {
            url: url,
            headers: worker["headers"] || {}
        };

        if( worker["options"] && worker["options"].hasOwnProperty("encoding") ){
            options["encoding"] = worker["options"]["encoding"];
        }

        function add_cookie_header(cookies){
            if( cookies.length>0 ){
                var headers = options["headers"];
                headers["Cookie"] = headers["Cookie"] ? headers["Cookie"]+"; "+cookies.join("; ") : cookies.join("; ");//fork by python cookielit
            }
        }

        req(options,function(err,res,body){
            if(err){
                return reject(err);
            }
            if( res.headers["set-cookie"] ){
                var _cookies = [].concat(res.headers["set-cookie"]);
                add_cookie_header(_cookies);
            }
            logger.debug(options);
            if( 200 == res.statusCode ){
                resolve([body,res.request.href,res]);
            }else{
                reject(" 服务器异常 => "+res.statusCode+" "+body);
            }
        })
    })
    return promise;
}

var store = exports.store = function(bean,schema){

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
                        logger.debug("mongodb => "+bean["title"]+" "+bean["mobile"]+" "+bean["pub_date"]+" "+bean["site_url"]);
                        return resolve(bean);
                    })
                })
            })
        })
    })
}

exports.start = function(workers,parserList,parserDetail,parserOther){

    var _cralweredData = {},_preCralweredData = {}

    return requestWorker();

    function requestWorker(){
        logger.debug(" >> requestWorker start ");
        _cralweredData = {};
        return new Promise(function(resolve,reject){
            var index = 0,len = workers.length,results = [];
            run();
            function run(){
                var worker = workers[index];
                index++;
                return requestList(worker)
                    .then(function(data){
                        results = results.concat(data);
                        if( index < len ){
                            return run();
                        }
                        logger.debug(" >> requestWorker resolve "+results.length);
                        _preCralweredData = _cralweredData;
                        resolve(results);

                        //restart requestWorker
                        loop(function(){
                            logger.debug(" >> requestWorker restart ");
                            requestWorker();
                        },1000*60*Math.round(Math.random()+2) );
                    })
                    .catch(function(msg){
                        logger.error(" >> requestWorker reject =>"+msg);
                        reject(msg);

                        //restart requestWorker
                        loop(function(){
                            logger.debug(" >> requestWorker restart ");
                            requestWorker();
                        },1000*60*Math.round(Math.random()+2) );
                    })
            }
        })
    }

    function requestList(worker) {

        var list_urls = worker["list_urls"];

        logger.debug(" >> requestList start "+worker["name"]);
        return new Promise(function(resolve,reject){

            var index = 0,len = list_urls.length,results = [];
            if( index == len ){
                logger.debug(" >> requestList Promise.resolve ");
                return resolve(results);
            }
            run();
            function run() {
                var list_url = list_urls[index];
                logger.debug(" >> requestList start "+worker["name"]+" list_url "+list_url);
                index++;
                return request(list_url,worker)
                    .then(function(data){
                        return parserList(data,worker);//detail urls
                    })
                    .then(function(data){
                        return requestDetail(data);
                    })
                    .then(function(data){
                        results = results.concat(data);
                        if( index < len ){
                            return run();
                        }
                        logger.debug(" >> requestList resolve "+worker["name"]);
                        resolve(results);
                    })
                    .catch(function(msg){
                        logger.error(" >> requestList reject "+worker["name"]+" : "+msg);
                        reject(msg);
                    })
            }
        })


        function requestDetail(details){
            logger.debug(" >> requestDetail start "+worker["name"]+"  "+details.length);
            //details = details.slice(0,5)
            return new Promise(function(resolve,reject){
                var index = 0,len = details.length,results = [];
                if( index == len ){
                    logger.debug("requestDetail Promise.resolve ");
                    return resolve(results);
                }
                run();

                function run() {
                    var detail_url = details[index];
                    index++;
                    return request(detail_url,worker)
                        .then(function(data){
                            return parserDetail(data,worker);//detail urls
                        })
                        .then(function(data){
                            data["id"] = uuid.uuid();
                            data["create_time"] = dateTime.getCurrentDate();
                            data["site"] = worker["site"];
                            data["province"] = worker["province"];
                            data["city"] = worker["city"];
                            if( !data["site_url"] ){
                                data["site_url"] = detail_url;
                            }
                            if( _preCralweredData && _preCralweredData[data["site_url"]] && _preCralweredData[data["site_url"]]["pub_date"] == data["pub_date"] ){
                                return data;
                            }
                            if( parserOther ){
                                return parserOther(data,worker);
                            }
                            return data;
                        })
                        .then(function(data){
                            if( _preCralweredData && _preCralweredData[data["site_url"]] && _preCralweredData[data["site_url"]]["pub_date"] == data["pub_date"] ){
                                return data;
                            }
                            _cralweredData[data["site_url"]] = data;
                            return store(data,worker["storeScheme"]);
                        })
                        .then(function(data){
                            results.push(data);
                            if( index < len ){
                                return loop(run,(worker["timer"] || 1000*Math.round(Math.random()*3+3)));
                            }
                            logger.debug(" >> requestDetail resolve "+worker["name"]);
                            resolve(results);
                        })
                        .catch(function(msg){
                            logger.error(" >> requestDetail reject "+worker["name"]+" : "+msg);
                            reject(msg);
                        })
                }

            })
        }
    }

    function loop(run,timer){

        return new Promise(function(resolve){
            if(!timer){
                return resolve(run());
            }
            setTimeout(function(){
                return resolve(run());
            },timer)
        })
    }
}