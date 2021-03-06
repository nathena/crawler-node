/**
 * Created by nathena on 16/6/1.
 */
var util   = require("util");
var cheerio = require("cheerio");
var Worker = require("./lib/WorkerChain");
var uuid = require("./lib/UUID");
var dateTime = require("./lib/DateTimeUtil");

var options = {};
options["Cookie"] = "24a79_saltkey=a66GHPRb; 24a79_lastpos=other; 24a79_oltoken=BFtRB1JVCQcHAjEDB1I; 24a79_readlog=%2C12557561%2C12583647%2C12703550%2C; 24a79_ipstate=1464599883; 24a79_cloudClientUid=49100991; CNZZDATA1254399833=718311327-1464227415-http%253A%252F%252Fwww.xmfish.com%252F%7C1464598006; CNZZDATA2119469=cnzz_eid%3D487015705-1464227415-http%253A%252F%252Fwww.xmfish.com%252F%26ntime%3D1464598958; 24a79_winduser=BFZUBVVTDj5VB1kBBQUGVwUABlZTDwdTCAZVDwtRAVUDBAIEAQUFBGpoVVJWW1dAVAA8GAY; 24a79_ck_info=%2F%09.xmfish.com; 24a79_lastvisit=1895%091464599916%09%2Fjq_ajax.php%3FactionshowFace%26%26uid1503627; 24a79_user_id_flag=82e2rvlV6%2FU9lItfUGcMLNc%2F%2F8ldgt%2F8hiURfp1BUNR8iErU; 24a79_lastupd1503627=1";

var url = "http://fangzi.xmfish.com/web/info_hire_31FD6BAB-4FA9-196F-7DF8-C03E80B04F56.html#373370";

Worker.request(url,options).then(function(data){

    console.log(data);

    var body = data[0],url = data[1];

    var $ = cheerio.load(body);

    var house = {};
    house["id"] = uuid.uuid();
    house["create_time"] = dateTime.getCurrentDate();
    house["site"] = "小鱼网";
    house["site_url"] = url;
    house["province"] = "福建";
    house["city"] = "厦门";

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
    house["pub_date"] = $(".secondMain span").eq(0).text().replace("最近更新：","").trim();
    house["up"] = 0;

    console.log(house);
})