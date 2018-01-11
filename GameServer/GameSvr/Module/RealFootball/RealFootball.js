module.exports = RealFootball;

var OBJ = require('../../../Utils/ObjRoot').getObj;
var uuid = require('node-uuid');
var Schema = require('../../../db_structure');
var PlayerContainer = require('../Player/PlayerContainer');
var fs = require('fs');
var Config = require('../../../config').dataCenterSvrConfig();
var Func = require('../../../Utils/Functions');

function RealFootball(){
    var mapScheduleList = new Map();     //当前时刻赛事列表
    var mapLeagueIdList = new Map();     //联赛id列表
    var mapBetClass = new Map();         //投注类型
    var mapBetArea = new Map();          //投注区域
    var waitMap = new Map();             

    var betItem1 = 0;
    var betItem2 = 0;
    var betItem3 = 0;
    var betNumLimit = 1;
    var betCoinLimit = 0;

    var maxLeagueId = 0;

    var limit = 0;

    var classLogRealBet = OBJ('DbMgr').getStatement(Schema.LogRealBet());
    var classSchedule = OBJ('DbMgr').getStatement(Schema.Schedule());

    var scehduleSelect = {"_id":0,"id":1,"weekday":1,"official_num":1,"phase":1,"match_date":1,
                            "status":1,"first_half":1,"final_score":1,"match_name":1,"home_team":1,
                            "away_team":1,"odds_jingcai":1,"odds_jingcai_admin":1,"handicap":1,
                            "odds_rangqiu":1,"odds_rangqiu_admin":1,"display_flag":1,"hot_flag":1,
                            "odds_avg":1,"bet_num":1,"bet_num1":1};

    init();

    function init(){
        initLeagueIdList();
        limit = Config['limit']?Config['limit']:12;
        //申请投注信息
        OBJ('DataCenterModule').send({module:'RealFootball', func:'getRealBetConf'});
        //游戏服重启主动申请
        OBJ('DataCenterModule').send({module:'RealFootball', func:'reGetCurData'});
    }

    //初始化 mapLeagueIdList
    function initLeagueIdList(){
       var  leagueIdInfo = JSON.parse(fs.readFileSync('./Json/LeagueIdInfo.json'));
       for(var key in leagueIdInfo){
        var item = leagueIdInfo[key];
        mapLeagueIdList.set(item.match_name, item.league_id);
       }
       maxLeagueId = mapLeagueIdList.size;
    }

    //获取联赛id
    function getLeagueId(leagueName)
    {
        var leagueId = mapLeagueIdList.get(leagueName);
        if(null == leagueId){
            return maxLeagueId+1;
        }
        return leagueId;
    }

    //初始化话scheduleList
    this.resCurData = function(source,data){
        for(var i = 0;i<data.map.length;i++){
            mapScheduleList.set(data.map[i]['sceheduleId'],data.map[i]);
        }
    }

    //刷新betItem数据
    this.refreshBetItem =function(source,data){
        betItem1 = data.betItem1;
        betItem2 = data.betItem2;
        betItem3 = data.betItem3;
        betNumLimit = data.betNumLimit;
        betCoinLimit = data.betCoinLimit;
    }

    //刷新scheduleList数据
    this.refreshSchedule = function(source,data){
        var arr = [];
        for(var i = 0;i<data.map.length;i++){
            var item = data.map[i];
            if(1 == item['type']){
               var tmpItem = mapScheduleList.get(item['sceheduleId']);
               if(tmpItem['oddsJingcai'] == item['oddsJingcai'] && 
                  tmpItem['oddsRangqiu'] == item['oddsRangqiu'] && 
                  tmpItem['hotFlag'] == item['hotFlag']){
                   continue;
               }
               arr.push(item);
            }
        }

        //广播
        var push = new pbSvrcli.Push_ScheduleInfo();
        var listArr = [];
        for(var i = 0;i<arr.length;i++){
            //赋值mapScheduleList
            mapScheduleList.set(arr[i]['sceheduleId'],arr[i]);

            var row = new pbSvrcli.RlScheduleInfo();

            var oddsJingcai  = JSON.stringify(arr[i].oddsJingcai);
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
            row.setDisplayflag(arr[i].displayFlag);

            listArr.push(row);

        }
        push.setRlscheduleinfoList(arr);
        var buf = push.serializeBinary();
        io.sockets.in('RealFootMainInfo').emit(pbSvrcli.Push_ScheduleInfo.Type.ID, buf, buf.length);
    }

    //刷新停止下注的赛程列表
    this.refreshStopBetSchedule = function(source,data){
        for(var i = 0;i<data.id.length;i++){
            mapScheduleList.delete(data.id[i]);
        }

        //广播
        var push = new pbSvrcli.Push_StopBetSchedules();
        var idArr = [];
        for (var i = 0; i<data.id.length;i++){
            var row = new pbSvrcli.RlScheduleId();
            row.setScheduleid(data.id[i]);
            idArr.push(row);
        }

        push.setRlscheduleidList(idArr);
        var buf = push.serializeBinary();
        io.sockets.in('RealFootMainInfo').emit(pbSvrcli.Push_StopBetSchedules.Type.ID, buf, buf.length);
    }

    //刷新比赛状态
    this.refreshScheduleState = function(source,data){
        for(var i = 0;i<data.id.length;i++){
            var score = data.score[i].split(":");
            var homeScore = parseInt(score[0]);
            var awayScore = parseInt(score[1]);
            var value = homeScore - awayScore;
            try{
                var filter = {"bet_plan":{"$elemMatch":{"schedule_id":data.id[i]}}};
                classLogRealBet.find(filter,null,function(error,docs){
                    if(error){
                        console.log('Module RealFootball refreshScheduleState classLogRealBet.find() :', error);
                    }else if(0 == docs.length){
                        continue ;
                    }
                    updateLogRealBetStatus(value,docs,data.id[i]);
                });
            }catch(err){
                console.log('Module RealFootball refreshScheduleState() :', err);
            }
        }
    }


    //请求竞彩足球主页面
    this.askRealFootMainInfo = function(askRealFootMainInfo, socket){
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

            var oddsJingcai  = JSON.stringify(item.oddsJingcai);
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
        OBJ('WsMgr').send(socket, pbSvrcli.Res_RealFootMainInfo.Type.ID, res.serializeBinary());
    };

    //请求比赛赛事投注比例
    this.askRealFootBetRateInfo = function(askRealFootBetRateInfo,socket){
        var scheduleId = askRealFootBetRateInfo.getSceheduleid();
        var betClass = askRealFootBetRateInfo.getBetclass();
        var filter = {'id':scheduleId};
        var res = new pbSvrcli.Res_RealFootBetRateInfo();
        try{
            classSchedule.findOne(filter,scehduleSelect,function(error, docs){
                if(error){
                    console.log('Module RealFootball askRealFootBetRateInfo() classSchedule.findOne :',error);
                    return ;
                }else if(0 == docs.length){
                    return ;
                }
                res.setOddsavg(JSON.stringify(docs['odds_avg']));
                //投注比率
                if(1 == betClass){
                    res.setBetrate(JSON.stringify(docs['bet_num']));
                }else if(2 == betClass){
                    res.setBetrate(JSON.stringify(docs['bet_num1']));    
                }
                
                //历史交锋
                filter ={"match_date":{"$lt":Date.now()},"home_team":{$in:[docs['home_team'],docs['away_team']]},
                        "away_team":{$in:[docs['home_team'],docs['away_team']]},"final_score":{$ne:''}};
                var select ={"_id":0,"home_team":1,"away_team":1,"final_score":1};
                var homeTeam = docs['home_team'];
                var awayTeam = docs['away_team'];
                classSchedule.find(filter,select,{limit:10, sort:{'match_num':-1}},function(error,historydocs){
                    if(error){
                        console.log('Module RealFootball askRealFootBetRateInfo() classSchedule.find  :',error);
                        return ;
                    }else if(0 == historydocs.length){
                        var str = {"warTotal":0,"homename":homeTeam,"win":0,"flat":0,"lose":0};
                        res.setHistoryinfo(JSON.stringify(str));         //'双方暂无交锋记录'     
                    }else{
                        var win = 0;
                        var flat = 0;
                        var lose = 0;
                        for(var i=0;i<historydocs.length;i++){
                            var score =historydocs[i]['final_score'].split(":");
                            var value = 0;
                            if(historydocs[i]['home_team'] == homeTeam){
                                value = parseInt(score[0]) - parseInt(score[1]);
                            }else{
                                value = parseInt(score[1]) - parseInt(score[0]);
                            }
                            if(value >0){
                                win++;
                            }else if(value == 0){
                                flat++;
                            }else{
                                lose++;
                            }
                        }
                        var history = {"warTotal":historydocs.length,"homename":homeTeam,"win":win,"flat":flat,"lose":lose};
                        res.setHistoryinfo(JSON.stringify(history));    
                    }

                    //主队近期战绩
                    var record = {};
                    filter = {"match_date":{"$lt":Date.now()},"$or": [ {'home_team':homeTeam} , {'away_team':homeTeam} ],"final_score":{$ne:''}};
                    classSchedule.find(filter,select,{limit:10, sort:{'match_num':-1}},function(error,homedocs){
                        if(error){
                            console.log('Module RealFootball askRealFootBetRateInfo() classSchedule.find :',error);
                            return ;
                        }else if(0 == homedocs.length){
                            record['homeWin'] = 0;
                            record['homeFlat'] = 0;
                            record['homeLose'] = 0; 
                        }else{
                            var homeWin = 0;
                            var homeFlat = 0;
                            var homeLose = 0;
                            for(var i =0;i<homedocs.length;i++){
                                var score =homedocs[i]['final_score'].split(":");
                                var value = 0;
                                if(homedocs[i]['home_team'] == homeTeam){
                                    value = parseInt(score[0]) - parseInt(score[1]);
                                }else{
                                    value = parseInt(score[1]) - parseInt(score[0]);
                                }
                                if(value >0){
                                    homeWin++;
                                }else if(value == 0){
                                    homeFlat++;
                                }else{
                                    homeLose++;
                                }
                            }
                            record['homeWin'] = homeWin;
                            record['homeFlat'] = homeFlat;
                            record['homeLose'] = homeLose; 

                            //客队近期战绩
                            filter = {"match_date":{"$lt":Date.now()},"$or": [ {'home_team':awayTeam} , {'away_team':awayTeam} ],"final_score":{$ne:''}};
                            classSchedule.find(filter,select,{limit:10, sort:{'match_num':-1}},function(error,awaydocs){
                                if(error){
                                    console.log('Module RealFootball askRealFootBetRateInfo() classSchedule.find :',error);
                                    return ;
                                }else if(0 == awaydocs.length){
                                    record['awayWin'] = 0;
                                    record['awayFlat'] = 0;
                                    record['awayLose'] = 0; 
                                }else{
                                    var awayWin = 0;
                                    var awayFlat = 0;
                                    var awayLose = 0;
                                    for(var i=0;i<awaydocs.length;i++){
                                        var score =awaydocs[i]['final_score'].split(":");
                                        var value = 0;
                                        if(awaydocs[i]['home_team'] == awayTeam){
                                            value = parseInt(score[0]) - parseInt(score[1]);
                                        }else{
                                            value = parseInt(score[1]) - parseInt(score[0]);
                                        }
                                        if(value >0){
                                            awayWin++;
                                        }else if(value == 0){
                                            awayFlat++;
                                        }else{
                                            awayLose++;
                                        }
                                    }
                                    record['awayWin'] = awayWin;
                                    record['awayFlat'] = awayFlat;
                                    record['awayLose'] = awayLose; 
                                    res.setLastestinfo(JSON.stringify(record));
                                    OBJ('WsMgr').send(socket, pbSvrcli.Res_RealFootBetRateInfo.Type.ID, res.serializeBinary());
                                }

                            });

                        }
                    }); 
                });

            });
        }catch(err){
            console.log('RealFootball askRealFootBetRateInfo() :', err);
        }

        
    }
    //请求真实足球投注
    this.askRealFootBetInfo = function(askRealFootBetInfo,socket){
        var player = OBJ('PlayerContainer').findPlayer(socket);
        if (null == player)
            return;
        //获取投注信息
        var betType = askRealFootBetInfo.getBettype();
        if(betType<1 || betType>4){
            return;
        }
        var betNum = askRealFootBetInfo.getBetnum();
        if(betNum <1){
            return;
        }
        var betTime = askRealFootBetInfo.getBettime();
        if(betTime <1){
            return;
        }
        var betCoin = 0;
        var betCoinArea = askRealFootBetInfo.getBetCoinarea();
        if(betCoinArea<1 || betCoinArea>3){
            return ;
        }else{
            if(1 == betCoinArea){
                betCoin = betTime*betItem1;
            }else if(2 == betCoinArea){
                betCoin = betTime*betItem2;
            }else{
                betCoin = betTime*betItem3;
            }
        }
        if(player.gameCoin <betCoin ||betCoin >betCoinLimit){
            return;
        }
        var betInfoList = askRealFootBetInfo.getBetinfoList();
        if(betInfoList.length > betNumLimit){
            return;
        }
        var betScheduleId = [];
        var jingcaiType = 0;
        var betPlan = [];
        var betRate = []; 
        var distributeCoin;
        for(var i= 0;i<betInfoList.length;i++){
            var scheduleId = betInfoList[i].getSceheduleid();
            if(scheduleId < 0){
                return ;
            }
            betScheduleId.push(scheduleId);
            var betClass = betInfoList[i].getBetclass();
            if(betClass <1 || betClass>2){
                return ;
            }
            var betArea = betInfoList[i].getBetarea();
            if(betArea<1 || betArea>3){
                return ;
            }
            //判断同一个赛事是否压多次
            if(mapBetClass.get(scheduleId)!=null){
                return ;
            }
            mapBetClass.set(scheduleId,betClass);
            mapBetArea.set(scheduleId,betArea);
        }


        try{
            var filter = {'id':{"$in":betScheduleId}};
            var select = {"_id":0,"id":1,"home_team":1,"away_team":1,"odds_jingcai":1,"odds_rangqiu":1,
                          "odds_jingcai_admin":1,"odds_rangqiu_admin":1,"handicap":1,"input_flag":1,"bet_num":1,"bet_num1":1}
            classSchedule.find(filter,select,function(error,docs){
                if(error){
                    console.log('Module RealFootball askRealFootBetInfo() classSchedule.find :',error);
                    return ;
                }else if(docs.length !=betScheduleId.length){
                    return ;
                }
                var lastBetClass = 0;
                var betClass = 0;
                var betArea = 0;
                var betPlanDetails ={};
                var oddsTotal=1.0;
                for(var i=0;i<docs.length;i++){
                    betClass = mapBetClass.get(parseInt(docs[i]['id']));
                    betArea = mapBetArea.get(parseInt(docs[i]['id']));
                    if(lastBetClass!= 0 && lastBetClass!=betClass &&jingcaiType!=3){  //竞猜类型
                        jingcaiType = 3;
                    }else if(jingcaiType!=3){
                        jingcaiType = betClass;
                    }
                    lastBetClass = betClass;
                    betPlanDetails['schedule_id'] = parseInt(docs[i]['id']);
                    betPlanDetails['match_date'] = docs[i]['match_date'];
                    betPlanDetails['team_name'] = docs[i]['home_team'] +'vs'+docs[i]['away_team'];
                    betPlanDetails['betClass'] = betClass;
                    betPlanDetails['betArea'] = betArea;
                    betPlanDetails['handicap'] = docs[i]['handicap'];
                    betPlanDetails['schedule_result'] = 0;
                    betPlanDetails['status'] = 0;
                    //获取投注倍率,投注内容和计算投注人数
                    var bet = getBetInfoAndRate(betClass,betArea,docs[i]);
                    betPlanDetails['bet_info'] = bet['bet_info'];
                    betPlanDetails['odds'] = bet['odds'];
                    //总赔率
                    oddsTotal*=betPlanDetails['odds'];
                    //投注方案
                    betPlan.push(betPlanDetails);
                    //投注人数更新
                    if(1 == betClass){
                        betRate.push(bet['bet_num']);
                    }else if(2 == betClass){
                        betRate.push(bet['bet_num1']);
                    }
                    
                }
                //派发金额
                distributeCoin= oddsTotal*betCoin;
                //清空map
                mapBetClass.clear();
                mapBetArea.clear();
                //生成唯一ID
                var uid = uuid.v4();
                waitMap.set(uid, {player:player, betBeforeCoin: player.gameCoin, 
                        betScheduleId: betScheduleId,betNum:betNum,betType:betType,
                        jingcaiType:jingcaiType,betCoin:betCoin,distributeCoin:distributeCoin,betPlan:betPlan,betRate:betRate});
                OBJ('WalletAgentModule').send({module:'WalletSvrAgent', func:'reqBet', data:{
                    userid:player.userId, 
                    outType:11, 
                    outTypeDescription:'足球竞猜', 
                    uuid:uid, 
                    betCoin:betCoin.toString(),
                    cbModule:'RealFootball',
                    cbFunc:'resRealBet'
                }});

            });
        }catch(err){
            console.log('RealFootball askRealFootBetInfo() :', err);
        }  
    }

    //投注钱包回执
    this.resRealBet = function(source, data){
        var res = new pbSvrcli.Res_RealFootBetInfo();
        var waitValue = waitMap.get(data.uuid);
        waitMap.delete(data.uuid);
        if(null == waitValue.player)
        return; //扣了钱但是投注会失败，正常情况下不会出现，除非钱包挂掉
        var player = waitValue.player;
        player.gameCoin = data.balance;
        res.setStatus(data.res);
        res.setCoin(data.balance);
        //投注
        player.send(pbSvrcli.Res_RealFootBetInfo.Type.ID, res.serializeBinary());

        //生成投注记录
        var modelLogRealBet = OBJ('DbMgr').getModel(Schema.LogRealBet());
        modelLogRealBet.out_trade_no = data.uuid;
        modelLogRealBet.user_id = player.userId;
        modelLogRealBet.user_name = player.userName;
        modelLogRealBet.bet_date = Date.now();
        modelLogRealBet.bet_coin = data.betCoin;
        modelLogRealBet.bet_scheduleid = waitValue.betScheduleId;
        modelLogRealBet.bet_num = waitValue.betNum;
        modelLogRealBet.bet_type = waitValue.betType;
        modelLogRealBet.jingcai_type = waitValue.jingcaiType;
        modelLogRealBet.bet_coin = waitValue.betCoin;
        modelLogRealBet.distribute_coin = waitValue.distributeCoin;
        modelLogRealBet.status = 0;
        modelLogRealBet.bet_plan = waitValue.betPlan;
        modelLogRealBet.save(function(err){
            if(err){
                console.log('Module RealFootball resRealBet() :', err);
            }
        });

        //更新投注比例
        updateBetRateInfo(waitValue.betScheduleId,waitValue.betRate);
    }


    //请求真实足球我的竞猜
    this.askRealFootballBetRecords = function(askRealFootballBetRecords,socket){
        socket.leave('RealFootMainInfo');
        var player = OBJ('PlayerContainer').findPlayer(socket);
        if(null == player)
            return;
        var page = askRealFootballBetRecords.getPage();
        if(page <0){
            return;
        }
        var filter = {'user_id':player.userId};
        try{
            classLogRealBet.find({filter},null,{skip:(page-1)*limit, 
                limit:limit, sort:{'bet_date':-1}},function(error,docs){
                    if(error){
                        console.log('Module RealFootball askRealFootballBetRecords() classLogRealBet.find :',error);
                    }
                    var res = new pbSvrcli.Res_RealFootBetRecords();
                    if(0 == docs.length){
                        player.send(pbSvrcli.Res_RealFootBetRecords.Type.ID, res.serializeBinary());
                        return ;
                    }
                    
                    var arr = [];
                    for(var item of docs){
                        var row = new pbSvrcli.RlBetRecordInfo();
                        row.setRecordid(item.out_trade_no);
                        row.setBettype(item.bet_type);
                        row.setJingcaitype(item.jingcai_type);
                        row.setBetdate(item.bet_date.toLocaleString());
                        row.setBetcoin(item.bet_coin);
                        row.setDistributecoin(item.distribute_coin);
                        row.setBetstatus(item.status);
                        row.setBetcontents(JSON.stringify(item.bet_plan));
                        arr.push(row);
                    }
                    res.setBetrecordinfoList(arr);
                    player.send(pbSvrcli.Res_RealFootBetRecords.Type.ID, res.serializeBinary());
            });
        }catch(err){
            console.log('Module RealFootball askRealFootballBetRecords() :', err);
        }

    }

    //请求真实足球比赛记录
    this.askRealFootRecords = function(askRealFootRecords,socket){
        socket.leave('RealFootMainInfo');

        var filter = {"match_date":{"$lt":Date.now()},"display_flag":1};
        var select = {"_id":0,"phase":1,"match_date":1,"official_num":1,"match_name":1,
                "weekday":1,"home_team":1,"away_team":1,"first_half":1,"final_score":1};
        try{
            classSchedule.find(filter,select,{sort:{'match_num':-1}},function(error,docs){
                if(error){
                    console.log('Module RealFootball askRealFootRecords() find:', error);
                }
                var res = new pbSvrcli.Res_RealFootRecords();
                if(0 == docs.length){
                    player.send(pbSvrcli.Res_RealFootRecords.Type.ID, res.serializeBinary());
                    return ;
                }
                //计算5天前的phase
                var phase = docs[0]['phase'].toString();
                var timeStime = Func.getStamp(phase);
                var before5day = timeStime - 5*24*60*60*1000;
                var phaseBefore5day = parseInt(Func.getDate(before5day));

                var arr = [];
                for(var item of docs){
                    //获取最近5天的
                    if(item.phase <phaseBefore5day){
                        break;
                    }
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

            });
        }catch(err){
            console.log('Module RealFootball askRealFootRecords() :', err);
        }

    }

    //获取betinfo和计算投注比率信息
    function getBetInfoAndRate(betClass,betArea,docs){
        var bet = {};
        var betRate = [];
        if(1 == betClass){          //胜平负
            if(1 == betArea){
                //赔率
                if(docs['input_flag']){
                    bet['odds'] = docs['odds_jingcai_admin'].h;
                }else{
                    bet['odds'] = docs['odds_jingcai'].h;
                }
                //投注人数
                betRate['h'] = parseInt(docs['bet_num'].h)+1;
                betRate['a'] = docs['bet_num'].a;
                betRate['d'] = docs['bet_num'].d;
                
            }else if(2 == betArea){
                //赔率
                if(docs['input_flag']){
                    bet['odds'] = docs['odds_jingcai_admin'].d;
                }else{
                    bet['odds'] = docs['odds_jingcai'].d;
                }
                //投注人数
                betRate['h'] = docs['bet_num'].h;
                betRate['a'] = docs['bet_num'].a;
                betRate['d'] = parseInt(docs['bet_num'].d)+1;

            }else if(3 == betArea){
                //赔率
                if(docs['input_flag']){
                    bet['odds'] = docs['odds_jingcai_admin'].a;
                }else{
                    bet['odds'] = docs['odds_jingcai'].a;
                }
                //投注人数
                betRate['h'] = docs['bet_num'].h;
                betRate['a'] = parseInt(docs['bet_num'].a)+1;
                betRate['d'] = docs['bet_num'].d;
            }
            bet['bet_num'] = betRate;

        }else if(2 == betClass){    //让球胜平负
            if(1 == betArea){
                //赔率
                if(docs['input_flag']){
                    bet['odds'] = docs['odds_rangqiu_admin'].h;
                }else{
                    bet['odds'] = docs['odds_rangqiu'].h;
                }
                //投注人数
                betRate['h'] = parseInt(docs['bet_num1'].h)+1;
                betRate['a'] = docs['bet_num1'].a;
                betRate['d'] = docs['bet_num1'].d;
            }else if(2 == betArea){
                //赔率
                if(docs['input_flag']){
                    bet['odds'] = docs['odds_rangqiu_admin'].d;
                }else{
                    bet['odds'] = docs['odds_rangqiu'].d;
                }
                //投注人数
                betRate['h'] = docs['bet_num1'].h;
                betRate['a'] = docs['bet_num1'].a;
                betRate['d'] = parseInt(docs['bet_num1'].d)+1;
            }else if(3 == betArea){
                //赔率
                if(docs['input_flag']){
                    bet['odds'] = docs['odds_rangqiu_admin'].a;
                }else{
                    bet['odds'] = docs['odds_rangqiu'].a;
                }
                //投注人数
                betRate['h'] = docs['bet_num1'].h;
                betRate['a'] = parseInt(docs['bet_num1'].a)+1;
                betRate['d'] = docs['bet_num1'].d;
            }
            bet['bet_num1'] = betRate;
        }
        return bet;
    }

    //更新投注人数
    function updateBetRateInfo(betScheduleId,betRate){
        try{
            for(var i=0;i<betScheduleId.length;i++){
                classSchedule.update({id:betScheduleId[i]},{$set:betRate[i]},false,true);
            }
        }catch(err){
            console.log('Module RealFootball updateBetRateInfo() :', err);
        }
    }

    //更新用户投注记录表
    function updateLogRealBetStatus(scoreValue,docs,scheduleId){
        try{
            var allEndFlag = 0;
            var endNum = 0;
            var hasedOpen = 0;
            var status = 0;
            var recordId = 0;
            for(var i =0;i<docs.length;i++){
                recordId = docs[i]['out_trade_no'];
                //开过奖不中
                if(2 == docs[i]['status']){
                    hasedOpen = 1;
                }

                var result = {};
                for(var j=0;j<docs[i]['bet_plan'].length;j++){
                    if(scheduleId == docs[i]['bet_plan'][j]['schedule_id']){
                        result =scheduleResult(scoreValue,docs[i]['bet_plan'][j]);
                    }else{
                        if(docs[i]['bet_plan'][j]['status'] !=0){
                            endNum++;
                        }
                    }
                } 

                if(1 ==  (docs[i]['bet_plan'].length - endNum)){
                    allEndFlag = 1;
                }

                if(0 == hasedOpen){
                    if(0 == result['status']){
                        status = 2;
                    }else{
                        if(1 == docs[i]['bet_type']){     //单场 
                            status = 1;
                        }else{                            //串场
                            if(1 == allEndFlag){
                                status = 1;
                            }
                        }
                    }
                }
                //更新用户金币
                if(1 == status){
                    OBJ('WalletAgentModule').send({module:'WalletSvrAgent', func:'reqAddMoney', data:{
                        userid:docs[i]['user_id'], 
                        outType:12, 
                        outTypeDescription:'足球竞猜', 
                        uuid:docs[i]['out_trade_no'], 
                        betCoin:docs[i].distribute_coin.toString(),
                        cbModule:'RealFootball',
                        cbFunc:'resAddTrade'
                    }});
                }
                var logRealBetValue = {"status":status,"bet_plan":{"$elemMatch":{"schedule_id":scheduleId,"status":result['result']}}};
                classLogRealBet.update({out_trade_no:recordId},{$set:logRealBetValue},false,true);

               
                recordId = 0;
                allEndFlag = 0;
                endNum = 0;
                hasedOpen = 0;
                status = 0;   
            }
        }catch(err){
            console.log('Module RealFootball updateLogRealBetStatus() :', err);
        }
    }

    //结算钱包回执
    this.resAddTrade = function(source, data){
        if(data.res != 0){
            //生成投注记录
            var updateValue = {
                'status':3          //系统错误
            };
            try{
                classLogRealBet.update({'out_trade_no':data.uuid}, updateValue, function(error){
                    if(error){
                        console.log('Module RealFootball resAddTrade() update:', error);
                    }
                });
            }catch(err){
                console.log('Module RealFootball resAddTrade() :', err);
            }
        }
        
    }


    //开奖结果
    function scheduleResult(score,betPlan){
        var result = {};
        if(1 == betPlan['betClass']){
            if(1 == betPlan['betArea'] && score >0){
                result['status'] = 1;
            }else{
                result['status'] = 0;
            }
            if(2 == betPlan['betArea'] && score == 0){
                result['status'] = 1;
            }else{
                result['status'] = 0;
            }
            if(3 == betPlan['betArea'] && score <0){
                result['status'] = 1;
            }else{
                result['status'] = 0;
            }
        }else if(2 == betPlan['betClass']){
            var handicap = betPlan['handicap'];
            var value = score + handicap;
            if(1 == betPlan['betArea'] && value >0){
                result['status'] = 1;
            }else{
                result['status'] = 0;
            }
            if(2 == betPlan['betArea'] && value == 0){
                result['status'] = 1;
            }else{
                result['status'] = 0;
            }
            if(3 == betPlan['betArea'] && value <0){
                result['status'] = 1;
            }else{
                result['status'] = 0;
            }
        }
        result['schedule_result'] = betPlan['betArea'];
        return result;

    }



    this.run = function(Timestamp){
        
    };
}