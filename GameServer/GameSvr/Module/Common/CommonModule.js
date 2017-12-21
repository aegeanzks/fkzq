// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = CommonModule;

var OBJ = require('../../../Utils/ObjRoot').getObj;

var BaseModule = require("../BaseModule");
var Logic = require('./Common');

function CommonModule(){
    BaseModule.call(this);
    var logic = new Logic();
    //一帧
    this.run = function(timestamp){
        logic.run(timestamp);
    };

    /*//断开连接与ping特殊处理
    this.registerFun = function(socket){
        //this.register(socket, 'disconnect', logic.disconnect);
        //this.register(socket, 'ping', logic.ping);
    };*/
}