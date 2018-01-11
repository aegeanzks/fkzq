//竞彩足球管理路由
var express = require('express');
var RlVRaceController = require('../Controller/VirtualFootball/VirtualRaceController');
var RlVRecordsontroller = require('../Controller/VirtualFootball/VirtualRecordsController');

const router = express.Router();

//比赛管理
router.get('/list', RlVRaceController.getList);            //获取赛事列表
router.get('/records', RlVRecordsontroller.recordslist);                            //获取赛事记录列表
//end 比赛管理

//全部竞猜记录

//end 全部竞猜记录




module.exports = router;


