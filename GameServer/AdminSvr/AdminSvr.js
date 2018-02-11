// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = AdminSvr;

var OBJ = require('../Utils/ObjRoot').getObj;

var RpcMgr = require('../Utils/Manager/RpcMgr');
var ModuleMgr = require('../Utils/Manager/ModuleMgr');
var DbMgr = require('../Utils/Manager/DbMgr');
var LogMgr = require('../Utils/Manager/LogMgr');
var RpcModule = require('./Module/Rpc/RpcModule');
var express = require('express');
var Router = require('./Routes/index');

var configs = require("../config");
var mongoCfg = configs.mongodb();
var config = configs.adminSvrConfig();
global.SERVERID = config.serverId;

var RlRaceController = require('./Controller/RealFootball/RaceController');
var RlRecordsController = require('./Controller/RealFootball/RecordsController');
var GameConfigController = require('./Controller/SystemManage/GameConfigController');
var RlVirtualRaceController = require('./Controller/VirtualFootball/VirtualRaceController');
var RlVirtualRecordsController = require('./Controller/VirtualFootball/VirtualRecordsController');
var RlAnnounceController = require('./Controller/SystemManage/AnnounceController');
var RlAccountController = require('./Controller/Accounts/AccountController');
function AdminSvr(){
}

AdminSvr.start = function () {
    //管理器初始化
    new LogMgr();
    console.log('开始启动服务('+config.serverId+') pid('+process.pid+')...');
    new ModuleMgr();
    new RpcMgr();
    new DbMgr().init(mongoCfg);
    AdminSvr.regsterFun();
    OBJ('RpcMgr').run(SERVERID, AdminSvr.run);
    console.log('服务已启动...');
};

//注册
AdminSvr.regsterFun = function(){
    //用户组件
    new RpcModule();
    new RlRaceController();
    new RlRecordsController();
    new GameConfigController();
    new RlVirtualRaceController();
    new RlVirtualRecordsController();
    new RlAnnounceController();
    new RlAccountController();
};


//运行
AdminSvr.run = function() {
    const app = express();

    app.all('*', (req, res, next) => {
        res.header("Access-Control-Allow-Origin", req.headers.origin || '*');
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
        res.header("Access-Control-Allow-Credentials", true); //可以带cookies
        res.header("X-Powered-By", '3.2.1')
        if (req.method == 'OPTIONS') {
              res.send(200);
        } else {
            next();
        }
    });
    Router(app);

    app.listen(config.port);
};

