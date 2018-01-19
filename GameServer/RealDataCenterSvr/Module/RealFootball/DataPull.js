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
    var logRealBetStatement = OBJ('DbMgr').getStatement(Schema.LogRealBet());
    var realInfoStatement = OBJ('DbMgr').getStatement(Schema.RealInfo());
    //end 数据库statement

    var mapDeleteSchedule = new Map();         //开始赛事
    var mapEndSchedule = new Map();            //结束赛事 
    var mapScheduleScore = new Map();          //赛事比分
    var updateScheduleList = [];               //赛事信息更新
    var phaseScheduleIdArr = [];               //本期号赛事id  

    var deleteScheduleFlag = 0;                //有赛事开始标识
    var endScheduleFlag = 0;                   //比赛结束标识
    var updateScheduleFlag = 0;                //比赛信息更新标识

    var startSvrflag = 1;                      //是否重启服务标识
    var incrementalFlag = 0;                   //增量推送的标识  
    var endPhaseFlag = 0;                      //本期号所有赛事比赛结束
    var hasHistoryFlag = 0;                    // RealInfo是否有maxPhase字段

    //mongodb find 输出字段列表
    var scehduleSelect = {
        "_id": 0, "id": 1, "weekday": 1, "official_num": 1, "phase": 1, "match_date": 1,
        "status": 1, "first_half": 1, "final_score": 1, "match_name": 1, "home_team": 1,
        "away_team": 1, "odds_jingcai": 1, "handicap": 1, "odds_rangqiu": 1,
        "display_flag": 1, "hot_flag": 1, "lottery_status": 1
    };

    //初始化
    init();

    /*
        @func 数据拉取路口
    */
    this.dataToPull = function () {
        endPhaseFlag = 0;
        phaseScheduleIdArridArr = [];
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
    function getMaxPhase(){
        try{ 
            var filter = {"status_name":"maxPhase"};
            var select = {"_id": 0, "status_value": 1};
            realInfoStatement.findOne(filter,select,function(error,docs){
                if(error){
                    OBJ('LogMgr').error(error);
                }
                if(null == docs){
                    hasHistoryFlag = 0;
                }else{
                    hasHistoryFlag = 1;
                    var curTimeStamp = Func.getStamp(docs['status_value'].toString());
                    var before1day = curTimeStamp - 24 * 60 *60 *1000;
                    var before1Phase = parseInt(Func.getDate(before1day));
                    if(before1Phase > parseInt(config['beginTime'])){
                        phaseday = before1day;
                        var today = parseInt(Func.getDate(Date.now()));
                        if(before1Phase ==  today){
                            console.log('-----Start Pull online of data .....------');
                            switchOn = 1;
                        }else{
                            console.log('-----Start pull history of data .....------');
                        }
                    }
                }
            });
        }catch(err){
            OBJ('LogMgr').error(err);
        }
    }

    /*
        @func 更新maxPhase值
    */
    function setMaxPhase(phase){
        try{
            if(hasHistoryFlag){
                var updateValue = {
                    'status_value':phase
                };
                realInfoStatement.update({ "status_name":"maxPhase"}, updateValue, function(error){
                    if(error){
                            OBJ('LogMgr').error(err);
                    }
                });
            }else{
                hasHistoryFlag = 1;
                var docRealInfo = OBJ('DbMgr').getModel(Schema.RealInfo());
                docRealInfo.status_name = "maxPhase";
                docRealInfo.status_value = phase;
                docRealInfo.save(function(error){
                    if(error){
                        OBJ('LogMgr').error(error);
                    }
                });
            }
        }catch(err){
            OBJ('LogMgr').error(err);
        }
    }


    /*
        @func 初始化函数
    */
    function init(){
        switchOn = (switchOn = parseInt(config['switch'])) ? switchOn : 0;
        beginTime = config['beginTime'];
        endTime = parseInt(Func.getDate(Date.now() -24*60*60*1000));
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
            endScheduleState();
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
            var dataArr = JSON.parse(html);
            var len = dataArr.length;
            var nowTime = Date.now();
            for (var i = 0; i < len; i++) {
                var id = parseInt(dataArr[i]['id']);
                phaseScheduleIdArr.push(id);
                if(switchOn){                                                                           //在线数据                                                                 
                    if(dataArr[i]['status'] == 6 || dataArr[i]['status'] == 7) {                        //取消比赛 status=6 status =7
                        if (incrementalFlag){
                            //取消比赛不能下注了
                            if (mapDeleteSchedule.get(id) == null) {
                                mapDeleteSchedule.set(parseInt(dataArr[i]['id']), 0);
                                deleteScheduleFlag = 1;
                            }
                            //取消的比赛按比赛结束来算,比分0:0
                            if(mapEndSchedule.get(id) == null){
                                var final_score = "0:0";
                                mapEndSchedule.set(parseInt(dataArr[i]['id']), -1);
                                mapScheduleScore.set(parseInt(dataArr[i]['id']), final_score);
                                endScheduleFlag = 1;
                            }
                        }
                        finishNum++;
                    }else if (dataArr[i]['status'] == '3' || dataArr[i]['status'] == '4'                //比赛结束 
                        || dataArr[i]['status'] == '5') {
                        finishNum++;
                        //mapEndSchedule mapScheduleScore 赋值
                        if (incrementalFlag && dataArr[i]['final_score'] != "") {
                            if (mapEndSchedule.get(id) == null) {
                                //用于比赛结束，数据正常的结算
                                mapEndSchedule.set(parseInt(dataArr[i]['id']), 0);
                                mapScheduleScore.set(parseInt(dataArr[i]['id']), dataArr[i]['final_score']);
                                endScheduleFlag = 1;
                            }
                        }
                        //end mapEndSchedule mapScheduleScore 赋值
                    }
                    //mapDeleteSchedule 赋值
                    if(incrementalFlag) {
                        if (Date.parse(dataArr[i]['match_date']) > Date.now()) {
                            if (mapDeleteSchedule.get(id) == null) {
                                mapDeleteSchedule.set(parseInt(dataArr[i]['id']), 0);
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
                setMaxPhase(phase);
                return 1;
            }else if(0 == switchOn){
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
        if(switchOn){
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
        scheduleDoc.phase = parseInt(data['phase']);
        scheduleDoc.match_num = data['match_num'];
        scheduleDoc.id = parseInt(data['id']);
        
        //赔率为空的默认不显示
        if(data['odds_jingcai'] == null || data['odds_rangqiu'] == null || data['odds_avg'] == null){
            scheduleDoc.display_flag = 0;
        }

        //scheduleDoc.official_date = moment.utc(data['official_date']).format();
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
        var docValue = {};
        var time_endsale = Date.parse(data['time_endsale']);
        var match_date = Date.parse(data['match_date']);
        var status = parseInt(data['status']);
        var flag = 0;
        var arr = [];
        var pushFlag = 0;
        var updateFlag = 0;
        var curTime = Date.now();

        docValue['id'] = parseInt(data['id']);
        if (0 == doc['status'] && match_date < curTime) {
            updateFlag = 1;
        }
        //判断lottery_status值
        if (data['status'] == 6 || data['status'] == 7 || data['status'] == 1) {
            if (doc['lottery_status'] != 1) {
                docValue['lottery_status'] = 1;
                flag = 1;
            }
        } else if (data['status'] == 3 || data['status'] == 4 || data['status'] == 5) {
            if (data['final_score'] != "") {
                if (doc['lottery_status'] != 2) {
                    docValue['lottery_status'] = 2;
                    flag = 1;
                }
            } else {
                if (doc['lottery_status'] != 1) {
                    docValue['lottery_status'] = 1;
                    flag = 1;
                }
            }
        } else if (data['status'] == 0) {
            if (doc['lottery_status'] != 0) {
                docValue['lottery_status'] = 0;
                flag = 1;
            }
        }

        //不显示默认为比赛结束去推送
        if (0 == doc['display_flag'] && (match_date < curTime)) {
            if (incrementalFlag) {
                if (mapDeleteSchedule.get(docValue['id']) == null) {
                    mapDeleteSchedule.set(parseInt(docValue['id']), 0);
                    deleteScheduleFlag = 1;
                }
            }
        }
        if (Date.parse(doc['time_endsale']) != time_endsale) {
            docValue['time_endsale'] = new Date(time_endsale);
            flag = 1;
        }
        arr['sceheduleId'] = data['id'];
        arr['phase'] = data['phase'];
        arr['matchName'] = data['match_name'];
        if (Date.parse(doc['match_date']) != match_date) {
            docValue['match_date'] = new Date(match_date);
            flag = 1;
            if (updateFlag) {
                pushFlag = 1;
            }
        }
        arr['endSale'] = data['match_date'].toLocaleString();
        arr['homeName'] = data['home_team'];
        arr['awayName'] = data['away_team'];

        if (doc['first_half'] != data['first_half']) {
            docValue['first_half'] = data['first_half'];
            flag = 1;
        }
        if (doc['final_score'] != data['final_score']) {
            docValue['final_score'] = data['final_score'];
            flag = 1;
        }
        if (doc['status'] != status) {
            docValue['status'] = status;
            flag = 1;
        }
        if (doc['handicap'] != data['handicap']) {
            docValue['handicap'] = data['handicap'];
            flag = 1;
            if (updateFlag) {
                pushFlag = 1;
            }
        }
        arr['handicap'] = data['handicap'];
        if (doc['weekday'] != data['weekday']) {
            docValue['weekday'] = data['weekday'];
            flag = 1;
            if (updateFlag) {
                pushFlag = 1;
            }
        }
        arr['weekday'] = data['weekday'];

        //odds数据比较
        if (doc['odds_jingcai'] != null && !Func.isObjectValueEqual(doc['odds_jingcai'][0], data['odds_jingcai'])) {
            docValue['odds_jingcai'] = data['odds_jingcai'];
            flag = 1;
            if (updateFlag && doc['input_flag'] == 0) {
                pushFlag = 1;
            }

        }
        arr['input_flag'] = doc['input_flag'];
        arr['type'] = 0;
        arr['oddsJingcai'] = data['odds_jingcai'];
        if (doc['odds_avg'] != null && !Func.isObjectValueEqual(doc['odds_avg'][0], data['odds_avg'])) {
            docValue['odds_avg'] = data['odds_avg'];
            flag = 1;
            if (updateFlag) {
                pushFlag = 1;
            }
        }
        /*{
            if(doc['odds_wlxe'] != null && !Func.isObjectValueEqual(doc['odds_wlxe'][0],data['odds_wlxe'])){
                docValue['odds_wlxe'] = data['odds_wlxe'];
                flag = 1;
            }
            if(doc['odds_aomen'] != null && !Func.isObjectValueEqual(doc['odds_aomen'][0],data['odds_aomen'])){
                docValue['odds_aomen'] = data['odds_aomen'];
                flag = 1;
            }
            if(doc['odds_libo'] != null && !Func.isObjectValueEqual(doc['odds_libo'][0],data['odds_libo'])){
                docValue['odds_libo'] = data['odds_libo'];
                flag = 1;
            }
            if(doc['odds_bet365'] != null && !Func.isObjectValueEqual(doc['odds_bet365'][0],data['odds_bet365'])){
                docValue['odds_bet365'] = data['odds_bet365'];
                flag = 1;
            }
            if(doc['odds_bwin'] != null && !Func.isObjectValueEqual(doc['odds_bwin'][0],data['odds_bwin'])){
                docValue['odds_bwin'] = data['odds_bwin'];
                flag = 1;
            }
            if(doc['odds_weide'] != null && !Func.isObjectValueEqual(doc['odds_weide'][0],data['odds_weide'])){
                docValue['odds_weide'] = data['odds_weide'];
                flag = 1;
            }
            if(doc['odds_hg'] != null && !Func.isObjectValueEqual(doc['odds_hg'][0],data['odds_hg'])){
                docValue['odds_hg'] = data['odds_hg'];
                flag = 1;
            }
            if(doc['odds_ysb'] != null && !Func.isObjectValueEqual(doc['odds_ysb'][0],data['odds_ysb'])){
                docValue['odds_ysb'] = data['odds_ysb'];
                flag = 1;
            }

            //yapan数据比较
            if(doc['odds_yapan'] != null && !Func.isObjectValueEqual(doc['odds_yapan'][0],data['odds_yapan'])){
                docValue['odds_yapan'] = data['odds_yapan'];
                flag = 1;
            }
            if(doc['odds_yapan_bet365'] != null && !Func.isObjectValueEqual(doc['odds_yapan_bet365'][0],data['odds_yapan_bet365'])){
                docValue['odds_yapan_bet365'] = data['odds_yapan_bet365'];
                flag = 1;
            }
            if(doc['odds_yapan_hg'] != null && !Func.isObjectValueEqual(doc['odds_yapan_hg'][0],data['odds_yapan_hg'])){
                docValue['odds_yapan_hg'] = data['odds_yapan_hg'];
                flag = 1;
            }
            if(doc['odds_yapan_ysb'] != null && !Func.isObjectValueEqual(doc['odds_yapan_ysb'][0],data['odds_yapan_ysb'])){
                docValue['odds_yapan_ysb'] = data['odds_yapan_ysb'];
                flag = 1;
            }
            if(doc['odds_yapan_weide'] != null && !Func.isObjectValueEqual(doc['odds_yapan_weide'][0],data['odds_yapan_weide'])){
                docValue['odds_yapan_weide'] = data['odds_yapan_weide'];
                flag = 1;
            }
            if(doc['odds_rangqiu_wlxe'] != null && !Func.isObjectValueEqual(doc['odds_rangqiu_wlxe'][0],data['odds_rangqiu_wlxe'])){
                docValue['odds_rangqiu_wlxe'] = data['odds_rangqiu_wlxe'];
                flag = 1;
            }
            if(doc['odds_rangqiu_libo'] != null && !Func.isObjectValueEqual(doc['odds_rangqiu_libo'][0],data['odds_rangqiu_libo'])){
                docValue['odds_rangqiu_libo'] = data['odds_rangqiu_libo'];
                flag = 1;
            }
            if(doc['odds_rangqiu_bet365'] != null && !Func.isObjectValueEqual(doc['odds_rangqiu_bet365'][0],data['odds_rangqiu_bet365'])){
                docValue['odds_rangqiu_bet365'] = data['odds_rangqiu_bet365'];
                flag = 1;
            }
        }*/

        //rangqiu数据比较
        if (doc['odds_rangqiu'] != null && !Func.isObjectValueEqual(doc['odds_rangqiu'][0], data['odds_rangqiu'])) {
            docValue['odds_rangqiu'] = data['odds_rangqiu'];
            flag = 1;
            if (updateFlag && doc['input_flag'] == 0) {
                pushFlag = 1;
            }
        }
        arr['oddsRangqiu'] = data['odds_rangqiu'];

        if (doc['input_flag'] == 0) {
            if (doc['odds_rangqiu_admin'] != null && !Func.isObjectValueEqual(doc['odds_rangqiu_admin'][0], data['odds_rangqiu'])) {
                docValue['odds_rangqiu_admin'] = data['odds_rangqiu'];
                flag = 1;
            }
            if (doc['odds_jingcai_admin'] != null && !Func.isObjectValueEqual(doc['odds_jingcai_admin'][0], data['odds_jingcai'])) {
                docValue['odds_jingcai_admin'] = data['odds_jingcai'];
                flag = 1;
            }
        } else {
            if (0 == pushFlag) {
                arr['type'] = 1;          //用于区分doc['input_flag'] docs['hot_flag'] 后台是否修改过  0 默认值  1 代表运行期间后台修改了 
                pushFlag = 1;
            }
            arr['oddsRangqiu'] = doc['odds_rangqiu_admin'][0];
            arr['oddsJingcai'] = doc['odds_jingcai_admin'][0];
        }
        if (1 == doc['hot_flag']) {
            if (0 == pushFlag) {
                arr['type'] = 1;        //用于区分doc['input_flag'] docs['hot_flag'] 后台是否修改过  0 默认值  1 代表运行期间后台修改了 
                pushFlag = 1;
            }
        }
        arr['hotFlag'] = doc['hot_flag'];

        if (pushFlag && doc['display_flag']) {
            updateScheduleFlag = 1;
            updateScheduleList.push(arr);
        }

        if (flag) {
            return docValue;
        } else {
            return null;
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
            addCurData(data, len);
        }

        //保存到数据库
        try {
            for (var i = 1; i <= len; i++) {
                schedule.push(scheduleDeal(data[i - 1]));
                if (0 == i % batchSize) {
                    //写数据库
                    if (schedule.length != 0)
                        scheduleStatement.collection.insert(schedule, onInsert);
                    schedule = [];
                }
            }
            if (schedule.length != 0) {
                //写数据库
                if (schedule.length != 0)
                    scheduleStatement.collection.insert(schedule, onInsert);
            }
        } catch (err) {
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
        var dataArr = [];
        for (var i = 0; i < len; i++) {
            Id = parseInt(data[i]['id']);
            //schedule判断
            for (var j = 0; j < scheduledocs.length; j++) {
                if (scheduledocs[j]['_doc']['id'] != data[i]['id']) {
                    continue;
                } else {
                    var schedocValue = scheduleComp(data[i], scheduledocs[j]['_doc']);
                    if (schedocValue != null) {
                        dataArr.push(schedocValue);
                    }
                    break;
                }
            }
        }
        //赛事信息有更新推送游戏服
        if (incrementalFlag) {
            updateCurData();
        }

        //更新数据库
        try {
            for (var i = 0; i < dataArr.length; i++) {
                scheduleStatement.collection.update({ id: dataArr[i]['id'] }, { $set: dataArr[i] }, false, true);
            }
        } catch (err) {
            OBJ('LogMgr').error(err);
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
        var filter = { "match_date": { "$gt": Date.now() }, "display_flag": 1, "status": 0};
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
                        arr['sceheduleId'] = parseInt(docs[i]['id']);
                        arr['phase'] = docs[i]['phase'];
                        arr['matchName'] = docs[i]['match_name'];
                        arr['weekday'] = docs[i]['weekday'];
                        arr['officialNum'] = docs[i]['weekday'] + docs[i]['official_num'];
                        arr['endSale'] = docs[i]['match_date'].toLocaleString();
                        arr['homeName'] = docs[i]['home_team'];
                        arr['awayName'] = docs[i]['away_team'];
                        arr['handicap'] = docs[i]['handicap'];
                        arr['input_flag'] = docs[i]['input_flag'];
                        arr['type'] = 0;                             //用于区分doc[i]['input_flag'] docs[i]['hot_flag'] 后台是否修改过  0 默认值  1 代表运行期间后台修改了
                        if (docs[i]['input_flag']) {
                            arr['oddsJingcai'] = docs[i]['odds_jingcai_admin'];
                            arr['oddsRangqiu'] = docs[i]['odds_rangqiu_admin'];
                        } else {
                            //赔率为空赛事不开
                            if(docs[i]['odds_jingcai'] == null){
                                continue;
                            }
                            arr['oddsJingcai'] = docs[i]['odds_jingcai'];
                            arr['oddsRangqiu'] = docs[i]['odds_rangqiu'];
                        }
                        arr['hotFlag'] = docs[i]['hot_flag'];

                        list.push(arr);
                    }
                    if (list.length > 0) {
                        if (source != null) {
                            func(list, source);
                        } else {
                            func(list);
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
    function broadcastCurData(list) {
        OBJ('RpcModule').broadcastGameServer('RealFootball', 'resCurData', {
            map: list
        });
    }

    /*
        @func  发送当前赛事列表
    */
    function sendCurData(list, source) {
        OBJ('RpcModule').send(source, 'RealFootball', 'resCurData', {
            map: list
        });
    }


    /*
        @func 获取所有比赛的赛事列表
    */
    function getCurData() {
        getCurScheduleList(broadcastCurData);
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
        @func 有新的比赛赛事
    */
    function addCurData(data, len) {
        var list = [];
        for (var i = 0; i < data.length; i++) {
            var arr = {};
            arr['sceheduleId'] = parseInt(data[i]['id']);
            arr['phase'] = data[i]['phase'];
            arr['matchName'] = data[i]['match_name'];
            arr['weekday'] = data[i]['weekday'];
            arr['officialNum'] = data[i]['weekday'] + data[i]['official_num'];
            arr['endSale'] = data[i]['match_date'].toLocaleString();
            arr['homeName'] = data[i]['home_team'];
            arr['awayName'] = data[i]['away_team'];
            arr['handicap'] = data[i]['handicap'];
            arr['input_flag'] = 0;
            arr['type'] = 0;                    //用于区分doc[i]['input_flag'] docs[i]['hot_flag'] 后台是否修改过  0 默认值  1 代表运行期间后台修改了           
            arr['oddsJingcai'] = data[i]['odds_jingcai'];
            arr['oddsRangqiu'] = data[i]['odds_rangqiu'];
            arr['hotFlag'] = 0;

            list.push(arr);
        }
        OBJ('RpcModule').broadcastGameServer('RealFootball', 'resCurData', {
            map: list
        });
    }

    /*
        @func 比赛开始删除相应的赛事信息
    */
    function deleteCurData() {
        if (1 == deleteScheduleFlag) {
            deleteScheduleFlag = 0;
            var idArr = [];
            for (var key in mapDeleteSchedule) {
                var item = mapDeleteSchedule[key];
                if (0 == item) {
                    mapDeleteSchedule.set(key, 1);
                    idArr.push(key);
                }
            }

            if (idArr.length > 0) {
                OBJ('RpcModule').broadcastGameServer('RealFootball', 'refreshStopBetSchedule', {
                    id: idArr
                });
            }
        }
    }

    /*
        @func 比赛结束,推送游戏服结算(含正常比分和取消比赛的)
    */
    function endScheduleState(){
        if (1 == endScheduleFlag) {
            endScheduleFlag = 0;
            var idArr = [];
            var scoreArr = [];
            var raceStatus = [];
            for (var key in mapEndSchedule) {
                var item = mapEndSchedule(key);
                var itemScore = mapScheduleScore(key);
                if (0 != item && itemScore) {
                    mapDeleteSchedule.set(key, 1);
                    idArr.push(key);
                    scoreArr.push(itemScore);
                    if(0 == item){
                        raceStatus.push(0);    //正常比分
                    }else if(-1 == item){
                        raceStatus.push(1);    //取消比赛
                    }
                }
            }

            //本期号赛事全部结束
            if (endPhaseFlag) {
                //删除map的 值
                for (var i = 0; i < phaseScheduleIdArr.length; i++) {
                    if (1 == mapDeleteSchedule.get(phaseScheduleIdArr[i])) {
                        mapDeleteSchedule.delete(phaseScheduleIdArr[i]);
                        mapScheduleScore.delete(phaseScheduleIdArridArr[i]);
                    }
                    if (1 == mapEndSchedule.get(phaseScheduleIdArridArr[i])) {
                        mapEndSchedule.delete(phaseScheduleIdArr[i]);
                    }
                }
                //end 删除map
            }
            //广播给游戏服
            if (idArr.length > 0) {
                OBJ('RpcModule').broadcastGameServer('RealFootball', 'refreshScheduleState', {
                    id: idArr,
                    score: scoreArr,
                    raceStatus:raceStatus
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

    
}