// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = WalletAgent;
var OBJ = require('../../../Utils/ObjRoot').getObj;
var configWallet = require('../../../config').agentSvrConfig();

function WalletAgent(){
    //注册函数
    (function registerRpc(){
        OBJ('RpcMgr').register('WalletSvrReq', rpcRoot);
    })();

    function rpcRoot(source, msg){
        switch(msg.module){
            case 'Login':
            {
                var mod = OBJ('LoginModule');
                if(msg.func == 'resGetCoin'){
                    mod.logic.resGetCoin(source, msg.data);
                }
            }break;
            case 'VirtualFootball':
            {
                var mod = OBJ('VirtualFootballModule');
                if (msg.func == 'resVirtualBet'){
                    mod.logic.resVirtualBet(source, msg.data);
                } else if(msg.func == 'resGetSettlementCoin'){
                    mod.logic.resGetSettlementCoin(source, msg.data);
                } else if(msg.func == 'resUpdateMoney'){
                    mod.logic.resUpdateMoney(source, msg.data);
                }
            }break;
            case 'RealFootBall':
            {
                var mod = OBJ('RealFootballModule');
                if (msg.func == 'resRealBet'){
                    mod.logic.resRealBet(source, msg.data);
                }else if(msg.func == 'resAddTrade'){
                    mod.logic.resAddTrade(source,msg.data);
                }
            }break;
        }
    }

    this.send = function(msg){
        OBJ('RpcMgr').send(configWallet.serverId, 'GameSvrReq', msg);
    };
}