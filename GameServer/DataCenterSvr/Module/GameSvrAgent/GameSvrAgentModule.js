// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = GameSvrAgentModule;

var OBJ = require('../../../Utils/ObjRoot').getObj;
var BaseModule = require('../BaseModule');
var Logic = require('./GameSvrAgent');

function GameSvrAgentModule(){
    BaseModule.call(this);
    var self = this;
    this.logic = new Logic();
    
    //一帧s
    this.run = function(timestamp){
        self.logic.run(timestamp);
    };

    this.broadcastGameServer = function(msg){
        self.logic.broadcastGameServer(msg);
    };

    this.send = function(target, msg){
        self.logic.send(target, msg);
    };
}