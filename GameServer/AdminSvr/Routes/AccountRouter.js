//竞彩足球管理路由
var express = require('express');
var RlAccountController = require('../Controller/Accounts/AccountController');


const router = express.Router();

//比赛管理
router.get('/list', RlAccountController.accountlist);            //获得玩家列表
router.get('/accountfreeze', RlAccountController.accountfreeze);    
router.get('/slewrateupdate', RlAccountController.slewrateupdate);    

//end 比赛管理

//全部竞猜记录

//end 全部竞猜记录




module.exports = router;

