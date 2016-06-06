/**
 * Created by nathena on 16/6/6.
 */
var Worker = require("../lib/WorkerChain");
for(var i in Worker){
    exports[i] = Worker[i];
}

exports.start = function(name,urls,options,parserList,parserDetail){

    
}
