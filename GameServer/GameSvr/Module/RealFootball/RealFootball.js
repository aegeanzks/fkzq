module.exports = RealFootball;

var SingleTimer = require('../../../Utils/SingleTimer');
var OBJ = require('../../../Utils/ObjRoot').getObj;
var uuid = require('node-uuid');
var Schema = require('../../../db_structure');
var PlayerContainer = require('../Player/PlayerContainer');
var fs = require('fs');
var Config = require('../../../config').realDataCenterSvrConfig();
var Func = require('../../../Utils/Functions');

function RealFootball() {
    var self = this;
    var mapScheduleList = new Map();     //当前时刻赛事列表
    var mapLeagueIdList = new Map();     //联赛id列表
    var mapBetNumList = new Map();       //用于更新赛事投注人数    
    var mapAnList = new Map();           //公告信息
    var orderId = 1 ;                    //订单id自增使用
    var betMatchDate = 20180204;         //投注日期
    var service = SERVERID.substr(6);    //服务器标识

    var betItem1 = 0;
    var betItem2 = 0;
    var betItem3 = 0;
    var betNumLimit = 1;
    var betCoinLimit = 0;

    var maxLeagueId = 0;

    var limit = 0;

    var announceTimer = new SingleTimer();             //用于公告过去处理
    announceTimer.startup(120 * 60 * 1000);             //120分钟执行一次

    var classLogRealBet = OBJ('DbMgr').getStatement(Schema.LogRealBet());
    var classSchedule = OBJ('DbMgr').getStatement(Schema.Schedule());
    var classAnnounce = OBJ('DbMgr').getStatement(Schema.Announcement());

    var scehduleSelect = {
        "_id": 0, "id": 1, "weekday": 1, "official_num": 1, "phase": 1, "match_date": 1,
        "status": 1, "first_half": 1, "final_score": 1, "match_name": 1, "home_team": 1,
        "away_team": 1, "odds_jingcai": 1, "odds_jingcai_admin": 1, "handicap": 1,
        "odds_rangqiu": 1, "odds_rangqiu_admin": 1, "display_flag": 1, "hot_flag": 1,
        "odds_avg": 1, "bet_num": 1, "bet_num1": 1
    };

    init();

    function init() {
        service = ((service.length == 1)?('0'+service):service);
        initLeagueIdList();
        limit = Config['limit'] ? Config['limit'] : 12;
        //获取订单的流水号
        getMaxSerial();
        //查询公告信息
        getAnnounce();
        //申请投注信息
        OBJ('RpcModule').send2RealDataCenter('RealFootball', 'getRealBetConf', SERVERID);
        //游戏服重启主动申请
        OBJ('RpcModule').send2RealDataCenter('RealFootball', 'reGetCurData', SERVERID);
    }

    //初始化 mapLeagueIdList
    function initLeagueIdList() {
        var leagueIdInfo = JSON.parse(fs.readFileSync('./Json/LeagueIdInfo.json'));
        for (var key in leagueIdInfo) {
            var item = leagueIdInfo[key];
            mapLeagueIdList.set(item.match_name, item.league_id);
        }
        maxLeagueId = mapLeagueIdList.size;
    }

    //获取联赛id
    function getLeagueId(leagueName) {
        var leagueId = mapLeagueIdList.get(leagueName);
        if (null == leagueId) {
            return maxLeagueId + 1;
        }
        return leagueId;
    }

    //初始化话scheduleList
    this.resCurData = function (data) {
        for (var i = 0; i < data.map.length; i++) {
            mapScheduleList.set(data.map[i]['sceheduleId'], data.map[i]);
            //所有赛事的支持率
            mapBetNumList.set(data.betRate[i].id, data.betRate[i].num);
        }
    }

    //增加赛事
    this.resAddData = function (data){
        var arr = [];
        for(var i = 0;i < data.map.length;i++){
            var schedule = mapScheduleList.get(data.map[i]['sceheduleId']);
            if(null == schedule){
                mapScheduleList.set(data.map[i]['sceheduleId'], data.map[i]);
                mapBetNumList.set(data.betRate[i].id, data.betRate[i].num);
                arr.push(data.map[i]);
            }else{
                continue ;
            }
        }

        //广播
        var push = new pbSvrcli.Push_AddScheduleInfo();
        var listArr = [];
        for (var i = 0; i < arr.length; i++) {
            var row = new pbSvrcli.RlScheduleInfo();

            var oddsJingcai = JSON.stringify(arr[i].oddsJingcai);
            var oddsRangqiu = JSON.stringify(arr[i].oddsRangqiu);

            row.setSceheduleid(arr[i].sceheduleId);
            row.setPhase(arr[i].phase);
            row.setLeagueid(getLeagueId(arr[i].matchName));
            row.setMatchname(arr[i].matchName);
            row.setWeekday(arr[i].weekday);
            row.setOfficialnum(arr[i].officialNum);
            row.setEndsale(arr[i].endSale);
            row.setHomename(arr[i].homeName);
            row.setAwayname(arr[i].awayName);
            row.setHandicap(arr[i].handicap);
            row.setOddsjingcai(oddsJingcai);
            row.setOddsrangqiu(oddsRangqiu);
            row.setHotflag(arr[i].hotFlag);

            listArr.push(row);
        }
        push.setRlscheduleinfoList(listArr);
        var buf = push.serializeBinary();
        io.sockets.in('RealFootMainInfo').emit(pbSvrcli.Push_AddScheduleInfo.Type.ID, buf, buf.length);

    }

    //刷新betItem数据
    this.refreshBetItem = function (data) {
        betItem1 = data.betItem1;
        betItem2 = data.betItem2;
        betItem3 = data.betItem3;
        betNumLimit = data.betNumLimit;
        betCoinLimit = data.betCoinLimit;

         //广播
         var push = new pbSvrcli.Push_RlBetItems();
         push.setItem1(betItem1);
         push.setItem2(betItem2);
         push.setItem3(betItem3);
         push.setNumlimit(betNumLimit);
         push.setCoinlimit(betCoinLimit);

         var buf = push.serializeBinary();
         io.sockets.in('RealFootMainInfo').emit(pbSvrcli.Push_RlBetItems.Type.ID, buf, buf.length);
    }

    //刷新scheduleList数据
    this.refreshSchedule = function (data) {
        var arr = [];
        for (var i = 0; i < data.map.length; i++) {
            var item = data.map[i];
            var tmpItem = mapScheduleList.get(item['sceheduleId']);
            if (null == tmpItem) {
                continue;
            }
            arr.push(item);
        }

        //广播
        var push = new pbSvrcli.Push_ScheduleInfo();
        var listArr = [];
        for (var i = 0; i < arr.length; i++) {
            //赋值mapScheduleList
            mapScheduleList.set(arr[i]['sceheduleId'], arr[i]);

            var row = new pbSvrcli.RlScheduleInfo();

            var oddsJingcai = JSON.stringify(arr[i].oddsJingcai);
            var oddsRangqiu = JSON.stringify(arr[i].oddsRangqiu);

            row.setSceheduleid(arr[i].sceheduleId);
            row.setPhase(arr[i].phase);
            row.setLeagueid(getLeagueId(arr[i].matchName));
            row.setMatchname(arr[i].matchName);
            row.setWeekday(arr[i].weekday);
            row.setOfficialnum(arr[i].officialNum);
            row.setEndsale(arr[i].endSale);
            row.setHomename(arr[i].homeName);
            row.setAwayname(arr[i].awayName);
            row.setHandicap(arr[i].handicap);
            row.setOddsjingcai(oddsJingcai);
            row.setOddsrangqiu(oddsRangqiu);
            row.setHotflag(arr[i].hotFlag);

            listArr.push(row);
        }
        push.setRlscheduleinfoList(listArr);
        var buf = push.serializeBinary();
        io.sockets.in('RealFootMainInfo').emit(pbSvrcli.Push_ScheduleInfo.Type.ID, buf, buf.length);
    }

    //刷新停止下注的赛程列表
    this.refreshStopBetSchedule = function (data) {
        var effectiveData = [];
        for (var i = 0; i < data.id.length; i++) {
            if(mapScheduleList.get(data.id[i]) != null &&
               mapBetNumList.get(data.id[i]) != null){
                mapScheduleList.delete(data.id[i]);
                mapBetNumList.delete(data.id[i]);
                effectiveData.push(data.id[i]);
            }
        }
        if(effectiveData.length > 0){
            //广播
            var push = new pbSvrcli.Push_StopBetSchedules();
            var idArr = [];
            for (var i = 0; i < effectiveData.length; i++) {
                var row = new pbSvrcli.RlScheduleId();
                row.setScheduleid(effectiveData[i]);
                idArr.push(row);
            }

            push.setRlscheduleidList(idArr);
            var buf = push.serializeBinary();
            io.sockets.in('RealFootMainInfo').emit(pbSvrcli.Push_StopBetSchedules.Type.ID, buf, buf.length);
        }
    }

    //刷新公告信息 更新 增加 删除
    this.refreshAnnounce = function (data){
        var len = mapAnList.size;
        var pushFlag = 0;
        var isNull = mapAnList.get(data.id);
        if(1 == data.type){             //增加公告
            if(isNull == null){
                mapAnList.set(data.id,data.content);
                pushFlag = 1;
            }else{
                return ;
            }
        }else if(2 == data.type){      //更新公告
            mapAnList.set(data.id,data.content);
            pushFlag = 1;
        }else if(3 == data.type){      //删除公告
            if(isNull != null){
                mapAnList.delete(data.id);
                pushFlag = 1;
            }
        }
        if(pushFlag){
            //广播
            var push = new pbSvrcli.Push_Announce();
            var AnnounceArr = [];
            //删除所有公告
            if(len >0 && mapAnList.size == 0){
                push.setStatus(-1);
                var arow = new pbSvrcli.Announce();
                arow.setContent("");
                AnnounceArr.push(arow);
            }
            if(mapAnList.size >0){
                push.setStatus(0);    
                for(var value of mapAnList.values()){
                    var arow = new pbSvrcli.Announce();
                    arow.setContent(value);
                    AnnounceArr.push(arow);
                }
            }
            push.setAnnounceList(AnnounceArr);
            var buf = push.serializeBinary();
            io.sockets.in('RealFootMainInfo').emit(pbSvrcli.Push_Announce.Type.ID, buf, buf.length);
        }
    }

    //刷新比赛状态,用于结算(包含后台录入的比分)
    this.refreshScheduleState = function (data) {
        //比赛结束的总场次
        for (var i = 0; i < data.id.length; i++) {
            var score = data.score[i].split(":");
            var isCancel = data.raceStatus[i];
            var homeScore = parseInt(score[0]);
            var awayScore = parseInt(score[1]);
            var value = homeScore - awayScore;

            getOrders(value,data.id[i],isCancel);
        }
    };

    //请求竞彩足球主页面
    this.askRealFootMainInfo = function (askRealFootMainInfo, socket) {
        var player = OBJ('PlayerContainer').findPlayer(socket);
        if (null == player)
            return;
        player.outAllGroup();
        socket.join('RealFootMainInfo');

        var res = new pbSvrcli.Res_RealFootMainInfo();
        var betConfig = new pbSvrcli.RlBetConfig();

        betConfig.setBetitem1(betItem1);
        betConfig.setBetitem2(betItem2);
        betConfig.setBetitem3(betItem3);
        betConfig.setBetnumlimit(betNumLimit);
        betConfig.setBetcoinlimit(betCoinLimit);

        var arr = [];
        for (var item of mapScheduleList.values()) {
            var row = new pbSvrcli.RlScheduleInfo();
            
            var oddsJingcai = JSON.stringify(item.oddsJingcai);
            var oddsRangqiu = JSON.stringify(item.oddsRangqiu);

            row.setSceheduleid(item.sceheduleId);
            row.setPhase(item.phase);
            row.setLeagueid(getLeagueId(item.matchName));
            row.setMatchname(item.matchName);
            row.setWeekday(item.weekday);
            row.setOfficialnum(item.officialNum);
            row.setEndsale(item.endSale);
            row.setHomename(item.homeName);
            row.setAwayname(item.awayName);
            row.setHandicap(item.handicap);
            row.setOddsjingcai(oddsJingcai);
            row.setOddsrangqiu(oddsRangqiu);
            row.setHotflag(item.hotFlag);
            arr.push(row);
        }
        res.setRlscheduleinfoList(arr);
        res.setBetconfig(betConfig);
        res.setMaxleagueid(maxLeagueId);
        //公告
        var AnnounceArr = [];
        if(mapAnList.size == 0){
            var arow = new pbSvrcli.Announce();
            arow.setContent("");
            AnnounceArr.push(arow);
            res.setAnnounceList(AnnounceArr); 
        }else{
            for(var item of mapAnList.values()){
                var arow = new pbSvrcli.Announce();
                arow.setContent(item);
                AnnounceArr.push(arow);
            }
            res.setAnnounceList(AnnounceArr); 
        }
        OBJ('WsMgr').send(socket, pbSvrcli.Res_RealFootMainInfo.Type.ID, res.serializeBinary());
    };

    //请求比赛赛事投注比例
    this.askRealFootBetRateInfo = function (askRealFootBetRateInfo, socket) {
        var player = OBJ('PlayerContainer').findPlayer(socket);
        if (null == player)
            return;
        var scheduleId = askRealFootBetRateInfo.getSceheduleid();
        var betClass = askRealFootBetRateInfo.getBetclass();
        var filter = { 'id': scheduleId, "match_date": { "$gt": Date.now() }, "status": 0 };
        try {
            classSchedule.findOne(filter, scehduleSelect, function (error, docs) {
                if (error) {
                    OBJ('LogMgr').error(error);
                    return;
                } else if (null == docs) {
                    //无记录
                    var res = new pbSvrcli.Res_State();
                    res.setState(-1);
                    OBJ('WsMgr').send(socket, pbSvrcli.Res_State.Type.ID, res.serializeBinary());
                    return;
                }
                var res = new pbSvrcli.Res_RealFootBetRateInfo();
                res.setSceheduleid(scheduleId);
                res.setOddsavg(JSON.stringify(docs['odds_avg']));
                //投注比率
                var item = mapBetNumList.get(scheduleId);
                if (item == null) {
                    console.log('mapBetNumList get is null...');
                    return;
                }
                if (1 == betClass) {                  //胜平负
                    res.setBetrate(JSON.stringify(item.bet_num));
                } else if (2 == betClass) {            //让球胜平负
                    res.setBetrate(JSON.stringify(item.bet_num1));
                }
                //end 投注比例

                //历史交锋
                filter = {
                    "match_date": { "$lt": Date.now() }, "home_team": { $in: [docs['home_team'], docs['away_team']] },
                    "away_team": { $in: [docs['home_team'], docs['away_team']] }, "final_score": { $ne: '' }
                };
                var select = { "_id": 0, "home_team": 1, "away_team": 1, "final_score": 1 };
                var homeTeam = docs['home_team'];
                var awayTeam = docs['away_team'];
                classSchedule.find(filter, select, { limit: 10, sort: { 'match_num': -1 } }, function (error, historydocs) {
                    if (error) {
                        OBJ('LogMgr').error(error);
                        return;
                    } else if (0 == historydocs.length) {
                        var str = { "warTotal": 0, "homename": homeTeam, "win": 0, "flat": 0, "lose": 0 };
                        res.setHistoryinfo(JSON.stringify(str));         //'双方暂无交锋记录'     
                    } else {
                        var win = 0;
                        var flat = 0;
                        var lose = 0;
                        for (var i = 0; i < historydocs.length; i++) {
                            var score = historydocs[i]['final_score'].split(":");
                            var value = 0;
                            if (historydocs[i]['home_team'] == homeTeam) {
                                value = parseInt(score[0]) - parseInt(score[1]);
                            } else {
                                value = parseInt(score[1]) - parseInt(score[0]);
                            }
                            if (value > 0) {
                                win++;
                            } else if (value == 0) {
                                flat++;
                            } else {
                                lose++;
                            }
                        }
                        var history = { "warTotal": historydocs.length, "homename": homeTeam, "win": win, "flat": flat, "lose": lose };
                        res.setHistoryinfo(JSON.stringify(history));
                    }

                    //主队近期战绩
                    var record = {};
                    filter = { "match_date": { "$lt": Date.now() }, "$or": [{ 'home_team': homeTeam }, { 'away_team': homeTeam }], "final_score": { $ne: '' } };
                    classSchedule.find(filter, select, { limit: 10, sort: { 'match_num': -1 } }, function (error, homedocs) {
                        if (error) {
                            OBJ('LogMgr').error(error);
                            return;
                        } else if (0 == homedocs.length) {
                            record['homeWin'] = 0;
                            record['homeFlat'] = 0;
                            record['homeLose'] = 0;
                        } else {
                            var homeWin = 0;
                            var homeFlat = 0;
                            var homeLose = 0;
                            for (var i = 0; i < homedocs.length; i++) {
                                var score = homedocs[i]['final_score'].split(":");
                                var value = 0;
                                if (homedocs[i]['home_team'] == homeTeam) {
                                    value = parseInt(score[0]) - parseInt(score[1]);
                                } else {
                                    value = parseInt(score[1]) - parseInt(score[0]);
                                }
                                if (value > 0) {
                                    homeWin++;
                                } else if (value == 0) {
                                    homeFlat++;
                                } else {
                                    homeLose++;
                                }
                            }
                            record['homeWin'] = homeWin;
                            record['homeFlat'] = homeFlat;
                            record['homeLose'] = homeLose;

                            //客队近期战绩
                            filter = { "match_date": { "$lt": Date.now() }, "$or": [{ 'home_team': awayTeam }, { 'away_team': awayTeam }], "final_score": { $ne: '' } };
                            classSchedule.find(filter, select, { limit: 10, sort: { 'match_num': -1 } }, function (error, awaydocs) {
                                if (error) {
                                    OBJ('LogMgr').error(error);
                                    return;
                                } else if (0 == awaydocs.length) {
                                    record['awayWin'] = 0;
                                    record['awayFlat'] = 0;
                                    record['awayLose'] = 0;
                                } else {
                                    var awayWin = 0;
                                    var awayFlat = 0;
                                    var awayLose = 0;
                                    for (var i = 0; i < awaydocs.length; i++) {
                                        var score = awaydocs[i]['final_score'].split(":");
                                        var value = 0;
                                        if (awaydocs[i]['home_team'] == awayTeam) {
                                            value = parseInt(score[0]) - parseInt(score[1]);
                                        } else {
                                            value = parseInt(score[1]) - parseInt(score[0]);
                                        }
                                        if (value > 0) {
                                            awayWin++;
                                        } else if (value == 0) {
                                            awayFlat++;
                                        } else {
                                            awayLose++;
                                        }
                                    }
                                    record['awayWin'] = awayWin;
                                    record['awayFlat'] = awayFlat;
                                    record['awayLose'] = awayLose;
                                    res.setLastesinfo(JSON.stringify(record));
                                    OBJ('WsMgr').send(socket, pbSvrcli.Res_RealFootBetRateInfo.Type.ID, res.serializeBinary());
                                }

                            });

                        }
                    });
                });

            });
        } catch (err) {
            OBJ('LogMgr').error(err);
        }


    }
    //请求真实足球投注
    this.askRealFootBetInfo = function (askRealFootBetInfo, socket) {
        var player = OBJ('PlayerContainer').findPlayer(socket);
        if (null == player)
            return;
        //投注数目
        var betNum = askRealFootBetInfo.getBetnum();
        if (betNum < 1) {
            return;
        }
        //投注倍数
        var betTime = askRealFootBetInfo.getBettime();
        if (betTime < 1) {
            return;
        }
        var betCoin = 0;
        var betCoinArea = askRealFootBetInfo.getBetcoinarea();
        if (betCoinArea < 1 || betCoinArea > 3) {
            return;
        } else {
            if (1 == betCoinArea) {
                betCoin = betTime * betItem1 * betNum;
            } else if (2 == betCoinArea) {
                betCoin = betTime * betItem2 * betNum;
            } else {
                betCoin = betTime * betItem3 * betNum;
            }
        }
        if(player.gameCoin <betCoin ||betCoin >betCoinLimit){
            return;
        }
        //赛事id
        var betScheduleId = [];
        var idList = askRealFootBetInfo.getScheduleList();
        if (idList.length < 1 || idList.length > betNumLimit) {
            return;
        } else {
            for (var i = 0; i < idList.length; i++) {
                betScheduleId.push(idList[i]['array'][0]);
            }
        }
        //串场类型 赋值betTypes
        var betTypes = [];
        var betTypeList = askRealFootBetInfo.getBettypeList();
        for(var i=0;i<betTypeList.length;i++){
            var betTypeInfo = {};
            if(betTypeList[i]['array'][0]<0 || betTypeList[i]['array'][0] >betNumLimit){
                return ;
            }
            betTypeInfo['judged'] = betTypeList[i]['array'][0];
            betTypes.push(betTypeInfo);
        }
        //end 串场类型 赋值betTypes

        //投注详情
        var betPlanList = askRealFootBetInfo.getBetplanList();
        if (betPlanList.length != betNum) {
            return;
        }
        //先扣除用户的钱避免连续投注
        player.gameCoin -= betCoin;
        //投注处理
        dealBetInfo(betNum, betTime, betCoin, betScheduleId,betTypes, betPlanList, player);
    }

    //请求真实足球我的竞猜
    this.askRealFootballBetRecords = function (askRealFootballBetRecords, socket) {
        socket.leave('RealFootMainInfo');
        var player = OBJ('PlayerContainer').findPlayer(socket);
        if (null == player)
            return;
        var type = askRealFootballBetRecords.getType();
        if(type<0 || type>2){
            return;
        }
        var page = askRealFootballBetRecords.getPage();
        if (page < 0) {
            return;
        }
        var filter = {'user_id': player.userId};
        if(type == 1){
            filter['status'] = 1;
        }else if(type == 2){
            filter['status'] = 0;
        }
        try {
            classLogRealBet.find(filter, null, {
                skip: (page) * limit,
                limit: limit, sort: { 'bet_date': -1 }
            }, function (error, docs) {
                if (error) {
                    OBJ('LogMgr').error(error);
                }
                if (null == docs || 0 == docs.length) {
                    //无记录
                    var res = new pbSvrcli.Res_State();
                    res.setState(-1);
                    OBJ('WsMgr').send(socket, pbSvrcli.Res_State.Type.ID, res.serializeBinary());
                    return;
                }
                var res = new pbSvrcli.Res_RealFootBetRecords();
                var arr = [];
                for (var item of docs) {
                    var row = new pbSvrcli.RlBetRecordInfo();
                    row.setRecordid(item.out_trade_no);
                    row.setBettype(item.bet_types[0].judged);
                    row.setJingcaitype(item.jingcai_type);
                    row.setBetdate(item.bet_date.toLocaleString());
                    row.setBetcoin(item.bet_coin);
                    row.setDistributecoin(item.realDistrobute_coin);
                    row.setBetstatus(item.status);
                    row.setTeamname(item.bet_items[0].team_name);
                    arr.push(row);
                }
                res.setBetrecordinfoList(arr);
                player.send(pbSvrcli.Res_RealFootBetRecords.Type.ID, res.serializeBinary());
            });
        } catch (err) {
            OBJ('LogMgr').error(err);
        }

    }

    //请求真实足球的竞猜详情
    this.askRealFootBetDetails = function(askRealFootBetDetails,socket){
        var player = OBJ('PlayerContainer').findPlayer(socket);
        if (null == player)
            return;
        socket.leave('RealFootMainInfo');
        var recordId = askRealFootBetDetails.getRecordid();
        if (null  == recordId) {
            return;
        }

        var filter = {"out_trade_no":recordId};
        var select = {"bet_types":1,"bet_items":1,"out_trade_no":1};

        try{
            classLogRealBet.findOne(filter,select,function(error,docs){
                if(error){
                    OBJ('LogMgr').error(error);
                }
                if(null == docs){
                    //无记录
                    var res = new pbSvrcli.Res_State();
                    res.setState(-1);
                    OBJ('WsMgr').send(socket, pbSvrcli.Res_State.Type.ID, res.serializeBinary());
                    return ;
                }
                var res = new pbSvrcli.Res_RealFootBetDetails();

                res.setRecordid(docs['out_trade_no']);
                res.setMatchdate(docs['bet_items'][0]['match_date'].toLocaleString());
                var betTypesArr = [];
                for(var item of docs['bet_types']){
                    var row = new pbSvrcli.RlbetType();
                    row.setBettype(item.judged);
                    betTypesArr.push(row);
                }
                res.setBettypeList(betTypesArr);

                var betItemsArr = [];
                for (var item of docs['bet_items']) {
                    var row = new pbSvrcli.RlBetItems();
                    row.setTeamname(item.team_name);
                    row.setHandicap(item.handicap);
                    var betContentArr = [];
                    for(var cItem of item['bet_content']){
                        var cRow = new pbSvrcli.RlBetContent();
                        cRow.setBetclass(cItem.bet_class);
                        if(1 == cItem.bet_class){
                            cRow.setOdds(JSON.stringify(item.odds));
                        }else if(2 == cItem.bet_class){
                            cRow.setOdds(JSON.stringify(item.rangqiu_odds));
                        }
                        cRow.setBetarea(JSON.stringify(cItem.bet_area));
                        cRow.setResult(cItem.schedule_result);
                        betContentArr.push(cRow);
                    }
                    row.setBetcontentList(betContentArr);
                    betItemsArr.push(row);
                }
                res.setBetitemsList(betItemsArr);
                player.send(pbSvrcli.Res_RealFootBetDetails.Type.ID, res.serializeBinary());
            }); 
        }catch(err){
            OBJ('LogMgr').error(err);
        }
    }

    //请求真实足球比赛记录
    this.askRealFootRecords = function (askRealFootRecords, socket) {
        var player = OBJ('PlayerContainer').findPlayer(socket);
        if (null == player)
            return;
        socket.leave('RealFootMainInfo');

        var filter = { "match_date": { "$lt": Date.now() }, "display_flag": 1 };
        var select = {
            "_id": 0, "phase": 1, "match_date": 1, "official_num": 1, "match_name": 1,
            "weekday": 1, "home_team": 1, "away_team": 1, "first_half": 1, "final_score": 1
        };
        try {
            classSchedule.findOne(filter, select, { sort: { 'phase': -1 } }, function (error, docs) {
                if (error) {
                    OBJ('LogMgr').error(error);
                }

                if (null == docs) {
                    //无记录
                    var res = new pbSvrcli.Res_State();
                    res.setState(-1);
                    OBJ('WsMgr').send(socket, pbSvrcli.Res_State.Type.ID, res.serializeBinary());
                    return;
                }
                //计算5天前的phase
                var phase = docs['phase'].toString();
                var timeStime = Func.getStamp(phase);
                var before5day = timeStime - 4 * 24 * 60 * 60 * 1000;
                var phaseBefore5day = parseInt(Func.getDate(before5day));

                filter = { "match_date": { "$lt": Date.now() }, "display_flag": 1, "phase": { "$gte": phaseBefore5day, "$lte": docs['phase'] } };
                classSchedule.find(filter, select, { sort: { 'match_num': -1 } }, function (error, racedocs) {
                    if (error) {
                        OBJ('LogMgr').error(error);
                    } else if (racedocs.length > 0) {
                        var res = new pbSvrcli.Res_RealFootRecords();
                        var arr = [];
                        for (var item of racedocs) {
                            var row = new pbSvrcli.RlScheduleRecords();
                            row.setPhase(item.phase);
                            row.setMatchname(item.match_name);
                            row.setOfficialnum(item.official_num);
                            row.setWeekday(item.weekday);
                            row.setEndsale(item.match_date.toLocaleString());
                            row.setHomename(item.home_team);
                            row.setAwayname(item.away_team);
                            row.setFirsthalf(item.first_half);
                            row.setFinalscore(item.final_score);
                            arr.push(row);
                        }
                        res.setSchedulerecordsList(arr);
                        player.send(pbSvrcli.Res_RealFootRecords.Type.ID, res.serializeBinary());
                    }
                });
            });
        } catch (err) {
            OBJ('LogMgr').error(err);
        }

    }

    //接收投注赛事人数更新
    this.receiveBetInfo = function (data) {
        var serverId = data.serverId;
        if (serverId == SERVERID) {
            return;
        } else {
            var betRateArr = data.pushBetRate;
            for (var i = 0; i < betRateArr.length; i++) {
                var item = mapBetNumList.get(betRateArr[i].id);
                if (item == null) {
                    console.log('receiveBetInfo mapBetNumList get is null...');
                    return;
                }
                var docValue = { bet_num: { h: 0, d: 0, a: 0 }, bet_num1: { h: 0, d: 0, a: 0 } };
                docValue.bet_num = betRateArr[i].bet_num;
                docValue.bet_num1 = betRateArr[i].bet_num1;
                mapBetNumList.set(betRateArr[i].id, docValue);
            }
        }

    }

    //中奖信息接收
    this.dealWinning = function (data) {
        var player = data.player;
        //本机上搜索一遍
        if (null == player) {
            var userid = data.userid;
            player = OBJ('PlayerContainer').findPlayerByUserId(userid);
        }
        //在本机上
        if (null != player) {
            OBJ('RpcModule').req2Wallet('WalletSvrAgent', 'reqGetCoin', {
                userid: player.userId
            }, function (data) {
                
                var winCoin = parseInt(data.balance - player.gameCoin + 0.1);     //0.1是为了修正浮点值精度问题
                if(winCoin >0){
                    var push = new pbSvrcli.Push_WinBet();
                    push.setWincoin(winCoin);    
                    push.setCoin(data.balance);
                    player.send(pbSvrcli.Push_WinBet.Type.ID, push.serializeBinary());
                    player.gameCoin = parseInt(parseInt(data.balance)+0.1);
                }
            });
        }
    }

    //获取某注内的某赛事的投注信息
    function getBetScheduleInfo(scheduleId, betClass, betArea) {
        var scheduleInfo = {};
        scheduleInfo['scheduleId'] = scheduleId;
        if (1 == betClass) {
            scheduleInfo['wfl'] = 1;
            scheduleInfo['wfl_' + betArea] = 1;
            scheduleInfo['rangqiuwfl'] = 0;
            scheduleInfo['rangqiuwfl_1'] = 0;
            scheduleInfo['rangqiuwfl_2'] = 0;
            scheduleInfo['rangqiuwfl_3'] = 0;
            if (1 == betArea) {
                scheduleInfo['wfl_2'] = 0;
                scheduleInfo['wfl_3'] = 0;
            } else if (2 == betArea) {
                scheduleInfo['wfl_1'] = 0;
                scheduleInfo['wfl_3'] = 0;
            } else if (3 == betArea) {
                scheduleInfo['wfl_2'] = 0;
                scheduleInfo['wfl_1'] = 0;
            }
        } else if (2 == betClass) {
            scheduleInfo['rangqiuwfl'] = 1;
            scheduleInfo['rangqiuwfl_' + betArea] = 1;
            scheduleInfo['wfl'] = 0;
            scheduleInfo['wfl_1'] = 0;
            scheduleInfo['wfl_2'] = 0;
            scheduleInfo['wfl_3'] = 0;
            if (1 == betArea) {
                scheduleInfo['rangqiuwfl_2'] = 0;
                scheduleInfo['rangqiuwfl_3'] = 0;
            } else if (2 == betArea) {
                scheduleInfo['rangqiuwfl_1'] = 0;
                scheduleInfo['rangqiuwfl_3'] = 0;
            } else if (3 == betArea) {
                scheduleInfo['rangqiuwfl_1'] = 0;
                scheduleInfo['rangqiuwfl_2'] = 0;
            }
        }
        return scheduleInfo;
    }

    //获取某赛事的投注信息(所有投注内该赛事的所有情况)
    function getScheduleInfo(betContent) {
        var betContentArr = [];
        //有投胜平负玩法
        if (betContent['wfl']) {
            var betContentInfo = {};
            var betArea = {h:0,d:0,a:0};
            betContentInfo['bet_class'] = 1;
            //有投主胜
            if (betContent['wfl_1']) {
                betArea.h = 1;
            }
            //有投平
            if (betContent['wfl_2']) {
                betArea.d = 1;
            }
            //有投主负
            if (betContent['wfl_3']) {
                betArea.a = 1;
            }
            betContentInfo['schedule_result'] = 0;
            betContentInfo['bet_area'] = betArea;
            betContentArr.push(betContentInfo);
        }
        //有投让球胜平负玩法
        if (betContent['rangqiuwfl']) {
            var betContentInfo = {};
            var betArea = {h:0,d:0,a:0};
            betContentInfo['bet_class'] = 2;
            //有投让球胜
            if (betContent['rangqiuwfl_1']) {
                betArea.h = 1;
            }
            //让球平
            if (betContent['rangqiuwfl_2']) {
                betArea.d = 1;
            }
            //让球负
            if (betContent['rangqiuwfl_3']) {
                betArea.a = 1;
            }
            betContentInfo['schedule_result'] = 0;
            betContentInfo['bet_area'] = betArea;
            betContentArr.push(betContentInfo);
        }
        return betContentArr;

    }


    //获取投注赛事数组下标 
    function getIdIndex(betScheduleId, scheduleId) {
        var index = -1;
        for (var i = 0; i < betScheduleId.length; i++) {
            if (betScheduleId[i] == scheduleId) {
                index = i;
                break;
            }
        }
        return index;
    }


    //订单处理投注信息
    function dealBetInfo(betNum, betTime, betCoin, betScheduleId,betTypes, betPlanList, player) {
        var jingcaiType = 0;                //竞猜类型 
        var lastBetClass = 0;
        var distributeCoin = 0.0;
        var betPlanArr = [];                //投注详情数组
        var betContentArr = [];             //赛事投注情况
        var betRateArr = [];                //该订单赛事投注人数情况
        //初始化数组  
        for(var i =0 ;i<betScheduleId.length;i++){
            var betRate = { id: 0, bet_num: { h: 0, d: 0, a: 0 }, bet_num1: { h: 0, d: 0, a: 0 } };
            var scheduleInfo = {"scheduleId":0,"wfl":0,"wfl_1":0,"wfl_2":0,"wfl_3":0,"rangqiuwfl":0,"rangqiuwfl_1":0,"rangqiuwfl_2":0,"rangqiuwfl_3":0};
            betRateArr.push(betRate);
            betContentArr.push(scheduleInfo);
        }  
        //end 初始化数组  

        //该订单总的注数
        for (var i = 0; i < betNum; i++) {
            var betPlanInfo = {};
            var betInfoArr = [];  //每注详情数组
            var betInfoList = betPlanList[i]['array'][0];
            //每注的投注详情
            for (var j = 0; j < betInfoList.length; j++) {
                var betInfo = {};
                var betRateInfo = {};
                var scheduleId = betInfoList[j][0];
                if (scheduleId < 0) {
                    return;
                }
                var betClass = betInfoList[j][1];
                if (betClass < 1 || betClass > 2) {
                    return;
                }
                var betArea = betInfoList[j][2];
                if (betArea < 1 || betArea > 3) {
                    return;
                }
                //竞猜类型
                if (lastBetClass != 0 && lastBetClass != betClass
                    && jingcaiType != 3) {
                    jingcaiType = 3;
                } else if (jingcaiType != 3) {
                    jingcaiType = betClass;
                }
                lastBetClass = betClass;
                //end 竞猜类型

                //统计每个赛事的支持人数
                var index = getIdIndex(betScheduleId, scheduleId);
                if (index == -1) {
                    return;
                }
                betRateArr[index].id = scheduleId;
                if (1 == betClass) {
                    if (1 == betArea) {
                        betRateArr[index].bet_num.h += 1;
                    } else if (2 == betArea) {
                        betRateArr[index].bet_num.d += 1;
                    } else if (3 == betArea) {
                        betRateArr[index].bet_num.a += 1;
                    }
                } else if (2 == betClass) {
                    if (1 == betArea) {
                        betRateArr[index].bet_num1.h += 1;
                    } else if (2 == betArea) {
                        betRateArr[index].bet_num1.d += 1;
                    } else if (3 == betArea) {
                        betRateArr[index].bet_num1.a += 1;
                    }
                }
                //end 统计每个赛事的支持人数

                //赋值某赛事都投了哪些区域
                var scheduleInfo = getBetScheduleInfo(scheduleId, betClass, betArea);
                if(betContentArr[index]['scheduleId'] == scheduleInfo['scheduleId']){
                    if(1 == betClass){
                        betContentArr[index]['wfl'] = 1;
                        betContentArr[index]['wfl_' + betArea] = 1;
                    }else if(2 == betClass){
                        betContentArr[index]['rangqiuwfl'] = 1;
                        betContentArr[index]['rangqiuwfl_' + betArea] = 1;
                    }
                }else{
                    betContentArr[index]['scheduleId'] = scheduleInfo['scheduleId'];
                    betContentArr[index]['wfl'] = scheduleInfo['wfl'];
                    betContentArr[index]['wfl_1'] = scheduleInfo['wfl_1'];
                    betContentArr[index]['wfl_2'] = scheduleInfo['wfl_2'];
                    betContentArr[index]['wfl_3'] = scheduleInfo['wfl_3'];
                    betContentArr[index]['rangqiuwfl'] = scheduleInfo['rangqiuwfl'];
                    betContentArr[index]['rangqiuwfl_1'] = scheduleInfo['rangqiuwfl_1'];
                    betContentArr[index]['rangqiuwfl_2'] = scheduleInfo['rangqiuwfl_2'];
                    betContentArr[index]['rangqiuwfl_3'] = scheduleInfo['rangqiuwfl_3'];
                }
                //end 赋值某赛事都投了哪些区域

                betInfo['schedule_id'] = scheduleId;
                betInfo['bet_class'] = betClass;
                betInfo['bet_area'] = betArea;
                betInfo['result'] = 0;
                betInfoArr.push(betInfo);
                betPlanInfo['bet_info'] = betInfoArr;
            }
            betPlanArr.push(betPlanInfo);
        }

        try {
            var filter = { 'id': { "$in": betScheduleId }, "match_date": { "$gt": Date.now() }, "status": 0 };
            var select = {
                "_id": 0, "id": 1, "home_team": 1, "away_team": 1, "odds_jingcai": 1, "odds_rangqiu": 1,
                "odds_jingcai_admin": 1, "odds_rangqiu_admin": 1, "handicap": 1, "input_flag": 1,
                "bet_num": 1, "bet_num1": 1, "match_date": 1,"phase":1,"official_num":1,"weekday":1
            }
            classSchedule.find(filter, select, function (error, docs) {
                if (error) {
                    OBJ('LogMgr').error(error);
                    var res = new pbSvrcli.Res_RealFootBetInfo();
                    res.setStatus(-1);
                    res.setCoin(player.gameCoin);
                    player.send(pbSvrcli.Res_RealFootBetInfo.Type.ID, res.serializeBinary());
                    return;
                } else if (docs.length != betScheduleId.length) {
                    return;
                }
                //赋值betItems
                var betItems = [];
                for (var i = 0; i < docs.length; i++) {
                    var betItemsInfo = {};
                    betItemsInfo['schedule_id'] = docs[i]['id'];
                    betItemsInfo['phase'] = docs[i]['phase'];
                    betItemsInfo['official_num'] = docs[i]['weekday'] + docs[i]['official_num'];
                    betItemsInfo['match_date'] = docs[i]['match_date'];
                    betItemsInfo['team_name'] = docs[i]['home_team'] + ' vs ' + docs[i]['away_team'];
                    if (docs[i]['input_flag']) {
                        betItemsInfo['odds'] = docs[i]['odds_jingcai_admin'][0];
                        betItemsInfo['rangqiu_odds'] = docs[i]['odds_rangqiu_admin'][0];
                    } else {
                        betItemsInfo['odds'] = docs[i]['odds_jingcai'][0];
                        betItemsInfo['rangqiu_odds'] = docs[i]['odds_rangqiu'][0];
                    }

                    betItemsInfo['handicap'] = docs[i]['handicap'];
                    betItemsInfo['is_settlement'] = 0;
                    var betContent = [];
                    for (var k = 0; k < betContentArr.length; k++) {
                        if (betContentArr[k]['scheduleId'] == docs[i]['id']) {
                            var betContent = getScheduleInfo(betContentArr[k]);
                            betItemsInfo['bet_content'] = betContent;
                        }
                    }
                    betItems.push(betItemsInfo);
                }
                //end 赋值betItems

                //遍历每注信息
                var betPlan = [];
                for (var i = 0; i < betNum; i++) {
                    var betPlanInfo = {};
                    var oddsPerBet = 1.0;                 //每注总赔率
                    var distributeCoinPreBet = 1.0;
                    betPlanInfo['bet_index'] = i + 1;
                    betPlanInfo['bet_type'] = betPlanArr[i]['bet_type'];
                    betPlanInfo['status'] = 0;
                    betPlanInfo['total_num'] = 0;
                    betPlanInfo['bet_info'] = betPlanArr[i]['bet_info'];

                    for (var j = 0; j < betPlanArr[i]['bet_info'].length; j++) {
                        for (var k = 0; k < betItems.length; k++) {
                            if (betPlanArr[i]['bet_info'][j]['schedule_id'] == betItems[k]['schedule_id']) {
                                //胜平负
                                if (1 == betPlanArr[i]['bet_info'][j]['bet_class']) {
                                    if (1 == betPlanArr[i]['bet_info'][j]['bet_area']) {
                                        oddsPerBet *= betItems[j]['odds'].h;
                                    } else if (2 == betPlanArr[i]['bet_info'][j]['bet_area']) {
                                        oddsPerBet *= betItems[j]['odds'].d;
                                    } else if (3 == betPlanArr[i]['bet_info'][j]['bet_area']) {
                                        oddsPerBet *= betItems[j]['odds'].a;
                                    }
                                }
                                //让球胜平负
                                else if (2 == betPlanArr[i]['bet_info'][j]['bet_class']) {
                                    if (1 == betPlanArr[i]['bet_info'][j]['bet_area']) {
                                        oddsPerBet *= betItems[j]['rangqiu_odds'].h;
                                    } else if (2 == betPlanArr[i]['bet_info'][j]['bet_area']) {
                                        oddsPerBet *= betItems[j]['rangqiu_odds'].d;
                                    } else if (3 == betPlanArr[i]['bet_info'][j]['bet_area']) {
                                        oddsPerBet *= betItems[j]['rangqiu_odds'].a;
                                    }
                                }
                            }
                        }
                    }
                    betPlanInfo['total_odds'] = oddsPerBet;
                    betPlan.push(betPlanInfo);
                    //每注的派发金额
                    distributeCoinPreBet = oddsPerBet * betCoin / betNum;
                    //总的派发金额
                    distributeCoin += distributeCoinPreBet;
                }
                //end 遍历每注信息

                //生成唯一ID
                //var uid = uuid.v4();
                var orderStamp = Date.now();
                var uid = getOrderId(player.userId.toString(),orderStamp);
                OBJ('RpcModule').req2Wallet('WalletSvrAgent', 'reqBet', {
                    userid: player.userId,
                    outType: 3,
                    uuid: uid,
                    betCoin: betCoin.toString()
                }, function (data) {
                    var res = new pbSvrcli.Res_RealFootBetInfo();
                    player.gameCoin = data.balance;
                    res.setStatus(data.res);
                    res.setCoin(data.balance);
                    //投注
                    player.send(pbSvrcli.Res_RealFootBetInfo.Type.ID, res.serializeBinary());

                    //生成投注记录
                    var modelLogRealBet = OBJ('DbMgr').getModel(Schema.LogRealBet());
                    modelLogRealBet.out_trade_no = uid;
                    modelLogRealBet.user_id = player.userId;
                    modelLogRealBet.user_name = player.userName;
                    modelLogRealBet.bet_date = orderStamp;
                    modelLogRealBet.bet_server = global.SERVERID;
                    modelLogRealBet.bet_num = betNum;
                    modelLogRealBet.win_num = 0;
                    modelLogRealBet.multiple = betTime;
                    modelLogRealBet.jingcai_type = jingcaiType;
                    modelLogRealBet.perbet_coin = betCoin / betNum;
                    modelLogRealBet.bet_coin = betCoin;
                    modelLogRealBet.distribute_coin = parseInt(distributeCoin + 0.1);
                    modelLogRealBet.realDistrobute_coin = 0;
                    modelLogRealBet.before_bet_coin = parseInt(player.gameCoin) + parseInt(betCoin);
                    modelLogRealBet.status = 0;
                    modelLogRealBet.bet_types = betTypes;
                    modelLogRealBet.bet_items = betItems;
                    modelLogRealBet.bet_plan = betPlan;
                    modelLogRealBet.trade_no = data.trade_no;
                    modelLogRealBet.trade_endno = '';
                    modelLogRealBet.save(function (err) {
                        if (err) {
                            OBJ('LogMgr').error(err);
                        }
                    });
                    //更新投注内存的投注人数后,推送给数据中心更新数据库同时广播给其它游戏服
                    updateBetRateInfo(betRateArr);
                });
            });
        } catch (err) {
            OBJ('LogMgr').error(err);
        }
    }

    //转字母
    function toLetter(digital){
        var char = '';
        switch(digital){
            case '0':
            {
                char = 'W';
                break;
            }
            case '1':
            {
                char = 'L';
                break;
            }
            case '2':
            {
                char = 'P';
                break;
            }
            case '3':
            {
                char = 'E';
                break;
            }
            case '4':
            {
                char = 'A';
                break;
            }
            case '5':
            {
                char = 'R';
                break;
            }
            case '6':
            {
                char = 'Z';
                break;
            }
            case '7':
            {
                char = 'Q';
                break;
            }
            case '8':
            {
                char = 'K';
                break;
            }
            case '9':
            {
                char = 'H';
                break;
            }
        }
        return char;
    }

    //获取订单id的用户码
    function getCodebyUserId(strUserId){
        var strCode = '';
        for(var i = 0;i<strUserId.length;i++){
            strCode += toLetter(strUserId[i]);
        }
        if(strCode.length < 5){    //不足5位的补
            if(strCode.length == 4){
                strCode += 'X';
            }else if(strCode.length == 3){
                strCode += 'XM';
            }else if(strCode.length ==2){
                strCode += 'MYX';
            }else{
                strCode += 'MXYN';
            }
        }
        return strCode;

    }

    //获取流水号
    function getSerial(strOrderId){
        var serialNum = '';
        var len = strOrderId.length;
        if(len == 1){
            serialNum += '000'+strOrderId;
        }else if(len == 2){
            serialNum += '00'+strOrderId;
        }else if(len == 3){
            serialNum += '0'+strOrderId;
        }else{
            serialNum += strOrderId;
        }
        return serialNum;
    }

    //获取订单id
    function getOrderId(strUserId,orderStamp){
        var orderSeq = '';

        var userCode = getCodebyUserId(strUserId);
        
        var date = Func.getDate(orderStamp);
        if(parseInt(date) != betMatchDate){
            betMatchDate = parseInt(date);
            orderId = 1;
        }else{
            orderId++;
        }
        var serialNum = getSerial(orderId.toString());
        orderSeq = userCode + service + date + 'JC' + serialNum;
        return orderSeq;
    }

    //更新投注人数
    function updateBetRateInfo(betRateArr) {
        //更新mapBetNumList值
        var pushBetRateArr = [];
        for (var i = 0; i < betRateArr.length; i++) {
            var docValue = { bet_num: { h: 0, d: 0, a: 0 }, bet_num1: { h: 0, d: 0, a: 0 } };
            var betRateInfo = { id: 0, bet_num: { h: 0, d: 0, a: 0 }, bet_num1: { h: 0, d: 0, a: 0 } };
            var item = mapBetNumList.get(betRateArr[i].id);
            if (item == null) {
                console.log('updateBetRateInfo mapBetNumList get is null...');
                return;
            }
            docValue.bet_num.h = betRateArr[i].bet_num.h + item.bet_num.h;
            docValue.bet_num.d = betRateArr[i].bet_num.d + item.bet_num.d;
            docValue.bet_num.a = betRateArr[i].bet_num.a + item.bet_num.a;
            docValue.bet_num1.h = betRateArr[i].bet_num1.h + item.bet_num1.h;
            docValue.bet_num1.d = betRateArr[i].bet_num1.d + item.bet_num1.d;
            docValue.bet_num1.a = betRateArr[i].bet_num1.a + item.bet_num1.a;

            betRateInfo.id = betRateArr[i].id;
            betRateInfo.bet_num = docValue.bet_num;
            betRateInfo.bet_num1 = docValue.bet_num1;
            mapBetNumList.set(betRateArr[i].id, docValue);
            pushBetRateArr.push(betRateInfo);
        }

        //推送给数据中心
        OBJ('RpcModule').send2RealDataCenter('RealFootball', 'updateSupportRate', {
            serverId: SERVERID,
            pushBetRate: pushBetRateArr
        });

        //广播其它游戏服
        OBJ('RpcModule').broadcastOtherGameServer('RealFootball', 'receiveBetInfo', {
            serverId: SERVERID,
            pushBetRate: pushBetRateArr
        });
    }

    //取消的赛事获取原有投注时的赔率
    function getCancleOdds(betInfo, odds, rangqiuOdds) {
        if (1 == betInfo['bet_class']) {
            if (1 == betInfo['bet_area']) {
                oddsInfo = odds['h'];
            } else if (2 == betInfo['bet_area']) {
                oddsInfo = odds['d'];
            } else if (3 == betInfo['bet_area']) {
                oddsInfo = odds['a'];
            }

        } else if (2 == betInfo['bet_class']) {
            if (1 == betInfo['bet_area']) {
                oddsInfo = rangqiuOdds['h'];
            } else if (2 == betInfo['bet_area']) {
                oddsInfo = rangqiuOdds['d'];
            } else if (3 == betInfo['bet_area']) {
                oddsInfo = rangqiuOdds['a'];
            }
        }
        return oddsInfo;
    }

    //获取订单
    function getOrders(value,scheduleId,isCancel){
        try {
            var filter = {
                "bet_items": { "$elemMatch": { "schedule_id": scheduleId } },
                "bet_server": global.SERVERID
            };
            classLogRealBet.find(filter, null, function (error, docs) {
                if (error) {
                    OBJ('LogMgr').error(error);
                } else if (docs.length > 0) {
                    processOrders(value, docs, scheduleId, isCancel);
                }
            });
        } catch (err) {
            OBJ('LogMgr').error(err);
        }
    }

    //处理该赛事相关的订单
    function processOrders(scoreValue, docs, scheduleId, isCancel) {
        try {
            for (var i = 0; i < docs.length; i++) {                                                         //赛事id为scheduleId投注的总订单数
                var orderInfo = {};
                orderInfo['out_trade_no'] = docs[i]['out_trade_no'];
                orderInfo['user_id'] = docs[i]['user_id'];
                orderInfo['win_num'] = docs[i]['win_num'];
                orderInfo['status'] = docs[i]['status'];
                orderInfo['realDistrobute_coin'] = docs[i]['realDistrobute_coin'];
                //让球数
                var handicap;
                var odds;
                var rangqiuOdds;
                var betItemsInfo = {};
                //订单内已经完成的赛事数
                var finishedTotal = 0;

                var scheduleNum = docs[i]['bet_items'].length;                                       //订单内投的赛事数
                //赛事id索引                                                       
                for (var a = 0; a < scheduleNum; a++) {
                    if (docs[i]['bet_items'][a]['schedule_id'] == scheduleId) {
                        finishedTotal++;
                        var betContent = [];
                        betItemsInfo['index'] =a;
                        betItemsInfo['is_settlement'] = 1;
                        //取消的赛事,要重新计算金额
                        if (isCancel) {
                            odds = docs[i]['bet_items'][a]['odds'];
                            rangqiuOdds = docs[i]['bet_items'][a]['rangqiu_odds'];
                        }
                        //获取让球数
                        handicap = docs[i]['bet_items'][a]['handicap'];
                        //比赛结果
                        var sResult = scheduleResult(scoreValue, handicap, isCancel, docs[i]['bet_items'][a]['bet_content']);
                        var betContentNum = docs[i]['bet_items'][a]['bet_content'].length;           //该赛事在该订单总存在的玩法
                        if (1 == sResult['wfl']) {
                            var betContentInfo = {};
                            betContentInfo['schedule_result'] = sResult['wflResult'];
                            betContent.push(betContentInfo);
                        }
                        if (1 == sResult['rangqiuwfl']) {
                            var betContentInfo = {};
                            betContentInfo['schedule_result'] = sResult['rangqiuwflResult'];
                            betContent.push(betContentInfo);
                        }
                        betItemsInfo['bet_content'] = betContent;
                    } else {
                        if (1 == docs[i]['bet_items'][a]['is_settlement']) {
                            finishedTotal++;
                        }
                    }
                }
                //结算每个订单该赛事的投注
                var betPlan = [];
                var betNumPerOrder = docs[i]['bet_plan'].length;                                    //该订单内的投注总数
                for (var j = 0; j < betNumPerOrder; j++) {
                    //该注已开过奖
                    if (docs[i]['bet_plan'][j]['status'] != 0) {
                        continue;
                    }

                    //结算每注内的该赛事
                    var betPlanInfo = {};
                    betPlanInfo['bet_index'] = j+1;
                    var idNumPerBet = docs[i]['bet_plan'][j]['bet_info'].length;                   //该注有几场赛事
                    for (var k = 0; k < idNumPerBet; k++) {
                        var result = {};
                        if (scheduleId == docs[i]['bet_plan'][j]['bet_info'][k]['schedule_id']) {
                            //该注有投该赛事
                            var betInfo = [];
                            //判断该注该赛事区域投注结果
                            result = betResult(scoreValue, docs[i]['bet_plan'][j]['bet_info'][k], handicap, isCancel);
                            betInfo['index'] = k;
                            betPlanInfo['total_odds'] = docs[i]['bet_plan'][j]['total_odds'];
                            betPlanInfo['total_num'] = docs[i]['bet_plan'][j]['total_num'];
                            //未投中区域
                            if (0 == result['status']) {
                                betInfo['result'] = 2;
                                betPlanInfo['status'] = 2;
                            }
                            //投中区域
                            else if (1 == result['status']) {
                                if (isCancel) {
                                    var oddsInfo = getCancleOdds(docs[i]['bet_plan'][j]['bet_info'][k], odds, rangqiuOdds);
                                    betPlanInfo['total_odds'] = docs[i]['bet_plan'][j]['total_odds'] / oddsInfo;
                                }
                                betInfo['result'] = 1;
                                betPlanInfo['status'] = 0;
                                betPlanInfo['total_num'] += 1;
                            }
                            betPlanInfo['bet_info'] = betInfo;

                            //该注所有赛事都结束了,且全部投中
                            if (idNumPerBet == betPlanInfo['total_num']) {
                                var rewardCoin = 0;
                                //该注奖励金额
                                betPlanInfo['status'] = 1;
                                //取消赛事的赔率按1计算
                                if (isCancel) {
                                    rewardCoin = docs[i]['perbet_coin'] * betPlanInfo['total_odds'];
                                } else {
                                    rewardCoin = docs[i]['perbet_coin'] * docs[i]['bet_plan'][j]['total_odds'];
                                }
                                orderInfo['realDistrobute_coin'] = docs[i]['realDistrobute_coin'] + rewardCoin;
                                orderInfo['win_num'] += 1;
                            }
                            betPlan.push(betPlanInfo);
                        }
                    }
                }

                //该订单内所有赛事都结束
                if (finishedTotal == scheduleNum) {
                    orderInfo['finished'] = 1;
                    if (orderInfo['win_num'] > 0) {
                        orderInfo['status'] = 1;
                    } else {
                        orderInfo['status'] = 2;
                    }
                } else {
                    orderInfo['finished'] = 0;
                    orderInfo['status'] = 0;
                }
                orderInfo['realDistrobute_coin'] = parseInt(orderInfo['realDistrobute_coin']+0.1);
                //更新LogRealBet状态
                updateLogRealBetStatus(orderInfo, betItemsInfo, betPlan,docs[i]);
            }
        } catch (err) {
            OBJ('LogMgr').error(err);
        }
    }

    //更新LogRealBet状态
    function updateLogRealBetStatus(orderInfo, betItemsInfo, betPlan,doc) {
        //更新LogRealBet表的记录
        try{
            var index = betItemsInfo['index'];
            doc.status = orderInfo['status'];
            doc.win_num = orderInfo['win_num'];
            doc.realDistrobute_coin = orderInfo['realDistrobute_coin'];
            doc.bet_items[index].is_settlement = betItemsInfo['is_settlement'];

            doc.markModified('bet_items');
            for(var i = 0;i<betItemsInfo['bet_content'].length;i++){
                doc.bet_items[index].bet_content[i].schedule_result = betItemsInfo['bet_content'][i]['schedule_result'];
            }

            doc.markModified('bet_plan');
            for(var i =0;i<betPlan.length;i++){
                var betindex = betPlan[i]['bet_index'] - 1;
                doc.bet_plan[betindex].status = betPlan[i]['status'];
                doc.bet_plan[betindex].total_odds = betPlan[i]['total_odds'];
                doc.bet_plan[betindex].total_num = betPlan[i]['total_num'];

                var betInfoIndex = betPlan[i]['bet_info']['index'];
                doc.bet_plan[betindex].bet_info[betInfoIndex].result = betPlan[i]['bet_info']['result'];
            }
            if(0 == orderInfo['finished']){
                doc.save();
            }
           
            //向钱包请求,更新用户金币
            if (1 == orderInfo['finished']) {
                OBJ('RpcModule').req2Wallet('WalletSvrAgent', 'reqAddMoney', {
                    userid: orderInfo['user_id'],
                    outType: 5,
                    uuid: orderInfo['out_trade_no'],
                    betCoin: orderInfo['realDistrobute_coin'].toString(),
                }, function (data) {
                    if (0 == data.res) {
                        //更新订单
                        doc.trade_endno = data.trade_no;
                        doc.save();
                        //广播中奖信息
                        var player = OBJ('PlayerContainer').findPlayerByUserId(orderInfo['user_id']);
                        if (null == player) {
                            //如果不在线或在其他游戏服上，则广播
                            OBJ('RpcModule').broadcastOtherGameServer('RealFootball', 'dealWinning', {
                                userid: orderInfo['user_id'],
                                player: null
                            });
                        } else {
                            //在这台机子上，则直接处理
                            self.dealWinning({
                                userid: orderInfo['user_id'],
                                player: player
                            });
                        }

                    } else {
                        //更新结算失败
                        console.log('require out_trade_no'+orderInfo['out_trade_no']);
                        console.log('response res'+data.res);
                        console.log('response out_trade_no'+data.trade_no);
                        console.log('response msg'+data.msg);

                        doc.status = 3;
                        doc.trade_endno = data.trade_no;
                        doc.save();
                    }
                });
            }
        }catch(err){
            OBJ('LogMgr').error(err);
        }

    }

    //比赛结果
    function scheduleResult(score, handicap, isCancel, betContent) {
        var result = {};
        result['wfl'] = 0;
        result['rangqiuwfl'] = 0;
        for (var i = 0; i < betContent.length; i++) {
            //胜平负玩法
            if (1 == betContent[i]['bet_class']) {
                result['wfl'] = 1;
                if (isCancel) {
                    result['wflResult'] = -1;
                } else {
                    if (score > 0) {
                        result['wflResult'] = 1;
                    } else if (0 == score) {
                        result['wflResult'] = 2;
                    } else if (score < 0) {
                        result['wflResult'] = 3;
                    }
                }
            }
            //让球胜平负玩法
            else if (2 == betContent[i]['bet_class']) {
                result['rangqiuwfl'] = 1;
                if (isCancel) {
                    result['rangqiuwflResult'] = -1;
                } else {
                   var value = score + parseInt(handicap);
                    if (value > 0) {
                        result['rangqiuwflResult'] = 1;
                    } else if (0 == value) {
                        result['rangqiuwflResult'] = 2;
                    } else if (value < 0) {
                        result['rangqiuwflResult'] = 3;
                    }
                }
            }
        }
        return result;
    }

    //投注结果
    function betResult(score, betPlan, handicap, isCancle) {
        var result = {};
        //取消比赛的默认都中,赔率未1
        if (isCancle) {
            result['status'] = 1;
        } else {
            var value = 0;
            if (1 == betPlan['bet_class']) {        //胜平负
                value = score;
            } else if (2 == betPlan['bet_class']) {  //让球胜平负
                value = score + parseInt(handicap);
            }
            if (value > 0) {
                if (1 == betPlan['bet_area']) {
                    result['status'] = 1;
                } else {
                    result['status'] = 0;
                }
            } else if (value == 0) {
                if (2 == betPlan['bet_area']) {
                    result['status'] = 1;
                } else {
                    result['status'] = 0;
                }
            } else if (value < 0) {
                if (3 == betPlan['bet_area']) {
                    result['status'] = 1;
                } else {
                    result['status'] = 0;
                }
            }
        }
        return result;

    }

    /*
        @func 公告过期的使用
    */
    function overdue(){
        try {
            var curTime = Date.now();
            var filter = {"endtime": {"$lte":curTime}, "content": { $ne: '' },"type":0};
            classAnnounce.find(filter, null, function (error, docs) {
                if (error) {
                    OBJ('LogMgr').error(error);
                }
                if(docs == null || 0 == docs.length) {
                    return ;
                }
                var pushFlag = 0;
                var len  = mapAnList.size;
                for (var i = 0; i < docs.length; i++) {
                    var isNull = mapAnList.get(docs[i]['a_id']);
                    if(isNull !=null){
                        pushFlag = 1;
                        mapAnList.delete(docs[i]['a_id']);
                    }
                }
                if(pushFlag){
                    //广播
                    var push = new pbSvrcli.Push_Announce();
                    var AnnounceArr = [];
                    //删除所有公告
                    if(len >0 && mapAnList.size == 0){
                        push.setStatus(-1);
                        var arow = new pbSvrcli.Announce();
                        arow.setContent("");
                        AnnounceArr.push(arow);
                    }
                    if(mapAnList.size >0){
                        push.setStatus(0);    
                        for(var value of mapAnList.values()){
                            var arow = new pbSvrcli.Announce();
                            arow.setContent(value);
                            AnnounceArr.push(arow);
                        }
                    }
                    push.setAnnounceList(AnnounceArr);
                    var buf = push.serializeBinary();
                    io.sockets.in('RealFootMainInfo').emit(pbSvrcli.Push_Announce.Type.ID, buf, buf.length);
                }
            });
        } catch (err) {
            OBJ('LogMgr').error(err);
        }  
    }


    /*
        @func 查询公告信息 
    */
    function getAnnounce(){
        try {
            var curTime = Date.now();
            var filter = { "starttime": { "$lte": curTime }, "endtime": {"$gte":curTime}, "content": { $ne: '' },"type":0};
            classAnnounce.find(filter, null, function (error, docs) {
                if (error) {
                    OBJ('LogMgr').error(error);
                }
                if(docs == null || 0 == docs.length) {
                    return ;
                }
                for (var i = 0; i < docs.length; i++) {
                    mapAnList.set(docs[i]['a_id'],docs[i]['content']);
                }
            });
        } catch (err) {
            OBJ('LogMgr').error(err);
        }
    }

    /*
        @func 获取订单的最大流水
    */
    function getMaxSerial(){
        try{
            var filter = {"bet_server":SERVERID};
            var select = {"out_trade_no":1};
            classLogRealBet.findOne(filter,select,{sort: { 'bet_date': -1 }},function(error,docs){
                if(error){
                    OBJ('LogMgr').error(error);
                    return ;
                }
                if(null == docs){
                    return ;
                }
                var index =docs['out_trade_no'].indexOf('JC');
                if(index != -1){
                    orderId = parseInt(docs['out_trade_no'].substr(index+2));
                    betMatchDate = parseInt(docs['out_trade_no'].substr(index-8,8));
                }
            });
        }catch(err){
            OBJ('LogMgr').error(err);
        }
    }


    this.run = function (Timestamp) {
        if(null != announceTimer && announceTimer.toNextTime()){
            overdue();
        }
    };
}