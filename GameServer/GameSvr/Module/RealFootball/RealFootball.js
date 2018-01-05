module.exports = RealFootball;

var OBJ = require('../../../Utils/ObjRoot').getObj;
var uuid = require('node-uuid');
var Schema = require('../../../db_structure');
var PlayerContainer = require('../Player/PlayerContainer');
var fs = require('fs');
var Config = require('../../../config').dataCenterSvrConfig();

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

    var scehduleSelect = {"_id":0,"id":1,"weekday":1,"official_num":1,"phase":1,"match_date":1,"status":1,"first_half":1,"final_score":1,
    "match_name":1,"home_team":1,"away_team":1,"odds_jingcai":1,"handicap":1,"odds_rangqiu":1,"display_flag":1,"hot_flag":1};

    init();

    function init(){
        initLeagueIdList();
        //initScheduleList();
        limit = Config['limit']?Config['limit']:12;
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

    //初始化 mapScheduleList
    /*function initScheduleList(){
        var filter ={"match_date":{"$gte":Date.now()},"display_flag":1};
        try{
            classSchedule.find(filter,scehduleSelect,
                {sort:{'match_num':1}},function(error,docs){
                    if(error){
                        console.log('Module RealFootball initScheduleList() classSchedule.find :',error);
                        return;
                    }else if(0 == docs.length){
                        return;
                    }
                    var arr ={};
                    for(var i= 0;i<docs.length;i++){
                        arr['sceheduleId'] = parseInt(docs[i]['id']);
                        arr['phase'] = docs[i]['phase'];
                        arr['matchName'] = docs[i]['match_name'];
                        arr['weekday'] = docs[i]['weekday'];
                        arr['officialNum'] = docs[i]['weekday']+docs[i]['official_num'];
                        arr['endSale'] = docs[i]['match_date'].toLocaleString();
                        arr['homeName'] = docs[i]['home_team'];
                        arr['awayName'] = docs[i]['away_team'];
                        arr['handicap'] = docs[i]['handicap'];
                        if(docs[i]['input_flag']){
                            arr['oddsJingcai'] = docs[i]['odds_jingcai_admin'];
                            arr['oddsRangqiu'] = docs[i]['odds_rangqiu_admin'];
                        }else{
                            arr['oddsJingcai'] = docs[i]['odds_jingcai'];
                            arr['oddsRangqiu'] = docs[i]['odds_rangqiu'];
                        }
                        arr['hotFlag'] = docs[i]['hot_flag'];

                        mapScheduleList.set(arr['sceheduleId'],arr);
                    }
            });
        }catch(err){
            console.log('RealFootball initScheduleList() :', err);
        }
    }*/

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
        for(var item of data.map){
            mapScheduleList.set(item['sceheduleId'],item);
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

    }

    //刷新停止下注的赛程列表
    this.refreshStopBetSchedule = function(source,data){
        for(var i = 0;i<data.id.length;i++){
            mapScheduleList.delete(data.id[i]);
        }

        //广播
        var push = new pbSvrcli.Push_StopBetScheduls();
        var idArr = [];
        for (var i = 0; i<data.id.length;i++){
            var row = new pbSvrcli.RlScheduleId();
            row.setScheduleid(data.id[i]);
            idArr.push(row);
        }

        push.setRlscheduleidList(idArr);
        var buf = push.serializeBinary();
        io.sockets.in('VirtualFootMainInfo').emit(pbSvrcli.Push_StopBetScheduls.Type.ID, buf, buf.length);
    }
    //刷新赛程列表信息
    this.refreshSchedule = function(source,data){

    }
    //请求竞彩足球主页面
    this.askRealFootMainInfo = function(askRealFootMainInfo, socket){
        socket.join('VirtualFootMainInfo');

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
            row.setOddsJingcai(item.oddsJingcai);
            row.setOddsRangqiu(item.oddsRangqiu);
            row.setHotFlag(item.hotFlag);
            arr.push(row);
        }
        res.setRlscheduleinfoList(arr);
        res.setRlbetconfig(betConfig);
        res.setMaxleagueid(maxLeagueId);
        OBJ('WsMgr').send(socket, pbSvrcli.Res_RealFootMainInfo.Type.ID, res.serializeBinary());
    };

    //请求比赛赛事投注比例
    this.askRealFootBetRateInfo = function(askRealFootBetRateInfo,socket){
        var scheduleId = askRealFootBetRateInfo.getSceheduleid();
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
                res.setOddsavg(docs['odds_avg']);
                res.setBetrate(docs['bet_rate']);
                //历史交锋
                filter ={"match_date":{"$lt":Date.now()},"home_team":{$in:[docs['home_team'],docs['away_team']]},
                        "away_team":{$in:[docs['home_team'],docs['away_team']]}};
                var select ={"_id":0,"home_team":1,"away_team":1,"final_score":1};
                var homeTeam = docs['home_team'];
                var awayTeam = docs['away_team'];
                classSchedule.find(filter,select,{limit:10, sort:{'match_num':-1}},function(error,historydocs){
                    if(error){
                        console.log('Module RealFootball askRealFootBetRateInfo() classSchedule.find  :',error);
                        return ;
                    }else if(0 == historydocs.length){
                        var str = '双方暂无交锋记录';
                        res.setHistoryinfo(str);
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
                        var history = '近'+historydocs.length+'次交战,'+homeTeam+win+'胜'+flat+'平'+lose+'负';
                        res.setHistoryinfo(history);

                        //主队近期战绩
                        var record = '';
                        filter = {"match_date":{"$lt":Date.now()},"$or": [ {'home_team':homeTeam} , {'away_team':homeTeam} ]};
                        classSchedule.find(filter,select,{limit:10, sort:{'match_num':-1}},function(error,homedocs){
                            if(error){
                                console.log('Module RealFootball askRealFootBetRateInfo() classSchedule.find :',error);
                                return ;
                            }else if(0 == homedocs.length){
                                record += '主队暂无战绩,'; 
                            }else{
                                var homeWin = 0;
                                var homeFlat = 0;
                                var homeLose = 0;
                                for(var i =0;i<homedocs.length;i++){
                                    var score =homedocs[i]['final_score'].split(":");
                                    var value = 0;
                                    if(homedocs['home_team'] == homeTeam){
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
                                record += '主队'+homeWin+'胜'+homeFlat+'平'+homeLose+'负,';

                                //客队近期战绩
                                filter = {"match_date":{"$lt":Date.now()},"$or": [ {'home_team':awayTeam} , {'away_team':awayTeam} ],"final_score":{$ne:''}};
                                classSchedule.find(filter,select,{limit:10, sort:{'match_num':-1}},function(error,awaydocs){
                                    if(error){
                                        console.log('Module RealFootball askRealFootBetRateInfo() classSchedule.find :',error);
                                        return ;
                                    }else if(0 == awaydocs.length){
                                        record += '客队暂无战绩';
                                    }else{
                                        var awayWin = 0;
                                        var awayFlat = 0;
                                        var awayLose = 0;
                                        for(var i=0;i<awaydocs.length;i++){
                                            var score =awaydocs[i]['final_score'].split(":");
                                            var value = 0;
                                            if(awaydocs['home_team'] == awayTeam){
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
                                        record += '客队'+awayWin+'胜'+awayFlat+'平'+awayLose+'负';
                                        res.setLastestinfo(record);
                                        OBJ('WsMgr').send(socket, pbSvrcli.Res_RealFootBetRateInfo.Type.ID, res.serializeBinary());
                                    }

                                });

                            }
                        }); 

                    }
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
        var betInfoList = askRealFootBetInfo.getRlbetinfoList();
        if(betInfoList.length > betNumLimit){
            return;
        }
        var betScheduleId = [];
        var jingcaiType = 0;
        var betPlan = [];
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
                          "odds_jingcai_admin":1,"odds_rangqiu_admin":1,"handicap":1,"input_flag":1}
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
                    betPlanDetails['schedule_result']='';
                    if(1 == betClass){          //胜平负
                        if(1 == betArea){
                            betPlanDetails['bet_info'] = '主胜';
                            //赔率
                            if(docs[i]['input_flag']){
                                betPlanDetails['odds'] = docs[i]['odds_jingcai_admin'].h;
                            }else{
                                betPlanDetails['odds'] = docs[i]['odds_jingcai'].h;
                            }
                        }else if(2 == betArea){
                            betPlanDetails['bet_info'] = '平';
                            //赔率
                            if(docs[i]['input_flag']){
                                betPlanDetails['odds'] = docs[i]['odds_jingcai_admin'].d;
                            }else{
                                betPlanDetails['odds'] = docs[i]['odds_jingcai'].d;
                            }
                        }else if(3 == betArea){
                            betPlanDetails['bet_info'] = '客胜';
                            //赔率
                            if(docs[i]['input_flag']){
                                betPlanDetails['odds'] = docs[i]['odds_jingcai_admin'].a;
                            }else{
                                betPlanDetails['odds'] = docs[i]['odds_jingcai'].a;
                            }
                        }

                    }else if(2 == betClass){    //让球胜平负
                        if(1 == betArea){
                            betPlanDetails['bet_info'] = '主队'+docs[i]['handicap'];
                            //赔率
                            if(docs[i]['input_flag']){
                                betPlanDetails['odds'] = docs[i]['odds_rangqiu_admin'].h;
                            }else{
                                betPlanDetails['odds'] = docs[i]['odds_rangqiu'].h;
                            }
                        }else if(2 == betArea){
                            betPlanDetails['bet_info'] = '让球平';
                            //赔率
                            if(docs[i]['input_flag']){
                                betPlanDetails['odds'] = docs[i]['odds_rangqiu_admin'].d;
                            }else{
                                betPlanDetails['odds'] = docs[i]['odds_rangqiu'].d;
                            }
                        }else if(3 == betArea){
                            if(docs[i]['handicap']!=''){
                              var handicap = parseInt(docs[i]['handicap']);
                              if(handicap >0){
                                betPlanDetails['bet_info'] = '客队'+'-'+(-1*handicap);
                              }else if(handicap <0){
                                betPlanDetails['bet_info'] = '客队'+'+'+(handicap);
                              }else{
                                betPlanDetails['bet_info'] = '客队'+handicap;
                              }
                            }
                            //赔率
                            if(docs[i]['input_flag']){
                                betPlanDetails['odds'] = docs[i]['odds_rangqiu_admin'].a;
                            }else{
                                betPlanDetails['odds'] = docs[i]['odds_rangqiu'].a;
                            }
                        }
                    }
                    //总赔率
                    oddsTotal*=betPlanDetails['odds'];
                    //投注方案
                    betPlan.push(betPlanDetails);
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
                        jingcaiType:jingcaiType,betCoin:betCoin,distributeCoin:distributeCoin,betPlan:betPlan});
                OBJ('WalletAgentModule').send({module:'WalletSvrAgent', func:'reqBet', data:{
                    userid:player.userId, 
                    outType:3, 
                    outTypeDescription:'足球竞猜', 
                    uuid:uid, 
                    betCoin:betCoin.toString()
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
                        row.setBetcontents(item.bet_plan);
                        arr.push(row);
                    }
                    res.setRlbetrecordinfoList(arr);
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
            classSchedule.find(filter,select,function(error,docs){
                if(error){
                    console.log('Module RealFootball askRealFootRecords() find:', error);
                }
                var res = new pbSvrcli.Res_RealFootRecords();
                if(0 == docs.length){
                    player.send(pbSvrcli.Res_RealFootRecords.Type.ID, res.serializeBinary());
                    return ;
                }

                var arr = [];
                for(var item of docs){
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
                res.setRlschedulerecordsList(arr);
                player.send(pbSvrcli.Res_RealFootRecords.Type.ID, res.serializeBinary());

            });
        }catch(err){
            console.log('Module RealFootball askRealFootRecords() :', err);
        }

    }
   
    this.run = function(Timestamp){
        
    };
}