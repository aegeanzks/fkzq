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
const MQ = require('mmq');
var mq;

function RpcMgr(){
    ObjRoot.call(this, this.constructor.name);
    
    this.run = function(serverId){
        var msgMap = new Map();
        //注册消息
        this.register = function(id, func){
            msgMap.set(id, func);
        };
        //获取处理函数
        getFunc = function(id){
            var func = msgMap.get(id);
            if(null == func)
                return null;
            return func;
        };
        //消息队列回调
        var func = function(param1, param2) {
            var func = getFunc(param1);
            if(func)
                func(param2);
        }
        var str='{'+serverId+':'+func+'}';
        const consumers = eval("("+str+")");
        //rpc
        const options = {
            uri: RpcConfig.RPCURL,
            consumeInterval: RpcConfig.consumeInterval,   //消费周期60毫秒
            maxConsumption: RpcConfig.maxConsumption,   //一次消费数量
            visibility: RpcConfig.visibility, //消息可见时间，一个消息超过这个时间将会丢失，秒
            errorListener: RpcConfig.errorListener,//错误处理函数
            consumers,
        };

        mq = MQ.init('mmq', options);
        mq.run();
        //test
        /*setInterval(_ => {
            mq.appendMessage({
                operation: serverId,
                params: ['gaga', 'gaga']
            });
        }, 1000);*/
    };
    this.send = function(target, msgId, msgData){
        mq.appendMessage({
            operation: target,
            params: [msgId, msgData]
        });
    };
}