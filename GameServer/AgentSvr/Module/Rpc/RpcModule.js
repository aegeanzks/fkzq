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

    this.send = function(target, moduleName, funcName, msg){
        self.logic.send(target, moduleName, funcName, msg);
    };

    this.req = function(target, moduleName, funcName, msg, func){
        self.logic.req(target, moduleName, funcName, msg, func);
    };
}