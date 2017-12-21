// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = DataCenterAgentModule;

var OBJ = require('../../../Utils/ObjRoot').getObj;

var BaseModule = require("../BaseModule");
var Logic = require('./DataCenterAgent');

function DataCenterAgentModule(){
    BaseModule.call(this);
    var self = this;
    this.logic = new Logic();
    //////////////////////////////////////
    //注册函数
    (function registerRpc(){
        OBJ('RpcMgr').register('resGetCoin', self.logic.reqGetCoin);
    })();
    //一帧
    this.run = function(timestamp){
        //console.log("CommonModule.run..."+timestamp);
    };
}