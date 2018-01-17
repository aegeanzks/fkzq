// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = LogMgr;

var ObjRoot = require('../../Utils/ObjRoot');
var OBJ = ObjRoot.getObj;

var winston = require('winston');
const DailyRotateFile=require('winston-daily-rotate-file');
const moment = require('moment');
var fs = require('fs');
var path = require('path');


function LogMgr(){
    ObjRoot.call(this, this.constructor.name);
    
    const dateFormat=function() {
        return moment().format('YYYY-MM-DD HH:mm:ss:SSS');
    };

    //递归创建目录 同步方法  
    function mkdirsSync(dirname) { 
        if (fs.existsSync(dirname)) {
            return true;
        } else {
            if (mkdirsSync(path.dirname(dirname))) {
                fs.mkdirSync(dirname);
                return true;
            }
        }
    } 
    mkdirsSync('./logs/');
    const allLoggerTransport = new DailyRotateFile({
        name: 'all',
        filename: './logs/all.log',
        timestamp: dateFormat,
        level: 'info',
        colorize: true,
        maxsize: 1024 * 1024 * 10,
        datePattern: '.yyyy-MM-dd'
    });
    const errorTransport = new (winston.transports.File)({
        name: 'error',
        filename: './logs/error.log',
        timestamp: dateFormat,
        level: 'error',
        colorize: true
    });
    var logger = new (winston.Logger)({
        transports: [
            allLoggerTransport,
            errorTransport
        ]
    });

    /*let originalMethod=this.logger.error;
    this.logger.error=function(){
        let cellSite=stackTrace.get()[1]; 
        originalMethod.apply(logger,[arguments[0]+'\n',{filePath:cellSite.getFileName(),lineNumber:cellSite.getLineNumber()}]);
    };*/

    // 崩溃日志
    const crashLogger= new (winston.Logger)({
        transports: [
            new (winston.transports.File)({
                name: 'error',
                filename: './logs/crash.log',
                level: 'error',
                handleExceptions: true,
                timestamp:dateFormat,
                humanReadableUnhandledException: true,
                json: false,
                colorize:true
            })
        ]
    });

    // 数据库日志
    var dbLogger = new (winston.Logger)({
        transports: [
            new (winston.transports.File)({
                name: 'db',
                filename: './logs/db.log',
                timestamp: dateFormat,
                level: 'info'
            })
        ]
    });

    this.error = function(err){
        logger.error(err);
        console.error(err);
    };

    this.info = function(info){
        logger.info(info);
        console.log(info);
    };

    this.dbError = function(err){
        dbLogger.error(err);
        console.error(err);
    };

    this.dbInfo = function(info){
        dbLogger.info(info);
        console.log(info);
    };
}