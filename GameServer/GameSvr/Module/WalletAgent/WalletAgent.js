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
        }
    }

    this.send = function(msg){
        OBJ('RpcMgr').send(configWallet.serverId, 'GameSvrReq', msg);
    };
}