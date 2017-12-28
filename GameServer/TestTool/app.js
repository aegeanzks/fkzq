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
            console.log(res.getMatchinfo());

            
        });

        socket.on(pbLogin.Push_MatchInfo.Type.ID, function(msg, length){
            console.log('Push_MatchInfo');
        });

        socket.on(pbLogin.Push_GoalAndBetArea.Type.ID, function(msg, length){
            console.log('Push_GoalAndBetArea');
        });
    });
}

start();