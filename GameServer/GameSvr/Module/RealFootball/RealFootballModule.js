// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = RealFootballModule;

var OBJ = require('../../../Utils/ObjRoot').getObj;

var BaseModule = require("../BaseModule");
var Logic = require('./RealFootball');

function RealFootballModule(){
    BaseModule.call(this);
    var self = this;
    self.logic = new Logic();

    /*//注册消息
    self.registerMsg(pbSvrcli.Ask_RealFootMainInfo, self.logic.askRealFootMainInfo);                        //请求竞彩足球主页面
    self.registerMsg(pbSvrcli.Ask_RealFootBetRateInfo, self.logic.askRealFootBetRateInfo);                  //请求比赛赛事投注比例
    self.registerMsg(pbSvrcli.Ask_RealFootBetInfo, self.logic.askRealFootBetInfo);                          //请求真实足球投注
    self.registerMsg(pbSvrcli.Ask_RealFootballBetRecords, self.logic.askRealFootballBetRecords);            //请求真实足球我的竞猜
    self.registerMsg(pbSvrcli.Ask_RealFootRecords, self.logic.askRealFootRecords);                          //请求真实足球比赛记录*/
    
    //一帧
    this.run = function(timestamp){
        //self.logic.run(timestamp);
    };
    ///////////////////////////////////
    self.registerMsgToMgr();
}