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
var RpcModule = require('./Module/Rpc/RpcModule');

var configs = require("../config");
var mongoCfg = configs.mongodb();
var config = configs.agentSvrConfig();
global.SERVERID = config.serverId;

function AgentSvr(){}

AgentSvr.start = function () {
    //管理器初始化
    console.log('开始启动服务('+config.serverId+') pid('+process.pid+')...');
    new LogMgr();
    new ModuleMgr();
    new DbMgr().init(mongoCfg);
    new RpcMgr();
    AgentSvr.regsterFun();
    OBJ('RpcMgr').run(config.serverId, AgentSvr.run);
};

//用户模块注册
AgentSvr.regsterFun = function(){
    //用户组件
    new WalletSvrAgentModule();
    new RpcModule();
};

//运行
AgentSvr.run = function() {
    console.log('服务已启动...');
    OBJ('ModuleMgr').run(config.runInterval);
};

