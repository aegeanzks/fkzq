// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = VirtualFootball;

var SingleTimer = require('../../../Utils/SingleTimer');
var VirtualFootballConf = require('./VirtualFootballConf');
var VirtualFootballTimeAgent = require('./VirtualFootballTimeAgent');
var VirtualFootballMatch = require('./VirtualFootballMatch');
var OBJ = require('../../../Utils/ObjRoot').getObj;

function VirtualFootball(){
    var conf = new VirtualFootballConf();
    var timeAgent = new VirtualFootballTimeAgent();
    var updateTimer = new SingleTimer();
    updateTimer.startup(200);

    console.log('当前期号：'+timeAgent.no+' 当前事件：'+timeAgent.matchState+' 该事件剩余时间：'+timeAgent.matchStateLastTime/1000);
    OBJ('GameSvrAgentModule').broadcastGameServer('dataCenterMsg', timeAgent.matchState);
    var matchBeginEndTime = timeAgent.getCurMatchStartEndTime();
    var matchAgent = new VirtualFootballMatch(conf, matchBeginEndTime[0], matchBeginEndTime[1]);

    this.run = function(timestamp){
        if(null != updateTimer && updateTimer.toNextTime()){
            if(timeAgent.updateCurEvent(timestamp)){
                console.log('当前期号：'+timeAgent.no+' 当前事件：'+timeAgent.matchState+' 该事件剩余时间：'+timeAgent.matchStateLastTime/1000);
                OBJ('GameSvrAgentModule').broadcastGameServer('dataCenterMsg', timeAgent.matchState);
                if(timeAgent.matchState == 0) {
                    var matchBeginEndTime = timeAgent.getCurMatchStartEndTime();
                    matchAgent = new VirtualFootballMatch(conf, matchBeginEndTime[0], matchBeginEndTime[1]);
                }
                else if(timeAgent.matchState == 1) {
                    matchAgent.startMatch();
                    var strMatchEvent = 0;
                    switch(matchAgent.getCurEvent()){
                        case 0: strMatchEvent = '无事件'; break;
                        case 1: strMatchEvent = '主队控球'; break;
                        case 4: strMatchEvent = '客队控球'; break;
                    }
                    console.log('战场事件：'+strMatchEvent+' 剩余时间：'+(matchAgent.getNextEventTime()-timestamp)/1000);
                }
                else if(timeAgent.matchState == 2) {
                    matchAgent.stopMatch();
                }
            }
            if(null != matchAgent){
                if(matchAgent.update(timestamp)){
                    var strMatchEvent = 0;
                    switch(matchAgent.getCurEvent()){
                        case 0: strMatchEvent = '无事件'; break;
                        case 1: strMatchEvent = '主队控球'; break;
                        case 2: strMatchEvent = '主队进攻'; break;
                        case 3: strMatchEvent = '主队危险进攻'; break;
                        case 4: strMatchEvent = '客队控球'; break;
                        case 5: strMatchEvent = '客队进攻'; break;
                        case 6: strMatchEvent = '客队危险进攻'; break;
                        case 7: strMatchEvent = '主队进球'; break;
                        case 8: strMatchEvent = '客队进球'; break;
                    }
                    console.log('战场事件：'+strMatchEvent+' 剩余时间：'+(matchAgent.getNextEventTime()-timestamp)/1000);
                }
            }
        }
    };
}