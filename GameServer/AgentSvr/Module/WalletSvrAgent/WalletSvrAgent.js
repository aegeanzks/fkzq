module.exports = WalletSvrAgent;

var OBJ = require('../../../Utils/ObjRoot').getObj;
var pbWallet = require('../../../Msg/MsgFile/wallet_pb');
var SingleTimer = require('../../../Utils/SingleTimer');
var UtilFun = require('../../../Utils/Functions');
var WebSocketClient = require('websocket').client;
var config = require('../../../config').agentSvrConfig();

function WalletSvrAgent() {
    var self = this;
    self.isNeedRebate = 0;      //0没有返点，1有返点

    var uniqueId = 0;
    function getUniqueId() {
        if (uniqueId >= 10000)
            uniqueId = 0;
        return Math.floor(Date.now() % 100000) * 10000 + uniqueId++;
    }
    
    var client = new WebSocketClient();
    var conn = null;
    var errRes = null;
    client.on('connectFailed', function (err) {
        console.error('钱包连接失败...');
        setTimeout(function () {
            client.connect(config.wsUrl, [], config.origin);
        }, 500);
    });
    client.on('connect', function (connection) {
        console.info(Date.now() + '连上钱包...');
        conn = connection;
        connection.on('error', function (error) {
            OBJ('LogMgr').error(error);
            errRes.rsp({
                res: -2018,         //代表钱包断开连接
            });
        });
        connection.on('close', function () {
            console.error('钱包断开连接...');
            conn = null;
            setTimeout(function () {
                client.connect(config.wsUrl, [], config.origin);
            }, 500);
        });
        connection.on('message', function (message) {
            var data = new Buffer(message.binaryData);
            var msgType = data.readInt8(0);

            if (msgType == 2) {
                var requistId = data.readUInt32BE(1);
                var cbFunc = cbMap.get(requistId);
                cbMap.delete(requistId);
                if (cbFunc) {
                    var cbData = new Buffer(data.length - 5);
                    data.copy(cbData, 0, 5);
                    cbFunc.func(new Uint8Array(cbData));
                }
            }
        });
    });

    var cbMap = new Map();
    function req(funcId, data, func) {
        var cbId = 0;
        if (func) {
            cbId = getUniqueId();
            cbMap.set(cbId, { 'func': func, 'overdueTime': Date.now() + 10000 });
        }
        try {
            var reqBuf = new Buffer(data.serializeBinary());
            var buf = new Buffer(9 + reqBuf.byteLength);
            buf.writeInt8(1, 0);
            buf.writeUInt32BE(cbId, 1);
            buf.writeUInt32BE(funcId, 5);
            reqBuf.copy(buf, 9);
            conn.send(buf);
        } catch (err) {
            OBJ('LogMgr').error(err);
        }
    }
    //获取用户金额
    this.reqGetCoin = function (msg, response) {
        console.log('reqGetCoin:'+msg.userid);
        var rgc = new pbWallet.GetUserBalance();
        rgc.setUserId(msg.userid);
        if (!conn || !conn.connected) {
            response.rsp({
                userid: msg.userid,
                res: -2018,         //代表钱包断开连接
                msg: '',
                balance: 0
            });
        } else {
            errRes = response;
            req(2010002, rgc, function (data) {
                console.log('resGetCoin'+msg.userid);
                try {
                    var res = pbWallet.RspGetUserBalance.deserializeBinary(data);

                    response.rsp({
                        userid: msg.userid,
                        res: res.getRet(),
                        msg: res.getMsg(),
                        balance: res.getBalance()
                    });

                } catch (error) {
                    console.log(error);
                }
            });
        }
    };

    //投注
    this.reqBet = function (data, response) {
        console.log('reqBet:'+data.userid);
        var rb = new pbWallet.AddTrade();
        rb.setOutTradeNo(data.uuid);
        rb.setType(2);
        rb.setOutType(data.outType);
        rb.setUserId(data.userid);
        rb.setMoney(data.betCoin);
        rb.setGameId(1);
        rb.setIsNeedRebate(self.isNeedRebate);
        rb.setPlatformId(51);
        if (!conn || !conn.connected) {
            response.rsp({
                uuid: data.uuid,
                res: -2018,         //代表钱包断开连接
                msg: '',
                trade_no: '',
                balance: 0,
                betCoin: data.betCoin
            });
        } else {
            errRes = response;
            req(2010001, rb, function (msg) {
                console.log('resBet'+data.userid);
                try {
                    var res = pbWallet.RspAddTrade.deserializeBinary(msg);

                    response.rsp({
                        uuid: data.uuid,
                        res: res.getRet(),
                        msg: res.getMsg(),
                        trade_no: res.getTradeNo(),
                        balance: res.getBalance(),
                        betCoin: data.betCoin,
                    });

                } catch (error) {
                    console.log(error);
                }
            });
        }
    };

    //投注奖励(结算)
    this.reqAddMoney = function (data, response) {
        console.log('reqAddMoney:'+data.userid);
        var rb = new pbWallet.AddTrade();
        rb.setOutTradeNo(data.uuid);
        rb.setType(1);
        rb.setOutType(data.outType);
        rb.setUserId(data.userid);
        rb.setMoney(data.betCoin);
        rb.setGameId(1);
        rb.setIsNeedRebate(0);
        rb.setPlatformId(51);
        if (!conn || !conn.connected) {
            response.rsp({
                uuid: data.uuid,
                res: -2018,         //代表钱包断开连接
                msg: '',
                trade_no: '',
                balance: 0,
                addCoin: data.addCoin
            });
        } else {
            errRes = response;
            req(2010001, rb, function (msg) {
                console.log('resAddMoney:'+data.userid);
                try {
                    var res = pbWallet.RspAddTrade.deserializeBinary(msg);

                    response.rsp({
                        uuid: data.uuid,
                        res: res.getRet(),
                        msg: res.getMsg(),
                        trade_no: res.getTradeNo(),
                        balance: res.getBalance(),
                        addCoin: data.addCoin
                    });

                } catch (error) {
                    console.log(error);
                }
            });
        }
    };

    this.run = function (timestamp) {

    };

    client.connect(config.wsUrl, [], config.origin);
}