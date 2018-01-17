// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = VirtualFootballModule;

var OBJ = require('../../../Utils/ObjRoot').getObj;
var BaseModule = require('../BaseModule');
var VirtualFootball = require('./VirtualFootball');

function VirtualFootballModule(){
    BaseModule.call(this);
    this.logic = new VirtualFootball();

    //一帧
    this.run = function(timestamp){
        this.logic.run(timestamp);
        //console.log('VirtualFootballModule...'+timestamp);
    };
}