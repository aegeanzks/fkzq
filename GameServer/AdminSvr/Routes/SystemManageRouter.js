//系统管理路由
var express = require('express');
var GameConfigController = require('../Controller/SystemManage/GameConfigController');


const router = express.Router();

//游戏配置
router.get('/getStockList',GameConfigController.getStockValueList);
router.get('/getStockInfo',GameConfigController.getStockInfo);
router.post('/updateStockInfo',GameConfigController.updateStockInfo);
router.get('/getEventInfo',GameConfigController.getEventInfo);
router.get('/getOddsInfo',GameConfigController.getOddsInfo);
router.get('/getGoalInfo',GameConfigController.getGoalInfo);
//router.post('/updateEventInfo',GameConfigController.updateEventInfo);
//end 游戏配置



module.exports = router;


