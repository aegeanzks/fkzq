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
var uuid = require('node-uuid');

function RpcMgr(){
    ObjRoot.call(this, this.constructor.name);
    var amqp = require('amqplib/callback_api');
    var rpcCh;
    var thisServerId;

    this.run = function(serverId, cbfunc){
        
        thisServerId = serverId;
        amqp.connect(RpcConfig.RPCURL, function (err, conn) {
            conn.createChannel(function (err, ch) {
                rpcCh = ch;
                ch.assertQueue(serverId, { durable: false });
                ch.consume(serverId, function(msg) {
                    var json = JSON.parse(msg.content);
                    var type = json['msgData'].type;
                    var msg = json['msgData'].msgData;
                    if(0 == type){
                        var moduleName = json['msgData'].moduleName;
                        var moduleObj = OBJ(moduleName);
                        if(null != moduleObj){
                            var func = json['msgData'].funcName;
                            if(moduleObj.hasOwnProperty(func)){
                                var strExe = 'moduleObj.'+func+'(json[\'source\'], msg)';
                                eval(strExe);
                            }
                        }
                    }else if(1 == type){
                        var id = json['msgData'].id;
                        var moduleName = json['msgData'].moduleName;
                        var moduleObj = OBJ(moduleName);
                        if(null != moduleObj){
                            var func = json['msgData'].funcName;
                            if(moduleObj.hasOwnProperty(func)){
                                var strExe = 'moduleObj.'+func+'(json[\'source\'], msg, new Response(json[\'source\'], id))';
                                eval(strExe);
                            } 
                        }
                    }else{
                        var id = json['msgData'].id;
                        var func = reqMap.get(id);
                        if(func)
                            func(msg);
                    }
                }, {noAck: true});
                console.log('rpc已连接...');
                cbfunc();
            });
        });
    };
    this.send = function(target, moduleName, funcName, msgData){
        var json = {'source':thisServerId, 'msgData':{
            type:0,
            moduleName:moduleName,
            funcName:funcName,
            msgData:msgData
        }};
        rpcCh.sendToQueue(target, new Buffer(JSON.stringify(json)));
    };
    var reqMap = new Map();
    this.req = function(target, moduleName, funcName, msgData, func){
        var id = uuid.v4();
        var json = {'source':thisServerId, 'msgData':{
            type:1,
            moduleName:moduleName,
            funcName:funcName,
            id:id,
            msgData:msgData
        }};
        reqMap.set(id, func);
        rpcCh.sendToQueue(target, new Buffer(JSON.stringify(json)));
    };
    function Response(source, id){
        var target = source;
        var id = id;
        this.rsp = function(msgData){
            var json = {'source':thisServerId, 'msgData':{
                type:2,
                id:id,
                msgData:msgData
            }};
            rpcCh.sendToQueue(target, new Buffer(JSON.stringify(json)));
        };
    }
}