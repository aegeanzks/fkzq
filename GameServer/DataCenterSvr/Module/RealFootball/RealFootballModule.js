// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = RealFootballModule;

var OBJ = require('../../../Utils/ObjRoot').getObj;
var BaseModule = require("../BaseModule");
var DataPull = require("./DataPull");

function RealFootballModule(){
    BaseModule.call(this);
    var dataPull = new DataPull();
    //一帧
    this.run = function(timestamp){
        dataPull.run(timestamp);
    };
}