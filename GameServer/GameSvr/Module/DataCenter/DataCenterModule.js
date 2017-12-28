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
    var self = this;
    self.logic = new Logic();
    //////////////////////////////////////
    //一帧
    this.run = function(timestamp){
        self.logic.run(timestamp);
    };

    this.send = function(msg){
        self.logic.send(msg);
    };
}