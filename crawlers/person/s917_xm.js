/**
 * Created by nathena on 16/5/28.
 */
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
headers["Cookie"] = "gotoSite=xm;CNZZDATA1252896027=682520566-1464418840-http%253A%252F%252Fhouse1.4846.com%253A20002%252F%7C1464597614; Hm_lvt_71b06c2cbb8ee39cbaf2b225a876c356=1464419801,1464419810,1464419815,1464602186; SESSIONID=f7id7asp2o5gacjk51foe94231; Hm_lpvt_71b06c2cbb8ee39cbaf2b225a876c356=1464602541";

var url = "http://www.917.com/chuzu/r1t1/?page=%d";

var workers = [];

var worker = {};
worker["name"] = "s917_xm";
worker["site"] = "917";
worker["province"] = "福建";
worker["city"] = "厦门";
worker["storeScheme"] = "t_crawler";
worker["headers"] = headers;
worker["list_urls"] = [util.format(url,1),util.format(url,2)];

workers.push(worker);

Worker.start(workers,parserList,parserDetail);

var detailUrl = "http://www.917.com%s";
function parserList(data,worker){
    var body = data[0],url = data[1],results = [];
    var $ = cheerio.load(body);
    var list = $("dl.list p.title a");
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
    house["pub_date"] = $(".mainBoxL .title span").eq(5).text().trim().replace("发布时间：","").trim() || "";
    house["region"] = $(".bread a").eq(2).text().trim() || "";
    house["business_area"] = $(".bread a").eq(3).text().trim() || "";
    house["title"] = $(".mainBoxL .title h1").text().trim()||"";
    house["rent_price"] = $(".zongjia1 .red20b").text().trim()||"";
    house["rent_type"] = $(".youxinxi").find("dl").eq(0).find("dd").eq(2).find("span").text().trim() || "";
    //建筑类型
    house["style"] = $(".youxinxi").find("dl").eq(1).find("dt").eq(0).text().trim().replace(/\s+/g,"").replace("建筑类别：","") || "住宅";
    house["floor"] = $(".youxinxi").find("dl").eq(1).find("dd").eq(2).text().trim().replace(/\s+/g,"").replace("楼层：","") || "";
    //户型
    house["room_type"] = $(".youxinxi").find("dl").eq(0).find("dd").eq(0).text().trim().replace(/\s+/g,"").replace("户型：","") || "";
    //面积
    house["area"] = $(".youxinxi").find("dl").eq(1).find("dd").eq(0).text().trim().replace(/\s+/g,"").replace("面积：","") || "";
    //装修
    house["decor"] = $(".youxinxi").find("dl").eq(1).find("dd").eq(3).text().trim().replace(/\s+/g,"").replace("装修：","") || "";
    //朝向
    house["direction"] = $(".youxinxi").find("dl").eq(1).find("dd").eq(1).text().trim().replace(/\s+/g,"").replace("朝向：","") || "";
    house["mobile"] = $(".phone_top span").text().trim() || "";
    house["username"] = $(".phone_top em").text().trim() || "";
    house["addr"] = $(".youxinxi").find("dl").eq(1).find("dt").eq(2).find(".sheshi").text().trim() || "";
    house["up"] = 0;

    return house;
}
