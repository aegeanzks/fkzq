// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = DataCenter;

var configDataCenter = require('../../../config').dataCenterSvrConfig();
var SingleTimer = require('../../../Utils/SingleTimer');
var OBJ = require('../../../Utils/ObjRoot').getObj;

function DataCenter(){

    var self = this;
    var pingTimer = new SingleTimer();
    pingTimer.startup(1000);

    this.run = function(timestamp){
        //ping到数据中心
        if(null != pingTimer && pingTimer.toNextTime())
        {
            self.send({module:'GameSvrAgent', func:'gameServerPing'});
        }
    };

    //注册函数
    (function registerRpc(){
        OBJ('RpcMgr').register('DataCenterReq', rpcRoot);
    })();
    function rpcRoot(source, msg){
        switch(msg.module){
            case 'VirtualFootball':
            {
                var mod = OBJ('VirtualFootballModule');
                if(msg.func == 'resCurData'){
                    mod.logic.resCurData(source, msg.data);
                }else if(msg.func == 'refreshMatchState'){
                    mod.logic.refreshMatchState(source, msg.data);
                }else if(msg.func == 'refreshMatchEvent'){
                    mod.logic.refreshMatchEvent(source, msg.data);
                }else if(msg.func == 'refreshBetItem'){
                    mod.logic.refreshBetItem(source, msg.data);
                }else if(msg.func == 'updateMoney'){
                    mod.logic.updateMoney(source, msg.data);
                }
            }break;
            case 'RealFootball':
            {
                var mod = OBJ('RealFootballModule');
                if(msg.func == 'resCurData'){
                    mod.logic.resCurData(source, msg.data);
                }else if(msg.func == 'refreshScheduleList'){
                    mod.logic.refreshScheduleList(source, msg.data);
                }else if(msg.func == 'refreshStopBetSchedule'){
                    mod.logic.refreshSchedule(source, msg.data);
                }else if(msg.func == 'refreshSchedule'){
                    mod.logic.refreshSchedule(source,msg.data);
                }else if(msg.func == 'refreshBetItem'){
                    mod.logic.refreshBetItem(source, msg.data);
                }
            }break;
        }
    }

    this.send = function(msg){
        OBJ('RpcMgr').send(configDataCenter.serverId, 'GameSvrReq', msg);
    };
}