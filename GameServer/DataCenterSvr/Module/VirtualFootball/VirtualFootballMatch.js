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

const HOST_BALL_HANDING = 1;            //主队控球
const HOST_ATTACK = 2;                  //主队进攻
const HOST_DANGEROUS_ATTACK = 3;        //主队危险进攻
const GUEST_BALL_HANDING = 4;           //客队控球
const GUEST_ATTACK = 5;                 //客队进攻
const GUEST_DANGEROUS_ATTACK = 6;       //客队危险进攻
const HOST_GOAL = 7;                    //主队进球
const GUEST_GOAL = 8;                   //客队进球

function VirtualFootballMatch(conf, beginTime, endTime){
    var self = this;
    //球队信息
    self.hostTeam = conf.randATeam(-1);
    self.guestTeam = conf.randATeam(self.hostTeam.ID);

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

    var confMatchEvent;
    //当前比赛事件
    self.curEvent = 0;
    //下一个事件的到达时间
    self.nextEventTime = 0;
    //是否开始标志
    var bStart = false;

    //进球时间节点列表
    var timeGoal = [];

    //是否进入进球节点 0未进入 1下一个事件为危险进攻动画 2下一个事件为进球动画
    var nInGoalTime = 0;

    //是否作弊
    var bCheat = false;
    var judge = 0;      //哪一队进球判断结果
    
    initBetArea();
    function initBetArea(){
        conf.randOdds(self.hostTeam.Level, self.guestTeam.Level, function(odds){
            hostWinTimes = odds.host_win;
            drawTimes = odds.drawn;
            guestWinTimes = odds.guest_win;
            hostNextGoalTimes = odds.host_goal;
            zeroGoalTimes = odds.zero;
            guestNextGoalTimes = odds.guest_goal;
        });
    }

    initAllGoal();
    function initAllGoal(){
        conf.randGoal(function(goal){
            allGoal = goal;
            allGoal = 9;
            console.log('进球数：'+allGoal);
        });
    }

    initEvents();
    function initEvents(){
        conf.getEvents(function(events){
            confMatchEvent = events;
            //计算进球时间段列表
            var arrSlot = [];
            for(var i=0; i<allGoal; i++){
                var maxTime = confMatchEvent.get(HOST_DANGEROUS_ATTACK).animation_time;
                arrSlot.push(Functions.getRandomNum(1, maxTime));
            }
            //将赛场按危险进球的动作长度分割成几块，然后洗牌后，取出当做随机进球时间段
            var headTime = confMatchEvent.get(HOST_BALL_HANDING).animation_time;
            var maxTime = confMatchEvent.get(HOST_DANGEROUS_ATTACK).animation_time;
            maxTime += confMatchEvent.get(HOST_GOAL).animation_time;
            var count = (130-headTime)/maxTime;
            var tempPool = [];
            for(var i=0; i<count; i++){
                tempPool.push(i);
            }
            tempPool = shuffle(tempPool.slice(0));
            var count = arrSlot.length;
            var sortArr = [];
            while(count--){
                sortArr.push(tempPool.shift());
            }
            sortArr.sort(function(a,b){
                return a-b;
            });
            var realBeginTime = beginTime+headTime;
            var realMaxTime = maxTime*1000;
            for(var i=0; i<sortArr.length; i++){
                var animation_beginTime = realBeginTime+sortArr[i]*realMaxTime;
                timeGoal.push({
                    goal_animation_beginTime: animation_beginTime,
                    goal_animation_endTime: animation_beginTime + arrSlot[i]*1000
                });
            }
        });
    }

    //返回 0主队进球 1客队进球 2不进球
    function judgeWhichGoal(){
        if(bCheat){         //需要作弊

        }else{              //不需要作弊
            var allScore = self.hostTeam.Score + self.guestTeam.Score;
            var randNum = Functions.getRandomNum(1, allScore);
            if(randNum <= self.hostTeam.Score)
                return 0;
            else
                return 1;
        }
    }

    function updateNextEvent(timestamp){
        var oldEvent = self.curEvent;

        if(1 == nInGoalTime){
            //判断是主队还是客队进球
            judge = judgeWhichGoal();
            if (0 == judge){             //主队进球
                self.curEvent = HOST_DANGEROUS_ATTACK;
            }else if(1 == judge){        //客队进球
                self.curEvent = GUEST_DANGEROUS_ATTACK;
            }else{                       //不进球
                self.curEvent = Functions.getRandomNum(0, 1) == 0? HOST_DANGEROUS_ATTACK:GUEST_DANGEROUS_ATTACK;
            }
            self.nextEventTime = timeGoal[0].goal_animation_endTime;
            nInGoalTime = 2;
            timeGoal.shift();       //删除第一个进球时间节点
            return oldEvent != self.curEvent;
        } else if (2 == nInGoalTime &&  2 != judge){
            if (0 == judge){             //主队进球
                self.curEvent = HOST_GOAL;
                self.hostTeamGoal++;
            }else if(1 == judge){        //客队进球
                self.curEvent = GUEST_GOAL;
                self.guestTeamGoal++;
            }
            var maxTime = confMatchEvent.get(HOST_GOAL).animation_time;
            self.nextEventTime = (timestamp/1000 + Functions.getRandomNum(1, maxTime))*1000;
            nInGoalTime = 0;
            return oldEvent != self.curEvent;
        } else if (2 == nInGoalTime &&  2 == judge){
            nInGoalTime = 0;
        }
        //根据配置的概率，随机出下一个事件与事件需要的时间
        var eventConf = confMatchEvent.get(self.curEvent);
        var randArr = [];
        randArr = packageRandArr(eventConf.host_ball_handling, HOST_BALL_HANDING, randArr);
        randArr = packageRandArr(eventConf.host_attack, HOST_ATTACK, randArr);
        randArr = packageRandArr(eventConf.host_dangerous_attack, HOST_DANGEROUS_ATTACK, randArr);
        randArr = packageRandArr(eventConf.guest_ball_handling, GUEST_BALL_HANDING, randArr);
        randArr = packageRandArr(eventConf.guest_attack, GUEST_ATTACK, randArr);
        randArr = packageRandArr(eventConf.guest_dangerous_attack, GUEST_DANGEROUS_ATTACK, randArr);
        var index = Functions.getRandomNum(0, randArr.length-1);
        self.curEvent = randArr[index];
        var maxTime = confMatchEvent.get(self.curEvent).animation_time;
        self.nextEventTime = (timestamp/1000 + Functions.getRandomNum(1, maxTime))*1000;
        if(timeGoal.length > 0){
            if(self.nextEventTime > timeGoal[0].goal_animation_beginTime){
                nInGoalTime = 1;
                self.nextEventTime = timeGoal[0].goal_animation_beginTime;
            }
        }

        return oldEvent != self.curEvent;
    }

    function packageRandArr(num, item, randArr){
        for(var i=0; i<num; i++){
            randArr.push(item);
        }
        return randArr;
    }

    self.startMatch = function(){
        //初始都是主队控球或者客队控球
        self.curEvent = Functions.getRandomNum(0, 1) == 0? HOST_BALL_HANDING:GUEST_BALL_HANDING;
        var maxTime = confMatchEvent.get(self.curEvent).animation_time;
        self.nextEventTime = beginTime + Functions.getRandomNum(1, maxTime)*1000;
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
}