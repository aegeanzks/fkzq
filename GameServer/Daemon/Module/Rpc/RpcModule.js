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
}