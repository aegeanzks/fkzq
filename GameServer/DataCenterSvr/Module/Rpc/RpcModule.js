// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = RpcModule;

var OBJ = require('../../../Utils/ObjRoot').getObj;
var BaseModule = require('../BaseModule');
var SingleTimer = require('../../../Utils/SingleTimer');

function RpcModule(){
    BaseModule.call(this);

    var gamePingMap = new Map();
    var pingTimer = new SingleTimer();
    pingTimer.startup(5000);

    this.run = function(timestamp){
        if(null != pingTimer && pingTimer.toNextTime()){
            var tmMap = new Map(gamePingMap);
            for (var value of tmMap){
                if (timestamp > value[1]){
                    gamePingMap.delete(value[0]);
                }
            }
        }
    };

    var listInitFunc = [];
    this.registerInitFun = function(func){
        listInitFunc.push(func);
    };

    this.gameServerPing = function(source, msg){
        
        if(!gamePingMap.has(source)){
            gamePingMap.set(source, Date.now()+5000);
            //OBJ('RealFootballModule').logic.getRealBetConf(source, null);
            //OBJ('VirtualFootballModule').logic.getCurData(source, null);
            for(var func of listInitFunc){
                func(source);
            }
        }
        
    };

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
}