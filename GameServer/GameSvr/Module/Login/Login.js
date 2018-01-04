// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
var OBJ = require('../../../Utils/ObjRoot').getObj;
var Player = require('../Player/Player');
var gamesvrConfig = require('../../../config').gameSvrConfig();

module.exports = Login;

function Login(){
    var waitMap = new Map();
    var self = this;

    this.disconnect = function(socket){
        console.log('enter disconnect!');
    };
    this.ping = function(socket){
        console.log('enter ping!');
    };

    self.login = function(askLogin, socket){
        var strIp = socket.conn.remoteAddress;
        var arr = strIp.split('.');
        var realIp = strIp.split(':')[3];
        var userid = arr[arr.length-1];
        var userName = userid;
        waitMap.set(userid, [socket, userName, Date.now()+10000, realIp]);//超时10秒
        OBJ('WalletAgentModule').send({module:'WalletSvrAgent', func:'reqGetCoin', data:{
            userid:userid, 
            cbModule:'Login',
            cbFunc:'resGetCoin'
        }});
        //self.resGetCoin({'userid':userid, 'coin':100000});
        console.log('用户:' + userid + ' 登录成功!');
    };
    
    self.resGetCoin = function(source, data){
        //console.log('resGetCoin:'+data);
        var res = new pbSvrcli.Res_Login();
        var userArr = waitMap.get(data.userid);
        waitMap.delete(data.userid);
        if(userArr){
            var socket = userArr[0];
            var userName = userArr[1];
            res.setResult(data.res);
            res.setCoin(data.balance);
            //登录成功返回金币
            OBJ('WsMgr').send(socket, pbSvrcli.Res_Login.Type.ID, res.serializeBinary());
            //登录记录
            var player = new Player(data.userid, userName, data.balance, socket);
            var oldSocket = OBJ('PlayerContainer').findSocketByUserId(data.userid);
            if(oldSocket){
                OBJ('PlayerContainer').updatePlayer(oldSocket, socket, player);
            }else{
                OBJ('PlayerContainer').addPlayer(socket, player);
            }
            player.updateLoginDb(userArr[3]);

            //告诉其他游戏服，该用户在这台上线
            var servers = gamesvrConfig.servers;
            var count = servers.count;
            for(var i = 1; i<=count; i++){
                var serverId = 'server'+i;
                if(serverId == SERVERID)
                    continue;
                OBJ('RpcMgr').send(serverId, 'GameSvrReq', {module:'Login', func:'reqPlayerLogin', data:data.userid});
            }
        }
    };

    self.reqPlayerLogin = function(source, data) {
        var oldSocket = OBJ('PlayerContainer').findSocketByUserId(data);
        if(oldSocket){
            oldSocket.disconnect();
            OBJ('PlayerContainer').delete(oldSocket);
        }
    };
    
    self.run = function(timestamp){
        //console.log('login.prototype.run...'+timestamp);
        //超时删除
        var tmpArr = [];
        for(var item of waitMap.entries()){
            if(timestamp > item[1][2]){
                tmpArr.push(item[0]);
            }
        }
        for(var item of tmpArr){
            waitMap.delete(item);
        }
    };
}



