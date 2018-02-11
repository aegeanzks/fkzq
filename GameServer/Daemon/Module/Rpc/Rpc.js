// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = Rpc;

var OBJ = require('../../../Utils/ObjRoot').getObj;
var SingleTimer = require('../../../Utils/SingleTimer');
var child_process=require("child_process");

function Rpc(){
    var gamePingMap = new Map();
    var pingTimer = new SingleTimer();
    pingTimer.startup(2000);
    var startUpTime = new SingleTimer();
    startUpTime.startup(10000);
    var dir = process.cwd();

    function viewProcessMessage(pid, cb) {
        let cmd = process.platform === 'win32' ? 'tasklist' : 'ps aux';
        child_process.exec(cmd, function (err, stdout, stderr) {
            if (err) {
                return console.error(err);
            }
            stdout.split('\n').filter((line) => {
                let processMessage = line.trim().split(/\s+/);
                let processPid = processMessage[1]; //processMessage[0]进程名称 ， processMessage[1]进程id
                if (processPid == pid) {
                    return cb(processPid);
                }
            });
        });
    }
    this.reqApplyOpen = function(msg){
        if(gamePingMap.has(msg.source)){
            //关闭进程
            viewProcessMessage(msg.pid, function (pid) {
                //关闭匹配的进程
                process.kill(pid);
            });
        }
    };

    this.gameServerPing = function(msg){
        gamePingMap.set(msg.source, Date.now()+5000);
    };

    this.run = function(timestamp){
        if(null != pingTimer && pingTimer.toNextTime()){
            var tmMap = new Map(gamePingMap);
            for (var value of tmMap){
                if (timestamp > value[1]){
                    gamePingMap.delete(value[0]);
                }
            }
            //检测重启
            for(var item of serverList){
                if(!startUpList.has(item) && !gamePingMap.has(item)){
                    //重启
                    child_process.exec("start /D %cd% "+item+".bat",function(error,stdout,stderr){
                        if(error !==null){
                            console.log("exec error:"+error);
                        }
                        else console.log(item+"重启成功");
                        //console.log('stdout: ' + stdout);
                        //console.log('stderr: ' + stderr);
                    });
                    //标记
                    startUpList.set(item, Date.now()+5000);
                }
            }
        }
        if(null != startUpTime && startUpTime.toNextTime()){
            var tmMap = new Map(startUpList);
            for (var value of tmMap){
                if (timestamp > value[1]){
                    startUpList.delete(value[0]);
                }
            }
        }
    };

    var serverList = new Set();
    var startUpList = new Map();
    function init(){
        
        serverList.add('realDataCenter');
        serverList.add('virtualDataCenter');
        serverList.add('agent');
        serverList.add('server1');
        serverList.add('server2');

    }
    init();
}