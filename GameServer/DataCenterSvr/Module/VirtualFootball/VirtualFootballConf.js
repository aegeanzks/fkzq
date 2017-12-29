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
    var oddsInfo;
    var stockInfo;
    var eventInfo;
    var goalInfo;
    var classConfVirtualGoal = OBJ('DbMgr').getStatement(Schema.ConfVirtualGoal());
    var classConfVirtualOdds = OBJ('DbMgr').getStatement(Schema.ConfVirtualOdds());
    var classConfVirtualEvent = OBJ('DbMgr').getStatement(Schema.ConfVirtualEvent());
    var classConfVirtualStock = OBJ('DbMgr').getStatement(Schema.ConfStock());
    var classConfBetItem = OBJ('DbMgr').getStatement(Schema.ConfBetItem());
    //var mapTeamOdds = new Map();    //球队赔率

    //初始化函数
    function init(){
        createTeamInfo();
        //createTeamOdds();
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

    /*function createTeamOdds(){
        var index = 0;
        var teamOdds = JSON.parse(fs.readFileSync('./Json/TeamOdds.json'));
        for(var key in teamOdds){
            var item = teamOdds[key];
            index = item.ID;
            var arrayTeamOdds = mapTeamOdds.get(item.LevelDif);
            if (null == arrayTeamOdds){
                arrayTeamOdds = [];
                mapTeamOdds.set(item.LevelDif, arrayTeamOdds);
            }
            arrayTeamOdds.push(item);
        }
        //添加主队比客队弱的情况
        index++;
        for (var value of mapTeamOdds){
            if(value[0]>0){
                var arr = value[1];
                for (var key in arr){
                    var item = arr[key];
                    item.ID = index++;
                    item.LevelDif = -item.LevelDif;
                    var tmp = Functions.exchangeNum(item.HostWinTimes, item.GuestWinTimes);
                    item.HostWinTimes = tmp[0];
                    item.GuestWinTimes = tmp[1];
                    tmp = Functions.exchangeNum(item.HostNextGoal, item.GuestNextGoal);
                    item.HostNextGoal = tmp[0];
                    item.GuestNextGoal = tmp[1];

                    var arrayTeamOdds = mapTeamOdds.get(item.LevelDif);
                    if (null == arrayTeamOdds){
                        arrayTeamOdds = [];
                        mapTeamOdds.set(item.LevelDif, arrayTeamOdds);
                    }
                    arrayTeamOdds.push(item);
                }
            }
        }
    }*/

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

    /*this.randOdds = function(level1, level2){
        var dif = level1-level2;
        var arr = mapTeamOdds.get(dif);
        if (null == arr)
            return null;
        var index = Functions.getRandomNum(0, arr.length);
        return arr[index];
    };*/
    this.randOdds = function(level1, level2, func){
        classConfVirtualOdds.find({'sides_dvalue':level1-level2}, function(err, data){
            if(err){
                console.log(err);
                return;
            }
            if(data.length == 0){
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
            if(0 == data.length){
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
            if(0 == data.length){
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
            if(0 == data.length){

            }else{
                if (func)
                    func(data.item1, data.item2, data.item3);
            }
        });
    };
}

