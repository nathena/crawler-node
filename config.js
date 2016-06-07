/**
 * 项目配置文件
 * @type {{debug: boolean, name: string, giftname: string, description: string, version: string, site_static_host: string, session_secret: string, log4js: {appenders: *[], levels: {logInfo: string}}, db_default_max_conns: number, db_mysqlConfig: {host: string, user: string, password: string, database: string}, db_default_page_rows: number}}
 */
var path = require("path");

exports = module.exports = {

    debug: true,
    name: "爬虫引擎",
    description: "爬虫",
    version: "0.1.0",

    log4js: {
        "category": "console",
        //"category": "logInfo",
        "appenders": [
            // 下面一行应该是用于跟express配合输出web请求url日志的
            {"type": "console", "category": "console"},
            // 定义一个日志记录器
            {
                "type": "dateFile",                // 日志文件类型，可以使用日期作为文件名的占位符
                "filename": path.join(__dirname,'logs',"/"),    // 日志文件名，可以设置相对路径或绝对路径
                "maxLogSize": 1024,
                "pattern": "info-yyyyMMdd.txt",    // 占位符，紧跟在filename后面
                "absolute": true,                  // filename是否绝对路径
                "alwaysIncludePattern": true,      // 文件名是否始终包含占位符
                "category": "logInfo"              // 记录器名
            }],
        "levels": {"logInfo": "DEBUG"}        // 设置记录器的默认显示级别，低于这个级别的日志，不会输出
    },

    mongoClient : "mongodb://127.0.0.1:27017/crawlers"
};
