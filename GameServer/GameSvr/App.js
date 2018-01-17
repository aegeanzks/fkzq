// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
var ObjRoot = require('../Utils/ObjRoot');
var OBJ = ObjRoot.getObj;

var svr = require("./GameSvr");
var http = require('http');
var dbStructure = require('../db_structure');
var UtilsFunc = require('../Utils/Functions');

global.SERVERID = process.argv[2]; //获取服务端id

process.on('exit', function(){
    // 引入readline模块
    var readline = require('readline');

    //创建readline接口实例
    var  rl = readline.createInterface({
        input:process.stdin,
        output:process.stdout
    });

    // question方法
    rl.question("按下任意按键关闭程序！",function(key){
        rl.close();
    });
});

//从配置文件获取服务器信息
var configs = require("../config");
var config = configs.gameSvrConfig();

//判断是否有配置
mapSvrConf = config.servers[SERVERID];

global.ip = "127.0.0.1";
global.port = mapSvrConf['port']; //暴露给客户端的接口

// 检测端口是否被占用
var net = require('net');
function portIsOccupied(pmPort) {
    // 创建服务并监听该端口
    var server = net.createServer().listen(pmPort);

    server.on('listening', function () { // 执行这块代码说明端口未被占用
        server.close(); //必须关闭，不然会占用端口
        startSvr();
    });

    server.on('error', function (err) {
        console.Console('端口被占用，启动失败...');
    });
}

function startSvr() {
    http.get("http://www.ip111.cn/", function (res) {
        res.setEncoding('utf8');
        var html = '';
        res.on('data', function (data) {
            html += data;
        });
        res.on('end', function () {
            ip = html.match(/(\d+\.){3}\d+/)[0];
            //ip = "192.168.0.28";
            if (ip.length !== 0){
                //启动服务
                svr.start(SERVERID, ip, port);
            }else{
                console.log('无法获得外网IP地址,启动失败');
                //进程退出
                process.exit();
            }
        });
    }).on('error', function (e) {
        console.log("Got error: " + e.message);
    });
}

portIsOccupied(port);