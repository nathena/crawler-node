/**
 * Created by nathena on 16/5/28.
 */
var util   = require("util");
var cheerio = require("cheerio");
var uuid = require("../../lib/UUID");
var dateTime = require("../../lib/DateTimeUtil");

var Worker = require("../../lib/WorkerChain");

var options = {};
options["User-Agent"] = "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36";

var url = "http://m.58.com/xm/ershoufang/pn%d/?segment=true";
var detailUrl = "%s";
var urls = [util.format(url,1),util.format(url,2)];
//var urls = [util.format(url,1)];

Worker.start("s58_shh_xm",urls,options,function(datas){
    var data = [];
    var body = "",url = "";
    for(var i=0;i<datas.length;i++){
        body = datas[i][0],url = datas[i][1];
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
        var _url = url,index = url.indexOf("?");
        if( index > -1 ){
            _url = _url.substring(0,index);
        }
        house["site_url"] = _url;
        var pub_date = $(".name-info dd").eq(0).html(),index = pub_date.indexOf("</script>");
        if( index > -1 ){
            pub_date = pub_date.substring(index+"</script>".length,pub_date.length).trim();
        }
        //console.log($(".name-info").html()+" "+_url);
        //break;
        house["pub_date"] = (pub_date || dateTime.getCurrentDate()).trim();
        //重复
        if( _cralweredData && _cralweredData[house["site_url"]] && _cralweredData[house["site_url"]]["pub_date"] == house["pub_date"] ){
            break;
        }

        house["id"] = uuid.uuid();
        house["create_time"] = dateTime.getCurrentDate();
        house["site"] = "58";
        house["province"] = "福建";
        house["city"] = "厦门";

        var regions = $(".infor-other li").eq(3).text().replace("位置：","").trim();
        regions = regions.split("-");
        //区域
        house["region"] = (regions[0] || "").trim();
        //商圈
        house["business_area"] = (regions[1] || "").trim();
        //title
        house["title"] = $("#titlename").text().trim();
        //售价
        house["total"] = $(".infor-price li").eq(0).find(".yellow").text().trim();
        //单价格价
        house["price"] = $(".infor-other li").eq(0).find(".black").text().trim();
        //户型
        house["room_type"] = $(".infor-price li").eq(1).find(".yellow").text().trim();
        //面积
        house["area"] = $(".infor-price li").eq(2).find(".yellow").text().trim();
        //装修
        house["decor"] = $(".descrip-infor li").eq(2).find(".black").text().trim();
        //朝向
        house["direction"] = $(".infor-other li").eq(1).find(".black").text();
        //建筑类型~ 板楼
        house["style"] = $(".descrip-infor li").eq(3).find(".black").text().trim();
        //楼层
        house["floor"] = $(".infor-other li").eq(2).find(".black").text().trim();
        //房龄
        house["year"] = $(".descrip-infor li").eq(0).find(".black").text().trim();
        //产权
        house["property"] = $(".descrip-infor li").eq(1).find(".black").text().trim();
        //房东
        house["username"] = $(".contact li").eq(0).text().trim();
        //联系方式
        house["mobile"] = $(".contact li").eq(1).text().trim();
        //地址
        house["addr"] = $(".address").text().trim();
        //更新次数
        house["up"] = 0;

        data.push(house);
    }
    return data;
},"t_crawler_shh")
