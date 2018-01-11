// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = GameSvr;

var OBJ = require('../Utils/ObjRoot').getObj;

var MsgMgr = require('../Utils/Manager/MsgMgr');
var RpcMgr = require('../Utils/Manager/RpcMgr');
var WsMgr = require('../Utils/Manager/WsMgr');
var ModuleMgr = require('../Utils/Manager/ModuleMgr');
var DbMgr = require('../Utils/Manager/DbMgr');
var LogMgr = require('../Utils/Manager/LogMgr');

var PlayerModule = require('./Module/Player/PlayerModule');
var WalletAgentModule = require('./Module/WalletAgent/WalletAgentModule');
var LoginModule = require('./Module/Login/LoginModule');
var CommonModule = require('./Module/Common/CommonModule');
var DataCenterModule = require('./Module/DataCenter/DataCenterModule');
var VirtualFootModule = require('./Module/VirtualFootball/VirtualFootballModule');
var RealFootModule = require('./Module/RealFootball/RealFootballModule');

var configs = require("../config");
var mongoCfg = configs.mongodb();

global.pbSvrcli = require('../Msg/MsgFile/msg.svrcli_pb');

function GameSvr(){}

GameSvr.start = function (serverId, ip, port) {
    //管理器初始化
    new LogMgr();
    console.log('开始启动服务('+serverId+')...');
    console.log('ip:' + ip + ' 监听端口:'+port);
    new MsgMgr();
    new ModuleMgr();
    new DbMgr().init(mongoCfg);
    new RpcMgr().run(serverId, function(){
        //RPC组件不需要socket，所以提前初始化
        console.log('服务已启动...');
        GameSvr.registerModule();
        new WsMgr().run(port, GameSvr.regsterFun);
        GameSvr.run();
    });
};

//运行
GameSvr.run = function() {
    OBJ('ModuleMgr').run(configs.gameSvrConfig().runInterval);
};

//所有用户模块注册
GameSvr.registerModule = function(){
    new WalletAgentModule();
    new CommonModule();
    new LoginModule();
    new PlayerModule();
    new DataCenterModule();
    new VirtualFootModule();
    new RealFootModule();
}

//与客户端交互的模块这边还需要注册socket事件
GameSvr.regsterFun = function(socket){
    OBJ('CommonModule').registerFun(socket);
    OBJ('LoginModule').registerFun(socket);
    OBJ('PlayerModule').registerFun(socket);
    OBJ('VirtualFootballModule').registerFun(socket);
};



