module.exports = DataCenterAgent;

var OBJ = require('../../../Utils/ObjRoot').getObj;

function DataCenterAgent(){
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
                }
            }break;
        }
    }

    this.send = function(msg){
        OBJ('RpcMgr').send(config.DataCenter.serverId, 'GameSvrReq', msg);
    };
}

