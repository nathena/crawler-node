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

var url = "http://%s.baixing.com/m/zhengzu/?grfy=1&page=%d";

var workers = [];
var worker = {};
worker["name"] = "baixing_xm";
worker["site"] = "百姓网";
worker["province"] = "福建";
worker["city"] = "厦门";
worker["storeScheme"] = "t_crawler";
worker["headers"] = headers;
worker["site_code"] = "xiamen";
//worker["list_urls"] = [util.format(url,worker["site_code"],1),util.format(url,worker["site_code"],2)];
worker["list_urls"] = [util.format(url,worker["site_code"],1)];
workers.push(worker);

worker = {};
worker["name"] = "baixing_gz";
worker["site"] = "百姓网";
worker["province"] = "广东";
worker["city"] = "广州";
worker["storeScheme"] = "t_crawler";
worker["headers"] = headers;
worker["site_code"] = "guangzhou";
//worker["list_urls"] = [util.format(url,worker["site_code"],1),util.format(url,worker["site_code"],2)];
worker["list_urls"] = [util.format(url,worker["site_code"],1)];
workers.push(worker);

Worker.start(workers,parserList,parserDetail);

var detailUrl = "%s";
function parserList(data,worker){
    var body = data[0],url = data[1],results = [];
    var $ = cheerio.load(body);
    var list = $("li.regular a");
    list.each(function(index,val){
        results.push(util.format(detailUrl,$(val).attr("href")));
    });
    return results;
}

function parserDetail(data,worker){
    var body = data[0],url = data[1];
    var $ = cheerio.load(body,{decodeEntities: false});

    var house = {};
    house["site_url"] = url;
    house["pub_date"] = $("time.friendly").text().trim();
    var meta = $(".meta li");

    var meta_info = meta.eq(8).find("span").text().trim();
    var meta_info_data = meta_info.split("-");

    //区域
    house["region"] = (meta_info_data[0] || "").trim();
    //商圈
    meta_info_data.shift();
    house["business_area"] = meta_info_data.join(" ").trim();
    //title
    house["title"] = $("section.title h1").text().trim();

    var top_meta = $(".top-meta li");
    //租金
    house["rent_price"] = top_meta.eq(0).find("span").text().trim();
    //户型
    house["room_type"] = top_meta.eq(1).find("span").text().trim();
    //租住方式
    house["rent_type"] = meta.eq(2).find("span").text().trim();
    //面积
    house["area"] = top_meta.eq(2).find("span").text().trim();
    //装修
    house["decor"] = meta.eq(7).find("span").text().trim();
    //朝向
    house["direction"] = meta.eq(6).find("span").text().trim();
    //建筑类型
    //house["style"] = (basic_info_data[0] || "").replace(/\s+/g,"");
    //楼层
    house["floor"] = meta.eq(3).find("span").text().trim();

    house["mobile"] = $(".phone-number span.num").text().trim();

    house["username"] = $("section.user-info strong").text().trim();

    var addr = $("section.description section.long-content").text().trim().replace("地 址：","");
    addr = addr.substring(0,addr.indexOf("公 交："));

    house["addr"] = addr;

    house["up"] = 0;

    return house;
}

