var mailer    = require("nodemailer");
var appConfig = require("../config");

var transport = mailer.createTransport("SMTP", appConfig.mail_opts);

/**
 * send mail
 * @param  {object} mailObj the instance of mail
 * mail object like :
 * {
 *   from : xxx
 *   to   : xxx
 *   subject : xxx
 *   text/html : xxx
 * }
 * @return {null}         
 */
exports.sendMail = function (mailObj) {

    logger.debug("sendMail begin ..... ");

    if (!mailObj.hasOwnProperty("from")) {
        mailObj.from = appConfig.mail_opts.auth.user;
    }

    //if there is no property then use default
    if (!mailObj.hasOwnProperty("to")) {
        throw new DataNotFoundError("收件人未定义");
    }

    logger.debug("sending mail .....");

    transport.sendMail(mailObj, function (err) {
        if (err) {
            logger.error("sendMail error ... ");
            logger.error(err);
        }
    });
};