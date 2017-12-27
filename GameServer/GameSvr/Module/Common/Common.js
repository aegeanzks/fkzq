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
    var registerTimer = new SingleTimer();
    registerTimer.startup(5000);

    var class_GameServerInfos = OBJ('DbMgr').getStatement(GameServerInfosSchema);
    this.run = function(timestamp){
        //注册服务器
        if(null != registerTimer && registerTimer.toNextTime())
        {
            /**
             *  server_id: String,
                ip: String,           //ip                
                port: Number,         //端口                           
                on_line_num: Number,    //当前在线数         
                update_time: Date,
             */
            class_GameServerInfos.find({'server_id':SERVERID}, function(err, data){
                if(data.length == 0){
                    var model_GameServerInfos = OBJ('DbMgr').getModel(GameServerInfosSchema);
                    model_GameServerInfos.server_id = SERVERID;
                    model_GameServerInfos.ip = global.ip;
                    model_GameServerInfos.port = global.port;
                    model_GameServerInfos.online_num = OBJ('PlayerContainer').getOnlineNum();
                    model_GameServerInfos.save(function(err){
                        if(err){
                            console.log(err);
                            OBJ('LogMgr').writeErr(err);
                        }
                    });
                } else {
                    var updateVar = {update_time:Date.now(), online_num:OBJ('PlayerContainer').getOnlineNum()};
                    class_GameServerInfos.update({'server_id':SERVERID}, {$set:updateVar}, function(err){
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