var mysql  = require("mysql");
var util   = require("util");

function DbPool(cfg){
    this.pool = mysql.createPool(cfg);
    //this.pool.on('connection', function () {
    //        logger.debug(" on start connection pool ");
    //    });
    //this.pool.on('enqueue', function () {
    //    logger.debug('Waiting for available connection slot');
    //});
}
DbPool.prototype.getConnection = function() {
    var $this = this;
    return new Promise(function (resolve, reject) {
        $this.pool.getConnection(function (err, connection) {
            if (err)return reject(err);
            try {
                resolve(new DbConnection(connection));
            }
            catch (ex) {
                reject(err);
            }
        })
    })
}

function DbConnection(connection)
{
    if(!connection)throw new Error("unknow db connection..");

    var $this = this;

    this.transactioned = false;
    this.connection = connection;
    this.name = new Date().getTime();

    this.execCommand = function(dbStatement){
        logger.debug(dbStatement.sql);
        return new Promise(function(resolve,reject){
            $this.connection.query(dbStatement.sql, dbStatement.params, function (err, rows) {
                if( err ){
                    return reject(err);
                }
                dbStatement.value = rows;
                return resolve(dbStatement);
            })
        })
    }
}

DbConnection.prototype.startTracaction = function(){
    var $this = this;
    return new Promise(function(resolve,reject){
        $this.connection.beginTransaction(function(err){
            if( err ){
                return reject(err);
            }
            $this.transactioned = true;
            return resolve($this);
        });
    })
}

DbConnection.prototype.executeStatementQuery = function(sql,params){
    return Promise.resolve(new DbStatement(this,sql,params));
}

DbConnection.prototype.release = function(){
    try{
        this.connection.release();
    }catch(ex){
        logger.error(" release connection err => "+ex);
    }
}

DbConnection.prototype.rollback = function(){
    var $this = this;
    if( !$this.transactioned ) {
        return Promise.reject(err);
    }
    return new Promise(function(resolve){
        $this.transactioned = false;
        $this.connection.rollback(function() {
            $this.release();
            resolve(err);
        });
    })
}

DbConnection.prototype.commit = function(){
    var $this = this;
    if( !$this.transactioned ) {
        return Promise.resolve("commit");
    }
    return new Promise(function(resolve,reject){
        $this.transactioned = false;
        $this.connection.commit(function(err) {
            if( err ){
                $this.rollback(err).then(function(err){
                    reject(err);
                });
                return;
            }
            $this.release();
            resolve(err);
        });
    })
}

function DbStatement(dbConnection,sql,params){

    this.name = new Date().getTime();
    this.dbConnection = dbConnection;
    this.sql = sql || "select 1";
    this.params = params || {} ;

    this.execCommand = function(sql,params){
        if(sql){
            this.sql = sql;
        }
        if( params ){
            this.params = params;
        }
        this.format();
        return this.dbConnection.execCommand(this);
    }

    this.format = function(){
        if( Array.isArray(this.params) ){
            this.dbConnection.connection.config.queryFormat = null;
        }else{
            this.dbConnection.connection.config.queryFormat = function (query, values) {
                if (!values) return query;
                return query.replace(/\:(\w+)/g, function (txt, key) {
                    if (values.hasOwnProperty(key)) {
                        if( "object" == typeof values[key] ){
                            return this.escape(JSON.stringify(values[key]));
                        }else{
                            return this.escape(values[key]);
                        }
                    }
                    return txt;
                }.bind(this));
            };
        }
    }
}

DbStatement.prototype = new CurdTemplate();
DbStatement.prototype.constructor = DbStatement;

DbStatement.prototype.insert = function(schame,value){
    this.builderInsertStatement.apply(this,arguments);
    return this.execCommand();
}

DbStatement.prototype.inserts = function(schame,values){

    this.builderInsertsStatement.apply(this,arguments);
    return this.execCommand();
}
DbStatement.prototype.update = function(schame,fileds,wheresql){

    this.builderUpdateStatement.apply(this,arguments);
    return this.execCommand();
}

DbStatement.prototype.del = function(table,wheresql){
    this.builderDelStatement.apply(this,arguments);
    return this.execCommand();
}

function Db(cfg){

    var pool = new DbPool(cfg);

    this.sql = "";
    this.params = null;

    this.startTracaction = function(){
        return pool.getConnection().then(function(dbConnection){
            return dbConnection.startTracaction();
        }).then(function(dbConnection){
            return dbConnection.executeStatementQuery();
        })
    }

    this.execCommand = function(sql,params){
        return pool.getConnection().then(function(dbConnection){
                    return dbConnection.executeStatementQuery(sql,params)
                }).then(function(statement){return statement.execCommand()})

    }
    this.query = function(sql,params){
        return this.execCommand(sql,params).then(function(statement){
            statement.dbConnection.release();
            return statement;
        })
    }
}

Db.prototype = new CurdTemplate();
Db.prototype.constructor = Db;

Db.prototype.insert = function(schame,value){
    this.builderInsertStatement.apply(this,arguments);
    return this.execCommand(this.sql,this.params);
}
Db.prototype.inserts = function(schame,values){
    this.builderInsertsStatement.apply(this,arguments);
    return this.execCommand(this.sql,this.params);
}
Db.prototype.update = function(schame,fileds,wheresql){
    this.builderUpdateStatement.apply(this,arguments);
    return this.execCommand(this.sql,this.params);
}
Db.prototype.del = function(table,wheresql){
    this.builderDelStatement.apply(this,arguments);
    return this.execCommand(this.sql,this.params);
}

function CurdTemplate(){
    var insertFormat = "INSERT INTO `%s` ( %s ) VALUES ( %s )";
    var insertsFormat = "INSERT INTO `%s` ( %s ) VALUES  %s ";
    var updateFormat = "update `%s` set %s %s ";
    var delFormat = "DELETE FROM `%s` %s ";

    this.sql = "";
    this.params = "";

    this.builderInsertStatement = function(schame,value){
        var $insertkeysql = "",$insertvaluesql = "",$comma = "";
        for(var key in value){
            $insertkeysql += $comma + '`' +key + '`';
            $insertvaluesql += $comma+":"+key;
            $comma = ",";
        }
        var sql = util.format(insertFormat,schame,$insertkeysql,$insertvaluesql);
        //logger.debug(sql);

        this.sql = sql;
        this.params = value;
    }

    this.builderInsertsStatement = function(schame,values){
        if( !Array.isArray(values) && values.length <= 0 ){
            return Promise.reject(new Error("inserts 必须传递数组bean"));
        }
        var $insertkeysql = "",$insertvaluesql = "",$comma = "", $out="", $in = "";
        var $keys = values[0];
        for(var key in $keys){
            $insertkeysql += $comma + '`' +key + '`';
            $comma = ",";
        }

        var params = [];
        values.forEach(function(value){
            $in = '';
            $insertvaluesql += $out + '(';
            for(var key in value){
                $insertvaluesql += $in+"?";
                $in = ",";
                params.push(value[key] || "");
            }
            $insertvaluesql += ')';
            $out = ","
        })
        var sql = util.format(insertsFormat,schame,$insertkeysql,$insertvaluesql);
        //logger.debug(sql);
        var values = [];
        var $setsql = "",$comma = "",$_where = "";
        for(var key in fileds){
            $setsql += $comma + '`' +key + '` = ? ';
            $comma = ",";
            values.push(fileds[key] || "");
        }
        $comma = '';
        if( typeof wheresql == "string"){
            $_where = wheresql;
        }else{
            for(var key in wheresql){
                $_where += $comma + '`' +key + '` = ? ';
                $comma = " and ";
                values.push(wheresql[key] || "");
            }
        }
        if( $_where ){
            $_where = " where "+$_where;
        }
        var sql = util.format(updateFormat,schame,$setsql,$_where);
        //logger.debug(sql);
        this.sql = sql;
        this.params = values;
    }
    this.builderUpdateStatement = function(schame,fileds,wheresql){
        var values = [];
        var $setsql = "",$comma = "",$_where = "";
        for(var key in fileds){

            $setsql += $comma + '`' +key + '` = ? ';
            $comma = ",";

            values.push(fileds[key] || "");
        }
        $comma = '';
        if( typeof wheresql == "string"){
            $_where = wheresql;
        }else{
            for(var key in wheresql){
                $_where += $comma + '`' +key + '` = ? ';
                $comma = " and ";

                values.push(wheresql[key] || "");
            }
        }
        if( $_where ){
            $_where = " where "+$_where;
        }
        var sql = util.format(this.updateFormat,schame,$setsql,$_where);
        //logger.debug(sql);
        this.sql = sql;
        this.params = values;
    }
    this.builderDelStatement = function(schame,wheresql){
        var values = [];
        var $_where = "",$comma = '';
        if( typeof wheresql == "string"){
            $_where = wheresql;
        }else{
            for(var key in wheresql){
                $_where += $comma + '`' +key + '` = ? ';
                $comma = " and ";
                values.push(wheresql[key] || "");
            }
        }
        if( $_where ){
            $_where = " where "+$_where;
        }
        var sql = util.format(delFormat,schame,$_where);
        //logger.debug(sql);
        this.sql = sql;
        this.params = values;
    }
}

module.exports.createDb = function(cfg){
    return new Db(cfg);
}