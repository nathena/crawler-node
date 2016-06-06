
require("./xmfish");
require("./s917_xm");
require("./ganji_xm");
require("./anjuke_xm");
require("./fang_xm");
require("./baixing_xm");
require("./s58_xm");

//require("./myWorker");

//var child_process = require('child_process');
//
////var workers =["./modules/xmfish","./modules/s917_xm"
////    ,"./modules/ganji_xm","./modules/anjuke_xm"
////    ,"./modules/fang_xm","./modules/baixing_xm"
////    ,"./modules/s58_xm"];
//
//var workers =["./modules/xmfish"];
//
//workers.forEach(function(val){fork(val)})
//
//function fork(_exec){
//
//    var child = child_process.fork(_exec);
//
//    child.on("message",function(code){
//
//        console.log(this.pid +' >> message: ' + code+" "+_exec);
//    })
//    child.on("disconnect",function(code){
//
//        console.log(this.pid +' >> disconnect'+" "+_exec);
//    })
//    child.on("close",function(code){
//
//        console.log(this.pid +' >> close: ' + code+" "+_exec);
//    })
//    child.on("error",function(code){
//
//        console.log(this.pid +' >> error: ' + code+" "+_exec);
//    })
//    child.on("exit",function(code){
//
//        console.log(this.pid +' >> exit: ' + code+" "+_exec);
//    })
//
//    return child;
//}
