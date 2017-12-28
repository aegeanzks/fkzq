module.exports = VirtualFootball;

var OBJ = require('../../../Utils/ObjRoot').getObj;

function VirtualFootball(){

    var matchState = 0;
    var lastTime = 0;
    var event = 0;
    var hostTeamId = 0;
    var hostTeamGoal = 0;
    var guestTeamId = 0;
    var guestTeamGoal = 0;
    var hostWinTimes = 0;
    var hostWinSupport = 0;
    var drawTimes = 0;
    var drawSupport = 0;
    var guestWinTimes = 0;
    var guestWinSupport = 0;
    var hostNextGoalTimes = 0;
    var hostNextGoalSupport = 0;
    var zeroGoalTimes = 0;
    var zeroGoalSupport = 0;
    var guestNextGoalTimes = 0;
    var guestNextGoalSupport = 0;

    //初始化
    init();
    function init(){
        //申请虚拟足球数据
        OBJ('DataCenterModule').send({module:'VirtualFootball', func:'getCurData'});
    }

    this.resCurData = function(source, data){
        matchState = data.matchState;
        lastTime = data.lastTime;
        event = data.event;
        hostTeamId = data.hostTeamId;
        hostTeamGoal = data.hostTeamGoal;
        guestTeamId = data.guestTeamId;
        guestTeamGoal = data.guestTeamGoal;
        hostWinTimes = data.hostWinTimes;
        hostWinSupport = data.hostWinSupport;
        drawTimes = data.drawTimes;
        drawSupport = data.drawSupport;
        guestWinTimes = data.guestWinTimes;
        guestWinSupport = data.guestWinSupport;
        hostNextGoalTimes = data.hostNextGoalTimes;
        hostNextGoalSupport = data.hostNextGoalSupport;
        zeroGoalTimes = data.zeroGoalTimes;
        zeroGoalSupport = data.zeroGoalSupport;
        guestNextGoalTimes = data.guestNextGoalTimes;
        guestNextGoalSupport = data.guestNextGoalSupport;
    };

    this.refreshMatchEvent = function(source, data){
        event = data.event;
        hostTeamId = data.hostTeamId;
        hostTeamGoal = data.hostTeamGoal;
        guestTeamId = data.guestTeamId;
        guestTeamGoal = data.guestTeamGoal;
        hostWinTimes = data.hostWinTimes;
        hostWinSupport = data.hostWinSupport;
        drawTimes = data.drawTimes;
        drawSupport = data.drawSupport;
        guestWinTimes = data.guestWinTimes;
        guestWinSupport = data.guestWinSupport;
        hostNextGoalTimes = data.hostNextGoalTimes;
        hostNextGoalSupport = data.hostNextGoalSupport;
        zeroGoalTimes = data.zeroGoalTimes;
        zeroGoalSupport = data.zeroGoalSupport;
        guestNextGoalTimes = data.guestNextGoalTimes;
        guestNextGoalSupport = data.guestNextGoalSupport;

        //广播
        var push = new pbSvrcli.Push_GoalAndBetArea();
        var goalAndBetArea = new pbSvrcli.GoalAndBetArea();
        goalAndBetArea.setHostteamid(hostTeamId);
        goalAndBetArea.setHostteamgoal(hostTeamGoal);
        goalAndBetArea.setGuestteamid(guestTeamId);
        goalAndBetArea.setGuestteamgoal(guestTeamGoal);
        goalAndBetArea.setHostwintimes(hostWinTimes);
        goalAndBetArea.setHostwinsupport(hostWinSupport);
        goalAndBetArea.setDrawtimes(drawTimes);
        goalAndBetArea.setDrawsupport(drawSupport);
        goalAndBetArea.setGuestwintimes(guestWinTimes);
        goalAndBetArea.setGuestwinsupport(guestWinSupport);
        goalAndBetArea.setHostnextgoaltimes(hostNextGoalTimes);
        goalAndBetArea.setHostnextgoalsupport(hostNextGoalSupport);
        goalAndBetArea.setZerogoaltimes(zeroGoalTimes);
        goalAndBetArea.setZerogoalsupport(zeroGoalSupport);
        goalAndBetArea.setGuestnextgoaltimes(guestNextGoalTimes);
        goalAndBetArea.setGuestnextgoalsupport(guestNextGoalSupport);
        goalAndBetArea.setEvent(event);
        push.setGoalandbetarea(goalAndBetArea);
        io.sockets.in('VirtualFootMainInfo').emit(pbSvrcli.Push_GoalAndBetArea.Type.ID, push.serializeBinary());
    };

    this.refreshMatchState = function(source, data){
        matchState = data.matchState;
        lastTime = data.lastTime;

        //广播
        var push = new pbSvrcli.Push_MatchInfo();
        var matchInfo = new pbSvrcli.MatchInfo();
        matchInfo.setMatchstate(matchState);
        matchInfo.setLastsecond(parseInt(lastTime/1000));
        matchInfo.setHostwinnum(0);
        matchInfo.setDrawnum(0);
        matchInfo.setGuestwinnum(0);
        push.setMatchinfo(matchInfo);
        io.sockets.in('VirtualFootMainInfo').emit(pbSvrcli.Push_MatchInfo.Type.ID, push.serializeBinary());
    };

    this.askVirtualFootMainInfo = function(askVirtualFootMainInfo, socket){
        socket.join('VirtualFootMainInfo');

        var res = new pbSvrcli.Res_VirtualFootMainInfo();
        var matchInfo = new pbSvrcli.MatchInfo();
        matchInfo.setMatchstate(matchState);
        matchInfo.setLastsecond(parseInt(lastTime/1000));
        matchInfo.setHostwinnum(0);
        matchInfo.setDrawnum(0);
        matchInfo.setGuestwinnum(0);
        res.setMatchinfo(matchInfo);
        var goalAndBetArea = new pbSvrcli.GoalAndBetArea();
        goalAndBetArea.setHostteamid(hostTeamId);
        goalAndBetArea.setHostteamgoal(hostTeamGoal);
        goalAndBetArea.setGuestteamid(guestTeamId);
        goalAndBetArea.setGuestteamgoal(guestTeamGoal);
        goalAndBetArea.setHostwintimes(hostWinTimes);
        goalAndBetArea.setHostwinsupport(hostWinSupport);
        goalAndBetArea.setDrawtimes(drawTimes);
        goalAndBetArea.setDrawsupport(drawSupport);
        goalAndBetArea.setGuestwintimes(guestWinTimes);
        goalAndBetArea.setGuestwinsupport(guestWinSupport);
        goalAndBetArea.setHostnextgoaltimes(hostNextGoalTimes);
        goalAndBetArea.setHostnextgoalsupport(hostNextGoalSupport);
        goalAndBetArea.setZerogoaltimes(zeroGoalTimes);
        goalAndBetArea.setZerogoalsupport(zeroGoalSupport);
        goalAndBetArea.setGuestnextgoaltimes(guestNextGoalTimes);
        goalAndBetArea.setGuestnextgoalsupport(guestNextGoalSupport);
        goalAndBetArea.setEvent(event);
        res.setGoalandbetarea(goalAndBetArea);
        OBJ('WsMgr').send(socket, pbSvrcli.Res_VirtualFootMainInfo.Type.ID, res.serializeBinary());
    };

    this.askGuessingRecord = function(){
        socket.leave('VirtualFootMainInfo');

        var res = new pbSvrcli.Res_VirtualHistory();
        OBJ('WsMgr').send(socket, pbSvrcli.Res_VirtualHistory.Type.ID, res.serializeBinary());
    };

    this.askVirtualHistory = function(){
        socket.leave('VirtualFootMainInfo');

        var res = new pbSvrcli.Res_VirtualBet();
        OBJ('WsMgr').send(socket, pbSvrcli.Res_VirtualBet.Type.ID, res.serializeBinary());
    };

    this.run = function(Timestamp){

    };
}