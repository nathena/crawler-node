/**
 * Created by nathena on 16/5/28.
 */
var parserUrl = require("url");
var util   = require("util");
var cheerio = require("cheerio");
var uuid = require("../../lib/UUID");
var dateTime = require("../../lib/DateTimeUtil");

var Worker = require("../../lib/WorkerChain");

var options = {};
options["User-Agent"] = "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36";

var url = "http://m.58.com/xm/chuzu/0/pn%d/";
var detailUrl = "%s";
var mobile_site = "http://app.58.com/api/windex/scandetail/car/%d/?pid=799"

var urls = [util.format(url,1),util.format(url,2)];
//var urls = [util.format(url,1)];

Worker.start("s58_xm",urls,options,function(datas){
    var data = [];
    var body = "",url = "";
    for(var i=0;i<datas.length;i++){

        body = datas[i][0],url = datas[i][1];
        //body = datas[0][0],url = datas[0][1];

        var $ = cheerio.load(body);

        var list = $("ul.list-info li");

        var href = "";
        list.each(function(index,val){
            href = $(val).find("a").eq(0).attr("href");
            data.push(util.format(detailUrl,href));
        });
    }

    return data;

},function(datas,_cralweredData){

    var data = [],urls = [];
    var body = "",url = "";
    for(var i=0;i<datas.length;i++){

        body = datas[i][0],url = datas[i][1];


        var $ = cheerio.load(body,{decodeEntities: false});

        var house = {};

        var _url = url.substring(0,url.indexOf("?"));
        var _url = url,index = url.indexOf("?");
        if( index > -1 ){
            _url = _url.substring(0,index);
        }
        house["site_url"] = _url;
        house["pub_date"] = $(".meta-time li").eq(0).text().replace("发布时间:","").trim();

        if( _cralweredData && _cralweredData[house["site_url"]] && _cralweredData[house["site_url"]]["pub_date"] == house["pub_date"] ){
            break;
        }

        house["id"] = uuid.uuid();
        house["create_time"] = dateTime.getCurrentDate();
        house["site"] = "58";
        house["province"] = "福建";
        house["city"] = "厦门";

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

        data.push(house);

        var _data = parserUrl.parse(url,true);
        _data = _data["query"]["entinfo"] || "";
        if( !_data ){

            logger.debug(" ...."+url+" 获取不到手机号码");
            urls.push("about:blank");

        } else {
            _data = _data.substring(0,_data.indexOf("_0"));
            var _mobile_site = util.format(mobile_site,_data);

            urls.push(_mobile_site);
        }
    }

    if( data.length>0 ){
        var mapRequests = Worker.mapRequests(data,urls,options).then(function(datas){

            var data = [];
            var house = null,body = "",url = "";
            for(var i=0;i<datas.length;i++ ){

                house = datas[i][0],body = datas[i][1], url= datas[i][2];

                var $ = cheerio.load(body,{decodeEntities: false});
                var mobile = $('.nums').text().replace(/\-/g,"").trim();
                if( !mobile ){
                    mobile = $("p.tel").attr("data-tel").replace(/\-/g,"").trim();
                }

                house["mobile"] = mobile;
                logger.debug("  ..... 电话号码"+mobile+".... "+url);

                data.push(house);
            }
            return data;
        });

        return mapRequests;
    }

    return Promise.reject("没有新的数据可以抓取");
})