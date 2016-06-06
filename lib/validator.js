/**
 * 验证方法静态类，
 * nathena
 */

var Validator = {
    Require: /.+/,
    //Email : /^\w+([-_\.]\w+)*@\w+([-_\.]\w+)*\.\w+([-_\.]\w+)*$/,
    Email: /^\w+([-_\.]*\w+)*@\w+([-_\.]*\w+)*\.\w+([-_\.]*\w+)*$/,
    EmailSend: /^(?:[^\u0391-\uFFE5]|[-_\.])+@(?:[^\u0391-\uFFE5]|[-_\.])+$/,
    EmailEnd: /^\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
    //Phone : /^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/,
    //Phone : /^((\d{2,3})|(\d{3}\-))?(0\d{2,3}|0\d{2,3}\-)?[1-9]\d{6,7}(\-\d{1,4})?$/,
    //Mobile : /^((\(\d{2,3}\))|(\d{3}\-))?1(3|5)\d{9}$/,
    //Mobile : /^((\d{2,3})|(\d{3}\-))?1(3|5|8)\d{9}$/,
    Mobile: /^[\w\d\-\+\.]+$/,
    Phone: /^[\d\-\+\.\(\)]{1,30}$/,
    //Mobile : /^[\d\-\+\.\(\)]{1,30}$/,
    //Url : /^(?:http:\/\/|https:\/\/|ftp:\/\/)?([A-Za-z0-9]+\.)+[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/,
    Url: /^(?:http:\/\/|https:\/\/|ftp:\/\/)?[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/,
    IdCard: "this.IsIdCard(value)",
    //Host : /^([A-Za-z0-9]+\.([A-Za-z0-9]+\.)+[A-Za-z]+)$/,
    Host: /^\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
    Currency: /^\d+(\.\d+)?$/,
    Number: /^\d+$/,
    Float: /^\d+(?:\.\d+)?$/,
    IpNum: /^(\d){1,3}\.(\d){1,3}\.(\d){1,3}\.(\d){1,3}$/,
    Ponumber: /^\d{5,30}$/,
    Zip: /^[1-9]\d{5}$/,
    QQ: /^[1-9]\d{4,29}$/,
    Integer: /^[-\+]?\d+$/,
    Double: /^[-\+]?\d+(\.\d+)?$/,
    English: /^[A-Za-z]+$/,
    Chinese: /^[\u0391-\uFFE5]+$/,
    Username: /^[a-z]\w{3,}$/i,
    UnSafe: /^(([A-Z]*|[a-z]*|\d*|[\-\_\~!@#\$%\^&\*\.\(\)\[\]\{\}<>\?\\\/\'\"]*)|.{0,3})$|\s/,
    IsSafe: function (str) {
        return !this.UnSafe.test(str);
    },
    Password: /^([A-Za-z0-9\.]){6,36}$/,
    StrictTextUnSafe: /([~!@#\$%\^&\*\+\s\(\)\[\]\{\}<>\?\\\/\'\"]+)/,
    TextUnSafe: /([~#\$%\^&\*\+\(\)\[\]\{\}<>\\\/\'\"]+)/,
    SimpleUnSafe: /[\\\/\*\?"'<>\|]/,
    specialChar: /[\\\/\*\?"'<>\|\s\-\+&!]/,
    ForeignBoxPasswordUnSafe: /([\s<>\\\/\'\"]+)/,
    SreachTextUnSafe: /([~!#\$%\^&\*\(\)\[\]\{\}<>\?\\\/\'\"]+)/,
    personal: /([~!@#\$%\^&\*\+\(\)\[\]\{\}<>\?\\\/\'\",]+)/,
    check:function(req,val){
        return req.test(val);
    },
    IsYear: function (year) {

        if (!this.Integer.test(year) || year <= 0) {
            return false;
        }
        var y = new Date().getFullYear();
        var oldY = y - 150;
        if (year > y || year < oldY) {
            return false;
        }
        return true;
    },
    limit: function (len, min, max) {
        min = min || 0;
        max = max || Number.MAX_VALUE;
        return min <= len && len <= max;
    },
    LenB: function (str) {
        return str.replace(/[^\x00-\xff]/g, "**").length;
    },
    Trim: function (str) {
        return str.replace(/((^\s*)|(\s*$))/g, '');
    },
    IsIdCard: function (number) {
        var date, Ai;
        var verify = "10x98765432";
        var Wi = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
        var area = ['', '', '', '', '', '', '', '', '', '', '', '北京', '天津', '河北', '山西', '内蒙古', '', '', '', '', '', '辽宁', '吉林', '黑龙江', '', '', '', '', '', '', '', '上海', '江苏', '浙江', '安微', '福建', '江西', '山东', '', '', '', '河南', '湖北', '湖南', '广东', '广西', '海南', '', '', '', '重庆', '四川', '贵州', '云南', '西藏', '', '', '', '', '', '', '陕西', '甘肃', '青海', '宁夏', '新疆', '', '', '', '', '', '台湾', '', '', '', '', '', '', '', '', '', '香港', '澳门', '', '', '', '', '', '', '', '', '国外'];
        var re = number.match(/^(\d{2})\d{4}(((\d{2})(\d{2})(\d{2})(\d{3}))|((\d{4})(\d{2})(\d{2})(\d{3}[x\d])))$/i);
        if (re == null) return false;
        if (re[1] >= area.length || area[re[1]] == "") return false;
        if (re[2].length == 12) {
            Ai = number.substr(0, 17);
            date = [re[9], re[10], re[11]].join("-");
        }
        else {
            Ai = number.substr(0, 6) + "19" + number.substr(6);
            date = ["19" + re[4], re[5], re[6]].join("-");
        }
        if (!this.IsDate(date, "ymd")) return false;
        var sum = 0;
        for (var i = 0; i <= 16; i++) {
            sum += Ai.charAt(i) * Wi[i];
        }
        Ai += verify.charAt(sum % 11);
        return (number.length == 15 || number.length == 18 && number == Ai);
    },
    IsDate: function (op, formatString) {
        formatString = formatString || "ymd";
        var m, year, month, day;
        switch (formatString) {
            case "ymd" :
                m = op.match(new RegExp("^((\\d{4})|(\\d{2}))([-./])(\\d{1,2})\\4(\\d{1,2})$"));
                if (m == null) return false;
                day = m[6];
                month = m[5] * 1;
                year = (m[2].length == 4) ? m[2] : GetFullYear(parseInt(m[3], 10));
                break;
            case "dmy" :
                m = op.match(new RegExp("^(\\d{1,2})([-./])(\\d{1,2})\\2((\\d{4})|(\\d{2}))$"));
                if (m == null) return false;
                day = m[1];
                month = m[3] * 1;
                year = (m[5].length == 4) ? m[5] : GetFullYear(parseInt(m[6], 10));
                break;
            default :
                break;
        }
        if (!parseInt(month)) return false;
        month = month == 0 ? 12 : month;
        var date = new Date(year, month - 1, day);
        return (typeof(date) == "object" && year == date.getFullYear() && month == (date.getMonth() + 1) && day == date.getDate());
        function GetFullYear(y) {
            return ((y < 30 ? "20" : "19") + y) | 0;
        }
    },
    Ip: function (str) {
        if (!this.IpNum.test(str)) {
            return false;
        }
        return checkIp(str);
        function checkIp(str) {
            var ipv = str.split('.');
            for (var i = 0; i < ipv.length; i++) {
                if (ipv[i] > 255) {
                    return false;
                }
            }
            return true;
        }
    },
    Iscalendar: function (year, month, date) {
        if (isNaN(parseInt(year, 10)) || isNaN(parseInt(month, 10)) || isNaN(parseInt(date, 10)))
            return false;

        var isMixMonth = (function () {
            if (parseInt(month) == 4)return true;
            if (parseInt(month) == 6)return true;
            if (parseInt(month) == 9)return true;
            if (parseInt(month) == 11)return true;
            return false;
        })();

        var isLeapYear = (function () {
            return year % 4 == 0 && (year % 400 == 0 || year % 100 != 0);
        })();

        if (isLeapYear) {
            if (parseInt(month) == 2 && parseInt(date) > 29) {
                return false;
            }

        }
        else {
            if (parseInt(month) == 2 && parseInt(date) > 28) {
                return false;
            }
        }
        if (isMixMonth && parseInt(date) > 30) {
            return false;
        }
        return true;
    },
    IsNull: function () {
        var args = arguments;
        var len = args.length;
        for (var i = 0; i < len; i++) {
            if (!args[i])
                return true;
            if (this.LenB(this.Trim(args[i])) == 0)
                return true;
        }
        return false;
    },
    //2008-6-10 密码强度验证
    Passwd: function (passwd) {
        //0非法 1长 2弱 3中 4强 -1为空
        //双字节
        var cc = /[\u0391-\uFFE5]/;
        if (this.specialChar.test(passwd) || cc.test(passwd)) {
            //特殊字符或者空格
            return 0;
        }
        var len = this.LenB(this.Trim(passwd));

        if (len == 0) {
            return -1;
        }

        if (len < 6 || len > 36) {
            //密码长度6-30
            return 1
        }

        //全部小写字母
        var lw = /^[a-z]+$/;
        //全部大写字母
        var uw = /^[A-Z]+$/;
        //全部为数字
        var n = /^\d+$/;
        //全部为特殊字符
        var sw = /^[~#\$%\^\(\)\[\]\{\},:;\.`_=@]+$/;
        if (lw.test(passwd)) {
            return 2;
        }
        if (uw.test(passwd)) {
            return 2;
        }
        if (n.test(passwd)) {
            return 2;
        }
        if (sw.test(passwd)) {
            return 2;
        }

        //强 `~@#$%^()_=;:[]{},.\/*?"'<>|-+&!
        var s = /[~#\$%\^\(\)\[\]\{\},:;\.`_=@]/;
        var ss = /[a-z]/;
        var uss = /[A-Z]/;
        var sss = /\d/;
        if (s.test(passwd) && uss.test(passwd) && ss.test(passwd) && sss.test(passwd)) {
            return 4;
        }

        //中
        return 3
    },
    GetMobileType: function (mobile) {
        // 非11位0，移动1，联通2，其它3
        if (!/^\d{11}$/.test(mobile)) {
            return 0;
        }

        var chinamobile = ",1340,1341,1342,1343,1344,1345,1346,1347,1348,135,136,137,138,139,150,151,157,158,159,187,188,";
        var chinaunicom = ",130,131,132,133,153,155,156,185,186,177,179,";

        if (chinamobile.indexOf("," + mobile.substring(0, 3) + ",") > -1 || chinamobile.indexOf("," + mobile.substring(0, 4) + ",") > -1) {
            return 1;
        }
        else if (chinaunicom.indexOf("," + mobile.substring(0, 3) + ",") > -1) {
            return 2;
        }
        else {
            return 3;
        }
    }
}

module.exports = Validator;