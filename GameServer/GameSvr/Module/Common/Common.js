// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = Common;

var OBJ = require('../../../Utils/ObjRoot').getObj;
var GameServerInfosSchema = require('../../../db_structure').GameServerInfos();
var SingleTimer = require('../../../Utils/SingleTimer');

function Common(){
    var pingTimer = new SingleTimer();
    pingTimer.startup(1000);

    var model_GameServerInfos = OBJ('DbMgr').getModel(GameServerInfosSchema);
    this.run = function(timestamp){
        //注册服务器
        if(null != pingTimer && pingTimer.toNextTime())
        {
            model_GameServerInfos.ip = '127.0.0.1';
            model_GameServerInfos.port = 10010;
            model_GameServerInfos.onLineNum = 0;
            model_GameServerInfos.createTime = new Date(timestamp);
            model_GameServerInfos.save(function(err){
                if(err){
                    console.log(err);
                    OBJ('LogMgr').writeErr(err);
                }
            });
        }
    }
}