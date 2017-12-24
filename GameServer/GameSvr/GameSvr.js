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
var DataCenterAgentModule = require('./Module/DataCenterAgent/DataCenterAgentModule');
var LoginModule = require('./Module/Login/LoginModule');
var CommonModule = require('./Module/Common/CommonModule');

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
    new WsMgr().run(port, GameSvr.regsterFun);
    new RpcMgr().run(serverId);
    //RPC组件不需要socket，所以提前初始化
    GameSvr.registerModule();
    GameSvr.run();   //30毫秒

    console.log('服务已启动...');
};

//运行
GameSvr.run = function() {
    OBJ('ModuleMgr').run(configs.gameSvrConfig().runInterval);
};

//所有用户模块注册
GameSvr.registerModule = function(){
    new DataCenterAgentModule();
    new CommonModule();
    new LoginModule();
    new PlayerModule();
}

//与客户端交互的模块这边还需要注册socket事件
GameSvr.regsterFun = function(socket){
    OBJ('CommonModule').registerFun(socket);
    OBJ('LoginModule').registerFun(socket);
    OBJ('PlayerModule').registerFun(socket);
};



