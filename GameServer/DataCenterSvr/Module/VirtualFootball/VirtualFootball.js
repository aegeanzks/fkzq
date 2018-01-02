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
    var conf = new VirtualFootballConf();
    var timeAgent = new VirtualFootballTimeAgent();
    var updateTimer = new SingleTimer();
    updateTimer.startup(200);
    var betItemUpdateTimer = new SingleTimer();
    betItemUpdateTimer.startup(60000);
    var endMatchUpdateTimer = null;

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

    var waitNextGoalSettlement = false;

    console.log('当前期号：'+timeAgent.no+' 当前事件：'+timeAgent.matchState+' 该事件剩余时间：'+timeAgent.matchStateLastTime/1000);
    var matchBeginEndTime = timeAgent.getCurMatchStartEndTime();
    var matchAgent = new VirtualFootballMatch(conf, matchBeginEndTime[0], matchBeginEndTime[1]);

    this.run = function(timestamp){
        //游戏记录(优先),查询是否已经都结算完成
        if(null != endMatchUpdateTimer){
            if(endMatchUpdateTimer.toNextTime()){
                var findParam = {
                    'status':0,
                    'balance_schedule_id':timeAgent.no
                };
                classLogVirtualBet.find(findParam, function(err, data){
                    if(err){
                        console.log(err);
                        return;
                    }
                    if(data.length != 0)
                        return;
                    endMatchUpdateTimer = null;
                    //当所有记录都被结算以后，就可以生成游戏记录了
                    findParam = {
                        //'status':{"$in",[1,2,3]}},
                        'balance_schedule_id':timeAgent.no
                    };
                    classLogVirtualBet.find(findParam, function(err, data2){
                        if(err){
                            console.log(err);
                            return;
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
                                return;
                            }
                        });
                        //赢钱推送
                        OBJ('GameSvrAgentModule').broadcastGameServer({
                            module:'VirtualFootball',
                            func:'updateMoney'
                        });
                    });
                });
            }  
            return;
        }
        if(timeAgent.updateCurEvent(timestamp)){
            console.log('当前期号：'+timeAgent.no+' 当前事件：'+timeAgent.matchState+' 该事件剩余时间：'+timeAgent.matchStateLastTime/1000);
            OBJ('GameSvrAgentModule').broadcastGameServer({
                module:'VirtualFootball',
                func:'refreshMatchState',
                data:{
                    no:timeAgent.no,
                    matchState:timeAgent.matchState,
                    lastTime:timeAgent.matchStateLastTime,
                    hostWinNum:matchAgent.hostWinNum,
                    drawNum:matchAgent.drawNum,
                    guestWinNum:matchAgent.guestWinNum
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
                //如果没有游戏服连着，就直接计算结果
                if(OBJ('GameSvrAgentModule').getServerCount() == 0){
                    this.canSettlement(null, null);
                }
                endMatchUpdateTimer = new SingleTimer();
                endMatchUpdateTimer.startup(500);
            }
        }
        if(null != matchAgent){
            if(waitNextGoalSettlement){
                //等待时不进行更新操作
            }
            else if(matchAgent.update(timestamp)){
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

                //如果是进球，则结算下一球竞猜的投注
                if(matchAgent.curEvent == 7 || matchAgent.curEvent == 8){
                    SettlementNextGoal();
                }
            }
        }

        if(null != betItemUpdateTimer && betItemUpdateTimer.toNextTime()){
            //发送投注项数据
            OBJ('GameSvrAgentModule').broadcastGameServer({
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
                hostWinNum:matchAgent==null?0:matchAgent.hostWinNum,
                drawNum:matchAgent==null?0:matchAgent.drawNum,
                guestWinNum:matchAgent==null?0:matchAgent.guestWinNum
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
        if(settlementCount >= OBJ('GameSvrAgentModule').getServerCount()){
            //开始结算
            SettlementWinLose();
        }
    };
    //结算
    var waitMap = new Map();
    function SettlementWinLose(){
        var findParam = {
            'status':0,
            'balance_schedule_id':timeAgent.no
        };
        classLogVirtualBet.find(findParam, function(err, data){
            if(data.length == 0)
                return;

            var winArea = 0;
            if(matchAgent.hostTeamGoal > matchAgent.guestTeamGoal)
                winArea = 1;       //主胜
            else if(matchAgent.hostTeamGoal == matchAgent.guestTeamGoal)
                winArea = 2;       //平
            else
                winArea = 3;       //客胜
            var updateArr = [];
            for(var item of data){
                if(item.bet_area == winArea || item.bet_area == 5){   //主胜，平，客胜中了，或者不进球中了
                    //发送钱包加钱
                    var uid = uuid.v4();
                    waitMap.set(uid, {
                        out_trade_no:item.out_trade_no, 
                        bet_distribute_coin:item.bet_distribute_coin,
                        settlementType:1
                    });
                    OBJ('WalletAgentModule').send({module:'WalletSvrAgent', func:'reqAddMoney', data:{
                        userid:item.user_id, 
                        outType:2, 
                        outTypeDescription:'足球竞猜', 
                        uuid:uid, 
                        addCoin:item.bet_distribute_coin.toString(), 
                    }});
                } else {
                    //生成投注记录
                    var updateValue = {
                        'settlement_out_trade_no':'',
                        'settlement_trade_no':'',
                        'status':1
                    }
                    classLogVirtualBet.update({ "out_trade_no": item.out_trade_no }, updateValue, function(err){
                        if(err){
                            console.log(err);
                        }
                    });
                }
            }
        });
    }
    //下一球结算
    function SettlementNextGoal(eventId){
        var findParam = {
            'status':0,
            'balance_schedule_id':timeAgent.no,
            'bet_area':{ $in: [4,5,6] }
        };
        classLogVirtualBet.find(findParam, function(err, data){
            if(data.length == 0)
                return;

            var winArea = 0;
            if(7 == eventId)
                winArea = 4;       //主队进球
            else
                winArea = 6;       //客队进球
            var updateArr = [];
            for(var item of data){
                if(item.bet_area == winArea){
                    //发送钱包加钱
                    var uid = uuid.v4();
                    waitMap.set(uid, {
                        out_trade_no:item.out_trade_no, 
                        bet_distribute_coin:item.bet_distribute_coin,
                        settlementType:2
                    });
                    OBJ('WalletAgentModule').send({module:'WalletSvrAgent', func:'reqAddMoney', data:{
                        userid:item.user_id, 
                        outType:2, 
                        outTypeDescription:'足球竞猜', 
                        uuid:uid, 
                        addCoin:item.bet_distribute_coin.toString(), 
                    }});
                } else {
                    //生成投注记录
                    var updateValue = {
                        'settlement_out_trade_no':'',
                        'settlement_trade_no':'',
                        'status':1
                    };
                    classLogVirtualBet.update({ "out_trade_no": item.out_trade_no }, updateValue, function(err){
                        if(err){
                            console.log(err);
                        }
                    });
                }
            }
        });
    }
    this.resAddTrade = function(source, data){
        var waitValue = waitMap.get(data.uuid);
        waitMap.delete(data.uuid);
        if(null == waitValue)
            return;
        if(data.res != 0){
            //生成投注记录
            var updateValue = {
                'settlement_out_trade_no':data.uuid,
                'status':3          //系统错误
            };
            classLogVirtualBet.update({ "out_trade_no": waitValue.out_trade_no }, updateValue, function(err){
                if(err){
                    console.log(err);
                }
            });
            return;
        }
        
        //生成投注记录
        var updateValue = {
            'distribute_coin':waitValue.bet_distribute_coin,
            'settlement_out_trade_no':data.uuid,
            'settlement_trade_no':data.trade_no,
            'status':2
        };
        classLogVirtualBet.update({ "out_trade_no": waitValue.out_trade_no }, updateValue, function(err){
            if(err){
                console.log(err);
            }
            //检查是否结算完成，并且要等待完成
            if(waitValue.settlementType == 2){
                var findParam = {
                    'status':0,
                    'balance_schedule_id':timeAgent.no,
                    'bet_area':{ $in: [4,5,6] }
                };
                classLogVirtualBet.find(findParam, function(err, data){
                    if(data.length != 0)
                        waitNextGoalSettlement = true;
                    else{
                        waitNextGoalSettlement = false;
                        //下一球赢钱推送
                        OBJ('GameSvrAgentModule').broadcastGameServer({
                            module:'VirtualFootball',
                            func:'updateMoney'
                        });
                    }
                });
            }
        });
    };
}