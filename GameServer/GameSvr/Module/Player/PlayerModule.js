// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = PlayerModule;

var OBJ = require('../../../Utils/ObjRoot').getObj;

var BaseModule = require("../BaseModule");
var Logic = require('./Player');
var PlayerContainer = require('./PlayerContainer');

function PlayerModule(){
    BaseModule.call(this);
    var self = this;
    self.logic = new Logic();
    var playerContainer = new PlayerContainer();
    //一帧
    this.run = function(timestamp){
        self.logic.run(timestamp);
    };
    ///////////////////////////////////
}

