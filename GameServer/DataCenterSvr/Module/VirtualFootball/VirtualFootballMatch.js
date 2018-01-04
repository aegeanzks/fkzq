// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = VirtualFootballMatch;

var Functions = require('../../../Utils/Functions');
var shuffle = require('knuth-shuffle').knuthShuffle;
var OBJ = require('../../../Utils/ObjRoot').getObj;
var Schema = require('../../../db_structure');
var VirtualFootballOddsAgent = require('./VirtualFootballOddsAgent');

const HOST_BALL_HANDING = 1;            //主队控球
const HOST_ATTACK = 2;                  //主队进攻
const HOST_DANGEROUS_ATTACK = 3;        //主队危险进攻
const GUEST_BALL_HANDING = 4;           //客队控球
const GUEST_ATTACK = 5;                 //客队进攻
const GUEST_DANGEROUS_ATTACK = 6;       //客队危险进攻
const HOST_GOAL = 7;                    //主队进球
const GUEST_GOAL = 8;                   //客队进球
const DANGEROUS_ATTACK = 9;             //自己用，代表还未决定是哪队进球时候的危险进攻
const GOAL = 10;                        //自己用，代表还未决定是哪队进球时候的进球

function VirtualFootballMatch(conf, beginTime, endTime){
    var self = this;
    var conf = conf;
    //球队信息
    self.hostTeam = conf.randATeam(-1);
    self.guestTeam = conf.randATeam(self.hostTeam.ID);

    //var oddsAgent = VirtualFootballOddsAgent(conf, self.hostTeam, self.guestTeam, beginTime, endTime);

    self.hostTeamGoal = 0;   //比分
    self.guestTeamGoal = 0;  

    //猜胜负平
	self.hostWinTimes = 0;		    //主胜倍数
	self.hostWinSupport = 0;	        //主胜支持率
	self.drawTimes = 0;		        //平  倍数
	self.drawSupport = 0;		    //平  支持率
	self.guestWinTimes = 0;	        //客胜倍数
	self.guestWinSupport = 0;	    //客胜支持率
	//猜下一队进球
	self.hostNextGoalTimes = 0;	    //主队进球倍数
	self.hostNextGoalSupport = 0;	//主队进球支持率
	self.zeroGoalTimes = 0;	        //无进球  倍数
	self.zeroGoalSupport = 0;	    //无进球  支持率
	self.guestNextGoalTimes = 0;	    //客队进球倍数
    self.guestNextGoalSupport = 0;   //客队进球支持率
    
    var allGoal = 0;                //总进球数
    var beginTime = beginTime;      //比赛开始时间
    var endTime = endTime;          //比赛结束时间

    self.hostWinNum = 0;
    self.drawNum = 0;
    self.guestWinNum = 0;

    var confMatchEvent;
    //当前比赛事件
    self.curEvent = 0;
    //下一个事件的到达时间
    self.nextEventTime = 0;
    //是否开始标志
    var bStart = false;

    //进球时间节点列表
    var timeGoal = [];

    //是否作弊
    var bCheat = false;
    var judge = 0;      //哪一队进球判断结果

    //比赛赛程表
    var scheduleArr = [];

    var classVirtualSchedule = OBJ('DbMgr').getStatement(Schema.VirtualSchedule());
    var classConfVirtualStock = OBJ('DbMgr').getStatement(Schema.ConfStock());

    //库存
    var curStock = 0;
    var cheatChange1 = 0;
    var stockThreshold1 = 0;
    var cheatChange2 = 0;
    var stockThreshold2 = 0;
    var cheatChange3 = 0;
    conf.getStock(function(stockConf){
        curStock = stockConf.curStock;
        cheatChange1 = stockConf.cheatChange1;
        stockThreshold1 = stockConf.stockThreshold1;
        cheatChange2 = stockConf.cheatChange2;
        stockThreshold2 = stockConf.stockThreshold2;
        cheatChange3 = stockConf.cheatChange3;
    });

    //获取两队的对战历史
    initBattleHistory();
    function initBattleHistory() {
        //获取两队交锋场次，并广播
        classVirtualSchedule.find({
            "$or": [{ "host_team_id": self.hostTeamId, "guest_team_id": self.guestTeamId },
            { "host_team_id": self.guestTeamId, "guest_team_id": self.hostTeamId }]
        }, function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            if (data.length > 0) {
                for (var item of data) {
                    if (item.host_team_goal == item.guest_team_goal)
                        self.drawNum++;
                    else if (item.host_team_goal > item.guest_team_goal) {
                        if (item.host_team_id == self.hostTeamId) {
                            self.hostWinNum++;
                        } else {
                            self.guestWinNum++;
                        }
                    } else {
                        if (item.host_team_id == self.hostTeamId) {
                            self.guestWinNum++;
                        } else {
                            self.hostWinNum++;
                        }
                    }
                }
            }
        });
    }
    
    initBetArea();
    function initBetArea(){
        conf.randOdds(self.hostTeam.Level, self.guestTeam.Level, function(odds){
            self.hostWinTimes = odds.host_win;
            self.drawTimes = odds.drawn;
            self.guestWinTimes = odds.guest_win;
            self.hostNextGoalTimes = odds.host_goal;
            self.zeroGoalTimes = odds.zero;
            self.guestNextGoalTimes = odds.guest_goal;
        });
    }

    initAllGoal();
    function initAllGoal(){
        conf.randGoal(function(goal){
            allGoal = goal;
            console.log('进球数：'+allGoal);
            initEvents();
        });
    }

    function initEvents(){
        conf.getEvents(function(events){
            confMatchEvent = events;
            var baseTime = beginTime;
            var baseEndTime = baseTime + (endTime-beginTime);
            var timeAxis = [];
            var matchLong = (endTime-beginTime)/1000;//比赛时间长度 秒
            for(var i = 0; i < matchLong; i++){
                timeAxis.push(true);
            }

            //计算比赛赛程表
            var firEvent = Functions.getRandomNum(0, 1) == 0? HOST_BALL_HANDING:GUEST_BALL_HANDING;
            var maxTime = confMatchEvent.get(firEvent).animation_time;
            var nextTime = Functions.getRandomNum(1, maxTime);
            var nextTimeMill = nextTime*1000;
            scheduleArr.push({
                event:firEvent, 
                happenTime:baseTime+0,
                endTime:baseTime+0+nextTimeMill,
                bGoal:false, 
                goal:0
            });         //bGoal是否进球点 goal:0不进球 1主队进球 2客队进球

            //随机出进球点的各个时间长度
            goalsTimeLongArr = randGoalsTimeLong();
            timeLongParam = [];
            for(var item of goalsTimeLongArr){
                timeLongParam.push(item.dangerousTime+item.goalTime);
            }
            console.log(timeLongParam);
            //计算进球点
            var goalsScatterArr = Functions.getScatteredSectionBy(timeLongParam, matchLong-nextTime);
            var goalsSortArr = [];
            goalsSortArr.push();
            for(var i=0; i<goalsTimeLongArr.length; i++){
                goalsSortArr.push({
                    time1:baseTime+nextTimeMill+goalsScatterArr[i]*1000,
                    time2:baseTime+nextTimeMill+(goalsScatterArr[i]+goalsTimeLongArr[i].dangerousTime)*1000,
                    time3:baseTime+nextTimeMill+(goalsScatterArr[i]+timeLongParam[i])*1000
                });
            }
            goalsSortArr.sort(function(a,b){
                return a.time1-b.time1;
            });
            //生成时间轴上的所有事件
            while(true){
                var lastEndTime = scheduleArr[scheduleArr.length-1].endTime;
                if(goalsSortArr.length > 0){
                    if(lastEndTime == goalsSortArr[0].time1){
                        scheduleArr.push({
                            event:DANGEROUS_ATTACK, 
                            happenTime:goalsSortArr[0].time1,
                            endTime:goalsSortArr[0].time2,
                            bGoal:true, 
                            goal:0
                        });
                        scheduleArr.push({
                            event:GOAL, 
                            happenTime:goalsSortArr[0].time2,
                            endTime:goalsSortArr[0].time3,
                            bGoal:true, 
                            goal:0
                        });
                        goalsSortArr.shift();
                    } else {
                        var lastEvent = scheduleArr[scheduleArr.length-1].event;
                        if(lastEvent == GOAL) lastEvent = HOST_GOAL;
                        var ret = getRandEventIdAndMaxTime(lastEvent);
                        var eventEndTime = scheduleArr[scheduleArr.length-1].endTime+ret[1];
                        if(eventEndTime>=goalsSortArr[0].time1){
                            eventEndTime = goalsSortArr[0].time1;
                        }
                        scheduleArr.push({
                            event:ret[0], 
                            happenTime:scheduleArr[scheduleArr.length-1].endTime,
                            endTime:eventEndTime,
                            bGoal:false, 
                            goal:0
                        });
                    }
                } else {
                    var lastEvent = scheduleArr[scheduleArr.length-1].event;
                    if(lastEvent == 10) lastEvent = 7;
                    var ret = getRandEventIdAndMaxTime(lastEvent);
                    var eventEndTime = scheduleArr[scheduleArr.length-1].endTime+ret[1];
                    if(eventEndTime > baseEndTime){
                        eventEndTime = baseEndTime;
                    }
                    scheduleArr.push({
                        event:ret[0], 
                        happenTime:scheduleArr[scheduleArr.length-1].endTime,
                        endTime:eventEndTime,
                        bGoal:false, 
                        goal:0
                    });
                    if(eventEndTime == baseEndTime)
                        break;
                }
            }
        });
    }

    //随机出进球点所用的时间
    function randGoalsTimeLong(){
        if(null == confMatchEvent)
            return null;
        var dangerousTime = confMatchEvent.get(HOST_DANGEROUS_ATTACK).animation_time;
        var goalTime = confMatchEvent.get(HOST_GOAL).animation_time;
        var randArr = [];
        for(var i=0; i<allGoal; i++){
            randArr.push({
                dangerousTime:Functions.getRandomNum(1, dangerousTime),
                goalTime:Functions.getRandomNum(1, goalTime)
            });
        }
        return randArr;
    }

    //返回 0不进球 1主队进球 2客队进球
    function judgeWhichGoal(){
        if(bCheat){         //需要作弊

        }else{              //不需要作弊
            var allScore = self.hostTeam.Score + self.guestTeam.Score;
            var randNum = Functions.getRandomNum(1, allScore);
            if(randNum <= self.hostTeam.Score)
                return 1;
            else
                return 2;
        }
    }

    var playerIndex = 0;
    function updateNextEvent(timestamp){
        playerIndex++;
        if(playerIndex >= scheduleArr.length)
            return false;
        var oldEvent = self.curEvent;
        if(scheduleArr[playerIndex].event == DANGEROUS_ATTACK){
            judge = judgeWhichGoal();
            if(1 == judge){
                scheduleArr[playerIndex].event = HOST_DANGEROUS_ATTACK;
                scheduleArr[playerIndex+1].event = HOST_GOAL;
            }else if(2 == judge){
                scheduleArr[playerIndex].event = GUEST_DANGEROUS_ATTACK;
                scheduleArr[playerIndex+1].event = GUEST_GOAL;
            }else{
                
            }
            scheduleArr[playerIndex].goal = judge;
            scheduleArr[playerIndex+1].goal = judge;
        } else if(scheduleArr[playerIndex].event == HOST_GOAL){
            self.hostTeamGoal++;
            //猜下一队进球
            self.hostNextGoalSupport = 0;	//主队进球支持率
            self.zeroGoalSupport = 0;	    //无进球  支持率
            self.guestNextGoalSupport = 0;   //客队进球支持率
        } else if(scheduleArr[playerIndex].event == GUEST_GOAL){
            self.guestTeamGoal++;
            //猜下一队进球
            self.hostNextGoalSupport = 0;	//主队进球支持率
            self.zeroGoalSupport = 0;	    //无进球  支持率
            self.guestNextGoalSupport = 0;   //客队进球支持率
        }
        self.curEvent = scheduleArr[playerIndex].event;
        self.nextEventTime = scheduleArr[playerIndex].endTime;

        return oldEvent != self.curEvent;
    }

    //随机事件与事件所用时间
    var randArrMap = new Map();
    function getRandEventIdAndMaxTime(eventId) {
        if(randArrMap.size == 0){
            for(var i=HOST_BALL_HANDING; i<=GUEST_GOAL; i++){
                var eventConf = confMatchEvent.get(i);
                var randArr = [];
                randArr = packageRandArr(eventConf.host_ball_handling, HOST_BALL_HANDING, randArr);
                randArr = packageRandArr(eventConf.host_attack, HOST_ATTACK, randArr);
                randArr = packageRandArr(eventConf.host_dangerous_attack, HOST_DANGEROUS_ATTACK, randArr);
                randArr = packageRandArr(eventConf.guest_ball_handling, GUEST_BALL_HANDING, randArr);
                randArr = packageRandArr(eventConf.guest_attack, GUEST_ATTACK, randArr);
                randArr = packageRandArr(eventConf.guest_dangerous_attack, GUEST_DANGEROUS_ATTACK, randArr);
                randArrMap.set(i, randArr);
            }
        }
        var randArr = randArrMap.get(eventId);
        var index = Functions.getRandomNum(0, randArr.length-1);
        var retEvent = randArr[index];
        var maxTime = confMatchEvent.get(retEvent).animation_time;
        var retTimeLong = Functions.getRandomNum(1, maxTime)*1000;
        return [retEvent, retTimeLong];
    }

    function packageRandArr(num, item, randArr){
        for(var i=0; i<num; i++){
            randArr.push(item);
        }
        return randArr;
    }

    self.startMatch = function(){
        //初始都是主队控球或者客队控球
        self.curEvent = scheduleArr[0].event;
        self.nextEventTime = scheduleArr[0].endTime;
        bStart = true;
    };

    self.stopMatch = function(){
        bStart = false;
    };

    self.update = function(timestamp){
        if(!bStart)
            return false;
        if(timestamp >= self.nextEventTime){
            return updateNextEvent(timestamp);
        }
        return false;
    };

    self.supportArea = function(area){
        switch(area){
            case 1:
            {
                hostWinSupport++;
                break;
            }
            case 2:
            {
                drawSupport++;
                break;
            }
            case 3:
            {
                guestWinSupport++;
                break;
            }
            case 4:
            {
                hostNextGoalSupport++;
                break;
            }
            case 5:
            {
                zeroGoalSupport++;
                break;
            }
            case 6:
            {
                guestNextGoalSupport++;
                break;
            }
        }
    };

    function setCurStock(curStock, func){
        classConfVirtualStock.findOneAndUpdate({'game_id':1}, {'cur_stock':curStock}, function(err, data){
            if(err){
                console.log(err);
                return;
            }
            func(data.cur_stock);
        });
    }
    //加库存(用队列操作)
    var arrAddStock = [];
    this.addCurStock = function(addNum){
        arrAddStock.push(addNum);
        if(arrAddStock.length == 1){
            addStock();
        }
    };
    function addStock(){
        if(arrAddStock.length > 0){
            setCurStock(curStock+arrAddStock[0], function(data){
                curStock = data;
                arrAddStock.shift();
                addStock();
            });
        }
    }
}