/**
 * Created by nathena on 16/5/28.
 */
var util   = require("util");
var cheerio = require("cheerio");
var Worker = require("../../lib/WorkerChain");
var dateTime = require("../../lib/DateTimeUtil");

var headers = {}
headers["User-Agent"] = "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36";
headers["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
headers["Accept-Language"] = "zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3";
//options["Accept-Encoding"] = "gzip, deflate";
headers["Connection"] = "keep-alive";
headers["Cache-Control"] = "max-age=0";

var url = "http://m.58.com/%s/ershoufang/pn%d/?segment=true";

var workers = [];

var worker = {};
worker["name"] = "s58_shh_xm";
worker["site"] = "58";
worker["province"] = "福建";
worker["city"] = "厦门";
worker["storeScheme"] = "t_crawler_shh";
worker["headers"] = headers;
worker["site_code"] = "xm";
worker["list_urls"] = [util.format(url,worker["site_code"],1),util.format(url,worker["site_code"],2)];
workers.push(worker);

worker = {};
worker["name"] = "s58_shh_gz";
worker["site"] = "58";
worker["province"] = "广东";
worker["city"] = "广州";
worker["storeScheme"] = "t_crawler_shh";
worker["headers"] = headers;
worker["site_code"] = "gz";
worker["list_urls"] = [util.format(url,worker["site_code"],1),util.format(url,worker["site_code"],2)];
workers.push(worker);

Worker.start(workers,parserList,parserDetail);

var detailUrl = "%s";
function parserList(data,worker){
    var body = data[0],url = data[1],results = [];
    var $ = cheerio.load(body);
    var list = $("ul.list-info li");
    var href = "";
    list.each(function(index,val){
        href = $(val).find("a").eq(0).attr("href");
        results.push(util.format(detailUrl,href));
    });
    return results;
}

function parserDetail(data,worker){

    var body = data[0],url = data[1];

    var $ = cheerio.load(body,{decodeEntities: false});

    var house = {};
    var _url = url,index = url.indexOf("?");
    if( index > -1 ){
        _url = _url.substring(0,index);
    }
    house["site_url"] = _url;
    var pub_date = $(".name-info dd").eq(0).html(),index = pub_date.indexOf("</script>");
    if( index > -1 ){
        pub_date = pub_date.substring(index+"</script>".length,pub_date.length).trim();
    }
    house["pub_date"] = (pub_date || dateTime.getCurrentDate()).trim();

    var regions = $(".infor-other li").eq(3).text().replace("位置：","").trim();
    regions = regions.split("-");
    //区域
    house["region"] = (regions[0] || "").trim();
    //商圈
    house["business_area"] = (regions[1] || "").trim();
    //title
    house["title"] = $("#titlename").text().trim();
    //售价
    house["total"] = $(".infor-price li").eq(0).find(".yellow").text().trim();
    //单价格价
    house["price"] = $(".infor-other li").eq(0).find(".black").text().trim();
    //户型
    house["room_type"] = $(".infor-price li").eq(1).find(".yellow").text().trim();
    //面积
    house["area"] = $(".infor-price li").eq(2).find(".yellow").text().trim();
    //装修
    house["decor"] = $(".descrip-infor li").eq(2).find(".black").text().trim();
    //朝向
    house["direction"] = $(".infor-other li").eq(1).find(".black").text();
    //建筑类型~ 板楼
    house["style"] = $(".descrip-infor li").eq(3).find(".black").text().trim();
    //楼层
    house["floor"] = $(".infor-other li").eq(2).find(".black").text().trim();
    //房龄
    house["year"] = $(".descrip-infor li").eq(0).find(".black").text().trim();
    //产权
    house["property"] = $(".descrip-infor li").eq(1).find(".black").text().trim();
    //房东
    house["username"] = $(".contact li").eq(0).text().trim();
    //联系方式
    house["mobile"] = $(".contact li").eq(1).text().trim();
    //地址
    house["addr"] = $(".address").text().trim();
    //更新次数
    house["up"] = 0;

    console.log(house);

    return house;
}