// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = RealFootballConf;

var fs = require('fs');
var Func = require('../../../Utils/Functions');
var OBJ = require('../../../Utils/ObjRoot').getObj;
var Schema = require('../../../db_structure');

function RealFootballConf(){

    var betItemInfo;
    var classConfBetItem = OBJ('DbMgr').getStatement(Schema.ConfBetItem());

    init();

    /*
        @func 初始化
     */
    function init(){
        loadInitData();
    }

    function betItemDeal(data){
        var betItemDoc = OBJ('DbMgr').getModel(Schema.ConfBetItem());
        betItemDoc.game_id = data['game_id'];
        betItemDoc.item1 = data['item1'];
        betItemDoc.item2 = data['item2'];
        betItemDoc.item3 = data['item3'];
        betItemDoc.num_limit = data['numLimit'];
        betItemDoc.coin_limit = data['coinLimit'];
        return betItemDoc;
    }

    /*
        @func 初始化配置数据
     */
    function loadInitData(){
        try{
            betItemInfo = JSON.parse(fs.readFileSync('./Json/BetItem.json'));
        }catch(err){
            console.log('loadInitData err :'+err);
        }
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
        @func 获取真实足球投注项配置
     */
    this.getBetItem = function(func){
        classConfBetItem.findOne({'game_id':2}, function(err, data){
            if(err){
                console.log('RealFootball getBetItem ',err);
                return;
            }
            if(null == data || 0 == data.length){
                var dataConfig = [];
                for(var key in betItemInfo){
                    var item = betItemInfo[key];
                    if(item.game_id == 2)
                        dataConfig.push(betItemDeal(item));
                }
                insertInfo(classConfBetItem,dataConfig,function(dataCnf){
                    if(func)
                        func(dataCnf[0].item1, dataCnf[0].item2, dataCnf[0].item3,dataCnf[0].num_limit,dataCnf[0].coin_limit);
                });
            }else{
                if (func)
                    func(data.item1, data.item2, data.item3,data.num_limit,data.coin_limit);
            }
        });
    };

}