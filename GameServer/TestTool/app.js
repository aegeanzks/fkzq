var pbLogin = require('../Msg/MsgFile/msg.svrcli_pb');


function start() {

    var io = require('socket.io-client');
    var opts = {
        'reconnection': false,
        'force new connection': true,
        'transports': ['websocket', 'polling'],
    }
    var socket = io.connect('ws://127.0.0.1:10011', opts);
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
            msg.length = length;
            var res = pbLogin.Push_MatchInfo.deserializeBinary(new Uint8Array(msg));
            var matchInfo = res.getMatchinfo();
            console.log(Date.now());
            console.log('Matchstate:'+matchInfo.getMatchstate());
            console.log('Lastsecond:'+matchInfo.getLastsecond());
            console.log('Hostwinnum:'+matchInfo.getHostwinnum());
            console.log('Drawnum:'+matchInfo.getDrawnum());
            console.log('Guestwinnum:'+matchInfo.getGuestwinnum());
            console.log('Hostteamid:'+matchInfo.getHostteamid());
            console.log('Guestteamid:'+matchInfo.getGuestteamid());
            console.log('Issue:'+matchInfo.getIssue());
        });

        socket.on(pbLogin.Push_GoalAndBetArea.Type.ID, function(msg, length){
            console.log('Push_GoalAndBetArea');
			msg.length = length;
            var res = pbLogin.Push_GoalAndBetArea.deserializeBinary(new Uint8Array(msg));
			var goalAndBetArea = res.getGoalandbetarea();
			var event = goalAndBetArea.getEvent();
			console.error('event:'+event);
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

        socket.on(pbLogin.Push_WinBet.Type.ID, function(msg, length){
            msg.length = length;
            var res = pbLogin.Push_WinBet.deserializeBinary(new Uint8Array(msg));
            console.log('winCoin:'+res.getWincoin()+' coin:'+res.getCoin());
        });

        socket.on('disconnect', function(){
            console.log('disconnect');
        });

        socket.on(pbLogin.Push_OtherLogin.Type.ID, function(msg, length){
            console.log('在其他地方登陆');
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
                askRealFootBetRateInfo.setSceheduleid(51437);     //赛事id
                askRealFootBetRateInfo.setBetclass(1);

                var buf = askRealFootBetRateInfo.serializeBinary();
                console.log('真实胜平负投注比例');
                socket.emit(pbLogin.Ask_RealFootBetRateInfo.Type.ID, buf, buf.length);

            }else if(key == '22'){
                var askRealFootBetRateInfo = new pbLogin.Ask_RealFootBetRateInfo();
                askRealFootBetRateInfo.setSceheduleid(51437);     //赛事id
                askRealFootBetRateInfo.setBetclass(2);

                var buf = askRealFootBetRateInfo.serializeBinary();
                console.log('真实让球胜平负投注比例');
                socket.emit(pbLogin.Ask_RealFootBetRateInfo.Type.ID, buf, buf.length);
            }else if(key == '23'){
                var askRealFootBetInfo = new pbLogin.Ask_RealFootBetInfo();
                askRealFootBetInfo.setBetnum(8);
                askRealFootBetInfo.setBettime(2);
                askRealFootBetInfo.setBetcoinarea(1);

                var scheduleidArr = [];
                for(var i=0;i<2;i++){
                    var scheduleid = new pbLogin.RlScheduleId();
                    if(i==1){
                        scheduleid.setScheduleid(52075);
                    }else{
                        scheduleid.setScheduleid(52074);
                    }
                    scheduleidArr.push(scheduleid);
                }
                askRealFootBetInfo.setScheduleList(scheduleidArr);

                //2串1
                var betTypeArr = [];
                var betType = new pbLogin.RlbetType();
                betType.setBettype(2);
                betTypeArr.push(betType);
                askRealFootBetInfo.setBettypeList(betTypeArr);

                var betPlanArr = [];
                //让球胜平负+胜平负
                for(var i=0;i<4;i++){
                    var betPlan = new pbLogin.RlBetPlan();
                    var betInfoArr = [];
                    for(var j = 0;j<2;j++){
                        var betInfo = new pbLogin.RlBetInfo();
                        if(j == 0){
                            betInfo.setSceheduleid(52074);
                            betInfo.setBetclass(2);
                        }else{
                            betInfo.setSceheduleid(52075);
                            betInfo.setBetclass(1);
                        }
                        if((i == 0 && j==0 )|| (i == 1 && j == 0) || (i == 0 && j ==1) || (i == 2 && j == 1) ){
                            betInfo.setBetarea(1);
                        }else if((i == 1 && j == 1) || (i == 2 && j== 0) || (i == 3 && j ==0 ) || (i ==3 && j ==1)){
                            betInfo.setBetarea(2);
                        }
                        betInfoArr.push(betInfo);
                    }
                    betPlan.setBetinfoList(betInfoArr);
                    betPlanArr.push(betPlan);
                }

                //胜平负+胜平负
                for(var i=0;i<4;i++){
                    var betPlan = new pbLogin.RlBetPlan();
                    var betInfoArr = [];
                    for(var j = 0;j<2;j++){
                        var betInfo = new pbLogin.RlBetInfo();
                        if(j == 0){
                            betInfo.setSceheduleid(52074);
                            betInfo.setBetclass(1);
                        }else{
                            betInfo.setSceheduleid(52075);
                            betInfo.setBetclass(1);
                        }
                        if((i == 0 && j==0 )|| (i == 1 && j == 0) || (i == 0 && j ==1) || (i == 2 && j == 1) ){
                            betInfo.setBetarea(1);
                        }else if((i == 1 && j == 1)  || (i ==3 && j ==1)){
                            betInfo.setBetarea(2);
                        }else if((i == 2 && j== 0) || (i == 3 && j ==0 )){
                            betInfo.setBetarea(3);
                        }
                        betInfoArr.push(betInfo);
                    }
                    betPlan.setBetinfoList(betInfoArr);
                    betPlanArr.push(betPlan);
                }

                askRealFootBetInfo.setBetplanList(betPlanArr);
                var buf = askRealFootBetInfo.serializeBinary();
                
                var buf = askRealFootBetInfo.serializeBinary();
                console.log('2串1真实投注');
                socket.emit(pbLogin.Ask_RealFootBetInfo.Type.ID, buf, buf.length);
            }else if(key == '24'){
                var askRealFootballBetRecords = new pbLogin.Ask_RealFootballBetRecords();
                askRealFootballBetRecords.setPage(0);

                var buf = askRealFootballBetRecords.serializeBinary();
                console.log('真实我的竞猜请求');
                socket.emit(pbLogin.Ask_RealFootballBetRecords.Type.ID, buf, buf.length);
            }else if(key == '25'){
                var askRealFootBetDetails = new pbLogin.Ask_RealFootBetDetails();
                askRealFootBetDetails.setRecordid('LMXYN0220180205JC0004');
                var buf = askRealFootBetDetails.serializeBinary();
                console.log('真实我的竞猜详情请求');
                socket.emit(pbLogin.Ask_RealFootBetDetails.Type.ID, buf, buf.length);
            }
            else if(key == '26'){
                var askRealFootRecords = new pbLogin.Ask_RealFootRecords();

                var buf = askRealFootRecords.serializeBinary();
                console.log('真实足球比赛记录请求');
                socket.emit(pbLogin.Ask_RealFootRecords.Type.ID, buf, buf.length);                
            }
            questtion();
        });
    }
    questtion();
}

start();