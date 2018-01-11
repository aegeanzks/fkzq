// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = RealFootball;

var SingleTimer = require('../../../Utils/SingleTimer');
var RealFootballConf = require('./RealFootballConf');
var DataPull = require('./DataPull');
var OBJ = require('../../../Utils/ObjRoot').getObj;
var config = require('../../../config').dataCenterSvrConfig();

function RealFootball(){
    var self = this;
    var conf = new RealFootballConf();
    var dataPull = new DataPull();

    var betItemUpdateTimer = new SingleTimer();
    betItemUpdateTimer.startup(30*60*1000);         //30分钟读取一次配置文件 

    var pullTimer = new SingleTimer();
    pullTimer.startup(config.pullInterval*1000);

    var settlementTimer = new SingleTimer();
    settlementTimer.startup(config.pullInterval*1000);

    var betItem1 = 0;
    var betItem2 = 0;
    var betItem3 = 0;
    var betNumLimit = 0;
    var betCoinLimit = 0;

    init();

    function init(){
        //获取投注配置
        conf.getBetItem(function(v1, v2, v3,v4,v5){
            betItem1 = v1;
            betItem2 = v2;
            betItem3 = v3;
            betNumLimit = v4;
            betCoinLimit = v5;
        });
    }



    //真实足球入口
    this.run = function(timestamp){

        //数据拉取
        doDataPull(timestamp);

        //后台修改异常的数据,结算


        //更新投资配置信息
        betItemUpdate(timestamp);
    }

    //投注信息配置
    OBJ('RpcModule').registerInitFun(this.getRealBetConf);
    this.getRealBetConf = function(source, data){
        //发送投注项数据
        OBJ('RpcModule').broadcastGameServer('RealFootball', 'refreshBetItem', {
            betItem1:betItem1,
            betItem2:betItem2,
            betItem3:betItem3,
            betNumLimit:betNumLimit,
            betCoinLimit:betCoinLimit
        });
    };

    //游戏服重新启动请求数据
    this.reGetCurData = function(source,data){
        dataPull.reGetCurData(source,data);
    }

    /* 
        @func 数据拉取
    */
    function doDataPull(timestamp){
        if(null != pullTimer && pullTimer.toNextTime()){
            dataPull.dataToPull();
        }

    }

    /*
        @func 异常的结算
    */
    function abnormalSettlement(timestamp){

    }

    /*
        @func 更新投注配置信息
     */
    function betItemUpdate(timestamp){
        if(null != betItemUpdateTimer && betItemUpdateTimer.toNextTime()){
            //获取投注配置
            conf.getBetItem(function(v1, v2, v3,v4,v5){
                betItem1 = v1;
                betItem2 = v2;
                betItem3 = v3;
                betNumLimit = v4;
                betCoinLimit = v5;
            });
            //发送投注项数据
            OBJ('RpcModule').broadcastGameServer('RealFootball', 'refreshBetItem', {
                betItem1:betItem1,
                betItem2:betItem2,
                betItem3:betItem3,
                betNumLimit:betNumLimit,
                betCoinLimit:betCoinLimit,
            });
        }
    }


}