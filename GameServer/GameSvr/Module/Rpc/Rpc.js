// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = Rpc;

var OBJ = require('../../../Utils/ObjRoot').getObj;
var SingleTimer = require('../../../Utils/SingleTimer');
var configVirtualDataCenter = require('../../../config').virtualDataCenterSvrConfig();
var configRealDataCenter = require('../../../config').realDataCenterSvrConfig();
var configWallet = require('../../../config').agentSvrConfig();
var GameServerInfosSchema = require('../../../db_structure').GameServerInfos();
var configServer = require('../../../config').gameSvrConfig();

function Rpc(){
    var self = this;
    var gamePingMap = new Map();
    var pingTimer = new SingleTimer();
    pingTimer.startup(1000);
    var registerTimer = new SingleTimer();
    registerTimer.startup(5000);

    var class_GameServerInfos = OBJ('DbMgr').getStatement(GameServerInfosSchema);
    
    this.run = function(timestamp){
        //ping到数据中心
        if(null != pingTimer && pingTimer.toNextTime())
        {
            self.send2VirtualDataCenter('Rpc', 'gameServerPing', {
                source:SERVERID
            });
            self.send2RealDataCenter('Rpc', 'gameServerPing', {
                source:SERVERID
            });
        }
        //注册服务器
        if(null != registerTimer && registerTimer.toNextTime())
        {
            class_GameServerInfos.find({'server_id':SERVERID}, function(err, data){
                if(data.length == 0){
                    var model_GameServerInfos = OBJ('DbMgr').getModel(GameServerInfosSchema);
                    model_GameServerInfos.server_id = SERVERID;
                    model_GameServerInfos.ip = global.ip;
                    model_GameServerInfos.port = global.port;
                    model_GameServerInfos.online_num = OBJ('PlayerContainer').getOnlineNum();
                    model_GameServerInfos.save(function(err){
                        if(err){
                            OBJ('LogMgr').error(err);
                        }
                    });
                } else {
                    var updateVar = {update_time:Date.now(), online_num:OBJ('PlayerContainer').getOnlineNum()};
                    class_GameServerInfos.update({'server_id':SERVERID}, {$set:updateVar}, function(err){
                        if(err){
                            OBJ('LogMgr').error(err);
                        }
                    });
                }
            });
        }
    };

    this.send2VirtualDataCenter = function(moduleName, funcName, msg){
        OBJ('RpcMgr').send(configVirtualDataCenter.serverId, moduleName, funcName, msg);
    };

    this.send2RealDataCenter = function(moduleName, funcName, msg){
        OBJ('RpcMgr').send(configRealDataCenter.serverId, moduleName, funcName, msg);
    };

    this.send2Wallet = function(moduleName, funcName, msg){
        OBJ('RpcMgr').send(configWallet.serverId, moduleName, funcName, msg);
    };

    this.req2VirtualDataCenter = function(moduleName, funcName, msg, func){
        OBJ('RpcMgr').req(configVirtualDataCenter.serverId, moduleName, funcName, msg, func);
    };

    this.req2RealDataCenter = function(moduleName, funcName, msg, func){
        OBJ('RpcMgr').req(configRealDataCenter.serverId, moduleName, funcName, msg, func);
    };

    this.req2Wallet = function(moduleName, funcName, msg, func){
        OBJ('RpcMgr').req(configWallet.serverId, moduleName, funcName, msg, func);
    };

    this.send = function(target, moduleName, funcName, msg){
        OBJ('RpcMgr').send(target, moduleName, funcName, msg);
    };

    this.broadcastOtherGameServer = function(moduleName, funcName, msg){
        var count = configServer.servers.count;
        for(var i=1; i<=count; i++){
            var curServerId = 'server'+i;
            if(SERVERID == curServerId)
                continue;
            this.send(curServerId, moduleName, funcName, msg);
        }
    };
}