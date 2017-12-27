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
    var classConfVirtualGoal = OBJ('DbMgr').getStatement(Schema.ConfVirtualGoal());
    var classConfVirtualOdds = OBJ('DbMgr').getStatement(Schema.ConfVirtualOdds());
    var classConfVirtualEvent = OBJ('DbMgr').getStatement(Schema.ConfVirtualEvent());
    //var mapTeamOdds = new Map();    //球队赔率

    //初始化函数
    function init(){
        createTeamInfo();
        //createTeamOdds();
    }
    init();

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
            var index = Functions.getRandomNum(0, data.length-1);
            func(data[index]);
        });
    };
    this.randGoal = function(func){
        classConfVirtualGoal.find(function(err, data){
            if(err){
                console.log(err);
                return;
            }
            var arr = [];
            for (var value of data){
                for(var i=0; i<value.chance; i++){
                    arr.push(value.all_goal_num);
                }
            }
            var index = Functions.getRandomNum(0, arr.length-1);
            func(arr[index]);
        });
    };
    this.getEvents = function(func){
        classConfVirtualEvent.find(function(err, data){
            if(err){
                console.log(err);
                return;
            }
            var retMap = new Map();
            for(var item of data){
                retMap.set(item.event_id, item);
            }
            func(retMap);
        });
    };
}

