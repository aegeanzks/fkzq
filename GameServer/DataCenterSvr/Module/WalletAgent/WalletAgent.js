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
            case 'VirtualFootball':
            {
                var mod = OBJ('VirtualFootballModule');
                if (msg.func == 'resAddTrade'){
                    mod.logic.resAddTrade(source, msg.data);
                }
            }break;
        }
    }

    this.send = function(msg){
        OBJ('RpcMgr').send(configWallet.serverId, 'DataCenterReq', msg);
    };
}