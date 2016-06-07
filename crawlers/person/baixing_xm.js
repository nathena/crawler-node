/**
 * Created by nathena on 16/5/28.
 */
var util   = require("util");
var cheerio = require("cheerio");
var uuid = require("../../lib/UUID");
var dateTime = require("../../lib/DateTimeUtil");

var Worker = require("../../lib/WorkerChain");

var options = {};
options["User-Agent"] = "Mozilla/5.0 (iPhone; CPU iPhone OS 9_3_2 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13F69 MicroMessenger/6.3.16 NetType/WIFI Language/zh_CN";

var url = "http://xiamen.baixing.com/m/zhengzu/?grfy=1&page=%d";
var detailUrl = "%s";

var urls = [util.format(url,1),util.format(url,2)];
//var urls = [util.format(url,1)];

Worker.start("baixing_xm",urls,options,function(datas){
    var data = [];
    var body = "",url = "";
    for(var i=0;i<datas.length;i++){

        body = datas[i][0],url = datas[i][1];

        var $ = cheerio.load(body);
        var list = $("li.regular a");

        list.each(function(index,val){
            data.push(util.format(detailUrl,$(val).attr("href")));
        });
    }

    return data;

},function(datas,_cralweredData){

    var data = [];
    var body = "",url = "";
    for(var i=0;i<datas.length;i++){

        body = datas[i][0],url = datas[i][1];

        var $ = cheerio.load(body,{decodeEntities: false});

        var house = {};

        house["site_url"] = url;
        house["pub_date"] = $("time.friendly").text().trim();

        if( _cralweredData && _cralweredData[house["site_url"]] && _cralweredData[house["site_url"]]["pub_date"] == house["pub_date"] ){
            break;
        }

        house["id"] = uuid.uuid();
        house["create_time"] = dateTime.getCurrentDate();
        house["site"] = "百姓网";
        house["province"] = "福建";
        house["city"] = "厦门";

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

        data.push(house);
    }
    return data;
})