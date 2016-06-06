/**
 * Created by nathena on 16/6/6.
 */
var Worker = require("../lib/WorkerChain");
for(var i in Worker){
    exports[i] = Worker[i];
}

exports.start = function(name,urls,options,parserList,parserDetail){

    var detailReqData = [],s= 0,e= 3,_cralweredData = {},_preCralweredData = {};

    ( function run(){

        logger.debug("..... start "+name);

        detailReqData = [],s= 0,e=3;
        //list
        Worker.requests(urls,options)
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

        return Promise.resolve(data).then(function(data){
            return Worker.requests(data);
        })
        .then(function(datas){
            if( datas.length == 0 )return Promise.reject("获取详情数据为空.."+name);
            return parserDetail(datas,_cralweredData);
        })
        .then(function(datas){
            //store
            if( datas.length == 0 )return Promise.reject("获取详情分析数据为空.."+name)
            var workers = [];
            for(var i=0;i<datas.length;i++){
                workers.push( Worker.store( datas[i],"t_crawler" ) );
            }
            return Worker.all(workers);
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
