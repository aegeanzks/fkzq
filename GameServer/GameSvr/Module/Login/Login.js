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
var UserSchema = require('../../../db_structure').User();

module.exports = Login;

function Login(){
    var waitMap = new Map();
    var self = this;
    var class_Users = OBJ('DbMgr').getStatement(UserSchema);

    this.disconnect = function(socket){
        var player = OBJ('PlayerContainer').findPlayer(socket);
        if(player)
            console.log('用户:' + player.userId + ' 用户名称:' + player.userName + ' 离开游戏!');
        OBJ('PlayerContainer').delete(socket);
    };
    this.ping = function(socket){
        console.log('enter ping!');
    };

    self.login = function(askLogin, socket){
        var headers = socket.conn.request.headers;
        var userid = headers['user-id'];
        var userName = headers['username'];
        if(null == userid)
            userid = 1;
        if(null == userName)
            userName = '1';
        //判断是否是封号的状态
        var findValue = {
            'user_id':userid,
        };
        class_Users.find(findValue, function(err, data){
            if(err){
                OBJ('LogMgr').error(err);
            }else if(data.length > 0 && 1 == data[0].status){
                var res = new pbSvrcli.Res_Login();
                res.setResult(2017);
                res.setCoin(0);
                //登录成功返回金币
                OBJ('WsMgr').send(socket, pbSvrcli.Res_Login.Type.ID, res.serializeBinary());
            }else{
                OBJ('RpcModule').req2Wallet('WalletSvrAgent', 'reqGetCoin', {
                    userid:userid
                }, function(data){
                    var res = new pbSvrcli.Res_Login();
                    res.setResult(data.res);
                    res.setCoin(data.balance);
                    //登录成功返回金币
                    OBJ('WsMgr').send(socket, pbSvrcli.Res_Login.Type.ID, res.serializeBinary());
                    //登录记录
                    var player = new Player(data.userid, userName, data.balance, socket);
                    var oldSocket = OBJ('PlayerContainer').findSocketByUserId(data.userid);
                    if(oldSocket){
                        var msg = new pbSvrcli.Push_OtherLogin();
                        OBJ('WsMgr').send(oldSocket, pbSvrcli.Push_OtherLogin.Type.ID, msg);
                        OBJ('PlayerContainer').updatePlayer(oldSocket, socket, player);
                    }else{
                        OBJ('PlayerContainer').addPlayer(socket, player);
                    }
                    player.updateLoginDb(headers.ip);
        
                    //告诉其他游戏服，该用户在这台上线
                    var servers = gamesvrConfig.servers;
                    var count = servers.count;
                    for(var i = 1; i<=count; i++){
                        var serverId = 'server'+i;
                        if(serverId == SERVERID)
                            continue;
                        OBJ('RpcModule').send(serverId, 'Login', 'reqPlayerLogin', {
                            userid:userid
                        });
                    }
                    console.log('用户ID:' + userid + ' 用户名称:' + userName + ' 登陆游戏!');
                });
            }
        });
    };

    self.reqPlayerLogin = function(data) {
        var oldSocket = OBJ('PlayerContainer').findSocketByUserId(data.userid);
        if(oldSocket){
            var msg = new pbSvrcli.Push_OtherLogin();
            OBJ('WsMgr').send(oldSocket, pbSvrcli.Push_OtherLogin.Type.ID, msg);
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



