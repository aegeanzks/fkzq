module.exports =GameConfigModule;

var Schema = require('../../../db_structure');
var config = require('../../../config').adminSvrConfig();
var OBJ = require('../../../Utils/ObjRoot').getObj;

/*
    游戏配置module
 */
function GameConfigModule(){
    //定义变量
    var limit = config.limit;
    var stockStatement = OBJ('DbMgr').getStatement(Schema.ConfStock());
    var eventStatement = OBJ('DbMgr').getStatement(Schema.ConfVirtualEvent());
    var oddsStatement = OBJ('DbMgr').getStatement(Schema.ConfVirtualOdds());
    var goalStatement = OBJ('DbMgr').getStatement(Schema.ConfVirtualGoal());
    var confStatement = OBJ('DbMgr').getStatement(Schema.ConfBetItem());

    /*
        @func   库存stock组包
        @docs   待组包数据
        @count  条数
        @type   类型
     */
    function stockPackages(docs,count,res,type){
        var len = docs.length;
        var data = [];
        var list = [];
        var header = {};
        header['status'] = 200;
        header['totalCount'] = count;
        data.push(header);

        for(var i = 0;i<len;i++){
            var listOne ={};

            listOne['game_id'] = docs[i]['game_id'];
            listOne['game_name'] = docs[i]['game_name'];
            listOne['cur_stock'] = docs[i]['cur_stock'];
            if(0 == type){
                list.push(listOne);
                continue;
            }else{
                
                listOne['stock_initial_value'] = docs[i]['stock_initial_value'];
                listOne['cheat_chance_1'] = docs[i]['cheat_chance_1'];
                listOne['stock_threshold_1'] = docs[i]['stock_threshold_1'];
                listOne['cheat_chance_2'] = docs[i]['cheat_chance_2'];
                listOne['stock_threshold_2'] = docs[i]['stock_threshold_2'];
                listOne['cheat_chance_3'] = docs[i]['cheat_chance_3'];
    
                list.push(listOne);
            }
        }
        data.push(list);
        res.send(data);
    }


    /*
        @func     查找库存数据库
        @filter   过滤条件
        @funcname 被那个函数调用
     */
    function findStock(filter,page,res,funcname,type){
        try{
            stockStatement.count(filter,function(error,count){
                if(!error){
                    if(count >0){
                        stockStatement.find(filter,function(finderr,docs){
                            if(!finderr){
                                stockPackages(docs,count,res,type);     
                            }else{
                                console.log('Module of GameConfigModule '+funcname +' err :'+error);
                            }
                        })
                        .skip((page-1) * limit)
                        .limit(limit)
                        .sort({'game_id':1});
                    }else{
                        res.send({
                            status: 0,
                            type: 'GET_DATA_EMPTY',
                            message: '无相关记录'
                        })
                    }
                }else{
                    console.log('Module of GameConfigModule '+funcname +' find count err :'+error);
                }
            });
        }catch(err){
            console.log('findStock 获取数据失败', err);
            res.send({
                status: 1,
                type: 'GET_DATA_ERROR',
                message: '获取数据失败'
            })
        }
    }

       /*
        @func   事件配置组包
        @docs   待组包数据
        @count  条数
        @type   类型
     */
    function eventPackages(docs,count,res){
        var len = docs.length;
        var data = [];
        var list = [];
        var header = {};
        header['status'] = 200;
        header['totalCount'] = count;
        data.push(header);

        for(var i = 0;i<len;i++){
            var listOne ={};

            listOne['event_id'] = docs[i]['event_id'];
            listOne['event_name'] = docs[i]['event_name'];
            listOne['host_ball_handling'] = docs[i]['host_ball_handling'];  
            listOne['host_attack'] = docs[i]['host_attack'];
            listOne['host_dangerous_attack'] = docs[i]['host_dangerous_attack'];

            listOne['guest_ball_handling'] = docs[i]['guest_ball_handling'];
            listOne['guest_attack'] = docs[i]['guest_attack'];
            listOne['guest_dangerous_attack'] = docs[i]['guest_dangerous_attack'];
            listOne['animation_time'] = docs[i]['animation_time'];
            listOne['blockade'] = docs[i]['blockade'];

            list.push(listOne);
        }
        data.push(list);
        res.send(data);
    }

    /*
        @func     查找库存数据库
        @filter   过滤条件
        @funcname 被那个函数调用
     */
    function findEvent(filter,page,res,funcname){
        try{
            eventStatement.count(filter,function(error,count){
                if(!error){
                    if(count >0){
                        eventStatement.find(filter,function(finderr,docs){
                            if(!finderr){
                                eventPackages(docs,count,res);     
                            }else{
                                console.log('Module of GameConfigModule '+funcname +' err :'+error);
                            }
                        })
                        .skip((page-1) * limit)
                        .limit(limit)
                        .sort({'event_id':1});
                    }else{
                        res.send({
                            status: 0,
                            type: 'GET_DATA_EMPTY',
                            message: '无相关记录'
                        })
                    }
                }else{
                    console.log('Module of GameConfigModule '+funcname +' find count err :'+error);
                }
            });
        }catch(err){
            console.log('findEvent 获取数据失败', err);
            res.send({
                status: 1,
                type: 'GET_DATA_ERROR',
                message: '获取数据失败'
            })
        }
    }

    /*
        @func   赔率配置组包
        @docs   待组包数据
        @count  条数
        @type   类型
     */
    function oddsPackages(docs,count,res){
        var len = docs.length;
        var data = [];
        var list = [];
        var header = {};
        header['status'] = 200;
        header['totalCount'] = count;
        data.push(header);

        for(var i = 0;i<len;i++){
            var listOne ={};

            listOne['id'] = docs[i]['id'];
            listOne['both_sides'] = docs[i]['both_sides'];
            listOne['sides_dvalue'] = docs[i]['sides_dvalue'];
            listOne['host_win'] = docs[i]['host_win'];
            listOne['drawn'] = docs[i]['drawn'];
            listOne['guest_win'] = docs[i]['guest_win'];
            listOne['host_goal'] = docs[i]['host_goal'];
            listOne['zero'] = docs[i]['zero'];
            listOne['guest_goal'] = docs[i]['guest_goal'];

            list.push(listOne);
        }
        data.push(list);
        res.send(data);
    }

    /*
        @func     查找库存数据库
        @filter   过滤条件
        @funcname 被那个函数调用
     */
    function findOdds(filter,page,res,funcname){
        try{
            oddsStatement.count(filter,function(error,count){
                if(!error){
                    if(count >0){
                        oddsStatement.find(filter,function(finderr,docs){
                            if(!finderr){
                                oddsPackages(docs,count,res);     
                            }else{
                                console.log('Module of GameConfigModule '+funcname +' err :'+error);
                            }
                        })
                        .skip((page-1) * limit)
                        .limit(limit)
                        .sort({'id':-1});
                    }else{
                        res.send({
                            status: 0,
                            type: 'GET_DATA_EMPTY',
                            message: '无相关记录'
                        })
                    }
                }else{
                    console.log('Module of GameConfigModule '+funcname +' find count err :'+error);
                }
            });
        }catch(err){
            console.log('findOdds 获取数据失败', err);
            res.send({
                status: 1,
                type: 'GET_DATA_ERROR',
                message: '获取数据失败'
            })
        }
    }

        /*
        @func   进球配置组包
        @docs   待组包数据
        @count  条数
        @type   类型
     */
    function goalPackages(docs,count,res){
        var len = docs.length;
        var data = [];
        var list = [];
        var header = {};
        header['status'] = 200;
        header['totalCount'] = count;
        data.push(header);

        for(var i = 0;i<len;i++){
            var listOne ={};

            listOne['all_goal_num'] = docs[i]['all_goal_num'];
            listOne['chance'] = docs[i]['chance'];
                
            list.push(listOne);
        }
        data.push(list);
        res.send(data);
    }

    /*
        @func     查找库存数据库
        @filter   过滤条件
        @funcname 被那个函数调用
     */
    function findGoal(filter,page,res,funcname){
        try{
            goalStatement.count(filter,function(error,count){
                if(!error){
                    if(count >0){
                        goalStatement.find(filter,function(finderr,docs){
                            if(!finderr){
                                goalPackages(docs,count,res);     
                            }else{
                                console.log('Module of GameConfigModule '+funcname +' err :'+error);
                            }
                        })
                      //  .skip((page-1) * limit)
                      //  .limit(limit)
                        .sort({'all_goal_num':1});
                    }else{
                        res.send({
                            status: 0,
                            type: 'GET_DATA_EMPTY',
                            message: '无相关记录'
                        })
                    }
                }else{
                    console.log('Module of GameConfigModule '+funcname +' find count err :'+error);
                }
            });
        }catch(err){
            console.log('findGoal 获取数据失败', err);
            res.send({
                status: 1,
                type: 'GET_DATA_ERROR',
                message: '获取数据失败'
            })
        }        
    }

    /*
        @func     投注项配置的组包
        @docs     待组包的数据
        @gameid   类型
     */
    function configPackages(doc,res,gameid){
        var data = [];
        var list = [];
        var header = {};
        header['status'] = 200;
        header['totalCount'] = 1;
        data.push(header);

        var listOne ={};
        listOne['game_id'] = doc['game_id'];
        listOne['item1'] = doc['item1'];
        listOne['item2'] = doc['item2'];
        listOne['item3'] = doc['item3'];
        if(2 == gameid){
            listOne['num_limit'] = doc['num_limit'];
            listOne['coin_limit'] = doc['coin_limit'];
        }
        list.push(listOne);
        data.push(list);
        res.send(data);
    }

    /*
        @func     查找投注项配置数据库
        @filter   过滤条件
        @funcname 被哪个函数调用
    */
    function findConfBetItem(filter,res,funcname,gameid){
        try{
            confStatement.findOne(filter,null,function (finderr, docs) {
                if (!finderr) {
                    if(null == docs){
                        res.send({
                            status: 0,
                            type: 'GET_DATA_EMPTY',
                            message: '无相关记录'
                        })
                        return ;
                    }
                    configPackages(docs,res,gameid);
                }else{
                    console.log('Module of GameConfigModule '+funcname +' err :'+error);
                }
            });
        }catch(err){
            console.log('findConfBetItem 获取数据失败', err);
            res.send({
                status: 1,
                type: 'GET_DATA_ERROR',
                message: '获取数据失败'
            })
        }
    }

    /*
        @func        更新库存数据库
        @condition   条件
        @values      待更新的值
     */
    function updateStock(condition,values,res){
        try{
            stockStatement.findOneAndUpdate(condition,{$set:values},function(error,docs){
                if(!error){
                    res.send({
                        status: 200,
                        type: 'UPDATE_DATA_SUCESS',
                        message: '数据更新成功'
                    });
                }else{
                    console.log('Module of RaceModule updateListById err :'+error);
                }
            });
        }catch(err){
            console.log('更新数据失败', err);
            res.send({
                status: 1,
                type: 'UPDATE_DATA_ERROR',
                message: '更新数据失败'
            })
        }
    }

     /*
        @func   获取游戏列表的库存值
        @page   页数
     */
    this.getStockValue = function(page,res){
        var filter = {};
        var funcname = 'getStockValue';
        findStock(filter,page,res,funcname,0);
    }

    /*
        @func     根据游戏id获取库存信息
        @gameid   游戏id
     */
    this.getStockInfoById = function(gameId,res){
        var filter = {"game_id":gameId};
        var funcname = 'getStockById';
        var page = 1;
        findStock(filter,page,res,funcname,1);
    }

    /*
        @func   获取事件配置
     */
    this.getEventConfig = function(res){
        var filter = {};
        var funcname = 'getEventInfo';
        var page = 1;
        findEvent(filter,page,res,funcname);
    }


    /*
        @func   获取赔率配置
        @page   页数
     */
    this.getOddsConfig = function(page,res){
        var filter = {};
        var funcname = 'getOddsInfo';
        findOdds(filter,page,res,funcname);
    }

      /*
        @func     根据游戏id获取库存信息
        @gameid   游戏id
     */
    this.getoodInfoById = function(id,res){
        var filter = {"id":id};
        var funcname = 'getoodById';
        var page = 1;
        findOdds(filter,page,res,funcname,1);
    }

      /*
        @func    删除赔率配置通过id
        @id  标识id
     */
    this.deloodInfoById=function(id,res){
        var condition = {"id":id};
        try{
            oddsStatement.collection.remove(condition,function(error){
                 if(!error){
                     res.send({
                         status: 200,
                         type: 'DEL_DATA_SUCESS',
                         message: '删除数据成功'
                     });
                 }else{
                     console.log('Module of RaceModule deloodInfoById err :'+error);
                 }
             });
         }catch(err){
             console.log('删除数据失败', err);
             res.send({
                 status: 1,
                 type: 'DEL_DATA_ERROR',
                 message: '删除数据失败'
             })
         }
    }

    /*
        @func   获取进球配置
     */
    this.getGoalConfig = function(res){
        var filter = {};
        var funcname = 'getGoalInfo';
        var page = 1;
        findGoal(filter,page,res,funcname);
    }

          /*
        @func    删除赔率配置通过id
        @id  标识id
     */
    this.delGoalInfoByID=function(id,res){
        var condition = {"all_goal_num":id};
        try{
            goalStatement.collection.remove(condition,function(error){
                 if(!error){
                     res.send({
                         status: 200,
                         type: 'DEL_DATA_SUCESS',
                         message: '删除数据成功'
                     });
                 }else{
                     console.log('Module of GameConfig delGoalInfoByID err :'+error);
                 }
             });
         }catch(err){
             console.log('删除数据失败', err);
             res.send({
                 status: 1,
                 type: 'DEL_DATA_ERROR',
                 message: '删除数据失败'
             })
         }
    }

    /*
        @func    更新游戏的库存信息
        @fields  字段
     */
    this.updateStockInfoById = function(fields,res){
        var condition = {"game_id":fields.game_id};
        var values = {"cur_stock":fields.cur_stock,"stock_initial_value":fields.stock_initial_value,
                      "cheat_chance_1":fields.cheat_chance_1,"stock_threshold_1":fields.stock_threshold_1,
                      "cheat_chance_2":fields.cheat_chance_2,"stock_threshold_2":fields.stock_threshold_2,
                      "cheat_chance_3":fields.cheat_chance_3};
        updateStock(condition,values,res);
    }


       /*
        @func    更新游戏的事件信息
        @fields  字段
     */
    this.updateEventInfoById = function(fields,res){
        var condition = {"event_id":fields.event_id};
        var values = {"host_ball_handling":fields.host_ball_handling,"host_attack":fields.host_attack,
                      "host_dangerous_attack":fields.host_dangerous_attack,"guest_ball_handling":fields.guest_ball_handling,
                      "guest_attack":fields.guest_attack,"guest_dangerous_attack":fields.guest_dangerous_attack,
                      "animation_time":fields.animation_time,   "blockade":fields.blockade};
                      updateEvent(condition,values,res);
    }



        /*
        @func        更新库存数据库
        @condition   条件
        @values      待更新的值
     */
    function updateEvent(condition,values,res){
        try{
           eventStatement.findOneAndUpdate(condition,{$set:values},function(error,docs){
                if(!error){
                    res.send({
                        status: 200,
                        type: 'UPDATE_DATA_SUCESS',
                        message: '数据更新成功'
                    });
                }else{
                    console.log('Module of RaceModule updateListById err :'+error);
                }
            });
        }catch(err){
            console.log('更新数据失败', err);
            res.send({
                status: 1,
                type: 'UPDATE_DATA_ERROR',
                message: '更新数据失败'
            })
        }
    }

       /*
        @func    更新游戏的事件信息
        @fields  字段
     */
    this.addoodInfo = function(fields,res){
     $id=0;
     $dataarray={};
        try{
            oddsStatement.find({},function(finderr,docs){
                if(!finderr){
                    $dataarray=docs;
                    if($dataarray.length>0){
                        $id=$dataarray[0]['id']+1;
                    }
               
                       var values = {"id":$id,"host_win":fields.host_win,"drawn":fields.drawn,"guest_win":fields.guest_win,"both_sides":fields.both_sides,"sides_dvalue":-1,
                                     "host_goal":fields.host_goal,"zero":fields.zero,
                                     "guest_goal":fields.guest_goal};
                                     addnewoodinfo(values,res);
                }
            })
            .sort({'id':-1});
        }catch(err){
        }
   
    }

   function addnewoodinfo(values,res){
        try{
            oddsStatement.collection.insert(values,function(error){
                 if(!error){
                     res.send({
                         status: 200,
                         type: 'ADD_DATA_SUCESS',
                         message: '添加数据成功'
                     });
                 }else{
                     console.log('Module of RaceModule updateListById err :'+error);
                 }
             });
         }catch(err){
             console.log('添加数据失败', err);
             res.send({
                 status: 1,
                 type: 'ADD_DATA_ERROR',
                 message: '添加数据失败'
             })
         }
    }
    /*
        @func    更新游戏的赔率
        @fields  字段
     */
 this.updateOodInfo=function(fields,res){

            var condition = {"id":fields.id};
            var values = {"host_win":fields.host_win,"drawn":fields.drawn,"guest_win":fields.guest_win,"both_sides":fields.both_sides,
            "host_goal":fields.host_goal,"zero":fields.zero,
            "guest_goal":fields.guest_goal};
        try{
            oddsStatement.findOneAndUpdate(condition,{$set:values},function(error,docs){
                if(!error){
                    res.send({
                        status: 200,
                        type: 'UPDATE_DATA_SUCESS',
                        message: '数据更新成功'
                    });
                }else{
                    console.log('Module of RaceModule updateOodInfo err :'+error);
                }
            });
        }catch(err){
            console.log('更新数据失败', err);
            res.send({
                status: 1,
                type: 'UPDATE_DATA_ERROR',
                message: '更新数据失败'
            })
        }
     }


          /*
        @func    更新游戏的事件信息
        @fields  字段
     */
    this.addgoalsInfo = function(fields,res){
             var values = {"all_goal_num":parseInt(fields.all_goal_num),"chance":parseInt(fields.chance)};
            try{
               goalStatement.collection.insert(values,function(error){
                     if(!error){
                         res.send({
                             status: 200,
                             type: 'ADD_DATA_SUCESS',
                             message: '添加数据成功'
                         });
                     }else{
                         console.log('Module of RaceModule addgoalsInfo err :'+error);
                     }
                 });
             }catch(err){
                 console.log('添加数据失败', err);
                 res.send({
                     status: 1,
                     type: 'ADD_DATA_ERROR',
                     message: '添加数据失败'
                 })
             }
    }

    this.updateGoalInfo = function(fields,res){
        try{
            var condition = {"all_goal_num":parseInt(fields.all_goal_num)};
            var values = {"chance":parseInt(fields.chance)};
            goalStatement.findOneAndUpdate(condition,{$set:values},function(error,docs){
                if(!error){
                    res.send({
                        status: 200,
                        type: 'UPDATE_DATA_SUCESS',
                        message: '数据更新成功'
                    });
                }else{
                    console.log('Module of RaceModule updateGoalInfo err :'+error);
                }
            });
        }catch(err){
            console.log('更新数据失败', err);
            res.send({
                status: 1,
                type: 'UPDATE_DATA_ERROR',
                message: '更新数据失败'
            })
        }
    }

    this.getRealBetItem = function(res){
        var filter = {'game_id':2};
        var funcname = 'getRealBetItem';
        findConfBetItem(filter,res,funcname,2);
    }

    this.getVirtualBetItem = function(res){
        var filter = {'game_id':1};
        var funcname = 'getVirtualBetItem';
        findConfBetItem(filter,res,funcname,1);
    }

    this.updateBetItem = function(res,value,type){
        var filter = {'game_id':parseInt(value['game_id'])};
        var setvalues = {};
        if(type == '1'){
            setvalues = {"item1":parseInt(value.item1),"item2":parseInt(value.item2),"item3":parseInt(value.item3)};
        }else if(type == '2'){
            setvalues = {"item1":parseInt(value.item1),"item2":parseInt(value.item2),
                         "item3":parseInt(value.item3),"num_limit":parseInt(value.num_limit),
                         "coin_limit":parseInt(value.coin_limit)};
        }
        try{
            confStatement.findOneAndUpdate(filter,{$set:setvalues},function(error,docs){
                if(!error){
                    res.send({
                        status: 200,
                        type: 'UPDATE_DATA_SUCESS',
                        message: '数据更新成功'
                    });
                    if(type == '1'){
                        //推送给数据中心
                        OBJ('RpcModule').sendToVtDataCenter('VirtualFootball', 'refreshBetItem', {
                            betItem1: parseInt(value.item1),
                            betItem2: parseInt(value.item2),
                            betItem3: parseInt(value.item3),
                        });
                    }
                    if(type == '2'){
                        //推送给数据中心
                        OBJ('RpcModule').sendToDataCenter('RealFootball', 'refreshBetItem', {
                            betItem1: parseInt(value.item1),
                            betItem2: parseInt(value.item2),
                            betItem3: parseInt(value.item3),
                            betNumLimit:parseInt(value.num_limit),
                            betCoinLimit:parseInt(value.coin_limit)
                        });
                    }
                }else{
                    console.log('Module of RaceModule updateBetItem err :'+error);
                }
            });
        }catch(err){
            console.log('更新数据失败', err);
            res.send({
                status: 1,
                type: 'UPDATE_DATA_ERROR',
                message: '更新数据失败'
            })
        }
    }
}