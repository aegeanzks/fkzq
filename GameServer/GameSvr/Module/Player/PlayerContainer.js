// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = PlayerContainer;

var OBJ = require('../../../Utils/ObjRoot').getObj;
var BaseModule = require("../BaseModule");

function PlayerContainer(){
    BaseModule.call(this);
    var playerMap = new Map();

    this.addPlayer = function(socket, player){
        playerMap.set(socket, player);
        player.socket = socket;
    };

    this.findPlayer = function(socket){
        return playerMap.get(socket);
    };

    this.getOnlineNum = function(){
        return playerMap.size;
    };
}