// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
var OBJ = require('../../../Utils/ObjRoot').getObj;

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
        waitMap.set(userid, socket);
        OBJ('DataCenterAgentModule').logic.reqGetCoin(userid);
        //self.resGetCoin({'userid':userid, 'coin':100000});
        console.log(userid + ' enter login!');
    };
    
    self.resGetCoin = function(data){
        //console.log('resGetCoin:'+data);
        var socket = waitMap.get(data.userid);
        if(socket){
            var res = new pbSvrcli.Res_Login();
            res.setResult(0);
            res.setCoin(data.coin);

            OBJ('WsMgr').send(socket, pbSvrcli.Res_Login.Type.ID, res.serializeBinary());
        }
    };
    
    self.run = function(timestamp){
        //console.log('login.prototype.run...'+timestamp);
    };
}



