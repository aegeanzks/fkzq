//竞彩足球管理路由
var express = require('express');
var RlRaceController = require('../Controller/RealFootball/RaceController');
var RlRecordsontroller = require('../Controller/RealFootball/RecordsController');

const router = express.Router();

//比赛管理
router.get('/list', RlRaceController.getList);            //获取赛事列表
router.get('/records', RlRecordsontroller.recordslist);                            //获取赛事记录列表
router.get('/updateRaceInfo', RlRaceController.updateRaceInfo);                 //编辑某一赛事
//end 比赛管理

//全部竞猜记录

//end 全部竞猜记录




module.exports = router;


