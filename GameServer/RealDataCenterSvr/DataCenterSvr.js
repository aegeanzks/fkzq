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
var DbMgr = require('../Utils/Manager/DbMgr');
var LogMgr = require('../Utils/Manager/LogMgr');
var HttpClientMgr = require('../Utils/Manager/HttpClientMgr');

var RpcModule = require('./Module/Rpc/RpcModule');
var RealFootballModule = require('./Module/RealFootball/RealFootballModule');

var configs = require("../config");
var mongoCfg = configs.mongodb();
var config = configs.realDataCenterSvrConfig();
global.SERVERID = config.serverId;

function GameSvr(){}

GameSvr.start = function () {
    //管理器初始化
    new LogMgr();
    console.log('开始启动服务('+config.serverId+') pid('+process.pid+')...');
    new ModuleMgr();
    new DbMgr().init(mongoCfg);
    new HttpClientMgr();
    new RpcMgr();
    GameSvr.regsterFun();
    OBJ('RpcMgr').run(config.serverId, GameSvr.run);
};

//用户模块注册
GameSvr.regsterFun = function(){
    //用户组件
    new RpcModule();
    new RealFootballModule();
};

//运行
GameSvr.run = function() {
    console.log('服务已启动...');
    OBJ('ModuleMgr').run(config.runInterval);
};

