// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = DataCenter;

var configDataCenter = require('../../../config').dataCenterSvrConfig();
var SingleTimer = require('../../../Utils/SingleTimer');
var OBJ = require('../../../Utils/ObjRoot').getObj;

function DataCenter(){

    var pingTimer = new SingleTimer();
    pingTimer.startup(1000);

    this.run = function(timestamp){
        //ping到数据中心
        if(null != pingTimer && pingTimer.toNextTime())
        {
            OBJ('RpcMgr').send(configDataCenter.serverId, 'gameServerPing', null);
        }
    };

    this.dataCenterMsg = function(source, res){
        console.log(res);
    };
}