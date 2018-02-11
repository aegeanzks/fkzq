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
var configWallet = require('../../../config').agentSvrConfig();

function Rpc(){
    var gamePingMap = new Map();
    var pingTimer = new SingleTimer();
    pingTimer.startup(5000);
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
    }

    this.broadcastGameServer = function(moduleName, funcName, msg){
        for (var value of gamePingMap){
            OBJ('RpcMgr').send(value[0], moduleName, funcName, msg);
        }
    };

    this.send = function(target, moduleName, funcName, msg){
        OBJ('RpcMgr').send(target, moduleName, funcName, msg);
    };

    this.getServerCount = function(){
        return gamePingMap.size;
    };

    this.send2Wallet = function(moduleName, funcName, msg){
        OBJ('RpcMgr').send(configWallet.serverId, moduleName, funcName, msg);
    };

    this.req2Wallet = function(moduleName, funcName, msg, func){
        OBJ('RpcMgr').req(configWallet.serverId, moduleName, funcName, msg, func);
    };
}