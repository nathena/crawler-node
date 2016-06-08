/**
 * Created by nathena on 16/5/28.
 */
var iconv = require("iconv-lite");
var util   = require("util");
var cheerio = require("cheerio");
var Worker = require("../../lib/WorkerChain");

var headers = {}
headers["User-Agent"] = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:46.0) Gecko/20100101 Firefox/46.0";
headers["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
headers["Accept-Language"] = "zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3";
//options["Accept-Encoding"] = "gzip, deflate";
headers["Connection"] = "keep-alive";
headers["Cache-Control"] = "max-age=0";

var url = "http://zu.%s.fang.com/house/a21-i3%d/";

var workers = [];
var worker = {};
worker["name"] = "fang_xm";
worker["site"] = "房天下";
worker["province"] = "福建";
worker["city"] = "厦门";
worker["storeScheme"] = "t_crawler";
worker["headers"] = headers;
worker["options"] = {"encoding":null};
worker["site_code"] = "xm";
//worker["list_urls"] = [util.format(url,worker["site_code"],1),util.format(url,worker["site_code"],2)];
worker["list_urls"] = [util.format(url,worker["site_code"],1)];
workers.push(worker);

worker = {};
worker["name"] = "fang_gz";
worker["site"] = "房天下";
worker["province"] = "广东";
worker["city"] = "广州";
worker["storeScheme"] = "t_crawler";
worker["headers"] = headers;
worker["options"] = {"encoding":null};
worker["site_code"] = "gz";
worker["list_urls"] = [util.format(url,worker["site_code"],1),util.format(url,worker["site_code"],2)];
//workers.push(worker);

Worker.start(workers,parserList,parserDetail);

var detailUrl = "http://zu.%s.fang.com%s";
function parserList(data,worker){
    var body = data[0],url = data[1],results = [];
    body = iconv.decode(body,"gb2312");
    var $ = cheerio.load(body);
    var list = $("dl.list dt a");
    list.each(function(index,val){
        results.push(util.format(detailUrl,worker["site_code"],$(val).attr("href")));
    });
    return results;
}

function parserDetail(data,worker){

    var body = data[0],url = data[1];
    body = iconv.decode(body,"gb2312");
    var $ = cheerio.load(body,{decodeEntities: false});
    var house = {};
    house["site_url"] = url;
    house["pub_date"] = $(".h1-tit p").eq(0).find("span").eq(1).text().trim().replace("更新时间：","");
    //区域
    house["region"] = $("#gerenzfxq_B03_14").text().replace(/\s+/g,"").replace("租房","");;
    //商圈
    house["business_area"] = $("#gerenzfxq_B03_15").text().replace(/\s+/g,"").replace("租房","");;
    //title
    house["title"] = $(".h1-tit h1").text().trim();
    //租金
    house["rent_price"] = $(".house-info li").eq(0).text().trim().replace("租金：","");

    var basic_info = $(".house-info li").eq(1).text().trim();
    var basic_info_data = basic_info.split("|");
    //户型
    house["room_type"] = (basic_info_data[1] || "").replace(/\s+/g,"");
    //租住方式
    //house["rent_type"] = basic_info_data[1] || "";
    //面积
    house["area"] = (basic_info_data[2] || "").replace(/\s+/g,"");
    //装修
    house["decor"] = (basic_info_data[5] || "").replace(/\s+/g,"");
    //朝向
    house["direction"] = (basic_info_data[4] || "").replace(/\s+/g,"").replace("房屋概况：","");
    //建筑类型
    house["style"] = (basic_info_data[0] || "").replace(/\s+/g,"");
    //楼层
    house["floor"] = (basic_info_data[3] || "").replace(/\s+/g,"");
    house["mobile"] = $(".phoneicon").text();
    house["username"] = $(".phonewrap span.name").text();
    house["addr"] = $(".house-info li").last().attr("title");
    house["up"] = 0;

    return house;
}
