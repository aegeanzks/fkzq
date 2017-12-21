// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = AgentSvr;

var OBJ = require('../Utils/ObjRoot').getObj;

var RpcMgr = require('../Utils/Manager/RpcMgr');
var ModuleMgr = require('../Utils/Manager/ModuleMgr');
var DbMgr = require('../Utils/Manager/DbMgr');
var LogMgr = require('../Utils/Manager/LogMgr');

var WalletSvrAgentModule = require('./Module/WalletSvrAgent/WalletSvrAgentModule');
var GameSvrAgentModule = require('./Module/GameSvrAgent/GameSvrAgentModule');
var GlobalModule = require('./Module/Global/GlobalModule');

var configs = require("../config");
var mongoCfg = configs.mongodb();
var config = configs.agentSvrConfig();

function AgentSvr(){}

AgentSvr.start = function () {
    //管理器初始化
    new LogMgr();
    console.log('开始启动服务('+config.serverId+')...');
    new ModuleMgr();
    new DbMgr().init(mongoCfg);
    new RpcMgr().run(config.serverId);

    AgentSvr.regsterFun();

    AgentSvr.run();
    console.log('服务已启动...');
};

//用户模块注册
AgentSvr.regsterFun = function(){
    //用户组件
    new WalletSvrAgentModule();
    new GameSvrAgentModule();
    new GlobalModule();
};

//运行
AgentSvr.run = function() {
    OBJ('ModuleMgr').run(config.runInterval);
};

