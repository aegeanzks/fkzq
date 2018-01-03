// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = VirtualFootballOddsAgent;

var VirtualFootballConf = require('./VirtualFootballConf');

//初始化时自动识别强弱关系
function VirtualFootballOddsAgent(teamInfo1, teamInfo2){
    //设置强弱队
    var strongTeam;
    var weakTeam;
    if(teamInfo1.level >= teamInfo2.level){
        strongTeam = teamInfo1;
        weakTeam = teamInfo2;
    } else {
        strongTeam = teamInfo2;
        weakTeam = teamInfo1;
    }

    var oddsChangeBaseValue = VirtualFootballConf.getOddsChangeBaseValue();
}