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

var url = "http://m.anjuke.com/%s/rentlistbypage/all/a0_0-b0-0-0-f4/?page=%d";

var workers = [];
var worker = {};
worker["name"] = "anjuke_xm";
worker["site"] = "安居客";
worker["province"] = "福建";
worker["city"] = "厦门";
worker["storeScheme"] = "t_crawler";
worker["headers"] = headers;
worker["site_code"] = "xm";
//worker["list_urls"] = [util.format(url,worker["site_code"],1),util.format(url,worker["site_code"],2)];
worker["list_urls"] = [util.format(url,worker["site_code"],1)];
workers.push(worker);

worker = {};
worker["name"] = "anjuke_gz";
worker["site"] = "安居客";
worker["province"] = "广东";
worker["city"] = "广州";
worker["storeScheme"] = "t_crawler";
worker["headers"] = headers;
worker["site_code"] = "gz";
//worker["list_urls"] = [util.format(url,worker["site_code"],1),util.format(url,worker["site_code"],2)];
worker["list_urls"] = [util.format(url,worker["site_code"],1)];
workers.push(worker);

Worker.start(workers,parserList,parserDetail);

var detailUrl = "%s";
function parserList(data,worker){
    var body = data[0],url = data[1],results = [];
    body = JSON.parse(body);
    body = body.datas.list_info;
    body.forEach(function(val){
        results.push(util.format(detailUrl,val.prop_url));
    })
    return results;
}

function parserDetail(data,worker){
    var body = data[0],url = data[1];
    var $ = cheerio.load(body,{decodeEntities: false});

    var house = {};
    house["site_url"] = url;
    house["pub_date"] = $(".view-info-detail li").eq(8).text().trim().replace("时间：","");

    var region_info = $(".view-info-detail li").last().text().replace("小区：","").replace("查看详情","").trim().replace(/\s+/g,"-");
    var region_info_data = region_info.split("-");
    //区域
    house["region"] = region_info_data[0] || "";
    //商圈
    region_info_data.shift();
    house["business_area"] = region_info_data.join(" ");

    var title = $(".view-info-title h1").html(),index = title.indexOf("<");
    if( index>-1 ){
        title = title.substring(0,index);
    }
    house["title"] = title.trim();

    house["rent_price"] = $("li.price").text().trim().replace("租金：","");

    //户型
    house["room_type"] = $(".view-info-detail li").eq(2).text().trim().replace("房型：","");
    //租住方式
    house["rent_type"] = $(".entire-rent").text().trim();
    //面积
    house["area"] = $(".view-info-detail li").eq(3).text().trim().replace("面积：","");
    //装修
    house["decor"] = $(".view-info-detail li").eq(6).text().trim().replace("装修：","");

    //朝向
    house["direction"] = $(".view-info-detail li").eq(5).text().trim().replace("朝向：","");
    //建筑类型
    house["style"] = $(".view-info-detail li").eq(7).text().trim().replace("类型：","");
    //楼层
    house["floor"] = $(".view-info-detail li").eq(4).text().trim().replace("楼层：","");

    house["mobile"] = $(".view-info-tel strong").text().trim();

    house["username"] = $(".bc-broker-info label").text().trim().replace("免费咨询","");

    house["addr"] = $(".address p").text().trim().replace("地址：","") || "";

    house["up"] = 0;

    return house;
}
