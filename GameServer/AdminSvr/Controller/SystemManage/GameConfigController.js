module.exports = GameConfigController;

var RlRaceModule = require('../../Module/SystemManage/GameConfigModule');
var checkSign  = require('../Sign').checkSign;
var signValue = require('../../../config').adminSvrConfig();

/*  
    游戏配置controller类
 */
function GameConfigController(){
	rlRaceModule =	new RlRaceModule();
	this.signStr = signValue['sign'];
}

/*
    @func  获取游戏列表库存值
 */
GameConfigController.getStock = function(req,res,next){
    

}