module.exports = GameConfigController;

var GameConfigModule = require('../../Module/SystemManage/GameConfigModule');
var checkSign  = require('../Sign').checkSign;
var signValue = require('../../../config').adminSvrConfig()['sign'];;

/*  
    游戏配置controller类
 */
function GameConfigController(){
	gameConfigModule =	new GameConfigModule();
}

/*
    @func  获取游戏列表库存值
 */
GameConfigController.getStockValueList = function(req,res,next){
    try{
        //校验sign
        var sign = req.query.page+signValue;
        if(!checkSign(sign,req.query.sign)){
            res.send({
                status:2,
                type: 'ERROR_SIGN',
                message: 'sign错误',
            })
            return 
        }
        //校验参数合法性
        const page = req.query.page;
        if(!page &&  !Number(page)){
            res.send({
                status:2,
                type: 'ERROR_PAGE',
                message: 'page参数错误',
            })
            return 
        }
        //获取数据
		gameConfigModule.getStockValue(page,res);
    }catch(err){
        console.log('getStockValueList 获取数据失败', err);
		res.send({
			status: 1,
			type: 'GET_DATA_ERROR',
			message: '获取数据失败'
		})
    }
}

/*
    @func  获取游戏库存信息
 */
GameConfigController.getStockInfo = function(req,res,next){
    try{
        //校验sign
        var sign = req.query.game_id+signValue;
        if(!checkSign(sign,req.query.sign)){
            res.send({
                status:2,
                type: 'ERROR_SIGN',
                message: 'sign错误',
            })
            return 
        }
        //校验参数合法性
        const game_id = req.query.game_id;
        if(!game_id &&  !Number(game_id)){
            res.send({
                status:2,
                type: 'ERROR_GAMEID',
                message: 'game_id参数错误',
            })
            return 
        }
        //获取数据
		gameConfigModule.getStockInfoById(game_id,res);
    }catch(err){
        console.log('getStockInfo 获取数据失败', err);
		res.send({
			status: 1,
			type: 'GET_DATA_ERROR',
			message: '获取数据失败'
		})
    }
}


/*
    @func  获取事件配置
 */
GameConfigController.getEventInfo = function(req,res,next){
    try{
        //校验sign
        var sign = 'getEv'+signValue;
        if(!checkSign(sign,req.query.sign)){
            res.send({
                status:2,
                type: 'ERROR_SIGN',
                message: 'sign错误',
            })
            return 
        }
        //获取数据
        gameConfigModule.getEventConfig(res);
    }catch(err){
        console.log('getEventInfo 获取数据失败', err);
		res.send({
			status: 1,
			type: 'GET_DATA_ERROR',
			message: '获取数据失败'
		})
    }
}


/*
    @func  获取赔率配置
 */
GameConfigController.getOddsInfo = function(req,res,next){
    try{
        //校验sign
        var sign = req.query.page+signValue;
        if(!checkSign(sign,req.query.sign)){
            res.send({
                status:2,
                type: 'ERROR_SIGN',
                message: 'sign错误',
            })
            return 
        }
        //校验参数合法性
        const page = req.query.page;
        if(!page &&  !Number(page)){
            res.send({
                status:2,
                type: 'ERROR_PAGE',
                message: 'page参数错误',
            })
            return 
        }
        //获取数据
        gameConfigModule.getOddsConfig(page,res);
    }catch(err){
        console.log('getOddsInfo 获取数据失败', err);
		res.send({
			status: 1,
			type: 'GET_DATA_ERROR',
			message: '获取数据失败'
		})
    }
}
/*
    @func  获取赔率记录
 */
GameConfigController.getoodbyIdInfo = function(req,res,next){
    try{
        //校验sign
        var sign = req.query.id+signValue;
        if(!checkSign(sign,req.query.sign)){
            res.send({
                status:2,
                type: 'ERROR_SIGN',
                message: 'sign错误',
            })
            return 
        }
        //校验参数合法性
        const id = req.query.id;
        if(!id &&  !Number(id)){
            res.send({
                status:2,
                type: 'ERROR_ID',
                message: 'id参数错误',
            })
            return 
        }
        //获取数据
		gameConfigModule.getoodInfoById(id,res);
    }catch(err){
        console.log('getoodbyIdInfo 获取数据失败', err);
		res.send({
			status: 1,
			type: 'GET_DATA_ERROR',
			message: '获取数据失败'
		})
    }
}

/*
    @func  添加赔率记录
 */
GameConfigController.addOodInfo = function(req,res,next){
    try{
        //校验sign
        var sign = 'Addood'+signValue;
        if(!checkSign(sign,req.query.sign)){
            res.send({
                status:2,
                type: 'ERROR_SIGN',
                message: 'sign错误',
            })
            return 
        }
      //校验参数合法性
      var fields ={};
      fields.both_sides = req.query.both_sides;
      fields.host_win = req.query.host_win;
      fields.drawn = req.query.drawn;
      fields.guest_win = req.query.guest_win;
      fields.host_goal = req.query.host_goal;
      fields.zero = req.query.zero;
      fields.guest_goal = req.query.guest_goal;
      if(!fields.both_sides || !fields.host_win || !fields.drawn
          || !fields.guest_win || !fields.host_goal ||!fields.zero ||!fields.guest_goal){
              res.send({
                  status:2,
                  type: 'ERROR_PARAMS',
                  message: '参数错误',
              })
              return 
      }
      //更新数据
      gameConfigModule.addoodInfo(fields,res);
  }catch(err){
      console.log('addoodInfo 添加数据失败', err);
      res.send({
          status: 1,
          type: 'ADD_DATA_ERROR',
          message: '添加更新数据失败'
      })
  }
}

/*
    @func 更新游戏库存信息
 */
GameConfigController.delOodInfoByID = function(req,res,next){
    try{
        //校验sign
        var sign = req.query.id+signValue;
        if(!checkSign(sign,req.query.sign)){
            res.send({
                status:2,
                type: 'ERROR_SIGN',
                message: 'sign错误',
            })
            return 
        }
   
        if(!req.query.id &&  !Number(req.query.id)){
                res.send({
                    status:2,
                    type: 'ERROR_PARAMS',
                    message: '参数错误',
                })
                return 
        }

    
        //更新数据
		gameConfigModule.deloodInfoById(parseInt(req.query.id),res);
    }catch(err){
        console.log('delOodInfoByID 删除数据失败', err);
		res.send({
			status: 1,
			type: 'DEL_DATA_ERROR',
			message: '更新数据失败'
		})
    }
}


/*
    @func 更新游戏库存信息
 */
GameConfigController.updateOodInfo = function(req,res,next){
    try{
        //校验sign
        var sign = req.query.id+signValue;
        if(!checkSign(sign,req.query.sign)){
            res.send({
                status:2,
                type: 'ERROR_SIGN',
                message: 'sign错误',
            })
            return 
        }
        //校验参数合法性
        var fields ={};
        fields.id = req.query.id;
        fields.both_sides = req.query.both_sides;
        fields.host_win = req.query.host_win;
        fields.drawn = req.query.drawn;
        fields.guest_win = req.query.guest_win;
        fields.host_goal = req.query.host_goal;
        fields.zero = req.query.zero;
        fields.guest_goal = req.query.guest_goal;
        if(!fields.id &&  !Number(fields.id) || !fields.both_sides|| !fields.host_win || !fields.drawn 
            || !fields.guest_win || !fields.host_goal ||!fields.zero 
            ||!fields.guest_goal){
                res.send({
                    status:2,
                    type: 'ERROR_PARAMS',
                    message: '参数错误',
                })
                return 
        }

    
        //更新数据
		gameConfigModule.updateOodInfo(fields,res);
    }catch(err){
        console.log('updateOodInfo 更新数据失败', err);
		res.send({
			status: 1,
			type: 'UPDATE_DATA_ERROR',
			message: '更新数据失败'
		})
    }
}



/*
    @func  获取进球配置
 */
GameConfigController.getGoalInfo = function(req,res,next){
    try{
        var sign = 'getGo'+signValue;
        if(!checkSign(sign,req.query.sign)){
            res.send({
                status:2,
                type: 'ERROR_SIGN',
                message: 'sign错误',
            })
            return 
        }
        //获取数据
        gameConfigModule.getGoalConfig(res);
    }catch(err){
        console.log('getGoalInfo 获取数据失败', err);
		res.send({
			status: 1,
			type: 'GET_DATA_ERROR',
			message: '获取数据失败'
		})
    }
}

/*
    @func 根据id删除进球配置
 */
GameConfigController.delGoalInfoByID = function(req,res,next){
    try{
        //校验sign
        var sign = req.query.id+signValue;
        if(!checkSign(sign,req.query.sign)){
            res.send({
                status:2,
                type: 'ERROR_SIGN',
                message: 'sign错误',
            })
            return 
        }
   
        if(!req.query.id &&  !Number(req.query.id)){
                res.send({
                    status:2,
                    type: 'ERROR_PARAMS',
                    message: '参数错误',
                })
                return 
        }

    
        //更新数据
		gameConfigModule.delGoalInfoByID(parseInt(req.query.id),res);
    }catch(err){
        console.log('delGoalInfoByID 删除数据失败', err);
		res.send({
			status: 1,
			type: 'DEL_DATA_ERROR',
			message: '更新数据失败'
		})
    }
}

/*
    @func 更新游戏库存信息
 */
GameConfigController.updateStockInfo = function(req,res,next){
    try{
        //校验sign
        var sign = req.query.game_id+signValue;
        if(!checkSign(sign,req.query.sign)){
            res.send({
                status:2,
                type: 'ERROR_SIGN',
                message: 'sign错误',
            })
            return 
        }
        //校验参数合法性
        var fields ={};
        fields.game_id = req.query.game_id;
        fields.cur_stock = req.query.cur_stock;
        fields.stock_initial_value = req.query.stock_initial_value;
        fields.cheat_chance_1 = req.query.cheat_chance_1;
        fields.stock_threshold_1 = req.query.stock_threshold_1;
        fields.cheat_chance_2 = req.query.cheat_chance_2;
        fields.stock_threshold_2 = req.query.stock_threshold_2;
        fields.cheat_chance_3 = req.query.cheat_chance_3;
        if(!fields.game_id &&  !Number(fields.game_id) || !fields.cur_stock || !fields.stock_initial_value
            || !fields.cheat_chance_1 || !fields.stock_threshold_1 ||!fields.cheat_chance_2 
            ||!fields.stock_threshold_2 || !fields.cheat_chance_3){
                res.send({
                    status:2,
                    type: 'ERROR_PARAMS',
                    message: '参数错误',
                })
                return 
        }
        //更新数据
		gameConfigModule.updateStockInfoById(fields,res);
    }catch(err){
        console.log('updateStockInfo 更新数据失败', err);
		res.send({
			status: 1,
			type: 'UPDATE_DATA_ERROR',
			message: '更新数据失败'
		})
    }
}

/*
    @func 更新事件配置信息
 */
GameConfigController.updateEventInfo = function(req,res,next){
    try{
        //校验sign
        var sign = req.query.event_id+signValue;
        if(!checkSign(sign,req.query.sign)){
            res.send({
                status:2,
                type: 'ERROR_SIGN',
                message: 'sign错误',
            })
            return 
        }
        //校验参数合法性
        var fields ={};
        fields.event_id = req.query.event_id;
        fields.host_ball_handling = req.query.host_ball_handling;
        fields.host_attack = req.query.host_attack;
        fields.host_dangerous_attack = req.query.host_dangerous_attack;
        fields.guest_ball_handling = req.query.guest_ball_handling;
        fields.guest_attack = req.query.guest_attack;
        fields.guest_dangerous_attack = req.query.guest_dangerous_attack;
        fields.animation_time = req.query.animation_time;
        fields.blockade = req.query.blockade;
        if(!fields.event_id &&  !Number(fields.event_id) || !fields.host_attack || !fields.host_dangerous_attack
            || !fields.guest_ball_handling || !fields.guest_attack ||!fields.guest_dangerous_attack ||!fields.host_ball_handling 
            ||!fields.animation_time || !fields.blockade){
                res.send({
                    status:2,
                    type: 'ERROR_PARAMS',
                    message: '参数错误',
                })
                return 
        }
        //更新数据
		gameConfigModule.updateEventInfoById(fields,res);
    }catch(err){
        console.log('updateEventInfo 更新数据失败', err);
		res.send({
			status: 1,
			type: 'UPDATE_DATA_ERROR',
			message: '更新数据失败'
		})
    }
}


    GameConfigController.updateGoalInfo = function(req,res,next){
        try{
            //校验参数合法性
            var sign = req.query.all_goal_num+signValue;
            if(!checkSign(sign,req.query.sign)){
                res.send({
                    status:2,
                    type: 'ERROR_SIGN',
                    message: 'sign错误',
                })
                return 
            }
            var fields ={};
            fields.all_goal_num = req.query.all_goal_num;
            fields.chance =  req.query.chance;
            if(!fields.all_goal_num || !fields.chance){
                res.send({
                    status:2,
                    type: 'ERROR_PARAMS',
                    message: '参数错误',
                })
                return 
            }
            //更新数据
            gameConfigModule.updateGoalInfo(fields,res);
        }catch(err){
            console.log('updateGoalInfo 更新数据失败', err);
            res.send({
                status: 1,
                type: 'UPDATE_DATA_ERROR',
                message: '更新数据失败'
            })
        }

    }

        /*
        @func  获取竞猜足球的系统设置
    */
    GameConfigController.getRealBetItem = function(req,res,next){
        try{
            //校验sign
            var sign = 'getReal'+signValue;
            if(!checkSign(sign,req.query.sign)){
                res.send({
                    status:2,
                    type: 'ERROR_SIGN',
                    message: 'sign错误',
                })
                return 
            }
            //获取数据
            gameConfigModule.getRealBetItem(res);
        }catch(err){
            console.log('getRealBetItem 获取数据失败', err);
            res.send({
                status: 1,
                type: 'GET_DATA_ERROR',
                message: '获取数据失败'
            })
        }
    }

    /*
        @func  获取虚拟足球的系统设置
    */
    GameConfigController.getVirtualBetItem = function(req,res,next){
        try{
            //校验sign
            var sign = 'getvirtual'+signValue;
            if(!checkSign(sign,req.query.sign)){
                res.send({
                    status:2,
                    type: 'ERROR_SIGN',
                    message: 'sign错误',
                })
                return 
            }
            //获取数据
            gameConfigModule.getVirtualBetItem(res);
        }catch(err){
            console.log('getVirtualBetItem 获取数据失败', err);
            res.send({
                status: 1,
                type: 'GET_DATA_ERROR',
                message: '获取数据失败'
            })
        }
    }

    /*
        @func 
     */
    GameConfigController.updateBetItem = function(req,res,next){
        try{
            //校验sign
            var sign = req.query.type+signValue+req.query.id;
            if(!checkSign(sign,req.query.sign)){
                res.send({
                    status:2,
                    type: 'ERROR_SIGN',
                    message: 'sign错误',
                })
                return 
            }
            switch(req.query.type){
                case '1':
                    var value1 = {};
                    value1['game_id'] = req.query.id;
                    value1['item1'] = req.query.item1;
                    value1['item2'] = req.query.item2;
                    value1['item3'] = req.query.item3;
                    if(!value1['game_id']||!value1['item1']||!value1['item2']
                        || !value1['item3']){
                        res.send({
                            status:2,
                            type: 'ERROR_PARAMS',
                            message: '参数错误',
                        })
                        return 
				    }
                    //更新数据
                    gameConfigModule.updateBetItem(res,value1,req.query.type);
                    break;
                case '2':
                    var value2 = {};
                    value2['game_id'] = req.query.id;
                    value2['item1'] = req.query.item1;
                    value2['item2'] = req.query.item2;
                    value2['item3'] = req.query.item3;
                    value2['num_limit'] = req.query.num_limit;
                    value2['coin_limit'] = req.query.coin_limit;
                    if(!value2['game_id'] || !value2['item1']||!value2['item2']
                        || !value2['item3'] ||!value2['num_limit']||!value2['coin_limit']){
                        res.send({
                            status:2,
                            type: 'ERROR_PARAMS',
                            message: '参数错误',
                        })
                    return 
                    }
                    //更新数据
                    gameConfigModule.updateBetItem(res,value2,req.query.type);
                    break;
                default: 
				res.json({
					status:2,
					type: 'ERROR_QUERY_TYPE',
					message: '参数错误',
				})
				return
            }

        }catch(err){
            console.log('getVirtualBetItem 获取数据失败', err);
            res.send({
                status: 1,
                type: 'GET_DATA_ERROR',
                message: '获取数据失败'
            })
        }
    }

    /*
    @func  添加赔率记录
 */
    GameConfigController.addGoalsInfo = function(req,res,next){
        try{
            //校验sign
            var sign = 'Addgoals'+signValue;
            if(!checkSign(sign,req.query.sign)){
                res.send({
                    status:2,
                    type: 'ERROR_SIGN',
                    message: 'sign错误',
                })
                return 
            }
        //校验参数合法性
        var fields ={};
        fields.all_goal_num = req.query.all_goal_num;
        fields.chance = req.query.chance;
    
        if( !fields.all_goal_num || !fields.chance){
                res.send({
                    status:2,
                    type: 'ERROR_PARAMS',
                    message: '参数错误',
                })
                return 
        }
        //更新数据
        gameConfigModule.addgoalsInfo(fields,res);
        }catch(err){
        console.log('addGoalInfo 添加数据失败', err);
        res.send({
            status: 1,
            type: 'ADD_DATA_ERROR',
            message: '添加更新数据失败'
        })
    }




}

