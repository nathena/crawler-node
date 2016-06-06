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
//options["User-Agent"] = "Mozilla/5.0 (iPhone; CPU iPhone OS 9_3_2 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13F69 MicroMessenger/6.3.16 NetType/WIFI Language/zh_CN";

var url = "http://m.anjuke.com/xm/rent/69476032-2/";

Worker.request(url,options).then(function(data){


    var body = "",url = "";

        body = data[0],url = data[1];

        var $ = cheerio.load(body,{decodeEntities: false});

        var house = {};
        house["id"] = uuid.uuid();
        house["create_time"] = dateTime.getCurrentDate();
        house["site"] = "安居客";
        house["site_url"] = url;
        house["province"] = "福建";
        house["city"] = "厦门";

        var region_info = $(".view-info-detail li").last().text().replace("小区：","").replace("查看详情","").trim().replace(/\s+/g,"-");
        var region_info_data = region_info.split("-");
        //区域
        house["region"] = region_info_data[0] || "";
        //商圈
        region_info_data.shift();
        house["business_area"] = region_info_data.join(" ");

        var title = $(".view-info-title h1").html().trim(),index = title.indexOf("<");
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

        house["pub_date"] = $(".view-info-detail li").eq(8).text().trim().replace("时间：","");

        house["up"] = 0;

        console.log(house);

    return house;

}).then(function(data){
    Worker.store(data);
}).catch(function(err){
    console.log("err >> "+err);
})