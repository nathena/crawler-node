/**
 * Created by nathena on 16/5/28.
 */
var parserUrl = require("url");
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

var url = "http://m.58.com/%s/chuzu/0/pn%d/";

var workers = [];

var worker = {};
worker["name"] = "s58_xm";
worker["site"] = "58";
worker["province"] = "福建";
worker["city"] = "厦门";
worker["storeScheme"] = "t_crawler";
worker["headers"] = headers;
worker["site_code"] = "xm";
worker["list_urls"] = [util.format(url,worker["site_code"],1),util.format(url,worker["site_code"],2)];
workers.push(worker);

worker = {};
worker["name"] = "s58_gz";
worker["site"] = "58";
worker["province"] = "广东";
worker["city"] = "广州";
worker["storeScheme"] = "t_crawler";
worker["headers"] = headers;
worker["site_code"] = "gz";
worker["list_urls"] = [util.format(url,worker["site_code"],1),util.format(url,worker["site_code"],2)];
workers.push(worker);

Worker.start(workers,parserList,parserDetail,parserOther);

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
    var _url = url,index = url.indexOf("?");
    if( index > -1 ){
        _url = _url.substring(0,index);
    }

    var house = {};
    house["__url__"] = url;
    house["site_url"] = _url;
    house["pub_date"] = $(".meta-time li").eq(0).text().replace("发布时间:","").trim();

    var meta = $(".meta li");
    var houseInfo_detail = $(".houseInfo-detail li");

    var region_info = houseInfo_detail.eq(2).find("i").text();
    var region_info_data = region_info.split("-");
    //区域
    house["region"] = (region_info_data[0] || "").trim();
    //商圈
    region_info_data.shift();
    house["business_area"] = region_info_data.join(" ").trim();
    //title
    house["title"] = $(".meta-tit").text().trim();
    //租金
    house["rent_price"] = houseInfo_detail.eq(1).find("i").text().trim();
    //户型
    house["room_type"] = houseInfo_detail.eq(0).find("i").text().trim();
    //租住方式
    //house["rent_type"] = meta.eq(2).find("span").text().trim();

    var houseInfo_meta = $(".houseInfo-meta li");
    var houseDetail_type = $(".houseDetail-type li");

    //面积
    house["area"] = houseInfo_meta.eq(1).find("span").eq(0).text().replace("面积:","").trim();
    //装修
    house["decor"] = houseDetail_type.eq(1).text().replace("装","").replace("修","").replace(":","").trim();
    //朝向
    house["direction"] = houseDetail_type.eq(0).text().replace("朝","").replace("向","").replace(":","").trim();
    //建筑类型
    house["style"] = houseDetail_type.eq(2).text().replace("类","").replace("型","").replace(":","").trim();
    //楼层
    house["floor"] = houseInfo_meta.eq(0).find("span").eq(1).text();

    house["username"] = $(".profile-name").text().trim();

    house["addr"] = house["region"]+house["business_area"]+houseInfo_meta.eq(0).find("span").eq(0).text().replace("小区:","").trim();

    house["up"] = 0;

    house["mobile"] = $(".meta-phone").text().trim();

    return house;
}

var mobile_site = "http://app.58.com/api/windex/scandetail/car/%d/?pid=799"
function parserOther(data,worker){

    var url = parserUrl.parse(data["__url__"],true);
    url = url["query"]["entinfo"] || "";
    if( !url ){
        return data;
    } else {
        var _url = url,index = url.indexOf("_0");
        if( index > -1 ){
            _url = _url.substring(0,index);
        }
        var _mobile_site = util.format(mobile_site,_url);
        var req = Worker.request(_mobile_site,worker).then(function(_data){
            var body = _data[0],url = _data[1];
            var $ = cheerio.load(body,{decodeEntities: false});
            var mobile = $('.nums').text().replace(/\-/g,"").trim();
            if( !mobile ){
                mobile = $("p.tel").attr("data-tel").replace(/\-/g,"").trim();
            }

            data["mobile"] = mobile;
            logger.debug("  ..... 电话号码"+mobile+".... "+url);
            return data;
        })
        return req;
    }
}