/**
 * Created by nathena on 16/5/28.
 */
var iconv = require("iconv-lite");
var util   = require("util");
var cheerio = require("cheerio");
var uuid = require("../../lib/UUID");
var dateTime = require("../../lib/DateTimeUtil");

var Worker = require("../../lib/WorkerChain");

var options = {};
options["Accept-Charset"] = "gb2312";
options["encoding"] = null;

var url = "http://zu.xm.fang.com/house/a21-i3%d/";
var detailUrl = "http://zu.xm.fang.com%s";

var urls = [util.format(url,1),util.format(url,2)];
//var urls = [util.format(url,1)];

Worker.start("fang_xm",urls,options,function(datas){
    var data = [];
    var body = "",url = "";
    for(var i=0;i<datas.length;i++){

        body = datas[i][0],url = datas[i][1];

        var $ = cheerio.load(body);

        var list = $("dl.list dt a");
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

        body = iconv.decode(body,"gb2312");

        var $ = cheerio.load(body,{decodeEntities: false});

        var house = {};
        house["site_url"] = url;
        house["pub_date"] = $(".h1-tit p").eq(0).find("span").eq(1).text().trim().replace("更新时间：","");
        if( _cralweredData && _cralweredData[house["site_url"]] && _cralweredData[house["site_url"]]["pub_date"] == house["pub_date"] ){
            break;
        }

        house["id"] = uuid.uuid();
        house["create_time"] = dateTime.getCurrentDate();
        house["site"] = "房天下";

        house["province"] = "福建";
        house["city"] = "厦门";

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

        data.push(house);
    }
    return data;
})