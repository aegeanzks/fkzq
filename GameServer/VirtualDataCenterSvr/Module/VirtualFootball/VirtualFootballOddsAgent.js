// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = VirtualFootballOddsAgent;

var VirtualFootballConf = require('./VirtualFootballConf');
var Functions = require('../../../Utils/Functions');

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

    var bExchange = false;                              //当这个值为true时，说明客队是强队
    if(teamInfo1.Score >= teamInfo2.Score){
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
        bExchange = true;
    }

    var mapOddsChange = conf.getOddsChangeMap();

    var oddsChangeBaseValue = conf.getOddsChangeBaseValue();
    var changeRate = oddsChangeBaseValue.change_rate;     //修改频率1  
    var baseValue = oddsChangeBaseValue.base_value;         //修改的基础值
    var maxReward = oddsChangeBaseValue.max_reward*100000;         //最大返奖率
    var minReward = oddsChangeBaseValue.min_reward*100000;         //最小返奖率

    var mapOddsChangeRatio = conf.getOddsChangeRatioMap();  //各个模型对应的初始值修改的比率

    //初始化时间刻度
    var timeScale = [];         //平局的情况
    var indexTimeScale = 0;              //时间刻度对应游标
    //进球数
    self.strongGoal = 0;            //强队进球数
    self.weakGoal = 0;              //弱队进球数
    //Q的数组
    var arrValue;
    //是否强制封盘
    self.isBlockade = false;

    init();
    function init(){
        //组合时间刻度
        initTimeScale();
    }

    function initTimeScale(){
        //计算所有的Q
        initScaleAndcountAllQ();
        //计算模型1
        initModel1();
        //计算模型2
        initModel2(1);
        initModel2(2);
        initModel2(3);
        //计算模型3
        initModel3(-1);
        initModel3(-2);
        initModel3(-3);
        initModelNext();
        //比赛剩下10秒强制封盘
        timeScale.push({
            happenTime : beginTime + 1000*120,
            b_draw : 0,a_host : 0,c_guest: 0,
            '0_host' : 0,'0_draw' : 0,'0_guest' : 0,
            '1_host' : 0,'1_draw' : 0,'1_guest' : 0,
            '2_host' : 0,'2_draw' : 0,'2_guest' : 0,
            '3_host' : 0,'3_draw' : 0,'3_guest' : 0,
            '-1_host' : 0,'-1_draw' : 0,'-1_guest' : 0,
            '-2_host' : 0,'-2_draw' : 0,'-2_guest' : 0,
            '-3_host' : 0,'-3_draw' : 0,'-3_guest' : 0,
            'next_host': 0, 'next_zero': 0, 'next_guest': 0
        });
    }

    //计算所有的Q
    function initScaleAndcountAllQ(){
        ////////////////////////////////////////////////////
        var allB = 0;
        var allA = 0;
        var allC = 0;
        var allD = 0;
        //初始化刻度表
        for(var index=0; index<mapOddsChange.size; index+=changeRate){
            var row = mapOddsChange.get(index);
            timeScale.push({
                happenTime : beginTime + 1000*index,
                b_draw : row.draw1,a_host : row.host2,c_guest: row.guest3, d_next:row.next4,
                '0_host' : 0,'0_draw' : 0,'0_guest' : 0,
                '1_host' : 0,'1_draw' : 0,'1_guest' : 0,
                '2_host' : 0,'2_draw' : 0,'2_guest' : 0,
                '3_host' : 0,'3_draw' : 0,'3_guest' : 0,
                '-1_host' : 0,'-1_draw' : 0,'-1_guest' : 0,
                '-2_host' : 0,'-2_draw' : 0,'-2_guest' : 0,
                '-3_host' : 0,'-3_draw' : 0,'-3_guest' : 0,
                'next_host': 0, 'next_zero': 0, 'next_guest': 0
            });
            allA += row.host2;
            allB += row.draw1;
            allC += row.guest3;
            allD += row.next4;
        }
        //根据平赔公式计算出M、Q、以及每一次变化后的赔率值
        arrValue = {
            //模型1
            '0_Q':countQ(self.drawTimes*mapOddsChangeRatio.get(0).draw_ratio, allB),
            //模型2
            '1_Q':countQ(self.strongWinTimes*mapOddsChangeRatio.get(1).win_ratio, allA),
            '2_Q':countQ(self.strongWinTimes*mapOddsChangeRatio.get(2).win_ratio, allA),
            '3_Q':countQ(self.strongWinTimes*mapOddsChangeRatio.get(3).win_ratio, allA),
            //模型3
            '-1_Q':countQ(self.weakWinTimes*mapOddsChangeRatio.get(-1).lose_ratio, allC),
            '-2_Q':countQ(self.weakWinTimes*mapOddsChangeRatio.get(-2).lose_ratio, allC),
            '-3_Q':countQ(self.weakWinTimes*mapOddsChangeRatio.get(-3).lose_ratio, allC),
            //模型4
            'next_Q':countQ(self.strongNextGoalTimes*mapOddsChangeRatio.get(0).draw_ratio, allD)
        };
    }

    function initModel1(){
        var N = baseValue;
        var Q = arrValue['0_Q'][0];
        var countQ = arrValue['0_Q'][1];
        var X0 = self.strongWinTimes;             //主胜初始赔率
        var Y0 = self.drawTimes;                //平初始赔率
        var Z0 = self.weakWinTimes;            //客胜初始赔率
        var b1 = timeScale[0].b_draw;           //平赔率单次变化量
        //模型1 平赔
        var Y1 = (Y0-(b1*N+Q)).toFixed(2);
        if(Y1 <= 1.01){    //如果要封盘了，那值都设置为0
            Y1 = 1.01;
            p = 0.9;
        }
        timeScale[0]['0_draw'] = Y1;
        //模型1 胜赔
        var p = Functions.getRandomNum(minReward, maxReward)/100000;
        var X1=optimizeFloat(((1+X0/Z0)/(1/p-1/Y1)).toFixed(2));
        timeScale[0]['0_host'] = X1;
        //模型1 负赔
        var Z1=optimizeFloat((X1/(X0/Z0)).toFixed(2));
        timeScale[0]['0_guest'] = Z1;
        //console.log('X0:'+X0+' Y0:'+Y0+' Z0:'+Z0+' p:'+p+' Q:'+Q);
        for(var i=1; i<timeScale.length; i++){
            if(i >= countQ) Q=0;
            //平赔
            var p = Functions.getRandomNum(minReward, maxReward)/100000;
            var X1 = timeScale[i-1]['0_host'];
            var Z1 = timeScale[i-1]['0_guest'];
            var Y1 = timeScale[i-1]['0_draw'];
            var b2 = timeScale[i].b_draw;
            //平赔
            var Y2 = (Y1-(b2*N+Q)).toFixed(2);
            if(Y1 == 1.01){
                //console.log('X'+i+':'+X1+' Y'+i+':'+Y1+' Z'+i+':'+Z1+' p:'+p+' Q:'+Q);
                break;
            }else if(Y2 <= 1.01){    //如果要封盘了，那值都设置为0
                Y2 = 1.01;
                p = 0.9;
            }
            timeScale[i]['0_draw'] = Y2;
            //胜赔
            var X2=optimizeFloat(((1+X1/Z1)/(1/p-1/Y2)).toFixed(2));
            timeScale[i]['0_host'] = X2;
            //负赔
            var Z2=optimizeFloat((X2/(X1/Z1)).toFixed(2));
            timeScale[i]['0_guest'] = Z2;
            //console.log('X'+i+':'+X1+' Y'+i+':'+Y1+' Z'+i+':'+Z1+' p:'+p+' Q:'+Q);
            //if(i == timeScale.length-1)
            //    console.log('X'+timeScale.length+':'+X2+' Y'+timeScale.length+':'+Y2+' Z'+timeScale.length+':'+Z2);
        }
    }

    function initModelNext(){
        var N = baseValue;
        var Q = arrValue['next_Q'][0];
        var countQ = arrValue['next_Q'][1];
        var X0 = self.strongNextGoalTimes;             //主胜初始赔率
        var Y0 = self.zeroGoalTimes;                //平初始赔率
        var Z0 = self.weakNextGoalTimes;            //客胜初始赔率
        var b1 = timeScale[0].d_next;           //平赔率单次变化量
        //模型1 平赔
        var Y1 = (Y0-(b1*N+Q)).toFixed(2);
        if(Y1 <= 1.01){    //如果要封盘了，那值都设置为0
            Y1 = 1.01;
            p = 0.9;
        }
        timeScale[0]['next_zero'] = Y1;
        //模型1 胜赔
        var p = Functions.getRandomNum(minReward, maxReward)/100000;
        var X1=optimizeFloat(((1+X0/Z0)/(1/p-1/Y1)).toFixed(2));
        timeScale[0]['next_host'] = X1;
        //模型1 负赔
        var Z1=optimizeFloat((X1/(X0/Z0)).toFixed(2));
        timeScale[0]['next_guest'] = Z1;
        //console.log('下一球：');
        //console.log('X0:'+X0+' Y0:'+Y0+' Z0:'+Z0+' p:'+p+' Q:'+Q);
        for(var i=1; i<timeScale.length; i++){
            if(i >= countQ) Q=0;
            //平赔
            var p = Functions.getRandomNum(minReward, maxReward)/100000;
            var X1 = timeScale[i-1]['next_host'];
            var Z1 = timeScale[i-1]['next_guest'];
            var Y1 = timeScale[i-1]['next_zero'];
            var b2 = timeScale[i].d_next;
            //平赔
            var Y2 = (Y1-(b2*N+Q)).toFixed(2);
            if(Y1 == 1.01){
                //console.log('X'+i+':'+X1+' Y'+i+':'+Y1+' Z'+i+':'+Z1+' p:'+p+' Q:'+Q);
                break;
            }else if(Y2 <= 1.01){    //如果要封盘了，那值都设置为0
                Y2 = 1.01;
                p = 0.9;
            }
            timeScale[i]['next_zero'] = Y2;
            //胜赔
            var X2=optimizeFloat(((1+X1/Z1)/(1/p-1/Y2)).toFixed(2));
            timeScale[i]['next_host'] = X2;
            //负赔
            var Z2=optimizeFloat((X2/(X1/Z1)).toFixed(2));
            timeScale[i]['next_guest'] = Z2;
            //console.log('X'+i+':'+X1+' Y'+i+':'+Y1+' Z'+i+':'+Z1+' p:'+p+' Q:'+Q);
            //if(i == timeScale.length-1)
            //    console.log('X'+timeScale.length+':'+X2+' Y'+timeScale.length+':'+Y2+' Z'+timeScale.length+':'+Z2);
        }
    }

    //计算模型2 分差>=1
    function initModel2(difNum){
        var N = baseValue;
        var X0 = self.strongWinTimes;             //主胜初始赔率
        var Y0 = self.drawTimes;                //平初始赔率
        var Z0 = self.weakWinTimes;            //客胜初始赔率
        var a1 = timeScale[0].a_host;           //平赔率单次变化量
        var Q = arrValue['1_Q'][0];
        var countQ = arrValue['1_Q'][1];
        var g1 = mapOddsChangeRatio.get(difNum).win_ratio;
        var g2 = mapOddsChangeRatio.get(difNum).draw_ratio;
        var g3 = mapOddsChangeRatio.get(difNum).lose_ratio;
        if(difNum == 2){
            Q = arrValue['2_Q'][0];
            countQ = arrValue['2_Q'][1];
        }else if(difNum == 3){
            Q = arrValue['3_Q'][0];
            countQ = arrValue['3_Q'][1];
        }
        var p = Functions.getRandomNum(minReward, maxReward)/100000;
        //模型2 胜赔
        var X1 = (X0*g1-(a1*N+Q)).toFixed(2);
        if(X1 <= 1.01){    //如果要封盘了，那值都设置为0
            X1 = 1.01;
            p = 0.9;
        }
        var Y1 = optimizeFloat(((1+g2/g3)/(1/p-1/X1)).toFixed(2));
        var Z1 = optimizeFloat((Y1/(g2/g3)).toFixed(2));
        if(difNum == 1){
            timeScale[0]['1_host'] = X1;
            timeScale[0]['1_draw'] = Y1;
            timeScale[0]['1_guest'] = Z1;
        }else if(difNum == 2){
            timeScale[0]['2_host'] = X1;
            timeScale[0]['2_draw'] = Y1;
            timeScale[0]['2_guest'] = Z1;
        }else if(difNum == 3){
            timeScale[0]['3_host'] = X1;
            timeScale[0]['3_draw'] = Y1;
            timeScale[0]['3_guest'] = Z1;
        }
        //console.log('比分差:'+difNum+' countQ:'+countQ);
        //console.log('X0:'+X0+' Y0:'+Y0+' Z0:'+Z0+' p:'+p+' Q:'+Q);
        for(var i=1; i<timeScale.length; i++){
            if(i >= countQ) Q=0;
            var X1 = timeScale[i-1]['1_host'];
            var Y1 = timeScale[i-1]['1_draw'];
            var Z1 = timeScale[i-1]['1_guest'];
            if(difNum == 2){
                X1 = timeScale[i-1]['2_host'];
                Y1 = timeScale[i-1]['2_draw'];
                Z1 = timeScale[i-1]['2_guest'];
            }else if(difNum == 3){
                X1 = timeScale[i-1]['3_host'];
                Y1 = timeScale[i-1]['3_draw'];
                Z1 = timeScale[i-1]['3_guest'];
            }
            var a2 = timeScale[i].a_host;
            var p = Functions.getRandomNum(minReward, maxReward)/100000;
            var X2 = (X1-(a2*N+Q)).toFixed(2);
            if(X1 == 1.01){
                //console.log('X'+i+':'+X1+' Y'+i+':'+Y1+' Z'+i+':'+Z1+' p:'+p+' Q:'+Q);
                break;
            }else if(X2 <= 1.01){    //如果要封盘了，那值都设置为0
                X2 = 1.01;
                p = 0.9;
            }
            var Y2 = optimizeFloat(((1+Y1/Z1)/(1/p-1/X2)).toFixed(2));
            var Z2 = optimizeFloat((Y2/(Y1/Z1)).toFixed(2));
            
            if(difNum == 1){
                timeScale[i]['1_host'] = X2;
                timeScale[i]['1_draw'] = Y2;
                timeScale[i]['1_guest'] = Z2;
            }else if(difNum == 2){
                timeScale[i]['2_host'] = X2;
                timeScale[i]['2_draw'] = Y2;
                timeScale[i]['2_guest'] = Z2;
            }else if(difNum == 3){
                timeScale[i]['3_host'] = X2;
                timeScale[i]['3_draw'] = Y2;
                timeScale[i]['3_guest'] = Z2;
            }
            //console.log('X'+i+':'+X1+' Y'+i+':'+Y1+' Z'+i+':'+Z1+' p:'+p+' Q:'+Q);
            //if(i == timeScale.length-1)
            //    console.log('X'+timeScale.length+':'+X2+' Y'+timeScale.length+':'+Y2+' Z'+timeScale.length+':'+Z2);
        }
    }

    //计算模型2 分差>=1
    function initModel3(difNum){
        var N = baseValue;
        var X0 = self.strongWinTimes;           //主胜初始赔率
        var Y0 = self.drawTimes;                //平初始赔率
        var Z0 = self.weakWinTimes;             //客胜初始赔率
        var c1 = timeScale[0].c_guest;          //平赔率单次变化量
        var Q = arrValue['-1_Q'][0];
        var countQ = arrValue['-1_Q'][1];
        var k1 = mapOddsChangeRatio.get(difNum).win_ratio;
        var k2 = mapOddsChangeRatio.get(difNum).draw_ratio;
        var k3 = mapOddsChangeRatio.get(difNum).lose_ratio;
        if(difNum == -2){
            Q = arrValue['-2_Q'][0];
            countQ = arrValue['-2_Q'][1];
        }else if(difNum == -3){
            Q = arrValue['-3_Q'][0];
            countQ = arrValue['-3_Q'][1];
        }
        var p = Functions.getRandomNum(minReward, maxReward)/100000;
        //模型3 负赔
        var Z1=(Z0*k3-(c1*N+Q)).toFixed(2);
        if(Z1 <= 1.01){    //如果要封盘了，那值都设置为0
            Z1 = 1.01;
            p = 0.9;
        }
        var Y1=optimizeFloat(((1+k2/k1)/(1/p-1/Z1)).toFixed(2));
        var X1=optimizeFloat((Y1/(k2/k1)).toFixed(2));
        if(difNum == -1){
            timeScale[0]['-1_host'] = X1;
            timeScale[0]['-1_draw'] = Y1;
            timeScale[0]['-1_guest'] = Z1;
        }else if(difNum == -2){
            timeScale[0]['-2_host'] = X1;
            timeScale[0]['-2_draw'] = Y1;
            timeScale[0]['-2_guest'] = Z1;
        }else if(difNum == -3){
            timeScale[0]['-3_host'] = X1;
            timeScale[0]['-3_draw'] = Y1;
            timeScale[0]['-3_guest'] = Z1;
        }
        //console.log('比分差:'+difNum+' countQ:'+countQ);
        //console.log('X0:'+X0+' Y0:'+Y0+' Z0:'+Z0+' p:'+p+' Q:'+Q);
        for(var i=1; i<timeScale.length; i++){
            if(i >= countQ) Q=0;
            var Z1 = timeScale[i-1]['-1_guest'];
            var Y1 = timeScale[i-1]['-1_draw'];
            var X1 = timeScale[i-1]['-1_host'];
            if(difNum == -2){
                Z1 = timeScale[i-1]['-2_guest'];
                Y1 = timeScale[i-1]['-2_draw'];
                X1 = timeScale[i-1]['-2_host'];
            }else if(difNum == -3){
                Z1 = timeScale[i-1]['-3_guest'];
                Y1 = timeScale[i-1]['-3_draw'];
                X1 = timeScale[i-1]['-3_host'];
            }
            var c2 = timeScale[i].c_guest;
            var p = Functions.getRandomNum(minReward, maxReward)/100000;
            var Z2 = (Z1-(c2*N+Q)).toFixed(2);
            if(Z1 == 1.01){
                //console.log('X'+i+':'+X1+' Y'+i+':'+Y1+' Z'+i+':'+Z1+' p:'+p+' Q:'+Q);
                break;
            }else if(Z2 <= 1.01){    //如果要封盘了，那值都设置为0
                Z2 = 1.01;
                p = 0.9;
            }
            var Y2 = optimizeFloat(((1+Y1/X1)/(1/p-1/Z2)).toFixed(2));
            var X2 = optimizeFloat((Y2/(Y1/X1)).toFixed(2));
            if(difNum == -1){
                timeScale[i]['-1_host'] = X2;
                timeScale[i]['-1_draw'] = Y2;
                timeScale[i]['-1_guest'] = Z2;
            }else if(difNum == -2){
                timeScale[i]['-2_host'] = X2;
                timeScale[i]['-2_draw'] = Y2;
                timeScale[i]['-2_guest'] = Z2;
            }else if(difNum == -3){
                timeScale[i]['-3_host'] = X2;
                timeScale[i]['-3_draw'] = Y2;
                timeScale[i]['-3_guest'] = Z2;
            }
            //console.log('X'+i+':'+X1+' Y'+i+':'+Y1+' Z'+i+':'+Z1+' p:'+p+' Q:'+Q);
            //if(i == timeScale.length-1)
            //    console.log('X'+timeScale.length+':'+X2+' Y'+timeScale.length+':'+Y2+' Z'+timeScale.length+':'+Z2);
        }
    }

    //优化数值  参数是小数后两位，返回值也是小数后两位
    function optimizeFloat(srcValue){
        srcValue = parseFloat(srcValue);
        var tmp = srcValue*100;
        tmp = tmp%10;
        if(tmp > 1 && tmp < 5){
            return (srcValue + (5-tmp)/100).toFixed(2);
        } else {
            return (srcValue + (10-tmp)/100).toFixed(2);
        }
    }

    //根据倍率初始值计算Q值
    function countQ(initValue, allB){
        var M = ((initValue-1)-allB*baseValue).toFixed(2);
        var Q = 0;
        var qCount = 0;
        if(M > 0.1){ 
            Q = 0.1;
            qCount = parseInt(M/Q);
        }
        return [Q,qCount];
    }

    this.update = function(timestamp){
        if(indexTimeScale < timeScale.length && timestamp > timeScale[indexTimeScale].happenTime){
            
            reckonTimes();
            //下一球,在倒数10时要把值置为与队列中一直，都为0，其他情况如果达到封顶值，就保持封顶状态
            if(0 != timeScale[indexTimeScale]['next_zero'] || indexTimeScale == timeScale.length-1){
                self.strongNextGoalTimes = timeScale[indexTimeScale]['next_host'];
                self.zeroGoalTimes = timeScale[indexTimeScale]['next_zero'];
                self.weakNextGoalTimes = timeScale[indexTimeScale]['next_guest'];
            }

            indexTimeScale++;
            return true;
        }
        return false;
    };
    //计算倍率
    function reckonTimes(indexOffSet = 0){
        //更新当前赔率
        var difNum = self.strongGoal-self.weakGoal;
        if(difNum > 3 || difNum <= -3){
            self.strongWinTimes = 0;
            self.drawTimes = 0;
            self.weakWinTimes = 0;
        }

        switch(difNum){
            case 0:{
                self.strongWinTimes = timeScale[indexTimeScale+indexOffSet]['0_host'];
                self.drawTimes = timeScale[indexTimeScale+indexOffSet]['0_draw'];
                self.weakWinTimes = timeScale[indexTimeScale+indexOffSet]['0_guest'];
            }break;
            case 1:{
                self.strongWinTimes = timeScale[indexTimeScale+indexOffSet]['1_host'];
                self.drawTimes = timeScale[indexTimeScale+indexOffSet]['1_draw'];
                self.weakWinTimes = timeScale[indexTimeScale+indexOffSet]['1_guest'];
            }break;
            case 2:{
                self.strongWinTimes = timeScale[indexTimeScale+indexOffSet]['2_host'];
                self.drawTimes = timeScale[indexTimeScale+indexOffSet]['2_draw'];
                self.weakWinTimes = timeScale[indexTimeScale+indexOffSet]['2_guest'];
            }break;
            case 3:{
                self.strongWinTimes = timeScale[indexTimeScale+indexOffSet]['3_host'];
                self.drawTimes = timeScale[indexTimeScale+indexOffSet]['3_draw'];
                self.weakWinTimes = timeScale[indexTimeScale+indexOffSet]['3_guest'];
            }break;
            case -1:{
                self.strongWinTimes = timeScale[indexTimeScale+indexOffSet]['-1_host'];
                self.drawTimes = timeScale[indexTimeScale+indexOffSet]['-1_draw'];
                self.weakWinTimes = timeScale[indexTimeScale+indexOffSet]['-1_guest'];
            }break;
            case -2:{
                self.strongWinTimes = timeScale[indexTimeScale+indexOffSet]['-2_host'];
                self.drawTimes = timeScale[indexTimeScale+indexOffSet]['-2_draw'];
                self.weakWinTimes = timeScale[indexTimeScale+indexOffSet]['-2_guest'];
            }break;
            case -3:{
                self.strongWinTimes = timeScale[indexTimeScale+indexOffSet]['-3_host'];
                self.drawTimes = timeScale[indexTimeScale+indexOffSet]['-3_draw'];
                self.weakWinTimes = timeScale[indexTimeScale+indexOffSet]['-3_guest'];
            }break;
        }
    }
    //设置进球数
    this.setGoalNum = function(hostGoalNum, guestGoalNum){
        if(bExchange){
            self.strongGoal = guestGoalNum;            //强队进球数
            self.weakGoal = hostGoalNum;              //弱队进球数
        }else{
            self.strongGoal = hostGoalNum;            //强队进球数
            self.weakGoal = guestGoalNum;              //弱队进球数
        }
        reckonTimes(-1);
    };
    //获取当前比分对应的赔率
    this.getCurOdds = function(){
        if(self.isBlockade){
            return [0,0,0,0,0,0];
        }
        if(bExchange){
            return [self.weakWinTimes, self.drawTimes, self.strongWinTimes, 
                self.weakNextGoalTimes, self.zeroGoalTimes, self.strongNextGoalTimes];
        }else{
            return [self.strongWinTimes, self.drawTimes, self.weakWinTimes,
                self.strongNextGoalTimes, self.zeroGoalTimes, self.weakNextGoalTimes];
        }
    };
}