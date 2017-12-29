// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = DataCenterModule;

var OBJ = require('../../../Utils/ObjRoot').getObj;
var BaseModule = require('../BaseModule');
var Logic = require('./DataCenterAgent');

function GameModule(){
    BaseModule.call(this);
    this.logic = new Logic();
    //一帧
    this.run = function(timestamp){
        //console.log('GameModule...'+timestamp);
    };
}