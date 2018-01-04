// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = VirtualFootballOddsAgent;

var VirtualFootballConf = require('./VirtualFootballConf');

//初始化时自动识别强弱关系
function VirtualFootballOddsAgent(conf, teamInfo1, teamInfo2, beginTime, endTime, odds){
    var self = this;
    var conf = conf;
    var beginTime = beginTime;
    var endTime = endTime;
    //设置强弱队
    var strongTeam;
    var weakTeam;
    self.drawTimes = odds.drawTimes;		            //平  倍数
    self.zeroGoalTimes = odds.zeroGoalTimes;	        //无进球  倍数
    if(teamInfo1.level >= teamInfo2.level){
        strongTeam = teamInfo1;
        weakTeam = teamInfo2;
        self.strongWinTimes = odds.hostWinTimes;		    //主胜倍数
        self.weakWinTimes = odds.guestWinTimes;	            //客胜倍数
        self.strongNextGoalTimes = odds.hostNextGoalTimes;	//主队进球倍数
        self.weakNextGoalTimes = odds.guestNextGoalTimes;	//客队进球倍数
    } else {
        strongTeam = teamInfo2;
        weakTeam = teamInfo1;
        self.strongWinTimes = odds.guestWinTimes;		    //主胜倍数
        self.weakWinTimes = odds.hostWinTimes;	            //客胜倍数
        self.strongNextGoalTimes = odds.guestNextGoalTimes;	//主队进球倍数
        self.weakNextGoalTimes = odds.hostNextGoalTimes;	//客队进球倍数
    }

    var mapOddsChange = conf.getOddsChangeMap();

    var oddsChangeBaseValue = conf.getOddsChangeBaseValue();
    var changeRate1 = oddsChangeBaseValue.change_rate1;     //修改频率1  
    var changeRate2 = oddsChangeBaseValue.change_rate2;     //修改频率2
    var changeRate3 = oddsChangeBaseValue.change_rate3;     //修改频率3
    var baseValue = oddsChangeBaseValue.base_value;         //修改的基础值

    var mapOddsChangeRatio = conf.getOddsChangeRatioMap();  //各个模型对应的初始值修改的比率

    //初始化时间刻度
    var timeScale1 = [];
    var timeScale2 = [];
    var timeScale3 = [];
    var index1 = 0;//时间刻度对应游标
    var index2 = 0;
    var index3 = 0;
    //进球数
    self.strongGoal = 0;
    self.weakGoal = 0;

    init();
    function init(){
        initTimeScale();
    }

    function initTimeScale(){
        var row = mapOddsChange.get(1);
        //第一秒变化一次
        timeScale1.push({
            scale: 0,
            happenTime : beginTime,
            host : row.host1,
            draw : row.draw,
            guest : row.host2
        });
        //每隔changeRate秒变化一次
        for(var index=0; index<mapOddsChange.size; index+=changeRate1){
            var row = mapOddsChange.get(index);
            row = mapOddsChange.get(index);
            timeScale1.push({
                scale : index,
                happenTime : beginTime + 1000*index,
                host : row.host1,
                draw : row.draw1,
                guest : row.guest1
            });
        }
        //每隔changeRate秒变化一次
        for(var index=0; index<mapOddsChange.size; index+=changeRate2){
            var row = mapOddsChange.get(index);
            row = mapOddsChange.get(index);
            timeScale2.push({
                scale : index,
                happenTime : beginTime + 1000*index,
                host : row.host2,
                draw : row.draw2,
                guest : row.guest2
            });
        }
        //每隔changeRate秒变化一次
        for(var index=0; index<mapOddsChange.size; index+=changeRate3){
            var row = mapOddsChange.get(index);
            row = mapOddsChange.get(index);
            timeScale3.push({
                scale : index,
                happenTime : beginTime + 1000*index,
                host : row.host3,
                draw : row.draw3,
                guest : row.host3
            });
        }
    }

    this.update = function(timestamp){
        if(timestamp > timeScale1[index1].happenTime){
            
        }
        if(timestamp > timeScale2[index2].happenTime){
            
        }
        if(timestamp > timeScale3[index3].happenTime){
            
        }
    };
}