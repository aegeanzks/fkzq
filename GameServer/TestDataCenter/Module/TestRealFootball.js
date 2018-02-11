// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = TestRealFootball;
var ObjRoot = require('../../Utils/ObjRoot');
var OBJ = ObjRoot.getObj;

function TestRealFootball(){
        // 引入readline模块
        var readline = require('readline');
        
        //创建readline接口实例
        var  rl = readline.createInterface({
            input:process.stdin,
            output:process.stdout
        });

        question();

        function question(){
            rl.question("RealFootball准备好了...",function(key){
                if(key == 1){
                    var idArr = [];
                    var scoreArr = [];
                    var raceStatus = [];
                    idArr.push(51891);
                    scoreArr.push("3:1");
                    raceStatus.push(0);
                    console.log("比赛结束结算");

                    OBJ('RpcModule').send("server2", 'RealFootball', 'refreshScheduleState', {
                        id: idArr,
                        score: scoreArr,
                        raceStatus: raceStatus
                    });
                }
            });
        }
}