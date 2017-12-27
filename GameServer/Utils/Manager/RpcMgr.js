// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = RpcMgr;

var ObjRoot = require('../../Utils/ObjRoot');
var OBJ = ObjRoot.getObj;

var RpcConfig = require('../../config').rpc();

function RpcMgr(){
    ObjRoot.call(this, this.constructor.name);
    var amqp = require('amqplib/callback_api');
    var rpcCh;
    var thisServerId;

    //注册消息
    var msgMap = new Map();
    this.register = function(id, func){
        msgMap.set(id, func);
    };

    this.run = function(serverId){
        
        thisServerId = serverId;
        amqp.connect(RpcConfig.RPCURL, function (err, conn) {
            conn.createChannel(function (err, ch) {
                rpcCh = ch;
                ch.assertQueue(serverId, { durable: false });
                ch.consume(serverId, function(msg) {
                    var json = JSON.parse(msg.content);
                    var func = msgMap.get(json['msgId']);
                    if(func)
                        func(json['source'], json['msgData']);
                }, {noAck: true});
                console.log('rpc已连接...');
            });
            //setTimeout(function () { conn.close(); process.exit(0) }, 500);
        });
    };
    this.send = function(target, msgId, msgData){
        var json = {'source':thisServerId, 'msgId':msgId, 'msgData':msgData};
        rpcCh.sendToQueue(target, new Buffer(JSON.stringify(json)));
    };
}