module.exports = DataPull;

//加载模块
var config = require('../../../config').realDataCenterSvrConfig();
var Schema = require('../../../db_structure');
var OBJ = require('../../../Utils/ObjRoot').getObj;
var Func = require('../../../Utils/Functions');
//end 加载模块

//数据拉取
function DataPull() {
    //变量定义
    var phaseday = 0;                          //请求的期号时间戳
    var pageUrl;                              //请求数据网址
    var freq;                                 //请求时间间隔
    var noDataNum = 0;                         //连续取到空数据期号统计
    var noDataTotal = 0;                       //连续n天取到为空成立,截至轮询
    var totalNum = 0;                          //轮询的期号数统计
    var switchOn = 1;                          //获取历史数据开关
    var beginTime = '';                         //获取历史数据起始时间
    var endTime = '';                          //获取历史数据截止时间                         
    //end 变量定义

    //数据库statement
    var scheduleStatement = OBJ('DbMgr').getStatement(Schema.Schedule());
    var realInfoStatement = OBJ('DbMgr').getStatement(Schema.RealInfo());
    //end 数据库statement

    var mapDeleteSchedule = new Map();         //开始赛事
    var mapEndSchedule = new Map();            //结束赛事 
    var mapScheduleScore = new Map();          //赛事比分
    var mapBetNum = new Map();                 //可投注赛事,更新赛事的支持率
    var mapModifyFields = new Map();           //本地维护的字段 hot_flag,display_flag,input_flag,odds_jingcai_admin,odds_rangqiu_admin,避免后台人员误操作多次改动
    var updateScheduleList = [];               //赛事信息更新
    var phaseScheduleIdArr = [];               //本期号赛事id  

    var deleteScheduleFlag = 0;                //有赛事开始标识
    var endScheduleFlag = 0;                   //比赛结束标识
    var updateScheduleFlag = 0;                //比赛信息更新标识

    var startSvrflag = 1;                      //是否重启服务标识
    var incrementalFlag = 0;                   //增量推送的标识  
    var endPhaseFlag = 0;                      //本期号所有赛事比赛结束
    var hasHistoryFlag = 0;                    //RealInfo是否有maxPhase字段

    //mongodb find 输出字段列表
    var scehduleSelect = {
        "_id": 0, "id": 1, "weekday": 1, "official_num": 1, "phase": 1, "match_date": 1,
        "status": 1, "first_half": 1, "final_score": 1, "match_name": 1, "home_team": 1,
        "away_team": 1, "odds_jingcai": 1, "handicap": 1, "odds_rangqiu": 1,"odds_avg": 1,
        "display_flag": 1, "hot_flag": 1, "lottery_status": 1, "bet_num": 1, "bet_num1": 1
    };

    //初始化
    init();

    /*
        @func 数据拉取路口
    */
    this.dataToPull = function () {
        endPhaseFlag = 0;
        phaseScheduleIdArr = [];
        //获取期号
        var phase = Func.getDate(phaseday);
        //获取历史数据完成
        if (0 == switchOn && (phase - endTime > 0)) {
            console.log('-----Pull history of data is finished!-----');
            switchOn = 1;
            console.log('-----Start pull online of data .....------');
        }
        else {
            console.log('期号:' + phase);
            OBJ('HttpClientMgr').Get(pageUrl + phase, reqCallBack);
        }
    }

    /*
        @func 判断是否拉取历史数据
     */
    function getMaxPhase() {
        try {
            var filter = { "status_name": "maxPhase" };
            var select = { "_id": 0, "status_value": 1 };
            realInfoStatement.findOne(filter, select, function (error, docs) {
                if (error) {
                    OBJ('LogMgr').error(error);
                }
                if (null == docs) {
                    hasHistoryFlag = 0;
                } else {
                    hasHistoryFlag = 1;
                    var curTimeStamp = Func.getStamp(docs['status_value'].toString());
                    var before1day = curTimeStamp - 24 * 60 * 60 * 1000;
                    var before1Phase = parseInt(Func.getDate(before1day));
                    if (before1Phase > parseInt(config['beginTime'])) {
                        phaseday = before1day;
                        var today = parseInt(Func.getDate(Date.now()));
                        if (before1Phase == today) {
                            console.log('-----Start Pull online of data .....------');
                            switchOn = 1;
                        } else {
                            console.log('-----Start pull history of data .....------');
                        }
                    }
                }
            });
        } catch (err) {
            OBJ('LogMgr').error(err);
        }
    }

    /*
        @func 更新maxPhase值
    */
    function setMaxPhase(phase) {
        try {
            if (hasHistoryFlag) {
                var updateValue = {
                    'status_value': phase
                };
                realInfoStatement.update({ "status_name": "maxPhase" }, updateValue, function (error) {
                    if (error) {
                        OBJ('LogMgr').error(error);
                    }
                });
            } else {
                hasHistoryFlag = 1;
                var docRealInfo = OBJ('DbMgr').getModel(Schema.RealInfo());
                docRealInfo.status_name = "maxPhase";
                docRealInfo.status_value = phase;
                docRealInfo.save(function (error) {
                    if (error) {
                        OBJ('LogMgr').error(error);
                    }
                });
            }
        } catch (err) {
            OBJ('LogMgr').error(err);
        }
    }


    /*
        @func 初始化函数
    */
    function init() {
        switchOn = (switchOn = parseInt(config['switch'])) ? switchOn : 0;
        beginTime = config['beginTime'];
        endTime = parseInt(Func.getDate(Date.now() - 24 * 60 * 60 * 1000));
        phaseday = switchOn ? Date.now() : Func.getStamp(beginTime);
        freq = (freq = parseInt(config['pullInterval']) * 1000) ? freq : 6000;
        noDataTotal = (noDataTotal = parseInt(config['noDataTotal'])) ? noDataTotal : 3;
        pageUrl = 'http://api.caipiaokong.com/live/?name=jczq&format=json&uid=889953&token=007a12e40291b9b6d4a6516afcd79f58b059f2fc&phase=';
        getMaxPhase();

    }

    /*
        @func 数据拉取请求的回调函数
        @html 网页原生数据
    */
    function reqCallBack(html) {
        var result = dataStatus(html);
        setNextPhase(result);
        if (result != 0 && result != -1) {
            dataDeal(html);
        }
        if (incrementalFlag) {
            //有比赛开始推送游戏服,停止下注
            deleteCurData();
            //比赛结束
            //endScheduleState();
        }
    }

    /*
        @func      获取数据状态
        @data      数据
        @return    返回状态 0 空数据 1 本期号的比赛全部结束 2 继续轮询
    */
    function dataStatus(html) {
        //空数据
        if (html.indexOf('"code":"204","text":"空数据！"') > 0) {
            console.log('"code":"204","text":"空数据！"');
            return 0;
        }
        if (html == "[]") {                 //20170128
            console.log('html:' + html);
            return 0;
        }
        if (html.indexOf('{"id":"') > 0) {
            var finishNum = 0;                                                                          //用于判断phaseday是否可以跳出轮询
            try{
                var dataArr = JSON.parse(html);
            }catch(err){
                OBJ('LogMgr').error('err:'+err+'\nhtml:\n'+html);
                console.log('pull the data,but not json:'+html);
                return ;
            }
            var len = dataArr.length;
            var nowTime = Date.now();
            var totalCancle = 0;                                                                       //本期号赛事取消赛事总数                          
            for (var i = 0; i < len; i++) {
                var id = parseInt(dataArr[i]['id']);
                //判断该赛事是否为在线赛事
                var betNumValue =mapBetNum.get(id);
                phaseScheduleIdArr.push(id);
                if (switchOn) {                                                                           //在线数据                                                                 
                    if (dataArr[i]['status'] == 6 || dataArr[i]['status'] == 7) {                        //取消比赛 status=6 status =7
                        totalCancle++;
                        if (incrementalFlag && betNumValue != null) {
                            //取消比赛不能下注了
                            if (mapDeleteSchedule.get(id) == null) {
                                mapDeleteSchedule.set(id, 0);
                                deleteScheduleFlag = 1;
                            }
                            //取消的比赛按比赛结束来算,比分0:0
                            if (mapEndSchedule.get(id) == null) {
                                var final_score = "0:0";
                                mapEndSchedule.set(id, -1);
                                mapScheduleScore.set(id, final_score);
                                endScheduleFlag = 1;
                                //做结算
                                endScheduleState();
                            }
                        }
                        finishNum++;
                    } else if (dataArr[i]['status'] == '3' || dataArr[i]['status'] == '4'                //比赛结束 
                        || dataArr[i]['status'] == '5') {
                        finishNum++;
                        //mapEndSchedule mapScheduleScore 赋值
                        /*if (incrementalFlag && dataArr[i]['final_score'] != "") {
                            if (mapEndSchedule.get(id) == null) {
                                //用于比赛结束，数据正常的结算
                                mapEndSchedule.set(id, 0);
                                mapScheduleScore.set(id, dataArr[i]['final_score']);
                                endScheduleFlag = 1;
                            }
                        }
                        //end mapEndSchedule mapScheduleScore 赋值*/
                    }
                    //mapDeleteSchedule 赋值
                    if (incrementalFlag && betNumValue != null) {
                        if (Date.parse(dataArr[i]['match_date']) < Date.now()) {
                            if (mapDeleteSchedule.get(id) == null) {
                                mapDeleteSchedule.set(id, 0);
                                deleteScheduleFlag = 1;
                            }
                        }
                    }
                    //end mapDeleteSchedule 赋值
                }
            }
            var phase = Func.getDate(phaseday);
            //本期号比赛结束
            if (finishNum == len) {
                endPhaseFlag = 1;
                //一个期号的所有赛事都取消,不set
                if (len != totalCancle) {
                    setMaxPhase(phase);
                }
                return 1;
            } else if (0 == switchOn) {
                setMaxPhase(phase);
            }
            return 2;
        } else {
            //可能第三方数据有问题
            console.log('error data format not json  :' + html);
            return -1;
        }

    }

    /*  
        @func    设置next期号
        @status  上期号数据状态
    */
    function setNextPhase(status) {
        //第三方网页数据出问题,本期重新做请求
        if (-1 == status) {
            return;
        }
        if (switchOn) {
            totalNum++;
        }
        if (0 == status) {
            noDataNum++;
        } else {
            noDataNum = 0;
        }

        //获取下一期号时间戳
        if ((noDataNum == noDataTotal) && switchOn) {
            noDataNum = 0;
            //连续noDataNum期取到空数据,不再往下判断
            phaseday = phaseday - (totalNum - 1) * 24 * 60 * 60 * 1000;
            totalNum = 0;
            if (startSvrflag) {
                startSvrflag = 0;
                incrementalFlag = 1;
                //一批数据拉取完主动推送游戏服
                getCurData();
            }
        } else if (1 == status && switchOn) {
            noDataNum = 0;
            phaseday = phaseday + 24 * 60 * 60 * 1000;
        } else {
            phaseday = phaseday + 24 * 60 * 60 * 1000;
        }
    }

    /*
        @func 解析schedule数据
        
    */
    function scheduleDeal(data) {
        var scheduleDoc = OBJ('DbMgr').getModel(Schema.Schedule());

        //让球赔率
        scheduleDoc.odds_rangqiu_bet365 = data['odds_rangqiu_bet365'];
        scheduleDoc.odds_rangqiu_libo = data['odds_rangqiu_libo'];
        scheduleDoc.odds_rangqiu_wlxe = data['odds_rangqiu_wlxe'];
        scheduleDoc.odds_rangqiu = data['odds_rangqiu'];

        scheduleDoc.odds_rangqiu_admin = data['odds_rangqiu'];

        //亚盘赔率
        scheduleDoc.odds_yapan_weide = data['odds_yapan_weide'];
        scheduleDoc.odds_yapan_ysb = data['odds_yapan_ysb'];
        scheduleDoc.odds_yapan_hg = data['odds_yapan_hg'];
        scheduleDoc.odds_yapan_bet365 = data['odds_yapan_bet365'];
        scheduleDoc.odds_yapan = data['odds_yapan'];
        //欧赔赔率
        scheduleDoc.odds_12bet = data['odds_12bet']
        scheduleDoc.odds_coral = data['odds_coral'];
        scheduleDoc.odds_ysb = data['odds_ysb'];
        scheduleDoc.odds_hg = data['odds_hg'];
        scheduleDoc.odds_weide = data['odds_weide'];
        scheduleDoc.odds_bwin = data['odds_bwin'];
        scheduleDoc.odds_bet365 = data['odds_bet365'];
        scheduleDoc.odds_libo = data['odds_libo'];
        scheduleDoc.odds_aomen = data['odds_aomen'];
        scheduleDoc.odds_wlxe = data['odds_wlxe'];
        scheduleDoc.odds_avg = data['odds_avg'];
        scheduleDoc.odds_jingcai = data['odds_jingcai'];

        scheduleDoc.odds_jingcai_admin = data['odds_jingcai'];
        //赛事
        //判断lottery_status值
        if (data['status'] == 6 || data['status'] == 7 || data['status'] == 1) {
            scheduleDoc.lottery_status = 1;
        } else if (data['status'] == 3 || data['status'] == 4 || data['status'] == 5) {
            if (data['final_score'] != "") {
                scheduleDoc['lottery_status'] = 2;
            } else {
                scheduleDoc['lottery_status'] = 1;
            }
        } else if (data['status'] == 0) {
            scheduleDoc['lottery_status'] = 0;
        }

        scheduleDoc.score_dateline = new Date(parseInt(data['score_dateline']) * 1000);
        scheduleDoc.odds_dateline = new Date(parseInt(data['odds_dateline']) * 1000);
        scheduleDoc.weekday = data['weekday'];
        scheduleDoc.handicap = data['handicap'];
        scheduleDoc.ext = data['ext'];
        scheduleDoc.priority = data['priority'];
        scheduleDoc.fx_id = parseInt(data['fx_id']);
        scheduleDoc.status = parseInt(data['status']);
        scheduleDoc.final_score = data['final_score'];
        scheduleDoc.first_half = data['first_half'];
        scheduleDoc.away_team = data['away_team'];
        scheduleDoc.home_team = data['home_team'];
        scheduleDoc.match_date = Date.parse(data['match_date']);
        scheduleDoc.match_name = data['match_name'];
        scheduleDoc.time_endsale = Date.parse(data['time_endsale']);
        scheduleDoc.create_at = Date.parse(data['create_at']);
        scheduleDoc.official_num = data['official_num'];
        scheduleDoc.official_date = Date.parse(data['official_date']);
        //判断期号是否是对的
        var weekDay = Func.getWeekDay(data['phase']);
        if(weekDay == data['weekday']){
            scheduleDoc.phase = parseInt(data['phase']);
        }else{
            var timeStime = Func.getStamp(data['phase']);
            var before1day = timeStime - 1 * 24 * 60 * 60 * 1000;
            scheduleDoc.phase = parseInt(Func.getDate(before1day));
        }
        
        scheduleDoc.match_num = data['match_num'];
        scheduleDoc.id = parseInt(data['id']);

        //赔率为空的默认不显示
        if (data['odds_jingcai'] == null || data['odds_rangqiu'] == null || data['odds_avg'] == null) {
            scheduleDoc.display_flag = 0;
        }

        return scheduleDoc;

    }

    /*
        @func 批量插入数据回调函数
    */
    function onInsert(err, docs) {
        if (err) {
            // TODO: handle error
            OBJ('LogMgr').error(err);
        } else {
            console.info('%d docs were successfully stored.', docs['insertedCount']);
        }
    }


    /*
        @func schedule数据比较
        @data 抓取得数据
        @doc  本地数据
    */
    function scheduleComp(data, doc) {
        var time_endsale = Date.parse(data['time_endsale']);
        var match_date = Date.parse(data['match_date']);
        var status = parseInt(data['status']);
        var flag = 0;                                //判断是否要更新数据库
        var arr = {};
        var pushFlag = 0;                            //判断该赛事信息变化是否要推送
        var updateFlag = 0;                          //判断是否是在线赛事                       
        var curTime = Date.now();

        var docid = parseInt(data['id']);
        //是否为在线赛事
        var isOnline = mapBetNum.get(docid);
        //用于判断本地维护的数据是否有变
        var modifyFields = mapModifyFields.get(docid);
        if (0 == doc['status'] && match_date > curTime 
           && isOnline !=null && modifyFields !=null) {
            updateFlag = 1;
        }

        arr['sceheduleId'] = doc['id'];
        //判断期号是否是对的,有些赛事的id会重复
        arr['phase'] = doc['phase'];
        arr['matchName'] = data['match_name'];
        arr['endSale'] = data['match_date'].toLocaleString();
        arr['homeName'] = data['home_team'];
        arr['awayName'] = data['away_team'];
        arr['handicap'] = data['handicap'];
        arr['weekday'] = data['weekday'];
        //有些弱强队对战不一定有赔率
        if(doc['odds_jingcai'] != null){
            arr['oddsJingcai'] = doc['odds_jingcai'][0];
        }else{
            arr['oddsJingcai'] = null;
        }
        if(doc['odds_rangqiu'] != null){
            arr['oddsRangqiu'] = doc['odds_rangqiu'][0];
        }else{
            arr['oddsRangqiu']  = null;
        }
        arr['hotFlag'] = doc['hot_flag'];

        //判断lottery_status值是否更新
        if (data['status'] == 6 || data['status'] == 7 || data['status'] == 1) {           //6,7取消的比赛  1比赛进行中
            if (doc['lottery_status'] != 1) {
                doc['lottery_status'] = 1;
                flag = 1;
            }
        } else if (data['status'] == 3 || data['status'] == 4 || data['status'] == 5) {    //3,4,5 比赛结束
            if (data['final_score'] != "") {
                if (doc['lottery_status'] != 2) {
                    doc['lottery_status'] = 2;
                    flag = 1;
                }
            } else {
                if (doc['lottery_status'] != 1) {
                    doc['lottery_status'] = 1;
                    flag = 1;
                }
            }
        } else if (data['status'] == 0) {                                                  //0  比赛未开始
            if (doc['lottery_status'] != 0) {
                doc['lottery_status'] = 0;
                flag = 1;
            }
        }

        if (Date.parse(doc['time_endsale']) != time_endsale) {
            doc['time_endsale'] = new Date(time_endsale);
            flag = 1;
        }

        if (Date.parse(doc['match_date']) != match_date) {
            doc['match_date'] = new Date(match_date);
            arr['endSale'] = doc['match_date'].toLocaleString();
            flag = 1;
            if (updateFlag) {
                pushFlag = 1;
            }
        }
        if (doc['status'] != status) {
            doc['status'] = status;
            //docValue['status'] = status;
            //比分和状态同时录入
            if(status == 3 || status == 4 || status == 5){
                OBJ('LogMgr').info('status:'+status+'doc final_score:'+doc['final_score']+' data final_score:'+data['final_score']);
                if(doc['final_score'] == null && data['final_score'] != null){
                    if (mapEndSchedule.get(docid) == null) {
                        //用于比赛结束，数据正常的结算
                        mapEndSchedule.set(docid, 0);
                        mapScheduleScore.set(docid, data['final_score']);
                        endScheduleFlag = 1;
                        OBJ('LogMgr').info('settlement status scheduleId'+docid);	
                        endScheduleState();
                    }
                }
            }
            flag = 1;
        }
        if (doc['first_half'] != data['first_half'] 
            && data['first_half'] != null) {
            doc['first_half'] = data['first_half'];
            //docValue['first_half'] = data['first_half'];
            flag = 1;
        }
        if (doc['final_score'] != data['final_score']
            && data['final_score'] != null) {
            var temp = doc['final_score'];
            doc['final_score'] = data['final_score'];
            OBJ('LogMgr').info('doc final_score:'+temp+'data final_score:'+doc['final_score']);
            //比分和状态不同时录入
            if (mapEndSchedule.get(docid) == null) {
                //用于比赛结束，数据正常的结算
                mapEndSchedule.set(docid, 0);
                mapScheduleScore.set(docid, data['final_score']);
                endScheduleFlag = 1;
                OBJ('LogMgr').info('settlement final_score scheduleId'+docid);	
                endScheduleState();
            }
            flag = 1;
        }
        if (doc['handicap'] != data['handicap'] && data['handicap'] != null) {
            doc['handicap'] = data['handicap'];
            flag = 1;
            if (updateFlag) {
                pushFlag = 1;
            }
        }
        if (doc['weekday'] != data['weekday'] && data['weekday'] != null) {
            doc['weekday'] = data['weekday'];
            arr['weekday'] = data['weekday'];
            flag = 1;
            if (updateFlag) {
                pushFlag = 1;
            }
        }
        arr['officialNum'] = arr['weekday'] + doc['official_num'];

        //odds数据比较
        if ((doc['odds_jingcai'] != null && data['odds_jingcai'] != null
            && !Func.isObjectValueEqual(doc['odds_jingcai'][0], data['odds_jingcai']))
           || doc['odds_jingcai'] == null && data['odds_jingcai'] != null) {
            doc['odds_jingcai'] = data['odds_jingcai'];
            flag = 1;
            if (updateFlag && doc['input_flag'] == 0) {
                pushFlag = 1;
                arr['oddsJingcai'] = data['odds_jingcai'];
            }

        }

        if ((doc['odds_avg'] != null && data['odds_avg'] != null
            && !Func.isObjectValueEqual(doc['odds_avg'][0], data['odds_avg']))
            || doc['odds_avg'] == null && data['odds_avg'] !=null) {
            doc['odds_avg'] = data['odds_avg'];
            flag = 1;
        }

        //rangqiu数据比较
        if ((doc['odds_rangqiu'] != null && data['odds_rangqiu'] != null
            && !Func.isObjectValueEqual(doc['odds_rangqiu'][0], data['odds_rangqiu']))
            || doc['odds_rangqiu'] == null && data['odds_rangqiu'] != null) {
            doc['odds_rangqiu'] = data['odds_rangqiu'];
            flag = 1;
            if (updateFlag && doc['input_flag'] == 0) {
                pushFlag = 1;
                arr['oddsRangqiu'] = data['odds_rangqiu'];
            }
        }

        if (doc['input_flag'] == 0) {
            if ((doc['odds_rangqiu_admin'] != null && data['odds_rangqiu'] != null
                && !Func.isObjectValueEqual(doc['odds_rangqiu_admin'][0], data['odds_rangqiu']))
                || doc['odds_rangqiu_admin'] == null && data['odds_rangqiu'] != null) {
                doc['odds_rangqiu_admin'] = data['odds_rangqiu'];
                flag = 1;
            }
            if ((doc['odds_jingcai_admin'] != null && data['odds_jingcai'] != null
                && !Func.isObjectValueEqual(doc['odds_jingcai_admin'][0], data['odds_jingcai']))
               || doc['odds_jingcai_admin'] == null && data['odds_jingcai'] != null) {
                doc['odds_jingcai_admin'] = data['odds_jingcai'];
                flag = 1;
            }
        }

        if (pushFlag && doc['display_flag']) {
            updateScheduleFlag = 1;
            updateScheduleList.push(arr);
        }

        if (flag) {
            try{
                doc.save();
            }catch(err){
                OBJ('LogMgr').error(err);
            }
            
        }
    }

    /*
        @func 数据保存
        @data 抓取的数据
        @len  条数
    */
    function dataSave(data, len) {
        var schedule = [];
        var batchSize = 10;
        var size = 0;

        //有新的赛事增加推送游戏服
        if (incrementalFlag) {
            addCurData(data);
        }

        //保存到数据库
        for (var i = 1; i <= len; i++) {
            schedule.push(scheduleDeal(data[i - 1]));
            if (0 == i % batchSize) {
                //写数据库
                if (schedule.length != 0)
                    dataInsert(schedule);
                schedule = [];
            }
        }
        if (schedule.length != 0) {
            //写数据库
            if (schedule.length != 0)
                dataInsert(schedule);
        }
    }

    /*
        @func  schedule的insert操作
    */
    function dataInsert(schedule){
        try{
            scheduleStatement.collection.insert(schedule, onInsert);
        }catch(err){
            OBJ('LogMgr').error(err);
        }
    }


    /*
        @func            数据更新
        @data            抓取的数据
        @scheduledocs    本地数据
    */
    function dataUpdate(data, scheduledocs) {

        if (data.length != scheduledocs.length) {
            console.log('func dataUpdate length illegal');
            return;
        }
        var len = data.length;
        var Id = 0;
        for (var i = 0; i < len; i++) {
            Id = parseInt(data[i]['id']);
            //schedule判断
            for (var j = 0; j < scheduledocs.length; j++) {
                if (scheduledocs[j]['_doc']['id'] != data[i]['id']) {
                    continue;
                } else {
                    scheduleComp(data[i], scheduledocs[j]);
                    //var schedocValue = scheduleComp(data[i], scheduledocs[j]['_doc']);
                    //if (schedocValue != null) {
                    //    console.log('func dataDeal dataUpdate id =' + data[i]['id']);
                    //    updateTodb(schedocValue);
                    //}
                    break;
                }
            }
        }
        //赛事信息有更新推送游戏服
        if (incrementalFlag) {
            updateCurData();
        }
    }

    /*
        @func              数据保存+更新
        @dataArr           抓取数据
        @scheduledocs      本地数据
        @len               条数
    */
    function dataSaveAndUpdate(dataArr, scheduledocs, len) {
        var saveDate = [];
        var updataData = [];
        var length = 0;

        for (var j = 0; j < len; j++) {
            var hasFlag = 1;
            for (var i = 0; i < scheduledocs.length; i++) {
                if (scheduledocs[i]['_doc']['id'] == parseInt(dataArr[j]['id'])) {
                    updataData.push(dataArr[j]);
                    hasFlag = 0;
                    break;
                }
            }
            if (hasFlag) {
                length++;
                saveDate.push(dataArr[j]);
            }

        }
        //数据保存
        if (length > 0) {
            dataSave(saveDate, length);
        }

        //更新数据
        if (updataData.length > 0) {
            dataUpdate(updataData, scheduledocs);
        }
    }


    /*
        @func 数据处理
        @html 抓取的原生数据
    */
    function dataDeal(html) {
        var dataArr = JSON.parse(html);
        var len = dataArr.length;
        var Id = [];
        for (var i = 0; i < len; i++) {
            Id.push(parseInt(dataArr[i]['id']));
        }
        //TODO schedule查询数据
        try {
            scheduleStatement.find({}, function (err, scheduledocs) {
                if (!err) {
                    if (0 == scheduledocs.length) {
                        console.log('func dataDeal dataSave');
                        dataSave(dataArr, len);
                    }
                    else if (len == scheduledocs.length) {
                        console.log('func dataDeal dataUpdate');
                        dataUpdate(dataArr, scheduledocs);
                    } else {
                        console.log('func dataDeal dataSaveAndUpdate');
                        dataSaveAndUpdate(dataArr, scheduledocs, len);
                    }
                } else {
                    OBJ('LogMgr').error(err);
                }
            }).where('id').in(Id);
        } catch (error) {
            OBJ('LogMgr').error(error);
        }
    }

    /*
        @func 获取当前未开始赛事列表
    */
    function getCurScheduleList(func, source = null) {
        var filter = { "match_date": { "$gt": Date.now() }, "display_flag": 1, "status": 0 };
        try {
            scheduleStatement.find(filter, scehduleSelect,
                { sort: { 'match_num': 1 } }, function (error, docs) {
                    if (error) {
                        OBJ('LogMgr').error(error);
                        return;
                    } else if (0 == docs.length) {
                        return;
                    }
                    var list = [];
                    for (var i = 0; i < docs.length; i++) {
                        var arr = {};
                        arr['sceheduleId'] = docs[i]['id'];
                        arr['phase'] = docs[i]['phase'];
                        arr['matchName'] = docs[i]['match_name'];
                        arr['weekday'] = docs[i]['weekday'];
                        arr['officialNum'] = docs[i]['weekday'] + docs[i]['official_num'];
                        arr['endSale'] = docs[i]['match_date'].toLocaleString();
                        arr['homeName'] = docs[i]['home_team'];
                        arr['awayName'] = docs[i]['away_team'];
                        arr['handicap'] = docs[i]['handicap'];
                        if (docs[i]['input_flag']) {
                            arr['oddsJingcai'] = docs[i]['odds_jingcai_admin'];
                            arr['oddsRangqiu'] = docs[i]['odds_rangqiu_admin'];
                        } else {
                            //赔率为空赛事不开
                            if (docs[i]['odds_jingcai'] == null || 
                               docs[i]['odds_rangqiu'] == null ||
                               docs[i]['odds_avg'] == null) {
                                continue;
                            }
                            arr['oddsJingcai'] = docs[i]['odds_jingcai'];
                            arr['oddsRangqiu'] = docs[i]['odds_rangqiu'];
                        }
                        arr['hotFlag'] = docs[i]['hot_flag'];
                        list.push(arr);

                        if (startSvrflag == 0) {
                            //赋值 mapBetNum mapModifyFields
                            var docValue = { bet_num: { h: 0, d: 0, a: 0 }, bet_num1: { h: 0, d: 0, a: 0 } };
                            docValue.bet_num.h = docs[i]['bet_num'][0]['h'];
                            docValue.bet_num.d = docs[i]['bet_num'][0]['d'];
                            docValue.bet_num.a = docs[i]['bet_num'][0]['a'];
                            docValue.bet_num1.h = docs[i]['bet_num1'][0]['h'];
                            docValue.bet_num1.d = docs[i]['bet_num1'][0]['d'];
                            docValue.bet_num1.a = docs[i]['bet_num1'][0]['a'];
                            mapBetNum.set(docs[i]['id'], docValue);

                            var modifyFields = {"hot_flag":arr['hotFlag'],"display_flag":1,
                                                "input_flag":docs[i]['input_flag'],
                                                "odds_jingcai_admin":arr['oddsJingcai'],
                                                "odds_rangqiu_admin":arr['oddsRangqiu'] 
                                               };
                            mapModifyFields.set(docs[i]['id'],modifyFields);
                            //end 赋值 mapBetNum mapModifyFields
                        }
                    }
                    if (list.length > 0) {
                        //获取赛事的投注人数
                        var betNumList = [];
                        for (var key of mapBetNum.keys()) {
                            var docValue = { id: 0, num: { bet_num: { h: 0, d: 0, a: 0 }, bet_num1: { h: 0, d: 0, a: 0 } } };
                            docValue.id = key;
                            docValue.num = mapBetNum.get(key);
                            betNumList.push(docValue);
                        }
                        //end 获取赛事的投注人数
                        if (source != null) {
                            func(list, betNumList, source);
                        } else {
                            func(list, betNumList);
                        }
                    }
                });
        } catch (err) {
            OBJ('LogMgr').error(err);
        }
    }

    /*
        @func  广播当前赛事列表
    */
    function broadcastCurData(list, betNumList) {
        OBJ('RpcModule').broadcastGameServer('RealFootball', 'resCurData', {
            map: list,
            betRate: betNumList
        });
    }

    /*
        @func  发送当前赛事列表
    */
    function sendCurData(list, betNumList, source) {
        OBJ('RpcModule').send(source, 'RealFootball', 'resCurData', {
            map: list,
            betRate: betNumList
        });
    }


    /*
        @func 获取所有比赛的赛事列表
    */
    function getCurData() {
        getCurScheduleList(broadcastCurData);
    }

        /*
        @func 有新的比赛赛事
    */
    function addCurData(data) {
        var list = [];
        var betNumList = [];
        for (var i = 0; i < data.length; i++) {
            var arr = {};
            //比赛未开始的才做推送,并且赔率正常的
            if(0 != data[i]['status'] || data[i]['odds_jingcai'] == null || 
                data[i]['odds_rangqiu'] == null ||data[i]['odds_avg'] == null){ 
                continue;
            }
            arr['sceheduleId'] = parseInt(data[i]['id']);
            var isNull = mapBetNum.get(arr['sceheduleId']);
            if(isNull != null){
                continue;
            }
            arr['phase'] = data[i]['phase'];
            arr['matchName'] = data[i]['match_name'];
            arr['weekday'] = data[i]['weekday'];
            arr['officialNum'] = data[i]['weekday'] + data[i]['official_num'];
            arr['endSale'] = data[i]['match_date'].toLocaleString();
            arr['homeName'] = data[i]['home_team'];
            arr['awayName'] = data[i]['away_team'];
            arr['handicap'] = data[i]['handicap'];
            arr['hotFlag'] = 0;
          
            arr['oddsJingcai'] = data[i]['odds_jingcai'];
            arr['oddsRangqiu'] = data[i]['odds_rangqiu'];

            list.push(arr);

            var betValue = { id: 0, num: { bet_num: { h: 0, d: 0, a: 0 }, bet_num1: { h: 0, d: 0, a: 0 } } };
            betValue.id = arr['sceheduleId'];
            betNumList.push(betValue);
            //赋值 mapBetNum
            var docValue = { bet_num: { h: 0, d: 0, a: 0 }, bet_num1: { h: 0, d: 0, a: 0 } };
            mapBetNum.set(arr['sceheduleId'], docValue);

            var modifyFields = {"hot_flag":arr['hotFlag'],"display_flag":1,
                                "input_flag":0,
                                "odds_jingcai_admin":data[i]['odds_jingcai'],
                                "odds_rangqiu_admin":data[i]['odds_rangqiu']
                                };
            mapModifyFields.set(arr['sceheduleId'],modifyFields);
            //end 赋值 mapBetNum
        }
        OBJ('RpcModule').broadcastGameServer('RealFootball', 'resAddData', {
            map: list,
            betRate: betNumList
        });
    }

    /*
        @func 比赛开始删除相应的赛事信息
    */
    function deleteCurData() {
        if (1 == deleteScheduleFlag) {
            deleteScheduleFlag = 0;
            var idArr = [];
            for (var key of mapDeleteSchedule.keys()) {
                var item = mapDeleteSchedule.get(key);
                idArr.push(key);
            }



            if (idArr.length > 0) {
                OBJ('RpcModule').broadcastGameServer('RealFootball', 'refreshStopBetSchedule', {
                    id: idArr
                });
            }
            //更新赛事的支持人数
            for (var i = 0; i < idArr.length; i++) {
                var item = mapBetNum.get(idArr[i]);
                if (item == null) {
                    console.log(' mapBetNum get is null ...');
                    return;
                }
                updateBetNum(idArr[i],item,1);
            }
        }
    }

    /*
        @func 比赛开始，更新赛事投注人数
        @scheduleId 开始的赛事
        @item   各区域投注人数信息
    */
    function updateBetNum(scheduleId,item,finished = 0){
        try{
            var updateValue = {
                'bet_num': item.bet_num,
                'bet_num1': item.bet_num1
            };
            scheduleStatement.update({ id: scheduleId}, updateValue, function (err) {
                if (err) {
                    OBJ('LogMgr').error(err);
                }
                if(finished){
                    //删除mapBetNum  mapDeleteSchedule mapModifyFields
                    console.log('delete map BetNum DeleteSchedule ModifyFields');
                    if(mapBetNum.get(scheduleId) != null){
                        mapBetNum.delete(scheduleId);
                    }
                    if(mapDeleteSchedule.get(scheduleId) != null){
                        mapDeleteSchedule.delete(scheduleId);
                    }
                    if(mapModifyFields.get(scheduleId) != null){
                        mapModifyFields.delete(scheduleId);
                    }
                    //end 删除mapBetNum mapDeleteSchedule mapModifyFields
                }
            });
        }catch(err){
            OBJ('LogMgr').error(err);
        }
    }

    /*
        @func 比赛结束,推送游戏服结算(含正常比分和取消比赛的)
    */
    function endScheduleState() {
        if (1 == endScheduleFlag) {
            endScheduleFlag = 0;
            var idArr = [];
            var scoreArr = [];
            var raceStatus = [];
            for (var key of mapEndSchedule.keys()) {
                var item = mapEndSchedule.get(key);
                var itemScore = mapScheduleScore.get(key);
                if (1 != item && itemScore) {
                    mapEndSchedule.set(key, 1);
                    idArr.push(key);
                    scoreArr.push(itemScore);
                    if (0 == item) {
                        raceStatus.push(0);    //正常比分
                    } else if (-1 == item) {
                        raceStatus.push(1);    //取消比赛
                    }
                }
            }

            //本期号赛事全部结束
            if (endPhaseFlag) {
                //删除map的 值
                for (var i = 0; i < phaseScheduleIdArr.length; i++) {
                    if (1 == mapEndSchedule.get(phaseScheduleIdArr[i])) {
                        mapEndSchedule.delete(phaseScheduleIdArr[i]);
                        mapScheduleScore.delete(phaseScheduleIdArr[i]);
                    }
                }
                //end 删除map
            }
            //广播给游戏服
            if (idArr.length > 0) {
                OBJ('RpcModule').broadcastGameServer('RealFootball', 'refreshScheduleState', {
                    id: idArr,
                    score: scoreArr,
                    raceStatus: raceStatus
                });
            }
        }
    }

    /*
        @func 更新赛事信息有变更的
    */
    function updateCurData() {
        if (1 == updateScheduleFlag) {
            updateScheduleFlag = 0;
            OBJ('RpcModule').broadcastGameServer('RealFootball', 'refreshSchedule', {
                map: updateScheduleList
            });
        }
        updateScheduleList = [];
    }

    //游戏服重新重启请求赛事信息
    this.reGetCurData = function (source) {
        //一批数据未拉取完,直接return,拉取完数据中心会做推送
        if (1 == startSvrflag) {
            return;
        }
        getCurScheduleList(sendCurData, source);
    }

    /*
        @func 更新赛事的支持率
     */
    this.updateSupportRate = function (data) {
        var serverId = data.serverId;
        var betRateArr = data.pushBetRate;

        //更新赛事的支持人数
        for (var i = 0; i < betRateArr.length; i++) {
            var item = mapBetNum.get(betRateArr[i].id);
            if (item == null) {
                console.log('updateSupportRate mapBetNum get is null...');
                return;
            }

            //更新 mapBetNum
            var docValue = { bet_num: { h: 0, d: 0, a: 0 }, bet_num1: { h: 0, d: 0, a: 0 } };
            docValue.bet_num = betRateArr[i].bet_num;
            docValue.bet_num1 = betRateArr[i].bet_num1;

            mapBetNum.set(betRateArr[i].id, docValue);
            //end 更新 mapBetNum

            updateBetNum(betRateArr[i].id,docValue);
        }
    }

    /*
        @func 后台更新为显示
    */
    this.refreshDisplay = function (data){
        var betNumList = [];
        var list = [];
        for(var i = 0;i< data.list.length;i++){
            var arr = {};
            arr['sceheduleId'] = data.list[i]['sceheduleId'];
            var isNullbet = mapBetNum.get(arr['sceheduleId']);
            var isNullFields = mapModifyFields.get(arr['sceheduleId']);
            if(isNullbet !=  null || isNullFields != null){
                continue;
            }
            arr['phase'] = data.list[i]['phase'];
            arr['matchName'] = data.list[i]['matchName'];
            arr['weekday'] = data.list[i]['weekday'];
            arr['officialNum'] = data.list[i]['officialNum'];
            arr['endSale'] = data.list[i]['endSale'];
            arr['homeName'] = data.list[i]['homeName'];
            arr['awayName'] = data.list[i]['awayName'];
            arr['handicap'] = data.list[i]['handicap'];
            arr['oddsJingcai'] = data.list[i]['oddsJingcai'];
            arr['oddsRangqiu'] = data.list[i]['oddsRangqiu'];
            arr['hotFlag'] = data.list[i]['hotFlag'];

            var betInfo = { id: 0, num: { bet_num: { h: 0, d: 0, a: 0 }, bet_num1: { h: 0, d: 0, a: 0 } } };
            var tempBetNumValue = { bet_num: { h: 0, d: 0, a: 0 }, bet_num1: { h: 0, d: 0, a: 0 } };
            betInfo.id = arr['sceheduleId'];
            tempBetNumValue.bet_num = data.list[i]['bet_info'].bet_num;
            tempBetNumValue.bet_num1 = data.list[i]['bet_info'].bet_num1;
            betInfo.num.bet_num = tempBetNumValue.bet_num;
            betInfo.num.bet_num1 = tempBetNumValue.bet_num1;
            betNumList.push(betInfo);
            list.push(arr);
            mapBetNum.set(betInfo.id, tempBetNumValue);
    
            var modifyInfo = {"hot_flag":arr['hotFlag'],"display_flag":1,
                                "input_flag":data.list[i]['intputFlag'],
                                "odds_jingcai_admin":arr['oddsJingcai'],
                                "odds_rangqiu_admin":arr['oddsRangqiu']
            };
            mapModifyFields.set(betInfo.id,modifyInfo);
        }

        //广播给游戏服
        OBJ('RpcModule').broadcastGameServer('RealFootball', 'resAddData', {
            map: list,
            betRate: betNumList
        });
    }

    /*
        @func 后台更新为不显示
    */
    this.refreshNotDisplay = function (data){
        var idArr = [];
        for(var i =0;i< data.list.length;i++){
            var isNullBet = mapBetNum.get(data.list[i]);
            var isNull = mapModifyFields.get(data.list[i]);
            if(isNullBet == null || isNull == null){
                continue;
            }
            idArr.push(data.list[i]);
        }

        if (idArr.length > 0) {
            OBJ('RpcModule').broadcastGameServer('RealFootball', 'refreshStopBetSchedule', {
                id: idArr
            });
        }
        //更新赛事的支持人数
        for (var i = 0; i < idArr.length; i++) {
            var item = mapBetNum.get(idArr[i]);
            if (item == null) {
                console.log('refreshNotDisplay mapBetNum get is null ...');
                return;
            }
            updateBetNum(idArr[i],item,1);
        }
    }
}