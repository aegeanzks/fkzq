//竞彩足球管理路由
var express = require('express');
var RlAnnounceController = require('../Controller/SystemManage/AnnounceController');


const router = express.Router();

//比赛管理
router.get('/list', RlAnnounceController.getlist);            //获取广告列表
router.get('/info', RlAnnounceController.info);                            //获得公告信息（id）
router.get('/updateinfo', RlAnnounceController.updateinfo);                           //更新
router.get('/addinfo', RlAnnounceController.addinfo);                            //添加
router.get('/delinfo', RlAnnounceController.delinfo);                            //删除

//end 比赛管理

//全部竞猜记录

//end 全部竞猜记录




module.exports = router;

