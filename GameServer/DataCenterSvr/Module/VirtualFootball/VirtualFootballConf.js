// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = VirtualFootballConf;

var fs = require('fs');
var Functions = require('../../../Utils/Functions');
var OBJ = require('../../../Utils/ObjRoot').getObj;
var Schema = require('../../../db_structure');

function VirtualFootballConf(){
    //成员变量
    var self = this;
    var mapTeamInfo = new Map(); //球队信息
    var mapOddsChange = new Map(); //赔率变化表
    var mapOddsChangeRatio = new Map(); //赔率变化系数表
    var oddsInfo;
    var stockInfo;
    var eventInfo;
    var goalInfo;
    var betItemInfo;
    var oddsChangeBaseValue;
    var classConfVirtualGoal = OBJ('DbMgr').getStatement(Schema.ConfVirtualGoal());
    var classConfVirtualOdds = OBJ('DbMgr').getStatement(Schema.ConfVirtualOdds());
    var classConfVirtualEvent = OBJ('DbMgr').getStatement(Schema.ConfVirtualEvent());
    var classConfVirtualStock = OBJ('DbMgr').getStatement(Schema.ConfStock());
    var classConfBetItem = OBJ('DbMgr').getStatement(Schema.ConfBetItem());
    //var mapTeamOdds = new Map();    //球队赔率

    //初始化函数
    function init(){
        createTeamInfo();
        createOddsChangeInfo();
        createOddsChangeBaseValueInfo();
        createOddsChangeRatioInfo();
        loadInitData();
    }
    init();

    function oddsDeal(data){
        var oddsDoc = OBJ('DbMgr').getModel(Schema.ConfVirtualOdds());
        oddsDoc.guest_goal = data['guest_goal'];
        oddsDoc.zero = data['zero'];
        oddsDoc.host_goal = data['host_goal'];
        oddsDoc.guest_win = data['guest_win'];
        oddsDoc.drawn = data['drawn'];
        oddsDoc.host_win = data['host_win'];
        oddsDoc.sides_dvalue = data['sides_dvalue'];
        oddsDoc.both_sides = data['both_sides'];  
        oddsDoc.id = parseInt(data['id']);
        return oddsDoc;
    }

    function stockDeal(data){
        var stockDoc = OBJ('DbMgr').getModel(Schema.ConfStock());
        stockDoc.cheat_chance_3 = parseInt(data['cheat_chance_3']);
        stockDoc.stock_threshold_2 = parseInt(data['stock_threshold_2']);
        stockDoc.cheat_chance_2 = parseInt(data['cheat_chance_2']);
        stockDoc.stock_threshold_1 = parseInt(data['stock_threshold_1']);
        stockDoc.cheat_chance_1 = parseInt(data['cheat_chance_1']);
        stockDoc.stock_initial_value = parseInt(data['stock_initial_value']);
        stockDoc.cur_stock = parseInt(data['cur_stock']);
        stockDoc.game_name = data['game_name'];
        stockDoc.game_id = parseInt(data['game_id']);
        return stockDoc;
    }

    function eventDeal(data){
        var eventDoc = OBJ('DbMgr').getModel(Schema.ConfVirtualEvent());
        eventDoc.blockade = parseInt(data['blockade']);
        eventDoc.animation_time = parseInt(data['animation_time']);
        eventDoc.guest_dangerous_attack = parseInt(data['guest_dangerous_attack']);
        eventDoc.guest_attack = parseInt(data['guest_attack']);
        eventDoc.guest_ball_handling = parseInt(data['guest_ball_handling']);
        eventDoc.host_dangerous_attack = parseInt(data['host_dangerous_attack']);
        eventDoc.host_attack = parseInt(data['host_attack']);
        eventDoc.host_ball_handling = parseInt(data['host_ball_handling']);
        eventDoc.event_name = data['event_name'];
        eventDoc.event_id = parseInt(data['event_id']);
        return eventDoc;
    }

    function goalDeal(data){
        var goalDoc = OBJ('DbMgr').getModel(Schema.ConfVirtualGoal());
        goalDoc.chance = parseInt(data['chance']);
        goalDoc.all_goal_num = parseInt(data['all_goal_num']);
        return goalDoc;
    }

    function betItemDeal(data){
        var betItemDoc = OBJ('DbMgr').getModel(Schema.ConfBetItem());
        betItemDoc.game_id = data['game_id'];
        betItemDoc.item1 = data['item1'];
        betItemDoc.item2 = data['item2'];
        betItemDoc.item3 = data['item3'];
        return betItemDoc;
    }

    /*
        @func           初始化配置数据写到db
        @statemenet     表模型
        @data           配置数据
        @func           回调函数
     */
    function insertInfo(statement,data,func){
        try{
            if(data.length >0){
                statement.collection.insert(data,function(error, docs){
                    if(error){
                        console.log('loadInfo opertion of  '+ statement + ' insert err :'+err);
                    }else{
                        func(data);
                    }
                });
            } 
        }catch(err){
            console.log('loadInfo opertion of  '+ statement + 'err :'+err);
        }
    }
    /*
        @func 初始化配置数据
     */
    function loadInitData(){
        try{
            oddsInfo = JSON.parse(fs.readFileSync('./Json/OddsInfo.json'));
            stockInfo = JSON.parse(fs.readFileSync('./Json/StockInfo.json'));
            eventInfo = JSON.parse(fs.readFileSync('./Json/EventInfo.json'));
            goalInfo = JSON.parse(fs.readFileSync('./Json/GoalInfo.json'));
            betItemInfo = JSON.parse(fs.readFileSync('./Json/BetItem.json'));
        }catch(err){
            console.log('loadInitDataTodb err :'+err);
        }
    }


    function createTeamInfo(){
        var teamInfo = JSON.parse(fs.readFileSync('./Json/TeamInfo.json'));
        for(var key in teamInfo){
            var item = teamInfo[key];
            mapTeamInfo.set(item.ID, item);
        }
    }

    function createOddsChangeInfo(){
        var oddsChangeInfo = JSON.parse(fs.readFileSync('./Json/OddsChange.json'));
        for(var key in oddsChangeInfo){
            var item = oddsChangeInfo[key];
            mapOddsChange.set(item.time_scale, item);
        }
    }

    function createOddsChangeBaseValueInfo(){
        oddsChangeBaseValueInfo = JSON.parse(fs.readFileSync('./Json/OddsChangeBaseValue.json'));
    }

    function createOddsChangeRatioInfo(){
        var oddsChangeRatioInfo = JSON.parse(fs.readFileSync('./Json/OddsChangeRatio.json'));
        for(var key in oddsChangeRatioInfo){
            var item = oddsChangeRatioInfo[key];
            mapOddsChangeRatio.set(item.goal_dif, item);
        }
    }

    this.randATeam = function(exceptId){
        var index = Functions.getRandomNum(1, mapTeamInfo.size);
        var maxNum = 10;
        while(index == exceptId){
            index = Functions.getRandomNum(1, mapTeamInfo.size);
            maxNum--;
            if(maxNum == 0){
                index = 1;
                break;
            }
        }
        return mapTeamInfo.get(index);
    };

    this.randOdds = function(level1, level2, func){
        classConfVirtualOdds.find({'sides_dvalue':level1-level2}, function(err, data){
            if(err){
                console.log(err);
                return;
            }
            if(null == data || data.length == 0){
                var dataConfig = [];
                for(var key in oddsInfo){
                    var item = oddsInfo[key];
                    dataConfig.push(oddsDeal(item));
                }
                insertInfo(classConfVirtualOdds,dataConfig,function(dataCnf){
                    var index = Functions.getRandomNum(0, dataCnf.length-1);
                    func(dataCnf[index]);
                });
            }else{
                var index = Functions.getRandomNum(0, data.length-1);
                func(data[index]);
            }
        });
    };
    this.randGoal = function(func){
        classConfVirtualGoal.find(function(err, data){
            if(err){
                console.log(err);
                return;
            }
            if(null == data || 0 == data.length){
                var dataConfig = [];
                for(var key in goalInfo){
                    var item = goalInfo[key];
                    dataConfig.push(goalDeal(item));
                }
                insertInfo(classConfVirtualGoal,dataConfig,function(dataCnf){
                    var arr = [];
                    for (var value of dataCnf){
                        for(var i=0; i<value.chance; i++){
                            arr.push(value.all_goal_num);
                        }
                    }
                    var index = Functions.getRandomNum(0, arr.length-1);
                    func(arr[index]);
                });
            }else{
                var arr = [];
                for (var value of data){
                    for(var i=0; i<value.chance; i++){
                        arr.push(value.all_goal_num);
                    }
                }
                var index = Functions.getRandomNum(0, arr.length-1);
                func(arr[index]);
            }
        });
    };
    this.getEvents = function(func){
        classConfVirtualEvent.find(function(err, data){
            if(err){
                console.log(err);
                return;
            }
            if(null == data || 0 == data.length){
                var dataConfig = [];
                for(var key in eventInfo){
                    var item = eventInfo[key];
                    dataConfig.push(eventDeal(item));
                }
                insertInfo(classConfVirtualEvent,dataConfig,function(dataCnf){
                    var retMap = new Map();
                    for(var item of dataCnf){
                        retMap.set(item.event_id, item);
                    }
                    func(retMap);
                });
            }else{
                var retMap = new Map();
                for(var item of data){
                    retMap.set(item.event_id, item);
                }
                func(retMap);
            }
        });
    };
    this.getBetItem = function(func){
        classConfBetItem.findOne({'game_id':1}, function(err, data){
            if(err){
                console.log(err);
                return;
            }
            if(null == data || 0 == data.length){
                var dataConfig = [];
                for(var key in betItemInfo){
                    var item = betItemInfo[key];
                    if(item.game_id == 1)
                        dataConfig.push(betItemDeal(item));
                }
                insertInfo(classConfBetItem,dataConfig,function(dataCnf){
                    if(func)
                        func(dataCnf[0].item1, dataCnf[0].item2, dataCnf[0].item3);
                });
            }else{
                if (func)
                    func(data.item1, data.item2, data.item3);
            }
        });
    };
    this.getOddsChangeBaseValue = function(){
        return {
            change_rate1: oddsChangeBaseValueInfo["1"].change_rate1,
            change_rate2: oddsChangeBaseValueInfo["1"].change_rate2,
            change_rate3: oddsChangeBaseValueInfo["1"].change_rate3,
            base_value: oddsChangeBaseValueInfo["1"].base_value,
        };
    };
    this.getOddsChangeRatioMap = function(){
        return mapOddsChangeRatio;
    };
    this.getOddsChangeMap = function(){
        return mapOddsChange;
    };
    this.getStock = function(func){
        classConfVirtualStock.findOne({'game_id':1}, function(err, data){
            if(err){
                console.log(err);
                return;
            }
            if(null == data || 0 == data.length){
                var dataConfig = [];
                dataConfig.push(stockDeal(stockInfo["1"]));
                insertInfo(classConfVirtualEvent,dataConfig,function(dataCnf){
                    func({
                        curStock:dataCnf[0].cur_stock,
                        stockInitialValue:dataCnf[0].stock_initial_value,
                        cheatChange1:dataCnf[0].cheat_chance_1,
                        stockThreshold1:dataCnf[0].stock_threshold_1,
                        cheatChange2:dataCnf[0].cheat_chance_2,
                        stockThreshold2:dataCnf[0].stock_threshold_2,
                        cheatChange3:dataCnf[0].cheat_chance_3
                    });
                });
            } else {
                if (func)
                    func({
                        curStock:data.cur_stock,
                        stockInitialValue:data.stock_initial_value,
                        cheatChange1:data.cheat_chance_1,
                        stockThreshold1:data.stock_threshold_1,
                        cheatChange2:data.cheat_chance_2,
                        stockThreshold2:data.stock_threshold_2,
                        cheatChange3:data.cheat_chance_3
                    });
            }
        });
    };
}

