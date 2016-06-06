/**
 * Created by nathena on 15/7/13.
 */

exports.getCurrentDate = function(){

    var date = new Date();
    var dateString = [];
    dateString.push(date.getFullYear());
    dateString.push("-")
    dateString.push(date.getMonth()+1>10?date.getMonth()+1:"0"+(date.getMonth()+1));
    dateString.push("-")
    dateString.push(date.getDate()>10?date.getDate():"0"+date.getDate());
    dateString.push(" ")
    dateString.push(date.getHours()>10?date.getHours():"0"+date.getHours());
    dateString.push(":");
    dateString.push(date.getMinutes()>10?date.getMinutes():"0"+date.getMinutes());
    dateString.push(":");
    dateString.push(date.getSeconds()>10?date.getSeconds():"0"+date.getSeconds());

    return dateString.join("");
}


exports.getTimeStamp = function()
{
    var date = new Date();

    return parseInt(date.getTime()/1000,10);
}