// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
var OBJ = require('../../../Utils/ObjRoot').getObj;
var Player = require('../Player/Player');

module.exports = Login;

function Login(){
    var waitMap = new Map();
    var self = this;

    this.disconnect = function(socket){
        console.log('enter disconnect!');
    }
    this.ping = function(socket){
        console.log('enter ping!');
    }

    self.login = function(askLogin, socket){
        var userid = 1;
        var userName = '用户1';
        waitMap.set(userid, [socket, userName]);
        OBJ('WalletAgentModule').logic.reqGetCoin(userid);
        //self.resGetCoin({'userid':userid, 'coin':100000});
        console.log('用户:' + userid + ' 登录成功!');
    };
    
    self.resGetCoin = function(source, data){
        //console.log('resGetCoin:'+data);
        var userArr = waitMap.get(data.userid);
        if(userArr){
            var socket = userArr[0];
            var userName = userArr[1];
            var res = new pbSvrcli.Res_Login();
            res.setResult(data.res === 'ok'? 0:1);
            res.setCoin(data.balance);
            //登录成功返回金币
            OBJ('WsMgr').send(socket, pbSvrcli.Res_Login.Type.ID, res.serializeBinary());
            //登录记录
            var player = new Player(data.userid, userName, data.balance, socket);
            player.updateLoginDb();
            OBJ('PlayerContainer').addPlayer(socket, player);
        }
    };
    
    self.run = function(timestamp){
        //console.log('login.prototype.run...'+timestamp);
    };
}



