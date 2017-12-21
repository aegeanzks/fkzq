// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = WalletModule;

var OBJ = require('../../../Utils/ObjRoot').getObj;
var BaseModule = require('../BaseModule');
var Logic = require('./WalletSvrAgent');

function WalletModule(){
    BaseModule.call(this);
    var self = this;
    self.logic = new Logic();
    //一帧
    this.run = function(timestamp){
        self.logic.run(timestamp);
    };
    //注册函数
    (function registerRpc(){
        OBJ('RpcMgr').register('reqGetCoin', self.logic.reqGetCoin);
    })();
}