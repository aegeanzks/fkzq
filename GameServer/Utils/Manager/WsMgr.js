// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = WsMgr;

var ObjRoot = require('../../Utils/ObjRoot');
var OBJ = ObjRoot.getObj;

function WsMgr(){
    ObjRoot.call(this, this.constructor.name);
    
    this.run = function(port, func){
        io = require('socket.io')(port);
        io.sockets.on('connection', function(socket){
            socket.binaryType = 'arraybuffer';
            //回调
            func(socket);
        });
    };

    this.send = function(socket, msgid, data){
        socket.emit('message', msgid, data, data.length);
    };
}