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
    var betItemUpdateTimer = new SingleTimer();
    betItemUpdateTimer.startup(60000);

    var betItem1 = 0;
    var betItem2 = 0;
    var betItem3 = 0;
    var tmpArr = conf.getBetItem(function(v1, v2, v3){
        betItem1 = v1;
        betItem2 = v2;
        betItem3 = v3;
    });

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
                        no:timeAgent.no,
                        matchState:timeAgent.matchState,
                        lastTime:timeAgent.matchStateLastTime
                    }
                });
                if(timeAgent.matchState == 0) {
                    var matchBeginEndTime = timeAgent.getCurMatchStartEndTime();
                    matchAgent = new VirtualFootballMatch(conf, matchBeginEndTime[0], matchBeginEndTime[1]);
                    settlementCount = 0;
                }
                else if(timeAgent.matchState == 1) {
                    matchAgent.startMatch();
                    var strMatchEvent = 0;
                    switch(matchAgent.curEvent){
                        case 0: strMatchEvent = '无事件'; break;
                        case 1: strMatchEvent = '主队控球'; break;
                        case 4: strMatchEvent = '客队控球'; break;
                    }
                    console.log('战场事件1：'+strMatchEvent+' 剩余时间：'+(matchAgent.nextEventTime-timestamp)/1000);
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
                    console.log('战场事件2：'+strMatchEvent+' 剩余时间：'+(matchAgent.nextEventTime-timestamp)/1000);
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

        if(null != betItemUpdateTimer && betItemUpdateTimer.toNextTime()){
            //发送投注项数据
            OBJ('GameSvrAgentModule').send(source, {
                module:'VirtualFootball',
                func:'refreshBetItem',
                data:{
                    betItem1:betItem1,
                    betItem2:betItem2,
                    betItem3:betItem3,
                }
            });
        }
    };

    this.getCurData = function(source, data){
        OBJ('GameSvrAgentModule').send(source, {
            module:'VirtualFootball',
            func:'resCurData',
            data:{
                no:timeAgent.no,
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
        //发送投注项数据
        OBJ('GameSvrAgentModule').send(source, {
            module:'VirtualFootball',
            func:'refreshBetItem',
            data:{
                betItem1:betItem1,
                betItem2:betItem2,
                betItem3:betItem3,
            }
        });
    };

    var settlementCount = 0;    //结算回调
    this.canSettlement = function(source, data){
        settlementCount++;
        if(settlementCount > OBJ('GameSvrAgentModule').getServerCount()){
            //开始结算
            SettlementWinLose();
        }
    };
    //结算
    var settlementCount = 0;
    function SettlementWinLose(){
        var findParam = {
            'status':0,
            'no':no
        };
        classLogVirtualBet.find(findParam, function(err, data){
            if(data.length == 0)
                return;

            var winArea = 0;
            if(hostTeamGoal > guestTeamGoal)
                winArea = 1;       //主胜
            else if(hostTeamGoal == guestTeamGoal)
                winArea = 2;       //平
            else
                winArea = 3;       //客胜
            for(var item of data){
                if(data.bet_area == winArea){   //中了
                    settlementCount++;
                    
                }
            }
        });
    }
    var resCount = 0;
    this.resAddTrade = function(){
        resCount++;
        if(resCount == settlementCount)
        {
            //结算完成

        }
    };
}