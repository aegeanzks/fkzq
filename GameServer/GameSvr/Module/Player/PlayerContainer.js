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

    this.findSocketByUserId = function(userid) {
        for (var item of playerMap.entries()) {
            if(item[1].userId == userid)
                return item[0];
        }
        return null;
    };

    this.findPlayerByUserId = function(userid) {
        for (var item of playerMap.entries()) {
            if(item[1].userId == userid)
                return item[1];
        }
        return null;
    };

    this.delete = function(socket) {
        playerMap.delete(socket);
    };

    this.updatePlayer = function(oldSocket, newSocket, player) {
        oldSocket.disconnect();
        playerMap.set(newSocket, player);
        player.socket = newSocket;
    };

    this.getOnlineNum = function(){
        return playerMap.size;
    };

    this.getAllPlayer = function(){
        return playerMap;
    };

    this.getAllPlayerId = function(){
        var retArr = [];
        for(var player of playerMap.values()){
            retArr.push(player.userId);
        }
        return retArr;
    };
}