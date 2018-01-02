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
/*GameConfigController.updateEventInfo = function(req,res,next){
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
		gameConfigModule.updateStockConfig(fields,res);
    }catch(err){
        console.log('updateEventInfo 更新数据失败', err);
		res.send({
			status: 1,
			type: 'UPDATE_DATA_ERROR',
			message: '更新数据失败'
		})
    }
}*/