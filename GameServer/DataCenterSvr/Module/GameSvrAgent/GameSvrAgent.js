// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = GameSvrAgent;
var SingleTimer = require('../../../Utils/SingleTimer');
var OBJ = require('../../../Utils/ObjRoot').getObj;

function GameSvrAgent(){
    var gamePingMap = new Map();
    var pingTimer = new SingleTimer();
    pingTimer.startup(5000);

    //注册函数
    (function registerRpc(){
        OBJ('RpcMgr').register('GameSvrReq', rpcRoot);
    })();
    function rpcRoot(source, msg){
        switch(msg.module){
            case 'GameSvrAgent':
            {
                var mod = OBJ('GameSvrAgentModule');
                if(msg.func == 'gameServerPing'){
                    mod.logic.gameServerPing(source, msg.data);
                }
            }break;
            case 'VirtualFootball':
            {
                var mod = OBJ('VirtualFootballModule');
                if(msg.func == 'getCurData'){
                    mod.logic.getCurData(source, msg.data);
                } else if(msg.func == 'canSettlement'){
                    mod.logic.canSettlement(source, msg.data);
                } else if(msg.func == 'supportArea'){
                    mod.logic.supportArea(source, msg.data);
                }
            }break;
        }
    }

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

    this.gameServerPing = function(source, msg){
        if(!gamePingMap.has(source)){
            OBJ('VirtualFootballModule').logic.getCurData(source, null);
        }
        gamePingMap.set(source, Date.now()+5000);
    };

    this.broadcastGameServer = function(msg){
        for (var value of gamePingMap){
            OBJ('RpcMgr').send(value[0], 'DataCenterReq', msg);
        }
    };

    this.send = function(target, msg){
        OBJ('RpcMgr').send(target, 'DataCenterReq', msg);
    };

    this.getServerCount = function(){
        return gamePingMap.size;
    };
}