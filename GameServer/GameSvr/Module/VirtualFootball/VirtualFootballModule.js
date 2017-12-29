// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = VirtualFootballModule;

var OBJ = require('../../../Utils/ObjRoot').getObj;

var BaseModule = require("../BaseModule");
var Logic = require('./VirtualFootball');

function VirtualFootballModule(){
    BaseModule.call(this);
    var self = this;
    self.logic = new Logic();

    //注册消息
    self.registerMsg(pbSvrcli.Ask_VirtualFootMainInfo, self.logic.askVirtualFootMainInfo);  //请求虚拟足球主页面
    self.registerMsg(pbSvrcli.Ask_GuessingRecord, self.logic.askGuessingRecord);    //请求竞猜记录页面
    self.registerMsg(pbSvrcli.Ask_VirtualHistory, self.logic.askVirtualHistory);    //请求历史开奖页面
    self.registerMsg(pbSvrcli.Ask_VirtualBet, self.logic.askVirtualBet);            //请求虚拟下注
    //一帧
    this.run = function(timestamp){
        self.logic.run(timestamp);
    };
    ///////////////////////////////////
    self.registerMsgToMgr();
}