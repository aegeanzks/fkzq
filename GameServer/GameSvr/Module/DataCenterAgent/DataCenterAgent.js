// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = DataCenterAgent;
var OBJ = require('../../../Utils/ObjRoot').getObj;

function DataCenterAgent(){

    this.reqGetCoin = function(userid){
        OBJ('RpcMgr').send('agent', 'reqGetCoin', userid);
    };
    this.resGetCoin = function(res){
        OBJ('LoginModule').logic.resGetCoin(res);
    };
}