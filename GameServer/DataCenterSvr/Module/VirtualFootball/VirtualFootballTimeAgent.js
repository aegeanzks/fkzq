// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = VirtualFootballTimeAgent;

var Functions = require('../../../Utils/Functions');

const readySecondLong = 10 * 1000;     //准备时长 秒
const matchSecondLong = 130 * 1000;    //比赛时长 秒
const settlementSecondLong = 5 * 1000; //结算时长 秒
const showTrophySecondLong = 5 * 1000; //展示结果 秒

function VirtualFootballTimeAgent(){
    var timeTable = new Array(); //时刻表，记录虚拟足球的每天的球赛时间
    var curTimeRange;
    var self = this;
    self.matchState = 0;  
    self.matchStateLastTime = 0;
    self.no = '';

    //初始化函数
    function init(){
        //获取当天0时的时间
        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        var tomorrow = new Date(today);
        tomorrow.setHours(24);
        var timeToday = today.getTime();
        var timeTomorrow = tomorrow.getTime();

        //const readySecondLong = 10 * 1000;     //准备时长 秒
        //const matchSecondLong = 130 * 1000;    //比赛时长 秒
        //const settlementSecondLong = 5 * 1000; //结算时长 秒
        //const showTrophySecondLong = 5 * 1000; //展示结果 秒

        //比赛状态：0等待开始、1正在进行、2比赛结束（等待开奖）、3、比赛结束（开奖）
        var now = Date.now();
        var tomorrowTimeTable = new Array();
        var oneLong = readySecondLong + matchSecondLong + settlementSecondLong + showTrophySecondLong;
        for (var curTime=timeToday, issue=1; curTime <= timeTomorrow-showTrophySecondLong; curTime+=oneLong, issue++){  //一局150秒
            var strIssue = issue.toString();
            while(strIssue.length < 3)
                strIssue = '0' + strIssue;
            var one = {
                0:curTime,                                                              //等待开始(0-1之间，event=0)
                1:curTime + readySecondLong,                                            //正在进行(1-2之间，event=1)
                2:curTime + readySecondLong + matchSecondLong,                          //比赛结束（等待开奖）
                3:curTime + readySecondLong + matchSecondLong + settlementSecondLong,   //比赛结束（开奖）
                4:curTime + readySecondLong + matchSecondLong + settlementSecondLong + showTrophySecondLong,
                no:strIssue
            };
            if(now < one[1])
                timeTable.push(one);
            else{
                one[0] += 86400000;
                one[1] += 86400000;
                one[2] += 86400000;
                one[3] += 86400000;
                one[4] += 86400000;
                tomorrowTimeTable.push(one);
            }  
        }
        timeTable = timeTable.concat(tomorrowTimeTable);
        initCurEvent();
    }
    init();
    //更新时间范围，将旧的加一天放入队尾
    function updateTimeRange(){
        curTimeRange[0] += 86400000;
        curTimeRange[1] += 86400000;
        curTimeRange[2] += 86400000;
        curTimeRange[3] += 86400000;
        curTimeRange[4] += 86400000;
        timeTable.push(curTimeRange);
        curTimeRange = timeTable.shift();
        self.no = Functions.getDate(Date.now())+curTimeRange.no;
    }
    //初始化获得当前需要的事件与时间距离
    function initCurEvent(){
        var timestamp = Date.now();
        curTimeRange = timeTable.shift();
        self.no = Functions.getDate(timestamp)+curTimeRange.no;
        if(timestamp > curTimeRange[1]) //初始化时，如果发现游戏已经开始，则作废，时间放到下一期开始
            updateTimeRange();
    
        self.matchState = 0;
        self.matchStateLastTime = curTimeRange[self.matchState+1]-timestamp;
    }
    //获得当前的需要的事件与时间距离
    self.updateCurEvent = function(timestamp){
        var bRet = false;
        var nextEvent = self.matchState+1;
        if(timestamp > curTimeRange[nextEvent]){
            if(nextEvent==4){
                updateTimeRange();
                nextEvent = 0;
            }
            self.matchState = nextEvent;
            bRet = true;
        }
        self.matchStateLastTime = curTimeRange[self.matchState+1]-timestamp;
        return bRet;
    };
    //获得比赛的开始与结束时间
    self.getCurMatchStartEndTime = function(){
        return [curTimeRange[1], curTimeRange[2]];
    };
}