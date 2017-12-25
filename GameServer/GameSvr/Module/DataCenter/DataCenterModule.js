// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = DataCenterModule;

var OBJ = require('../../../Utils/ObjRoot').getObj;

var BaseModule = require("../BaseModule");
var Logic = require('./DataCenter');

function DataCenterModule(){
    BaseModule.call(this);
    var logic = new Logic();
    //////////////////////////////////////
    //注册函数
    (function registerRpc(){
        OBJ('RpcMgr').register('gaga', logic.func);
    })();
    //一帧
    this.run = function(timestamp){
        //console.log("CommonModule.run..."+timestamp);
    };
}