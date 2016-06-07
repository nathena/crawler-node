/**
 * Created by nathena on 16/6/1.
 */

var util   = require("util");
var cheerio = require("cheerio");
var Worker = require("./lib/WorkerChain");
var uuid = require("./lib/UUID");
var dateTime = require("./lib/DateTimeUtil");

var options = {};
options["User-Agent"] = "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36";

var url = "http://m.58.com/xm/ershoufang/pn%d/?segment=true";
var detailUrl = "%s";
var mobile_site = "http://app.58.com/api/windex/scandetail/car/%d/?pid=799"

//var urls = [util.format(url,1),util.format(url,2)];
//var urls = [util.format(url,1)];
var urls = ["http://jump.zhineng.58.com/clk?target=mv7V0A-b5HThuA-1pyEqnH91P1cdrH0QnHbznjNLrjmQPj0vnjmOPjNLFMP_ULEqUA-1IAQ-uMEhuA-1IAYqnHEvPHc3PHDOrjTvrau1ULRzmvNqniu-UMwY0jYkFMK60h7V5iuG0vR3IAR8ujdhmyQ1uiukUAmqnauGUyRG5iudpyEqPWmknH0zPjE1njT3PzuWUAVGujYdPjczPHDvPiY1nhP-sHEvmHEVrAP-niY1uhwbuWuWPhRhnhch0A-b5HbhuyOYpyEqnWmzPHDOPjTOP10vnjchuyOYIZTqnauk0h-WuHY1nHNh0hRbpgcqpZwY0jCfsvb8Ui3draOWUvYfXAYfugF1pAqduh78uztzPWcdnHbYnjbLP1mknM980v6YUykhuA-10Aq15HDh0LRBpyEqnWmdrHD3nHDhmLF-mgw-ujYQrjDYnjb1PjcQnjm3PWEh0A7zmydGujYhuA-1mvDqnHch0vR_uhP65HDzFhwG0vQf5HmkPBu1uyQhUAtqPWTvFMDqniukmyI-UMRV5HDhmh-b5Hn1niuLpyQbmv7zujYkFh7k0AR8uAV-XgIf0hEqnauWUvqopyNqUMR_UauzuymqpZwY0jCfsvY8PH98mvqVsL6VsvRz0v6fIyu6Uh0f0A3Qs1q1uyIVuyOY5gwzIyNhIh-1Iy-b5HThIh-1Iy-k5HmQsWD1ni3LnB3vrauzuyP6UAQhUAqL5HThmyFY5RDhUHdhuWTdrADLnhcznWbznADz&psid=183725971192057861476069457&entinfo=26251940977602_0&from=fcm2_new_xm"]

Worker.requests(urls,options).then(function(datas){


    //console.log(data);
})