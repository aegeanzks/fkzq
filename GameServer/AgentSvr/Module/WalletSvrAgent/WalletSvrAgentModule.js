// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = WalletSvrAgentModule;

var OBJ = require('../../../Utils/ObjRoot').getObj;
var BaseModule = require('../BaseModule');
var Logic = require('./WalletSvrAgent');

function WalletSvrAgentModule(){
    BaseModule.call(this);
    var self = this;
    self.logic = new Logic();
    //一帧
    this.run = function(timestamp){
        self.logic.run(timestamp);
    };
}