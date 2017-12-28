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
        //if(null != updateTimer && updateTimer.toNextTime()){
            if(timeAgent.updateCurEvent(timestamp)){
                console.log('当前期号：'+timeAgent.no+' 当前事件：'+timeAgent.matchState+' 该事件剩余时间：'+timeAgent.matchStateLastTime/1000);
                OBJ('GameSvrAgentModule').broadcastGameServer({
                    module:'VirtualFootball',
                    func:'refreshMatchState',
                    data:{
                        matchState:timeAgent.matchState,
                        lastTime:timeAgent.matchStateLastTime
                    }
                });
                if(timeAgent.matchState == 0) {
                    var matchBeginEndTime = timeAgent.getCurMatchStartEndTime();
                    matchAgent = new VirtualFootballMatch(conf, matchBeginEndTime[0], matchBeginEndTime[1]);
                }
                else if(timeAgent.matchState == 1) {
                    matchAgent.startMatch();
                    var strMatchEvent = 0;
                    switch(matchAgent.curEvent){
                        case 0: strMatchEvent = '无事件'; break;
                        case 1: strMatchEvent = '主队控球'; break;
                        case 4: strMatchEvent = '客队控球'; break;
                    }
                    console.log('战场事件：'+strMatchEvent+' 剩余时间：'+(matchAgent.nextEventTime-timestamp)/1000);
                }
                else if(timeAgent.matchState == 2) {
                    matchAgent.stopMatch();
                }
            }
            if(null != matchAgent){
                if(matchAgent.update(timestamp)){
                    var strMatchEvent = '';
                    switch(matchAgent.curEvent){
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
                    console.log('战场事件：'+strMatchEvent+' 剩余时间：'+(matchAgent.nextEventTime-timestamp)/1000);
                    //OBJ('GameSvrAgentModule').broadcastGameServer({type:2,value:matchAgent.getCurEvent()});
                    OBJ('GameSvrAgentModule').broadcastGameServer({
                        module:'VirtualFootball',
                        func:'refreshMatchEvent',
                        data:{
                            event:matchAgent==null?0:matchAgent.curEvent,
                            hostTeamId:matchAgent==null?0:matchAgent.hostTeam.ID,
                            hostTeamGoal:matchAgent==null?0:matchAgent.hostTeamGoal,
                            guestTeamId:matchAgent==null?0:matchAgent.guestTeam.ID,
                            guestTeamGoal:matchAgent==null?0:matchAgent.guestTeamGoal,
                            hostWinTimes:matchAgent==null?0:matchAgent.hostWinTimes,
                            hostWinSupport:matchAgent==null?0:matchAgent.hostWinSupport,
                            drawTimes:matchAgent==null?0:matchAgent.drawTimes,
                            drawSupport:matchAgent==null?0:matchAgent.drawSupport,
                            guestWinTimes:matchAgent==null?0:matchAgent.guestWinTimes,
                            guestWinSupport:matchAgent==null?0:matchAgent.guestWinSupport,
                            hostNextGoalTimes:matchAgent==null?0:matchAgent.hostNextGoalTimes,
                            hostNextGoalSupport:matchAgent==null?0:matchAgent.hostNextGoalSupport,
                            zeroGoalTimes:matchAgent==null?0:matchAgent.zeroGoalTimes,
                            zeroGoalSupport:matchAgent==null?0:matchAgent.zeroGoalSupport,
                            guestNextGoalTimes:matchAgent==null?0:matchAgent.guestNextGoalTimes,
                            guestNextGoalSupport:matchAgent==null?0:matchAgent.guestNextGoalSupport,
                        }
                    });
                }
            }
        //}
    };

    this.getCurData = function(source, data){
        OBJ('GameSvrAgentModule').send(source, {
            module:'VirtualFootball',
            func:'resCurData',
            data:{
                matchState:timeAgent.matchState,
                lastTime:timeAgent.matchStateLastTime,
                event:matchAgent==null?0:matchAgent.curEvent,
                hostTeamId:matchAgent==null?0:matchAgent.hostTeam.ID,
                hostTeamGoal:matchAgent==null?0:matchAgent.hostTeamGoal,
                guestTeamId:matchAgent==null?0:matchAgent.guestTeam.ID,
                guestTeamGoal:matchAgent==null?0:matchAgent.guestTeamGoal,
                hostWinTimes:matchAgent==null?0:matchAgent.hostWinTimes,
                hostWinSupport:matchAgent==null?0:matchAgent.hostWinSupport,
                drawTimes:matchAgent==null?0:matchAgent.drawTimes,
                drawSupport:matchAgent==null?0:matchAgent.drawSupport,
                guestWinTimes:matchAgent==null?0:matchAgent.guestWinTimes,
                guestWinSupport:matchAgent==null?0:matchAgent.guestWinSupport,
                hostNextGoalTimes:matchAgent==null?0:matchAgent.hostNextGoalTimes,
                hostNextGoalSupport:matchAgent==null?0:matchAgent.hostNextGoalSupport,
                zeroGoalTimes:matchAgent==null?0:matchAgent.zeroGoalTimes,
                zeroGoalSupport:matchAgent==null?0:matchAgent.zeroGoalSupport,
                guestNextGoalTimes:matchAgent==null?0:matchAgent.guestNextGoalTimes,
                guestNextGoalSupport:matchAgent==null?0:matchAgent.guestNextGoalSupport,
            }
        });
    };
}