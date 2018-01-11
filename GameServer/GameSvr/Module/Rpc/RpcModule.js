// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = RpcModule;

var BaseModule = require('../BaseModule');
var Logic = require('./Rpc');

function RpcModule(){
    BaseModule.call(this);
    var self = this;
    self.logic = new Logic();

    this.run = function(timestamp){
        self.logic.run(timestamp);
    };

    this.send2DataCenter = function(moduleName, funcName, msg){
        self.logic.send2DataCenter(moduleName, funcName, msg);
    };

    this.send2Wallet = function(moduleName, funcName, msg){
        self.logic.send2Wallet(moduleName, funcName, msg);
    };

    this.req2DataCenter = function(moduleName, funcName, msg, func){
        self.logic.req2DataCenter(moduleName, funcName, msg, func);
    };

    this.req2Wallet = function(moduleName, funcName, msg, func){
        self.logic.req2Wallet(moduleName, funcName, msg, func);
    };

    this.send = function(target, moduleName, funcName, msg){
        self.logic.send(target, moduleName, funcName, msg);
    };
}