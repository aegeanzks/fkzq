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
//var DataPull = require("./DataPull");
var RealFootball = require("./RealFootball");

function RealFootballModule(){
    BaseModule.call(this);
    //var dataPull = new DataPull();
    this.logic = new RealFootball();
    //一帧
    this.run = function(timestamp){
        this.logic.run(timestamp);
        //dataPull.run(timestamp);
    };
}