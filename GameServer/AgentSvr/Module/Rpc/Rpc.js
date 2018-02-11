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
var configDaemon = require('../../../config').daemonSvrConfig();

function Rpc(){
    var self = this;
    var pingTimer = new SingleTimer();
    pingTimer.startup(1000);

    this.run = function(timestamp){
        if(null != pingTimer && pingTimer.toNextTime()){
            self.send(configDaemon.serverId, 'Rpc', 'gameServerPing', {
                source:SERVERID
            });
        }
    };

    this.send = function(target, moduleName, funcName, msg){
        OBJ('RpcMgr').send(target, moduleName, funcName, msg);
    };

    this.req = function(target, moduleName, funcName, msg, func){
        OBJ('RpcMgr').req(target, moduleName, funcName, msg, func);
    };

    function init(){
        self.send(configDaemon.serverId, 'Rpc', 'reqApplyOpen', {
            source:SERVERID, 
            pid:process.pid
        });
    }
    init();
}