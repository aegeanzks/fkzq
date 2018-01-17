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

    this.registerInitFun = function(func){
        self.logic.registerInitFun(func);
    }

    this.broadcastGameServer = function(moduleName, funcName, msg){
        self.logic.broadcastGameServer(moduleName, funcName, msg);
    };

    this.send = function(target, moduleName, funcName, msg){
        self.logic.send(target, moduleName, funcName, msg);
    };

    this.getServerCount = function(){
        return self.logic.getServerCount();
    };

    this.send2Wallet = function(moduleName, funcName, msg){
        self.logic.send2Wallet(moduleName, funcName, msg);
    };

    this.req2Wallet = function(moduleName, funcName, msg, func){
        self.logic.req2Wallet(moduleName, funcName, msg);
    }
}