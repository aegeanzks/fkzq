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
    pingTimer.startup(5000);

    var class_GameServerInfos = OBJ('DbMgr').getStatement(GameServerInfosSchema);
    this.run = function(timestamp){
        //注册服务器
        if(null != pingTimer && pingTimer.toNextTime())
        {
            class_GameServerInfos.find({'serverid':SERVERID}, function(err, data){
                if(data.length == 0){
                    var model_GameServerInfos = OBJ('DbMgr').getModel(GameServerInfosSchema);
                    model_GameServerInfos.serverid = SERVERID;
                    model_GameServerInfos.ip = global.ip;
                    model_GameServerInfos.port = global.port;
                    model_GameServerInfos.onLineNum = 0;
                    model_GameServerInfos.save(function(err){
                        if(err){
                            console.log(err);
                            OBJ('LogMgr').writeErr(err);
                        }
                    });
                } else {

                    var updateVar = {updateTime:Date.now()};
                    class_GameServerInfos.update({'serverid':SERVERID}, {$set:updateVar}, function(err){
                        if(err){
                            console.log(err);
                            OBJ('LogMgr').writeErr(err);
                        }
                    });
                }
            });
        }
    }
}