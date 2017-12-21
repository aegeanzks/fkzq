// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = LoginModule;

var OBJ = require('../../../Utils/ObjRoot').getObj;

var BaseModule = require("../BaseModule");
var Logic = require('./Login');

function LoginModule(){
    BaseModule.call(this);
    var self = this;
    self.logic = new Logic();
    //一帧
    self.run = function(timestamp){
        self.logic.run(timestamp);
    };
    //特殊处理的两个消息
    self.setDisconnectFunc(self.logic.disconnect);
    self.setPingFunc(self.logic.ping);

    //注册消息
    self.registerMsg(pbSvrcli.Ask_Login, self.logic.login);  //登录
    
    self.registerMsgToMgr();
}




