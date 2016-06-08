/**
 * Created by nathena on 16/5/28.
 */
var util   = require("util");
var cheerio = require("cheerio");
var Worker = require("../../lib/WorkerChain");

var headers = {}
headers["User-Agent"] = "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36";
headers["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
headers["Accept-Language"] = "zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3";
//options["Accept-Encoding"] = "gzip, deflate";
headers["Connection"] = "keep-alive";
headers["Cache-Control"] = "max-age=0";

var url = "http://3g.ganji.com/%s_fang1/?page=%d";

var workers = [];
var worker = {};
worker["name"] = "ganji_xm";
worker["site"] = "赶集网";
worker["province"] = "福建";
worker["city"] = "厦门";
worker["storeScheme"] = "t_crawler";
worker["headers"] = headers;
worker["list_urls"] = [util.format(url,"xm",1),util.format(url,"xm",2)];
workers.push(worker);

worker = {};
worker["name"] = "ganji_gz";
worker["site"] = "赶集网";
worker["province"] = "广东";
worker["city"] = "广州";
worker["storeScheme"] = "t_crawler";
worker["headers"] = headers;
worker["list_urls"] = [util.format(url,"gz",1),util.format(url,"gz",2)];
workers.push(worker);

Worker.start(workers,parserList,parserDetail);

var detailUrl = "http://3g.ganji.com%s";
function parserList(data,worker){
    var body = data[0],url = data[1],results = [];
    var $ = cheerio.load(body);
    var list = $(".house-list a");
    list.each(function(index,val){
        results.push(util.format(detailUrl,$(val).attr("href")));
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
    house["pub_date"] = $(".publish-time").text().trim().replace("发布时间","") || "";

    var region_info = $(".house-type span").eq(0).text().trim();
    var region_info_data = region_info.split("-");

    //区域
    house["region"] = region_info_data[0] || "";
    //商圈
    region_info_data.shift();
    house["business_area"] = region_info_data.join("-");

    house["title"] = $(".house-detail-head h2").text().replace(/\s+/g,"").trim();

    var rent_price_info = $("p.house-price span").eq(1).text().trim();
    house["rent_price"] = rent_price_info.substring(0,rent_price_info.indexOf("("));

    var basic_info = $("p.house-type span").eq(1).text().trim();
    var room_basic_info_datas = basic_info.split("-");
    //户型
    house["room_type"] = room_basic_info_datas[0] || "";
    house["rent_type"] = room_basic_info_datas[1] || "";
    //面积
    house["area"] = room_basic_info_datas[2] || "";
    //装修
    house["decor"] = room_basic_info_datas[4] || "";

    //概括
    basic_info = $("p.house-type span").eq(3).text().trim();
    room_basic_info_datas = basic_info.split("-");
    //朝向
    house["direction"] = room_basic_info_datas[0] || "" ;
    //建筑类型
    house["style"] = room_basic_info_datas[1] || "住宅";
    //楼层
    house["floor"] = room_basic_info_datas[2] || "";

    house["mobile"] = $("p.tel-code").text().replace("&nbsp;","").trim();

    house["username"] = $(".connect-info p.f12").text().trim().replace(/\s+/g," ");

    house["addr"] = $(".map-addr").text().trim().replace("地址","") || "";

    house["up"] = 0;

    return house;
}