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
headers["Cookie"] = "24a79_saltkey=a66GHPRb; 24a79_lastpos=other; 24a79_oltoken=BFtRB1JVCQcHAjEDB1I; 24a79_readlog=%2C12557561%2C12583647%2C12703550%2C; 24a79_ipstate=1464599883; 24a79_cloudClientUid=49100991; CNZZDATA1254399833=718311327-1464227415-http%253A%252F%252Fwww.xmfish.com%252F%7C1464598006; CNZZDATA2119469=cnzz_eid%3D487015705-1464227415-http%253A%252F%252Fwww.xmfish.com%252F%26ntime%3D1464598958; 24a79_winduser=BFZUBVVTDj5VB1kBBQUGVwUABlZTDwdTCAZVDwtRAVUDBAIEAQUFBGpoVVJWW1dAVAA8GAY; 24a79_ck_info=%2F%09.xmfish.com; 24a79_lastvisit=1895%091464599916%09%2Fjq_ajax.php%3FactionshowFace%26%26uid1503627; 24a79_user_id_flag=82e2rvlV6%2FU9lItfUGcMLNc%2F%2F8ldgt%2F8hiURfp1BUNR8iErU; 24a79_lastupd1503627=1";

var url = "http://fangzi.xmfish.com/web/search_hire.html?hf=1&page=%d";

var workers = [];
var worker = {};
worker["name"] = "xmfish_xm";
worker["site"] = "小鱼网";
worker["province"] = "福建";
worker["city"] = "厦门";
worker["storeScheme"] = "t_crawler";
worker["headers"] = headers;
worker["site_code"] = "xm";
worker["list_urls"] = [util.format(url,1),util.format(url,2)];
workers.push(worker);

Worker.start(workers,parserList,parserDetail);

var detailUrl = "http://fangzi.xmfish.com%s";
function parserList(data,worker){
    var body = data[0],url = data[1],results = [];
    var $ = cheerio.load(body);
    var list = $(".list-img a");
    list.each(function(index,val){
        results.push(util.format(detailUrl,$(val).attr("href")));
    });
    return results;
}

function parserDetail(data,worker){
    var body = data[0],url = data[1];
    var $ = cheerio.load(body);

    var house = {};
    house["site_url"] = url;
    house["pub_date"] = $(".secondMain span").eq(0).text().replace("最近更新：","").trim();

    var regionDataInfo = $(".pos a");

    house["region"] = regionDataInfo.eq(2).text().trim();
    house["business_area"] = regionDataInfo.eq(3).text().trim();

    house["title"] = $(".secondMain h3").text().trim()||"";

    house["rent_price"] = $(".secondMain table tr").eq(0).find("span").text();
    house["rent_type"] = $(".secondMain table tr").eq(1).find("td").eq(0).find("span").text();

    house["style"] = "住宅";
    house["floor"] = $(".secondMain table tr").eq(2).find("td").eq(0).find("span").text();

    var s_room_type =  $(".secondMain table tr").eq(1).find("td").eq(1).find("span").text();
    var s_index = s_room_type.indexOf("("),s_last = s_room_type.indexOf(")");
    var room_type = s_room_type.substring(0,s_index).trim();
    var room_area = s_room_type.substring(s_index+1,s_last).trim();
    //户型
    house["room_type"] = room_type;
    //面积
    house["area"] = room_area;

    house["decor"] = $(".secondMain table tr").eq(3).find("td").eq(0).find("span").text();
    house["direction"] = $(".secondMain table tr").eq(2).find("td").eq(1).find("span").text();
    house["mobile"] = $(".secondTel").text().trim() || "";
    house["username"] = $(".secondAgent h4").text().trim() || "";
    //house["addr"] = $("div.bd table").find("tr").eq(6).find("span").text().trim() || "";

    house["up"] = 0;

    return house;
}
