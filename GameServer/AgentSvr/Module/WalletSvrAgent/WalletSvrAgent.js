module.exports = WalletSvrAgent;

var OBJ = require('../../../Utils/ObjRoot').getObj;
var pbWallet = require('../../../Msg/MsgFile/wallet_pb');
var WebSocket = require('ws');
var SingleTimer = require('../../../Utils/SingleTimer');
var UtilFun = require('../../../Utils/Functions');

function WalletSvrAgent(){
    var self = this;
    //ws连接
    var connWalletTimer = new SingleTimer();
    //self.ws = new WebSocket.Client("ws://120.78.166.241:4181?platform_id=20");
    try {
        self.ws = new WebSocket("ws://120.78.166.241:4181?platform_id=20", [], {
            origin:'http://120.78.166.241:4181/'
        });
    } catch (error) {
        console.error('连接钱包失败...');
    }
    self.ws.binaryType = "arraybuffer";
    self.ws.onerror = function(evt) {  
        console.log(evt);
        connWalletTimer.startup(2000);
    };
    self.ws.onopen = function() {
        connWalletTimer.clear();
    
        self.ws.onmessage = function(evt) {
            
            var data = new Buffer(evt.data);
            var msgType = data.readInt8(0);

            if(msgType == 2){
                var requistId = data.readUInt32BE(4);
                var cbFunc = cbMap.get(requistId);
                if(cbFunc){
                    var cbData = new Buffer(data.length - 8);
                    data.copy(cbData, 8);
                    cbFunc.func(cbData);
                }
            }
        };  
        self.ws.onclose = function(evt) {  
            console.log("WebSocket关闭...");
            console.error('连接钱包失败...');
            connWalletTimer.startup(2000);
        };  
    };  
    
    var cbMap = new Map();
    function req(funcId, data, func){
        var cbId = 0;
        if(func){
            cbId = OBJ('GlobalModule').getUniqueId();
            cbMap.set(cbId, {'func':func, 'overdueTime':Date.now()+10000});
        }

        var reqBuf = new Buffer(data.serializeBinary());
        var buf=new Buffer(9+reqBuf.byteLength);
        buf.writeInt8(1, 0);
        buf.writeUInt32BE(604440000, 1);
        buf.writeUInt32BE(funcId,5);
        reqBuf.copy(buf, 9);
        self.ws.send(buf);
    }
    //获取用户金额
    this.reqGetCoin = function(source, userid){
        var rgc = new pbWallet.GetUserBalance();
        rgc.setUserId(userid);
        req(2010002, rgc, function(data){
            var res = pbWallet.RspGetUserBalance.deserializeBinary(data);
            OBJ('RpcMgr').send(source, 'resGetCoin', res);
        });
    };

    this.run = function(timestamp){
        if(null != connWalletTimer && connWalletTimer.toNextTime()){
            try {
                self.ws = null;
                self.ws = new WebSocket("ws://120.78.166.241:4181?platform_id=20", [], {
                    origin:'http://120.78.166.241:4181/'
                });
            } catch (error) {
                console.error('连接钱包失败...');
            }
        }
    };
}