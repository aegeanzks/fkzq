// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = VirtualFootballConf;

var fs = require('fs');

function VirtualFootballConf(){
    //成员变量
    var self = this;
    var mapTeamInfo; //球队信息
    var mapTeamOdds = new Map();    //球队赔率
    var timeTable = new Map();      //时刻表，记录虚拟足球的每天的球赛时间
    const readySecondLong = 10 * 1000;     //准备时长 秒
    const matchSecondLong = 130 * 1000;    //比赛时长 秒
    const settlementSecondLong = 5 * 1000; //结算时长 秒
    const showTrophySecondLong = 5 * 1000; //展示结果 秒

    //初始化函数
    function init(){
        createTeamInfo();
        createTeamOdds();
        createTimeTable();
    }
    init();

    function createTeamInfo(){
        mapTeamInfo = JSON.parse(fs.readFileSync('./Json/TeamInfo.json'));
    }

    function createTeamOdds(){
        var teamOdds = JSON.parse(fs.readFileSync('./Json/TeamOdds.json'));
        for(var key in teamOdds){
            var item = teamOdds[key];
            var arrayTeamOdds = mapTeamOdds.get(item.LevelDif);
            if (null == arrayTeamOdds){
                arrayTeamOdds = [];
                mapTeamOdds.set(item.LevelDif, arrayTeamOdds);
            }
            arrayTeamOdds.push(item);
        }
    }

    function createTimeTable(){
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
        var oneLong = readySecondLong + matchSecondLong + settlementSecondLong + showTrophySecondLong;
        for (var curTime=timeToday, issue=1; curTime <= timeTomorrow; curTime+=oneLong, issue++){  //一局150秒
            var one = new Map();
            one.set(0, curTime);                 //等待开始
            one.set(1, curTime + readySecondLong);      //正在进行
            one.set(2, curTime + readySecondLong + matchSecondLong);    //比赛结束（等待开奖）
            one.set(3, curTime + readySecondLong + matchSecondLong + settlementSecondLong); //比赛结束（开奖）
            timeTable.set(issue, one);
        }
    }
}