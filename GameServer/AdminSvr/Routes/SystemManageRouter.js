//系统管理路由
var express = require('express');
var GameConfigController = require('../Controller/SystemManage/GameConfigController');


const router = express.Router();

//游戏配置
router.get('/addGoalsInfo',GameConfigController.addGoalsInfo);
router.get('/getStockList',GameConfigController.getStockValueList);
router.get('/getStockInfo',GameConfigController.getStockInfo);
router.get('/updateStockInfo',GameConfigController.updateStockInfo);
router.get('/getEventInfo',GameConfigController.getEventInfo);
router.get('/getOddsInfo',GameConfigController.getOddsInfo);
router.get('/getOddsByIdInfo',GameConfigController.getoodbyIdInfo);
router.get('/delOddsById',GameConfigController.delOodInfoByID);
router.get('/addOodInfo',GameConfigController.addOodInfo);
router.get('/updateOodInfo',GameConfigController.updateOodInfo);
router.get('/getGoalInfo',GameConfigController.getGoalInfo);
router.get('/delGoalById',GameConfigController.delGoalInfoByID);

router.get('/updateEventInfo',GameConfigController.updateEventInfo);
//end 游戏配置



module.exports = router;


