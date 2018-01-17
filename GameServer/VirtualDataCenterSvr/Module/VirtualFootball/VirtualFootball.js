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
var uuid = require('node-uuid');
var Schema = require('../../../db_structure');
var OBJ = require('../../../Utils/ObjRoot').getObj;

function VirtualFootball(){
    var self = this;
    var conf = new VirtualFootballConf();
    var timeAgent = new VirtualFootballTimeAgent();
    var updateTimer = new SingleTimer();
    updateTimer.startup(200);
    var betItemUpdateTimer = new SingleTimer();
    betItemUpdateTimer.startup(60000);

    var classLogVirtualBet = OBJ('DbMgr').getStatement(Schema.LogVirtualBet());
    var classVirtualSchedule = OBJ('DbMgr').getStatement(Schema.VirtualSchedule());

    var betItem1 = 0;
    var betItem2 = 0;
    var betItem3 = 0;
    var tmpArr = conf.getBetItem(function(v1, v2, v3){
        betItem1 = v1;
        betItem2 = v2;
        betItem3 = v3;
    });

    console.log('当前期号：'+timeAgent.no+' 当前事件：'+timeAgent.matchState+' 该事件剩余时间：'+timeAgent.matchStateLastTime/1000);
    var matchBeginEndTime = timeAgent.getCurMatchStartEndTime();
    var matchAgent = new VirtualFootballMatch(conf, matchBeginEndTime[0], matchBeginEndTime[1], callBackStep);

    this.run = function(timestamp){
        //时间代理更新
        timeAgentUpdate(timestamp);
        //比赛代理更新
        matchAgentUpdate(timestamp);
        //投注信息更新
        betItemUpdate(timestamp);
    };

    function callBackStep(number){
        if(1 == number){
            console.error(timeAgent.matchState);
            OBJ('RpcModule').broadcastGameServer('VirtualFootball', 'refreshMatchState', {
                no:timeAgent.no,
                matchState:timeAgent.matchState,
                stateEndTime:timeAgent.matchStateEndTime,
                hostWinNum:matchAgent.hostWinNum,
                drawNum:matchAgent.drawNum,
                guestWinNum:matchAgent.guestWinNum,
                hostTeamId:matchAgent.hostTeam.ID,
                guestTeamId:matchAgent.guestTeam.ID
            });
        }else if(2 == number){
            OBJ('RpcModule').broadcastGameServer('VirtualFootball', 'refreshMatchEvent', {
                event:matchAgent.curEvent,
                hostTeamGoal:matchAgent.hostTeamGoal,
                guestTeamGoal:matchAgent.guestTeamGoal,
                hostWinTimes:matchAgent.hostWinTimes,
                hostWinSupport:matchAgent.hostWinSupport,
                drawTimes:matchAgent.drawTimes,
                drawSupport:matchAgent.drawSupport,
                guestWinTimes:matchAgent.guestWinTimes,
                guestWinSupport:matchAgent.guestWinSupport,
                hostNextGoalTimes:matchAgent.hostNextGoalTimes,
                hostNextGoalSupport:matchAgent.hostNextGoalSupport,
                zeroGoalTimes:matchAgent.zeroGoalTimes,
                zeroGoalSupport:matchAgent.zeroGoalSupport,
                guestNextGoalTimes:matchAgent.guestNextGoalTimes,
                guestNextGoalSupport:matchAgent.guestNextGoalSupport,
            });
        }
    }

    function timeAgentUpdate(timestamp){
        if(timeAgent.updateCurEvent(timestamp)){
            if(timeAgent.matchState == 0) {
                var matchBeginEndTime = timeAgent.getCurMatchStartEndTime();
                matchAgent = new VirtualFootballMatch(conf, matchBeginEndTime[0], matchBeginEndTime[1], callBackStep);
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
                OBJ('RpcModule').broadcastGameServer('VirtualFootball', 'refreshMatchEvent', {
                    event:matchAgent.curEvent,
                    hostTeamGoal:matchAgent.hostTeamGoal,
                    guestTeamGoal:matchAgent.guestTeamGoal,
                    hostWinTimes:matchAgent.hostWinTimes,
                    hostWinSupport:matchAgent.hostWinSupport,
                    drawTimes:matchAgent.drawTimes,
                    drawSupport:matchAgent.drawSupport,
                    guestWinTimes:matchAgent.guestWinTimes,
                    guestWinSupport:matchAgent.guestWinSupport,
                    hostNextGoalTimes:matchAgent.hostNextGoalTimes,
                    hostNextGoalSupport:matchAgent.hostNextGoalSupport,
                    zeroGoalTimes:matchAgent.zeroGoalTimes,
                    zeroGoalSupport:matchAgent.zeroGoalSupport,
                    guestNextGoalTimes:matchAgent.guestNextGoalTimes,
                    guestNextGoalSupport:matchAgent.guestNextGoalSupport,
                });
            }
            else if(timeAgent.matchState == 2) {
                matchAgent.stopMatch();
            }else{  //3的情况，生成比赛记录
                //当所有记录都被结算以后，就可以生成游戏记录了
                findParam = {
                    'balance_schedule_id':timeAgent.no
                };
                classLogVirtualBet.find(findParam, function(err, data2){
                    if(err){
                        console.log(err);
                        return false;
                    }
                    var all_bet = 0;
                    var distribution = 0;
                    for(var item of data2){
                        all_bet += item.bet_coin;
                        distribution += item.distribute_coin;
                    }
                    var insertValue = {
                        'date':timeAgent.no.substr(0, timeAgent.no.length-3),
                        'date_num':timeAgent.no,
                        'host':matchAgent.hostTeam.Team,
                        'host_team_id':matchAgent.hostTeam.ID,
                        'host_team_goal':matchAgent.hostTeamGoal,
                        'guest':matchAgent.guestTeam.Team,
                        'guest_team_id':matchAgent.guestTeam.ID,
                        'guest_team_goal':matchAgent.guestTeamGoal,
                        'score':matchAgent.hostTeamGoal+':'+matchAgent.guestTeamGoal,
                        'all_bet':all_bet,
                        'distribution':distribution
                    };
                    classVirtualSchedule.collection.insert(insertValue, function(err){
                        if(err){
                            console.log(err);
                            return false;
                        }
                    });
                });
            }
            console.log('当前期号：'+timeAgent.no+' 当前事件：'+timeAgent.matchState+' 该事件剩余时间：'+timeAgent.matchStateLastTime/1000);
            if(timeAgent.matchState != 0){
                console.error(timeAgent.matchState);
                OBJ('RpcModule').broadcastGameServer('VirtualFootball', 'refreshMatchState', {
                    no:timeAgent.no,
                    matchState:timeAgent.matchState,
                    stateEndTime:timeAgent.matchStateEndTime,
                    hostWinNum:matchAgent.hostWinNum,
                    drawNum:matchAgent.drawNum,
                    guestWinNum:matchAgent.guestWinNum,
                    hostTeamId:matchAgent.hostTeam.ID,
                    guestTeamId:matchAgent.guestTeam.ID
                });
            }
        }
    }

    function matchAgentUpdate(timestamp){
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
                OBJ('RpcModule').broadcastGameServer('VirtualFootball', 'refreshMatchEvent', {
                    event:matchAgent.curEvent,
                    hostTeamGoal:matchAgent.hostTeamGoal,
                    guestTeamGoal:matchAgent.guestTeamGoal,
                    hostWinTimes:matchAgent.hostWinTimes,
                    hostWinSupport:matchAgent.hostWinSupport,
                    drawTimes:matchAgent.drawTimes,
                    drawSupport:matchAgent.drawSupport,
                    guestWinTimes:matchAgent.guestWinTimes,
                    guestWinSupport:matchAgent.guestWinSupport,
                    hostNextGoalTimes:matchAgent.hostNextGoalTimes,
                    hostNextGoalSupport:matchAgent.hostNextGoalSupport,
                    zeroGoalTimes:matchAgent.zeroGoalTimes,
                    zeroGoalSupport:matchAgent.zeroGoalSupport,
                    guestNextGoalTimes:matchAgent.guestNextGoalTimes,
                    guestNextGoalSupport:matchAgent.guestNextGoalSupport,
                });
            }
            if(matchAgent.oddsRun(timestamp)){
                //下一球赢钱推送
                OBJ('RpcModule').broadcastGameServer('VirtualFootball', 'updateArea',{
                    hostWinTimes : matchAgent.hostWinTimes,
                    drawTimes : matchAgent.drawTimes,
                    guestWinTimes : matchAgent.guestWinTimes,
                    hostNextGoalTimes : matchAgent.hostNextGoalTimes,
                    zeroGoalTimes : matchAgent.zeroGoalTimes,
                    guestNextGoalTimes : matchAgent.guestNextGoalTimes,
                });
            }
        }
    }

    function betItemUpdate(timestamp){
        if(null != betItemUpdateTimer && betItemUpdateTimer.toNextTime()){
            //发送投注项数据
            OBJ('RpcModule').broadcastGameServer('VirtualFootball', 'refreshBetItem', {
                betItem1:betItem1,
                betItem2:betItem2,
                betItem3:betItem3,
            });
        }
    }
    this.getCurData = function(target, data){
        OBJ('RpcModule').send(target, 'VirtualFootball', 'resCurData', {
            no:timeAgent.no,
            matchState:timeAgent.matchState,
            stateEndTime:timeAgent.matchStateEndTime,
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
            hostWinNum:matchAgent==null?0:matchAgent.hostWinNum,
            drawNum:matchAgent==null?0:matchAgent.drawNum,
            guestWinNum:matchAgent==null?0:matchAgent.guestWinNum
        });
        //发送投注项数据
        OBJ('RpcModule').send(target, 'VirtualFootball', 'refreshBetItem', {
            betItem1:betItem1,
            betItem2:betItem2,
            betItem3:betItem3,
        });
    };
    OBJ('RpcModule').registerInitFun(this.getCurData);

    this.supportArea = function(data){
        if(null != matchAgent)
            matchAgent.supportArea(data);
    };

    this.changeStock = function(data){
        if(null != matchAgent)
            matchAgent.changeStock(data);
    };
}