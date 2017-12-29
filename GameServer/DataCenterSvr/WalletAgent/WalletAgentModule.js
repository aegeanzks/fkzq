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
    this.logic = new Logic();
    //////////////////////////////////////
    //一帧
    this.run = function(timestamp){
        //console.log("CommonModule.run..."+timestamp);
    };
    this.send = function(msg){
        this.logic.send(msg);
    };
}