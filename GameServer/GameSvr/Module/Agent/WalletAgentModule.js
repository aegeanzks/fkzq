// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = WalletAgentModule;

var OBJ = require('../../../Utils/ObjRoot').getObj;

var BaseModule = require("../BaseModule");
var Logic = require('./WalletAgent');

function WalletAgentModule(){
    BaseModule.call(this);
    var self = this;
    this.logic = new Logic();
    //////////////////////////////////////
    //注册函数
    (function registerRpc(){
        OBJ('RpcMgr').register('resGetCoin', self.logic.resGetCoin);
    })();
    //一帧
    this.run = function(timestamp){
        //console.log("CommonModule.run..."+timestamp);
    };
}