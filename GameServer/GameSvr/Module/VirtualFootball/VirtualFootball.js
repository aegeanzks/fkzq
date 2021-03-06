module.exports = VirtualFootball;

var OBJ = require('../../../Utils/ObjRoot').getObj;
var uuid = require('node-uuid');
var Schema = require('../../../db_structure');
var PlayerContainer = require('../Player/PlayerContainer');

function VirtualFootball(){
    var self = this;

    var no = '';             //场次
    var matchState = 0;
    var stateEndTime = 0;
    var event = 0;
    var hostTeamId = 0;
    var hostTeamGoal = 0;
    var guestTeamId = 0;
    var guestTeamGoal = 0;
    var hostWinTimes = 0;
    var hostWinSupport = 0;
    var drawTimes = 0;
    var drawSupport = 0;
    var guestWinTimes = 0;
    var guestWinSupport = 0;
    var hostNextGoalTimes = 0;
    var hostNextGoalSupport = 0;
    var zeroGoalTimes = 0;
    var zeroGoalSupport = 0;
    var guestNextGoalTimes = 0;
    var guestNextGoalSupport = 0;
    var hostWinNum = 0;
    var drawNum = 0;
    var guestWinNum = 0;

    var betItem1 = 0;
    var betItem2 = 0;
    var betItem3 = 0;

    var canBetWinLose = true;
    var canBetNext = true;

    var classLogVirtualBet = OBJ('DbMgr').getStatement(Schema.LogVirtualBet());
    var classVirtualSchedule = OBJ('DbMgr').getStatement(Schema.VirtualSchedule());

    init();
    function init(){
        //申请虚拟足球数据
        OBJ('RpcModule').send2VirtualDataCenter('VirtualFootball', 'getCurData', 
            SERVERID
        );
        //对于之前因为服务端重启造成的没有结算的玩家进行金额退还
        rollbackErrBet();
    }

    function rollbackErrBet(){
        var findValue = {
            'status':0,
            'balance_schedule_id':{$ne:no}
        };
        classLogVirtualBet.find(findValue, function(err, data){
            if(err){
                OBJ('LogMgr').error(err);
            }else if(data.length > 0){
                for(var item of data){
                    dealRollbackErrBet(item);
                }
            }
        });
    }

    function dealRollbackErrBet(item){
        //生成投注记录
        var updateValue = {
            'status':4
        };
        classLogVirtualBet.update({ "out_trade_no": item.out_trade_no }, updateValue, function(err){
            if(err){
                OBJ('LogMgr').error(err);
            }
        });
        //发送钱包加钱
        OBJ('RpcModule').req2Wallet('WalletSvrAgent', 'reqAddMoney', {
            userid:item.user_id, 
            outType:5,
            uuid:item.out_trade_no, 
            betCoin:item.bet_distribute_coin.toString(),
        }, function(data){
            if(data.res != 0){
                //生成投注记录
                var updateValue = {
                    'settlement_out_trade_no':data.uuid,
                    'status':3
                };
                classLogVirtualBet.update({ "out_trade_no": item.out_trade_no }, updateValue, function(err){
                    if(err){
                        OBJ('LogMgr').error(err);
                    }
                });
    
            } else {
                //生成投注记录
                var updateValue = {
                    'distribute_coin':item.bet_coin,
                    'settlement_out_trade_no':data.uuid,
                    'settlement_trade_no':data.trade_no,
                };
                classLogVirtualBet.update({ "out_trade_no": item.out_trade_no }, updateValue, function(err){
                    if(err){
                        OBJ('LogMgr').error(err);
                    }
                    //广播中奖信息
                    //如果不在线或在其他游戏服上，则广播
                    OBJ('RpcModule').broadcastOtherGameServer('VirtualFootball', 'dealWinning', {
                        userid:item.user_id,
                        player:null
                    });
                    //修改库存
                    OBJ('RpcModule').send2VirtualDataCenter('VirtualFootball', 'changeStock', {
                        num:-item.bet_distribute_coin,
                        userid:item.user_id
                    });
                });
            }
        });
    }

    //当前比较数据数据中心回执
    this.resCurData = function(data){
        no = data.no;
        matchState = data.matchState;
        stateEndTime = data.stateEndTime;
        event = data.event;
        hostTeamId = data.hostTeamId;
        hostTeamGoal = data.hostTeamGoal;
        guestTeamId = data.guestTeamId;
        guestTeamGoal = data.guestTeamGoal;
        hostWinTimes = data.hostWinTimes;
        hostWinSupport = data.hostWinSupport;
        drawTimes = data.drawTimes;
        drawSupport = data.drawSupport;
        guestWinTimes = data.guestWinTimes;
        guestWinSupport = data.guestWinSupport;
        hostNextGoalTimes = data.hostNextGoalTimes;
        hostNextGoalSupport = data.hostNextGoalSupport;
        zeroGoalTimes = data.zeroGoalTimes;
        zeroGoalSupport = data.zeroGoalSupport;
        guestNextGoalTimes = data.guestNextGoalTimes;
        guestNextGoalSupport = data.guestNextGoalSupport;
        hostWinNum = data.hostWinNum;
        drawNum = data.drawNum;
        guestWinNum = data.guestWinNum;

        if(matchState == 0 || matchState == 1){
            if(drawTimes != 0){
                canBetWinLose = true;
            }else{
                canBetWinLose = false;
            }
            if(zeroGoalTimes != 0){
                canBetNext = true;
            }else{
                canBetNext = false;
            }
        }else{
            canBetWinLose = false;
            canBetNext = false;
        }
        rollbackErrBet();
    };
    //刷新比赛事件
    this.refreshMatchEvent = function(data){
        event = data.event;
        hostTeamGoal = data.hostTeamGoal;
        guestTeamGoal = data.guestTeamGoal;
        hostWinTimes = data.hostWinTimes;
        hostWinSupport = data.hostWinSupport;
        drawTimes = data.drawTimes;
        drawSupport = data.drawSupport;
        guestWinTimes = data.guestWinTimes;
        guestWinSupport = data.guestWinSupport;
        hostNextGoalTimes = data.hostNextGoalTimes;
        hostNextGoalSupport = data.hostNextGoalSupport;
        zeroGoalTimes = data.zeroGoalTimes;
        zeroGoalSupport = data.zeroGoalSupport;
        guestNextGoalTimes = data.guestNextGoalTimes;
        guestNextGoalSupport = data.guestNextGoalSupport;

        if(drawTimes != 0){
            canBetWinLose = true;
        }else{
            canBetWinLose = false;
        }
        if(zeroGoalTimes != 0){
            canBetNext = true;
        }else{
            canBetNext = false;
        }

        //广播
        var push = new pbSvrcli.Push_GoalAndBetArea();
        var goalAndBetArea = new pbSvrcli.GoalAndBetArea();
        goalAndBetArea.setHostteamgoal(hostTeamGoal);
        goalAndBetArea.setGuestteamgoal(guestTeamGoal);
        goalAndBetArea.setHostwintimes(hostWinTimes);
        goalAndBetArea.setHostwinsupport(hostWinSupport);
        goalAndBetArea.setDrawtimes(drawTimes);
        goalAndBetArea.setDrawsupport(drawSupport);
        goalAndBetArea.setGuestwintimes(guestWinTimes);
        goalAndBetArea.setGuestwinsupport(guestWinSupport);
        goalAndBetArea.setHostnextgoaltimes(hostNextGoalTimes);
        goalAndBetArea.setHostnextgoalsupport(hostNextGoalSupport);
        goalAndBetArea.setZerogoaltimes(zeroGoalTimes);
        goalAndBetArea.setZerogoalsupport(zeroGoalSupport);
        goalAndBetArea.setGuestnextgoaltimes(guestNextGoalTimes);
        goalAndBetArea.setGuestnextgoalsupport(guestNextGoalSupport);
        goalAndBetArea.setEvent(event);
        push.setGoalandbetarea(goalAndBetArea);
        var buf = push.serializeBinary();
        io.sockets.in('VirtualFootMainInfo').emit(pbSvrcli.Push_GoalAndBetArea.Type.ID, buf, buf.length);

        //结算
        if(7 == event || 8 == event){   //如果进球
            settlementNextGoal(event);
        }
    };
    //刷新比赛状态
    this.refreshMatchState = function(data){
        matchState = data.matchState;
        stateEndTime = data.stateEndTime;
        no = data.no;
        hostWinNum = data.hostWinNum;
        drawNum = data.drawNum;
        guestWinNum = data.guestWinNum;
        hostTeamId = data.hostTeamId;
        guestTeamId = data.guestTeamId;
        if(matchState == 0 || matchState == 1){
            canBetWinLose = true;
            canBetNext = true;
        }else{
            canBetWinLose = false;
            canBetNext = false;
        }
        if(matchState == 2){
            //结算
            settlementWinLose();
        }
        broacastMatchInfo();
    };
    function broacastMatchInfo() {
        //广播
        var push = new pbSvrcli.Push_MatchInfo();
        var matchInfo = new pbSvrcli.MatchInfo();
        matchInfo.setMatchstate(matchState);
        matchInfo.setLastsecond(parseInt((stateEndTime-Date.now())/1000));
        matchInfo.setHostwinnum(hostWinNum);
        matchInfo.setDrawnum(drawNum);
        matchInfo.setGuestwinnum(guestWinNum);
        matchInfo.setHostteamid(hostTeamId);
        matchInfo.setGuestteamid(guestTeamId);
        matchInfo.setIssue(no);
        push.setMatchinfo(matchInfo);
        var buf = push.serializeBinary();
        io.sockets.in('VirtualFootMainInfo').emit(pbSvrcli.Push_MatchInfo.Type.ID, buf, buf.length);
    }
    //刷新投注项
    this.refreshBetItem = function(data){
        betItem1 = data.betItem1;
        betItem2 = data.betItem2;
        betItem3 = data.betItem3;
        
        var push = new pbSvrcli.Push_VtBetItems();
        push.setItem1(betItem1);
        push.setItem2(betItem2);
        push.setItem3(betItem3);
        var buf = push.serializeBinary();
        io.sockets.in('VirtualFootMainInfo').emit(pbSvrcli.Push_VtBetItems.Type.ID, buf, buf.length);
    };
    //获取主页请求
    this.askVirtualFootMainInfo = function(askVirtualFootMainInfo, socket){
        var player = OBJ('PlayerContainer').findPlayer(socket);
        if(null == player)
            return;
        player.outAllGroup();
        socket.join('VirtualFootMainInfo');

        var res = new pbSvrcli.Res_VirtualFootMainInfo();
        var matchInfo = new pbSvrcli.MatchInfo();
        matchInfo.setMatchstate(matchState);
        matchInfo.setLastsecond(parseInt((stateEndTime-Date.now())/1000));
        matchInfo.setHostwinnum(hostWinNum);
        matchInfo.setDrawnum(drawNum);
        matchInfo.setGuestwinnum(guestWinNum);
        matchInfo.setHostteamid(hostTeamId);
        matchInfo.setGuestteamid(guestTeamId);
        matchInfo.setIssue(no);
        res.setMatchinfo(matchInfo);
        var goalAndBetArea = new pbSvrcli.GoalAndBetArea();
        goalAndBetArea.setHostteamgoal(hostTeamGoal);
        goalAndBetArea.setGuestteamgoal(guestTeamGoal);
        goalAndBetArea.setHostwintimes(hostWinTimes);
        goalAndBetArea.setHostwinsupport(hostWinSupport);
        goalAndBetArea.setDrawtimes(drawTimes);
        goalAndBetArea.setDrawsupport(drawSupport);
        goalAndBetArea.setGuestwintimes(guestWinTimes);
        goalAndBetArea.setGuestwinsupport(guestWinSupport);
        goalAndBetArea.setHostnextgoaltimes(hostNextGoalTimes);
        goalAndBetArea.setHostnextgoalsupport(hostNextGoalSupport);
        goalAndBetArea.setZerogoaltimes(zeroGoalTimes);
        goalAndBetArea.setZerogoalsupport(zeroGoalSupport);
        goalAndBetArea.setGuestnextgoaltimes(guestNextGoalTimes);
        goalAndBetArea.setGuestnextgoalsupport(guestNextGoalSupport);
        goalAndBetArea.setEvent(event);
        res.setGoalandbetarea(goalAndBetArea);
        res.setBetitem1(betItem1);
        res.setBetitem2(betItem2);
        res.setBetitem3(betItem3);

        var findValue = {
            'user_id':player.userId,
            'status':0,
            'balance_schedule_id':no
        };
        classLogVirtualBet.find(findValue, function(err, data){
            if(err){
                OBJ('LogMgr').error(err);
            }else if(data.length > 0){
                var mapAreaBetParam = new Map();
                for(var item of data){
                    var areaBetParam = mapAreaBetParam.get(item.bet_area);
                    if(null == areaBetParam){
                        areaBetParam = {betNum:0, allCoin:0};
                        mapAreaBetParam.set(item.bet_area, areaBetParam);
                    }
                    areaBetParam.betNum++;
                    areaBetParam.allCoin+=item.bet_coin;
                }
                var arr = [];
                for (var item of mapAreaBetParam.entries()) {
                    var row = new pbSvrcli.AreaBettedInfo();
                    row.setBetarea(item[0]);
                    row.setBetnum(item[1].betNum);
                    row.setAllcoin(item[1].allCoin);
                    arr.push(row);
                }
                res.setAreabettedinfolistList(arr);
            }
            OBJ('WsMgr').send(socket, pbSvrcli.Res_VirtualFootMainInfo.Type.ID, res.serializeBinary());
        });
    };
    //获取竞猜记录请求
    this.askGuessingRecord = function(askGuessingRecord, socket){
        socket.leave('VirtualFootMainInfo');
        var player = OBJ('PlayerContainer').findPlayer(socket);
        if(null == player)
            return;
        var page = askGuessingRecord.getPage();
        classLogVirtualBet.find({'user_id':player.userId}, null, 
            {skip:page*12, limit:12, sort:{'bet_date':-1}}, function(err, data){
                if(err){
                    OBJ('LogMgr').error(err);
                    return;
                }
                if(data.length == 0)
                    return;
                var res = new pbSvrcli.Res_GuessingRecord();
                var arr = [];
                for(var item of data){
                    var row = new pbSvrcli.GuessingRecord();
                    row.setIssue(item.balance_schedule_id);
                    row.setHostteamid(item.host_team_id);
                    row.setGuestteamid(item.guest_team_id);
                    row.setBetdate(item.bet_date.getTime());
                    row.setBetarea(item.bet_area);
                    row.setBettimes(item.bet_times);
                    row.setBetcoin(item.bet_coin);
                    row.setGetcoin(parseInt(item.distribute_coin));
                    row.setStatus(item.status);
                    arr.push(row);
                }
                res.setGuessingrecordsList(arr);
                player.send(pbSvrcli.Res_GuessingRecord.Type.ID, res.serializeBinary());
        });
    };
    //获取开奖历史请求
    this.askVirtualHistory = function(askGuessingRecord, socket){
        socket.leave('VirtualFootMainInfo');
        var player = OBJ('PlayerContainer').findPlayer(socket);
        if(null == player)
            return;
        var page = askGuessingRecord.getPage();
        classVirtualSchedule.find(null, null, 
            {skip:page*12, limit:12, sort:{'date_num':-1}}, function(err, data){
                if(err){
                    OBJ('LogMgr').error(err);
                    return;
                }
                if(data.length == 0)
                    return;
                var res = new pbSvrcli.Res_VirtualHistory();
                var arr = [];
                for(var item of data){
                    var row = new pbSvrcli.VirtualHistory();
                    row.setIssue(item.date_num);
                    row.setHostteamid(item.host_team_id);
                    row.setGuestteamid(item.guest_team_id);
                    row.setHostteamgoal(item.host_team_goal);
                    row.setGuestteamgoal(item.guest_team_goal);
                    arr.push(row);
                }
                res.setVirtualhistoryList(arr);
                player.send(pbSvrcli.Res_VirtualHistory.Type.ID, res.serializeBinary());
        });
    };
    //下注时发现赔率是0，则视为无效
    function judgeBet(betArea){
        switch(betArea){
            case 1:return hostWinTimes!=0;
            case 2:return drawTimes!=0;
            case 3:return guestWinTimes!=0;
            case 4:return hostNextGoalTimes!=0;
            case 5:return zeroGoalTimes!=0;
            case 6:return guestNextGoalTimes!=0;
        }
        return false;
    }
    
    //投注请求
    this.askVirtualBet = function(askVirtualBet, socket){
        var betArea = askVirtualBet.getBetarea();
        if(!judgeBet(betArea))
            return;
        if(betArea==1||betArea==2||betArea==3){
            if(!canBetWinLose)
                return;
        }else{
            if(!canBetNext)
                return;
        }
        
        var player = OBJ('PlayerContainer').findPlayer(socket);
        if (null == player)
            return;
        //获取投注金额
        var betCoin = 1000;
        var betItem = askVirtualBet.getCoinitem();
        if(1 == betItem)
            betCoin = betItem1;
        else if(2 == betItem)
            betCoin = betItem2;
        else if(3 == betItem)
            betCoin = betItem3;
        
        if(player.gameCoin < betCoin)
            return;
        player.gameCoin -= betCoin;
        //生成唯一ID
        var uid = uuid.v4();
        OBJ('RpcModule').req2Wallet('WalletSvrAgent', 'reqBet', {
            userid:player.userId, 
            outType:3,
            uuid:uid, 
            betCoin:betCoin.toString()
        }, function(data){
            if(data.res == 0){
                var res = new pbSvrcli.Res_VirtualBet();
                res.setResult(data.res);
                res.setCoin(data.balance);
                res.setBetarea(betArea);
                res.setCoinitem(betItem);
                //投注
                player.send(pbSvrcli.Res_VirtualBet.Type.ID, res.serializeBinary());
                //生成投注记录
                var modelLogVirtualBet = OBJ('DbMgr').getModel(Schema.LogVirtualBet());
                modelLogVirtualBet.user_id = player.userId;
                modelLogVirtualBet.user_name = player.userName;
                modelLogVirtualBet.bet_date = Date.now();
                modelLogVirtualBet.bet_coin = data.betCoin;
                modelLogVirtualBet.bet_area = betArea;
                modelLogVirtualBet.bet_times = getCurAreaTimes(betArea);
                modelLogVirtualBet.bet_distribute_coin = parseInt(modelLogVirtualBet.bet_coin*modelLogVirtualBet.bet_times+0.1);//0.1是考虑浮点值精度问题
                modelLogVirtualBet.distribute_coin = 0;
                modelLogVirtualBet.before_bet_coin = player.gameCoin + betCoin;
                modelLogVirtualBet.status = 0;
                modelLogVirtualBet.balance_schedule_id = no;
                modelLogVirtualBet.server_id = SERVERID;
                modelLogVirtualBet.out_trade_no = data.uuid;
                modelLogVirtualBet.trade_no = data.trade_no;
                modelLogVirtualBet.settlement_out_trade_no = '';
                modelLogVirtualBet.settlement_trade_no = '';
                modelLogVirtualBet.host_team_id = hostTeamId;
                modelLogVirtualBet.guest_team_id = guestTeamId;
                modelLogVirtualBet.bet_server = SERVERID;
                modelLogVirtualBet.save(function(err){
                    if(err){
                        OBJ('LogMgr').error(err);
                    }
                });

                //告诉数据中心修改支持率
                OBJ('RpcModule').send2VirtualDataCenter('VirtualFootball', 'supportArea', {
                    area:betArea, 
                    distributeCoin:modelLogVirtualBet.bet_distribute_coin,
                    betCoin:data.betCoin,
                    userid:player.userId
                });
            }else{
                player.gameCoin += betCoin;
            }
        });
    };

    function getCurAreaTimes(area){
        switch(area){
            case 1: return hostWinTimes;
            case 2: return drawTimes;
            case 3: return guestWinTimes;
            case 4: return hostNextGoalTimes;
            case 5: return zeroGoalTimes;
            case 6: return guestNextGoalTimes;
            default:
                return 0;
        }
    }

    //中奖信息接收
    this.dealWinning = function(data){
        var player = data.player;
        //本机上搜索一遍
        if(null == player){
            var userid = data.userid;
            player = OBJ('PlayerContainer').findPlayerByUserId(userid);
        }
        //在本机上
        if(null != player){
            OBJ('RpcModule').req2Wallet('WalletSvrAgent', 'reqGetCoin', {
                userid:player.userId
            }, function(data){
                var winCoin = parseInt(data.balance - player.gameCoin + 0.1);
                if(winCoin > 0){
                    var push = new pbSvrcli.Push_WinBet();
                    push.setWincoin(winCoin);    //0.1是为了修正浮点值精度问题
                    push.setCoin(data.balance);
                    player.send(pbSvrcli.Push_WinBet.Type.ID, push.serializeBinary());
                    player.gameCoin = data.balance;
                }
            });
        }
    };

    //更新投注区域
    this.updateArea = function(data){
        hostWinTimes = data.hostWinTimes;
        drawTimes = data.drawTimes;
        guestWinTimes = data.guestWinTimes;
        hostNextGoalTimes = data.hostNextGoalTimes;
        zeroGoalTimes = data.zeroGoalTimes;
        guestNextGoalTimes = data.guestNextGoalTimes;

        if(drawTimes != 0){
            canBetWinLose = true;
        }else{
            canBetWinLose = false;
        }
        if(zeroGoalTimes != 0){
            canBetNext = true;
        }else{
            canBetNext = false;
        }

        var push = new pbSvrcli.Push_BetArea();
        push.setHostwintimes(hostWinTimes);
        push.setDrawtimes(drawTimes);
        push.setGuestwintimes(guestWinTimes);
        push.setHostnextgoaltimes(hostNextGoalTimes);
        push.setZerogoaltimes(zeroGoalTimes);
        push.setGuestnextgoaltimes(guestNextGoalTimes);
        var buf = push.serializeBinary();
        io.sockets.in('VirtualFootMainInfo').emit(pbSvrcli.Push_BetArea.Type.ID, buf, buf.length);
    };

    //下一球结算
    function settlementNextGoal(eventId){
        var findParam = {
            'status':0,
            'balance_schedule_id':no,
            'bet_server':SERVERID,
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
            for(var item of data){
                dealNextGoalSettlement(winArea, item);
            }
        });
    }

    function dealNextGoalSettlement(winArea, item){
        if(item.bet_area == winArea){
            //生成投注记录
            var updateValue = {
                'status':2
            };
            classLogVirtualBet.update({ "out_trade_no": item.out_trade_no }, updateValue, function(err){
                if(err){
                    OBJ('LogMgr').error(err);
                }
            });
            //发送钱包加钱
            OBJ('RpcModule').req2Wallet('WalletSvrAgent', 'reqAddMoney', {
                userid:item.user_id, 
                outType:5,
                uuid:item.out_trade_no,
                betCoin:item.bet_distribute_coin.toString(),
            }, function(data){
                if(data.res != 0){
                    //生成投注记录
                    var updateValue = {
                        'settlement_out_trade_no':data.uuid,
                        'status':3          //系统错误
                    };
                    classLogVirtualBet.update({ "out_trade_no": item.out_trade_no }, updateValue, function(err){
                        if(err){
                            OBJ('LogMgr').error(err);
                        }
                    });
        
                } else {
                    //生成投注记录
                    var updateValue = {
                        'distribute_coin':item.bet_distribute_coin,
                        'settlement_out_trade_no':data.uuid,
                        'settlement_trade_no':data.trade_no,
                    };
                    classLogVirtualBet.update({ "out_trade_no": item.out_trade_no }, updateValue, function(err){
                        if(err){
                            OBJ('LogMgr').error(err);
                        }
                        //广播中奖信息
                        var player = OBJ('PlayerContainer').findPlayerByUserId(item.user_id);
                        if(null == player){
                            //如果不在线或在其他游戏服上，则广播
                            OBJ('RpcModule').broadcastOtherGameServer('VirtualFootball', 'dealWinning', {
                                userid:item.user_id,
                                player:null
                            });
                        } else {
                            //在这台机子上，则直接处理
                            self.dealWinning({
                                userid:item.user_id,
                                player:player
                            });
                        }
                        //修改库存
                        OBJ('RpcModule').send2VirtualDataCenter('VirtualFootball', 'changeStock', {
                            num:-item.bet_distribute_coin,
                            userid:item.user_id
                        });
                    });
                }
            });
        } else {
            //生成投注记录
            var updateValue = {
                'settlement_out_trade_no':'',
                'settlement_trade_no':'',
                'status':1
            };
            classLogVirtualBet.update({ "out_trade_no": item.out_trade_no }, updateValue, function(err){
                if(err){
                    OBJ('LogMgr').error(err);
                }
            });
            //发送钱包加钱
            OBJ('RpcModule').req2Wallet('WalletSvrAgent', 'reqAddMoney', {
                userid:item.user_id, 
                outType:5,
                uuid:item.out_trade_no,
                betCoin:'0',
            }, function(data){
                if(data.res != 0){
                    //生成投注记录
                    var updateValue = {
                        'settlement_out_trade_no':data.uuid,
                        'status':3          //系统错误
                    };
                    classLogVirtualBet.update({ "out_trade_no": item.out_trade_no }, updateValue, function(err){
                        if(err){
                            OBJ('LogMgr').error(err);
                        }
                    });
                }
            });
        }
    }

    //结算
    function settlementWinLose(){
        var findParam = {
            'status':0,
            'balance_schedule_id':no,
            'bet_server':SERVERID
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
                dealWinLoseSettlement(winArea, item);
            }
        });
    }

    function dealWinLoseSettlement(winArea, item){
        if(item.bet_area == winArea || item.bet_area == 5){   //主胜，平，客胜中了，或者不进球中了
            //生成投注记录
            var updateValue = {
                'status':2
            };
            classLogVirtualBet.update({ "out_trade_no": item.out_trade_no }, updateValue, function(err){
                if(err){
                    OBJ('LogMgr').error(err);
                }
            });
            //发送钱包加钱
            OBJ('RpcModule').req2Wallet('WalletSvrAgent', 'reqAddMoney', {
                userid:item.user_id, 
                outType:5,
                uuid:item.out_trade_no, 
                betCoin:item.bet_distribute_coin.toString(),
            }, function(data){
                if(data.res != 0){
                    //生成投注记录
                    var updateValue = {
                        'settlement_out_trade_no':data.uuid,
                        'status':3          //系统错误
                    };
                    classLogVirtualBet.update({ "out_trade_no": item.out_trade_no }, updateValue, function(err){
                        if(err){
                            OBJ('LogMgr').error(err);
                        }
                    });
        
                } else {
                    //生成投注记录
                    var updateValue = {
                        'distribute_coin':item.bet_distribute_coin,
                        'settlement_out_trade_no':data.uuid,
                        'settlement_trade_no':data.trade_no,
                    };
                    classLogVirtualBet.update({ "out_trade_no": item.out_trade_no }, updateValue, function(err){
                        if(err){
                            OBJ('LogMgr').error(err);
                        }
                        //广播中奖信息
                        var player = OBJ('PlayerContainer').findPlayerByUserId(item.user_id);
                        if(null == player){
                            //如果不在线或在其他游戏服上，则广播
                            OBJ('RpcModule').broadcastOtherGameServer('VirtualFootball', 'dealWinning', {
                                userid:item.user_id,
                                player:null
                            });
                        } else {
                            //在这台机子上，则直接处理
                            self.dealWinning({
                                userid:item.user_id,
                                player:player
                            });
                        }
                        //修改库存
                        OBJ('RpcModule').send2VirtualDataCenter('VirtualFootball', 'changeStock', {
                            num:-item.bet_distribute_coin,
                            userid:item.user_id
                        });
                    });
                }
            });
        } else {
            //生成投注记录
            var updateValue = {
                'settlement_out_trade_no':'',
                'settlement_trade_no':'',
                'status':1
            };
            classLogVirtualBet.update({ "out_trade_no": item.out_trade_no }, updateValue, function(err){
                if(err){
                    OBJ('LogMgr').error(err);
                }
            });
            //发送钱包加钱
            OBJ('RpcModule').req2Wallet('WalletSvrAgent', 'reqAddMoney', {
                userid:item.user_id, 
                outType:5,
                uuid:item.out_trade_no,
                betCoin:'0',
            }, function(data){
                if(data.res != 0){
                    //生成投注记录
                    var updateValue = {
                        'settlement_out_trade_no':data.uuid,
                        'status':3          //系统错误
                    };
                    classLogVirtualBet.update({ "out_trade_no": item.out_trade_no }, updateValue, function(err){
                        if(err){
                            OBJ('LogMgr').error(err);
                        }
                    });
                }
            });
        }
    }

    this.run = function(Timestamp){
        
    };
}