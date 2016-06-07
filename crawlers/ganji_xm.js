/**
 * Created by nathena on 16/5/28.
 */
var util   = require("util");
var cheerio = require("cheerio");
var uuid = require("../lib/UUID");
var dateTime = require("../lib/DateTimeUtil");

var Worker = require("../lib/WorkerChain");

var options = {};
options["User-Agent"] = "Mozilla/5.0 (iPhone; CPU iPhone OS 9_3_2 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13F69 MicroMessenger/6.3.16 NetType/WIFI Language/zh_CN";

var url = "http://3g.ganji.com/xm_fang1/?page=%d";
var detailUrl = "http://3g.ganji.com%s";

var urls = [util.format(url,1),util.format(url,2)];
//var urls = [util.format(url,1)];

Worker.start("ganji_xm",urls,options,function(datas){
    var data = [];
    var body = "",url = "";
    for(var i=0;i<datas.length;i++){

        body = datas[i][0],url = datas[i][1];

        var $ = cheerio.load(body);

        var list = $(".house-list a");
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
        var _url = url,index = url.indexOf("?");
        if( index > -1 ){
            _url = _url.substring(0,index);
        }
        house["site_url"] = _url;
        house["pub_date"] = $(".publish-time").text().trim().replace("发布时间","") || "";
        if( _cralweredData && _cralweredData[house["site_url"]] && _cralweredData[house["site_url"]]["pub_date"] == house["pub_date"] ){
            break;
        }
        house["id"] = uuid.uuid();
        house["create_time"] = dateTime.getCurrentDate();
        house["site"] = "赶集网";
        house["province"] = "福建";
        house["city"] = "厦门";

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

        house["mobile"] = $("p.tel-code").text().trim();

        house["username"] = $(".connect-info p.f12").text().trim().replace(/\s+/g," ");

        house["addr"] = $(".map-addr").text().trim().replace("地址","") || "";

        house["up"] = 0;

        data.push(house);
    }

    if( data.length>0 ) {
        return data;
    }else{
        return Promise.reject("没有新的数据可以抓取");
    }
})