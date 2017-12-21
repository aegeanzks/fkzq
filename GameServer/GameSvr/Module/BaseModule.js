// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = BaseModule;

var ObjRoot = require('../../Utils/ObjRoot');
var OBJ = ObjRoot.getObj;

function BaseModule() {
    ObjRoot.call(this, this.constructor.name);
    OBJ('ModuleMgr').register(this);
    //一帧
    this.run = function (timestamp) { };

    function register(socket, id, func) {

        if (id == 'disconnect') {
            if(null != disconnectFunc)
                socket.on(id, disconnectFunc);
        } else if (id == 'ping'){
            if(null != pingFunc)
                socket.on(id, pingFunc);
        } else {
            socket.on(id, function (data, length) {
                //解析数据
                var obj = OBJ('MsgMgr').getObject(id);
                data.length = length;
                var msg = obj.deserializeBinary(Uint8Array.from(data));
                func(msg, socket);
            });
        }
    };
    this.registerFun = function(socket){
        mapMsgClass.forEach(function (value, key, map){
            register(socket, key.Type.ID, value);//登录
        });
    };

    var mapMsgClass = new Map();
    this.registerMsg = function(msgClass, func){
        mapMsgClass.set(msgClass, func);
    };

    this.registerMsgToMgr = function(){
        mapMsgClass.forEach(function (value, key, map){
            OBJ('MsgMgr').register(key.Type.ID, key);
        });
    };

    var disconnectFunc;
    this.setDisconnectFunc = function(func){
        disconnectFunc = func;
    };
    var pingFunc;
    this.setPingFunc = function(func){
        pingFunc = func;
    };
}