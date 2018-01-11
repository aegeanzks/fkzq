var pbLogin = require('../Msg/MsgFile/msg.svrcli_pb');


function start() {

    var io = require('socket.io-client');
    var socket = io.connect('ws://127.0.0.1:10011');
    socket.binaryType = 'arraybuffer';
    socket.on('connect', function () {
        console.log('连接上了...');
        //发送登录
        var askLogin = new pbLogin.Ask_Login();
        //askLogin.token = '123456';
        //askLogin.userid = 123456;
        var buf = askLogin.serializeBinary();
        var remeberTime = Date.now();
        socket.emit(pbLogin.Ask_Login.Type.ID, buf, buf.length);

		socket.on('10001', function(msg, length){
            console.log('使用时间：'+(Date.now()-remeberTime) + '毫秒');
            msg.length = length;
            var res = pbLogin.Res_Login.deserializeBinary(new Uint8Array(msg));
            console.log(res.getCoin());

            var askVirtualFootMainInfo = new pbLogin.Ask_VirtualFootMainInfo();
            var buf = askVirtualFootMainInfo.serializeBinary();
            socket.emit(pbLogin.Ask_VirtualFootMainInfo.Type.ID, buf, buf.length);
        });
        
        socket.on(pbLogin.Res_VirtualFootMainInfo.Type.ID, function(msg, length){
            msg.length = length;
            var res = pbLogin.Res_VirtualFootMainInfo.deserializeBinary(new Uint8Array(msg));
            console.log('Res_VirtualFootMainInfo');

            //var askVirtualBet = new pbLogin.Ask_VirtualBet();

            //askVirtualBet.setBetarea(1);
            //askVirtualBet.setCoinitem(1);

            //var buf = askVirtualBet.serializeBinary();
            //console.log('开始下注');
            //socket.emit(pbLogin.Ask_VirtualBet.Type.ID, buf, buf.length);
        });

        socket.on(pbLogin.Res_VirtualBet.Type.ID, function(msg, length){
            msg.length = length;
            var res = pbLogin.Res_VirtualBet.deserializeBinary(new Uint8Array(msg));
            console.log('下注成功：' + res.getResult());
        });

        socket.on(pbLogin.Push_MatchInfo.Type.ID, function(msg, length){
            console.log('Push_MatchInfo');
        });

        socket.on(pbLogin.Push_GoalAndBetArea.Type.ID, function(msg, length){
            console.log('Push_GoalAndBetArea');
        });

        socket.on(pbLogin.Res_GuessingRecord.Type.ID, function(msg, length){
            msg.length = length;
            var res = pbLogin.Res_GuessingRecord.deserializeBinary(new Uint8Array(msg));
            var arr = res.getGuessingrecordsList();
            console.log('arr[0].getIssue()：'+arr[0].getIssue());
            console.log('arr[0].getbetDate()：'+arr[0].getBetdate());
        });

        socket.on(pbLogin.Res_VirtualHistory.Type.ID, function(msg, length) {
            msg.length = length;
            var res = pbLogin.Res_VirtualHistory.deserializeBinary(new Uint8Array(msg));
            var arr = res.getVirtualhistoryList();
            console.log('arr[0].getIssue():' + arr[0].getIssue());
        });
    });

    // 引入readline模块
    var readline = require('readline');

    //创建readline接口实例
    var  rl = readline.createInterface({
        input:process.stdin,
        output:process.stdout
    });

    // question方法
    function questtion() {
        rl.question("投注准备好了...",function(key){
            if(key == '1'){
                var askVirtualBet = new pbLogin.Ask_VirtualBet();
    
                askVirtualBet.setBetarea(1);
                askVirtualBet.setCoinitem(1);
    
                var buf = askVirtualBet.serializeBinary();
                console.log('开始下注:1');
                socket.emit(pbLogin.Ask_VirtualBet.Type.ID, buf, buf.length);
                //socket.emit(pbLogin.Ask_VirtualBet.Type.ID, buf, buf.length);
                //socket.emit(pbLogin.Ask_VirtualBet.Type.ID, buf, buf.length);
                //socket.emit(pbLogin.Ask_VirtualBet.Type.ID, buf, buf.length);
                //socket.emit(pbLogin.Ask_VirtualBet.Type.ID, buf, buf.length);
            }else if(key == '2'){
                var askVirtualBet = new pbLogin.Ask_VirtualBet();
    
                askVirtualBet.setBetarea(2);
                askVirtualBet.setCoinitem(1);
    
                var buf = askVirtualBet.serializeBinary();
                console.log('开始下注:2');
                socket.emit(pbLogin.Ask_VirtualBet.Type.ID, buf, buf.length);
            }else if(key == '3'){
                var askVirtualBet = new pbLogin.Ask_VirtualBet();
    
                askVirtualBet.setBetarea(3);
                askVirtualBet.setCoinitem(1);
    
                var buf = askVirtualBet.serializeBinary();
                console.log('开始下注:3');
                socket.emit(pbLogin.Ask_VirtualBet.Type.ID, buf, buf.length);
            }else if(key == '4'){
                var askVirtualBet = new pbLogin.Ask_VirtualBet();
    
                askVirtualBet.setBetarea(4);
                askVirtualBet.setCoinitem(1);
    
                var buf = askVirtualBet.serializeBinary();
                console.log('开始下注:4');
                socket.emit(pbLogin.Ask_VirtualBet.Type.ID, buf, buf.length);
            }else if(key == '5'){
                var askVirtualBet = new pbLogin.Ask_VirtualBet();
    
                askVirtualBet.setBetarea(5);
                askVirtualBet.setCoinitem(1);
    
                var buf = askVirtualBet.serializeBinary();
                console.log('开始下注:5');
                socket.emit(pbLogin.Ask_VirtualBet.Type.ID, buf, buf.length);
            }else if(key == '6'){
                var askVirtualBet = new pbLogin.Ask_VirtualBet();
    
                askVirtualBet.setBetarea(6);
                askVirtualBet.setCoinitem(1);
    
                var buf = askVirtualBet.serializeBinary();
                console.log('开始下注:6');
                socket.emit(pbLogin.Ask_VirtualBet.Type.ID, buf, buf.length);
            }else if(key == '7'){
                var askGuessingRecord = new pbLogin.Ask_GuessingRecord();
                askGuessingRecord.setPage(0);

                var buf = askGuessingRecord.serializeBinary();
                console.log('申请投注记录');
                socket.emit(pbLogin.Ask_GuessingRecord.Type.ID, buf, buf.length);
            }else if(key == '8'){
                var askVirtualHistory = new pbLogin.Ask_VirtualHistory();
                askVirtualHistory.setPage(0);

                var buf = askVirtualHistory.serializeBinary();
                console.log('申请虚拟赛局记录');
                socket.emit(pbLogin.Ask_VirtualHistory.Type.ID, buf, buf.length);
            }else if(key == '20'){
                var askRealFootMainInfo = new pbLogin.Ask_RealFootMainInfo();
                console.log('申请真实主页消息');
                socket.emit(pbLogin.Ask_RealFootMainInfo.Type.ID, "", 0);
            }else if(key == '21'){
                var askRealFootBetRateInfo = new pbLogin.Ask_RealFootBetRateInfo();
                askRealFootBetRateInfo.setSceheduleid(51434);     //赛事id
                askRealFootBetRateInfo.setBetclass(1);

                var buf = askRealFootBetRateInfo.serializeBinary();
                console.log('真实胜平负投注比例');
                socket.emit(pbLogin.Ask_RealFootBetRateInfo.Type.ID, buf, buf.length);

            }else if(key == '22'){
                var askRealFootBetRateInfo = new pbLogin.Ask_RealFootBetRateInfo();
                askRealFootBetRateInfo.setSceheduleid(51434);     //赛事id
                askRealFootBetRateInfo.setBetclass(2);

                var buf = askRealFootBetRateInfo.serializeBinary();
                console.log('真实让球胜平负投注比例');
                socket.emit(pbLogin.Ask_RealFootBetRateInfo.Type.ID, buf, buf.length);
            }else if(key == '23'){
                var askRealFootBetInfo = new pbLogin.Ask_RealFootBetInfo();
                askRealFootBetInfo.setBettype(1);
                askRealFootBetInfo.setBetnum(1);
                askRealFootBetInfo.setBettime(2);
                askRealFootBetInfo.setBetcoinarea(1);
                
                var arr = [];
                var betInfo = new  pbLogin.RlBetInfo();

                betInfo.setSceheduleid(51434);                    //赛事id
                betInfo.setBetclass(1);
                betInfo.setBetarea(1);
                arr.push(betInfo);

                askRealFootBetInfo.setBetinfoList(arr);
                var buf = askRealFootBetInfo.serializeBinary();
                console.log('真实单场投注');
                socket.emit(pbLogin.Ask_RealFootBetInfo.Type.ID, buf, buf.length);
            }

            questtion();
        });
    }
    questtion();
}

start();