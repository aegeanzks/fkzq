// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
var svr = require("./AdminSvr");
var OBJ = require('../Utils/ObjRoot').getObj;
const easyMonitor = require('easy-monitor');
easyMonitor('疯狂足球');

process.on('exit', function(){
    // 引入readline模块
    var readline = require('readline');

    //创建readline接口实例
    var rl = readline.createInterface({
        input:process.stdin,
        output:process.stdout
    });
  
    // question方法
    rl.question("按下任意按键关闭程序！",function(key){
        rl.close();
    });
});

process.on('uncaughtException', function (err) {
    OBJ('LogMgr').error(err);
});

function startSvr(){
    //启动服务
    svr.start();
}

startSvr();


