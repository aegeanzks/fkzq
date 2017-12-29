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

var RealFootballModule = require('./Module/RealFootball/RealFootballModule');
var VirtualFootballModule = require('./Module/VirtualFootball/VirtualFootballModule');
var GameSvrAgentModule = require('./Module/GameSvrAgent/GameSvrAgentModule');

var configs = require("../config");
var mongoCfg = configs.mongodb();
var config = configs.dataCenterSvrConfig();

function GameSvr(){}

GameSvr.start = function () {
    //管理器初始化
    new LogMgr();
    console.log('开始启动服务('+config.serverId+')...');
    new ModuleMgr();
    new DbMgr().init(mongoCfg);
    new HttpClientMgr();
    new RpcMgr().run(config.serverId, GameSvr.run);
};

//用户模块注册
GameSvr.regsterFun = function(){
    //用户组件
    //new RealFootballModule();
    new GameSvrAgentModule();
    new VirtualFootballModule();
    new WalletAgentModule();
};

//运行
GameSvr.run = function() {
    console.log('服务已启动...');
    GameSvr.regsterFun();
    OBJ('ModuleMgr').run(config.runInterval);
};

