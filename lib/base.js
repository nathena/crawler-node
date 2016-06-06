var util   = require("util");

/**
 * 自定义异常类
 * @param errorName
 * @param statusCode
 * @returns {MyError}
 */
function createError(errorName,statusCode){

    function MyError(message)
    {
        Error.call(this);
        this.name       = errorName;
        this.message    = message || errorName;
        this.statusCode = statusCode;

        this.toJSON = function(){
            return {code:this.statusCode,msg:this.message};
        }
    }

    util.inherits(MyError, Error);

    return MyError;
}

/**
 * 自定义异常名
 */

[
    ["ServerError",-1],
    ["InvalidParamError",-2],
    ["DataNotFoundError",-3],
    ["PageNotFoundError",-4],
    ["DBError",-5],
    ["SessionError",-6],
    ["ValiCodeSessionError",-7],
    ["UploadFileSizeLimitError",-8],
    ["NotFound",-404]

].forEach(function(errorData){
    global[errorData[0]] = createError(errorData[0],errorData[1]);
})

//全局logger
var log4js = require("log4js");
var config = require("../config");

log4js.configure(config.log4js);

global.logger = exports.logger = log4js.getLogger(config.log4js.category);

//String.format
if( !String.prototype.format ){

    String.prototype.format = function() {
        var s = this;
        for (var i = 0; i < arguments.length; i++) {
            var reg = new RegExp("\\{" + i + "\\}", "gm");
            s = s.replace(reg, arguments[i]);
        }
        return s;
    };
}

if (!String.prototype.repeat) {
    String.prototype.repeat = function(count) {
        'use strict';
        if (this == null) {
            throw new TypeError('can\'t convert ' + this + ' to object');
        }
        var str = '' + this;
        count = +count;
        if (count != count) {
            count = 0;
        }
        if (count < 0) {
            throw new RangeError('repeat count must be non-negative');
        }
        if (count == Infinity) {
            throw new RangeError('repeat count must be less than infinity');
        }
        count = Math.floor(count);
        if (str.length == 0 || count == 0) {
            return '';
        }
        // Ensuring count is a 31-bit integer allows us to heavily optimize the
        // main part. But anyway, most current (August 2014) browsers can't handle
        // strings 1 << 28 chars or longer, so:
        if (str.length * count >= 1 << 28) {
            throw new RangeError('repeat count must not overflow maximum string size');
        }
        var rpt = '';
        for (;;) {
            if ((count & 1) == 1) {
                rpt += str;
            }
            count >>>= 1;
            if (count == 0) {
                break;
            }
            str += str;
        }
        return rpt;
    }
}