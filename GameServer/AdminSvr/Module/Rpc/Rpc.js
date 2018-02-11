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
//var configWallet = require('../../../config').agentSvrConfig();
var configDaemon = require('../../../config').daemonSvrConfig();
var configGameSvr = require('../../../config').gameSvrConfig();

function Rpc(){
    var self = this;
    var gamePingMap = new Map();
    var pingTimer = new SingleTimer();
    pingTimer.startup(5000);
    var firePingTimer = new SingleTimer();
    firePingTimer.startup(1000);
    var listInitFunc = [];
    this.registerInitFun = function(func){
        listInitFunc.push(func);
    };

    this.gameServerPing = function(msg){
        
        if(!gamePingMap.has(msg.source)){
            gamePingMap.set(msg.source, Date.now()+5000);
            for(var func of listInitFunc){
                func(msg.source);
            }
        }else{
            gamePingMap.set(msg.source, Date.now()+5000);
        }
    };

    this.run = function(timestamp){
        if(null != pingTimer && pingTimer.toNextTime()){
            var tmMap = new Map(gamePingMap);
            for (var value of tmMap){
                if (timestamp > value[1]){
                    gamePingMap.delete(value[0]);
                }
            }
        }
        if(null != firePingTimer && firePingTimer.toNextTime()){
            self.send(configDaemon.serverId, 'Rpc', 'gameServerPing', {
                source:SERVERID
            });
        }
    };

    this.broadcastGameServer = function(moduleName, funcName, msg){
        /*for (var value of gamePingMap){
            OBJ('RpcMgr').send(value[0], moduleName, funcName, msg);
        }*/
        var count = configGameSvr.servers.count;
        for(var i=1; i<=count; ++i){
            OBJ('RpcMgr').send('server'+i, moduleName, funcName, msg);
        }
    };

    this.sendToDataCenter = function(moduleName,funcName,msg){
        OBJ('RpcMgr').send('realDataCenter', moduleName, funcName, msg);
    }

    this.sendToVtDataCenter = function(moduleName,funcName,msg){
        OBJ('RpcMgr').send('virtualDataCenter', moduleName, funcName, msg);
    }

    this.send = function(target, moduleName, funcName, msg){
        OBJ('RpcMgr').send(target, moduleName, funcName, msg);
    };

    this.req = function(target, moduleName, funcName, msg, func){
        OBJ('RpcMgr').req(target, moduleName, funcName, msg, func);
    };

    this.getServerCount = function(){
        return gamePingMap.size;
    };

    //this.send2Wallet = function(moduleName, funcName, msg){
    //    OBJ('RpcMgr').send(configWallet.serverId, moduleName, funcName, msg);
    //};

    //this.req2Wallet = function(moduleName, funcName, msg, func){
    //    OBJ('RpcMgr').req(configWallet.serverId, moduleName, funcName, msg, func);
    //};

    function init(){
        self.send(configDaemon.serverId, 'Rpc', 'reqApplyOpen', {
            source:SERVERID, 
            pid:process.pid
        });
    }
    init();
}