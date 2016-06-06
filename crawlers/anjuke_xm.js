/**
 * Created by nathena on 16/5/28.
 */
var util   = require("util");
var cheerio = require("cheerio");
var uuid = require("../lib/UUID");
var dateTime = require("../lib/DateTimeUtil");

var Worker = require("./myWorker");

var options = {};
//options["User-Agent"] = "Mozilla/5.0 (iPhone; CPU iPhone OS 9_3_2 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13F69 MicroMessenger/6.3.16 NetType/WIFI Language/zh_CN";
//options["User-Agent"] = "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36";
//options["Upgrade-Insecure-Requests"] = 1;
//options["Cookie"] = "sessid=CBD75E8F-8C43-CCD1-520B-92725786190B; twe=1; speed=0; ctid=46; Hm_lvt_d3e6ebed001da95304bcf4271eba64de=1464749808; Hm_lpvt_d3e6ebed001da95304bcf4271eba64de=1464920893; 58tj_uuid=2ef389a8-61e3-4189-a464-1b30d2c92cc3; new_uv=2; aQQ_ajkguid=53029C93-DF0F-88F4-F2DA-C4A0FF7E4DB1";

var url = "http://m.anjuke.com/xm/rentlistbypage/all/a0_0-b0-0-0-f4/?page=%d";
var detailUrl = "%s";

var urls = [util.format(url,1),util.format(url,2)];
//var urls = [util.format(url,1)];

Worker.start("anjuke_xm",urls,options,function(datas){
    var data = [];
    var body = "",url = "";
    for(var i=0;i<datas.length;i++){

        body = datas[i][0],url = datas[i][1];

        body = JSON.parse(body);
        body = body.datas.list_info;
        body.forEach(function(val){
            data.push(util.format(detailUrl,val.prop_url));
        })
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
        house["pub_date"] = $(".view-info-detail li").eq(8).text().trim().replace("时间：","");

        if( _cralweredData && _cralweredData[house["site_url"]] && _cralweredData[house["site_url"]]["pub_date"] == house["pub_date"] ){
            break;
        }

        house["id"] = uuid.uuid();
        house["create_time"] = dateTime.getCurrentDate();
        house["site"] = "安居客";
        house["province"] = "福建";
        house["city"] = "厦门";

        var region_info = $(".view-info-detail li").last().text().replace("小区：","").replace("查看详情","").trim().replace(/\s+/g,"-");
        var region_info_data = region_info.split("-");
        //区域
        house["region"] = region_info_data[0] || "";
        //商圈
        region_info_data.shift();
        house["business_area"] = region_info_data.join(" ");

        var title = $(".view-info-title h1").html(),index = -1;
        if( title ){
            index = title.indexOf("<")
        }else{
            console.log(" title is null >>>> "+url+" "+body);
            continue;
        }
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

        data.push(house);
    }

    if( data.length>0 ) {
        return data;
    }else{
        return Promise.reject("没有新的数据可以抓取");
    }
})