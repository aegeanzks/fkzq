// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = GameSvr;

var OBJ = require('../Utils/ObjRoot').getObj;

var RpcMgr = require('../Utils/Manager/RpcMgr');
var ModuleMgr = require('../Utils/Manager/ModuleMgr');
var LogMgr = require('../Utils/Manager/LogMgr');

var RpcModule = require('./Module/Rpc/RpcModule');

var configs = require("../config");
var config = configs.daemonSvrConfig();

function GameSvr(){}

GameSvr.start = function () {
    //管理器初始化
    console.log('开始守护进程('+config.serverId+') pid('+process.pid+')...');
    new LogMgr();
    new ModuleMgr();
    new RpcMgr();
    GameSvr.regsterFun();
    OBJ('RpcMgr').run(config.serverId, GameSvr.run);
};

//用户模块注册
GameSvr.regsterFun = function(){
    //用户组件
    new RpcModule();
};

//运行
GameSvr.run = function() {
    console.log('服务已启动...');
    OBJ('ModuleMgr').run(config.runInterval);
};