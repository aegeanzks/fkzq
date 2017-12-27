// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = WalletAgent;
var OBJ = require('../../../Utils/ObjRoot').getObj;

function WalletAgent(){

    this.reqGetCoin = function(userid){
        OBJ('RpcMgr').send('agent', 'reqGetCoin', userid);
    };
    this.resGetCoin = function(source, res){
        OBJ('LoginModule').logic.resGetCoin(source, res);
    };
}