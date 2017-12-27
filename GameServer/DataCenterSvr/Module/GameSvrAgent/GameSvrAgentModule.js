// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = GameSvrAgentModule;

var OBJ = require('../../../Utils/ObjRoot').getObj;
var BaseModule = require('../BaseModule');
var SingleTimer = require('../../../Utils/SingleTimer')

function GameSvrAgentModule(){
    BaseModule.call(this);
    var gamePingMap = new Map();
    var pingTimer = new SingleTimer();
    pingTimer.startup(5000);
    //注册函数
    (function registerRpc(){
        OBJ('RpcMgr').register('gameServerPing', gameServerPing);
    })();
    //一帧s
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
    
    function gameServerPing(source, res){
        gamePingMap.set(source, Date.now()+5000);
    }

    this.broadcastGameServer = function(msgId, msg){
        for (var value of gamePingMap){
            OBJ('RpcMgr').send(value[0], msgId, msg);
        }
    }
}