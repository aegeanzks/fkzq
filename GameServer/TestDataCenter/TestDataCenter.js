// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = TestDataCenter;

var OBJ = require('../Utils/ObjRoot').getObj;

var RpcMgr = require('../Utils/Manager/RpcMgr');
var ModuleMgr = require('../Utils/Manager/ModuleMgr');
var RpcModule = require('./Module/Rpc/RpcModule');
var TestRealFoot = require('./Module/TestRealFootball');

function TestDataCenter(){}

TestDataCenter.start = function () {
    //管理器初始化
    console.log('开始启动服务TestDataCenter...');
    new ModuleMgr();
    new RpcMgr().run('TestDataCenter', TestDataCenter.run);
};

//用户模块注册
TestDataCenter.regsterFun = function(){
    //用户组件
    new RpcModule();
    new TestRealFoot();
};

//运行
TestDataCenter.run = function() {
    console.log('test已启动...');
    TestDataCenter.regsterFun();
    OBJ('ModuleMgr').run(3);
};

