// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = PlayerContainer;

var OBJ = require('../../../Utils/ObjRoot').getObj;
var Player = require('./Player');

function PlayerContainer(){
    playerMap = new Map();

    this.addPlayer = function(socket, player){
        playerMap.set(socket, player);
        Player.socket = socket;
    };

    this.findPlayer = function(socket){
        return playerMap.get(socket);
    };
}