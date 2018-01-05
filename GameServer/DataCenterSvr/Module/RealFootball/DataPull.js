module.exports = DataPull;

//加载模块
//var SingleTimer = require('../../../Utils/SingleTimer');
var config = require('../../../config').dataCenterSvrConfig();
var Schema = require('../../../db_structure');
var OBJ = require('../../../Utils/ObjRoot').getObj;
var Func = require('../../../Utils/Functions');
//var moment = require('moment');
//end 加载模块

//数据拉取
function DataPull(){
    //变量定义
    //var _pullTimer;                             //定时器
    var _phaseday = 0;                          //请求的期号时间戳
    var _pageUrl ;                              //请求数据网址
    var _freq ;                                 //请求时间间隔
    var _noDataNum = 0;                         //连续取到空数据期号统计
    var _noDataTotal = 0;                       //连续n天取到为空成立,截至轮询
    var _totalNum = 0;                          //轮询的期号数统计
    var _switch = 1;                            //获取历史数据开关
    var _beginTime ='';                         //获取历史数据起始时间
    var _endTime = '';                          //获取历史数据截止时间
    var _startSvrflag = 1;                     //是否重启服务标识
    //var _path = '';                             
    //end 变量定义

    //数据库statement
    var _ScheduleStatement = OBJ('DbMgr').getStatement(Schema.Schedule());
    //end 数据库statement

    var mapScheduleList = new Map();           //当前时刻赛事列表
    var mapAddSchedule = new Map();            //新增赛事
    var mapDeleteSchedule = new Map();         //开始赛事
    var mapUpdateSchedule = new Map();         //赛事信息更新     

    var scehduleSelect = {"_id":0,"id":1,"weekday":1,"official_num":1,"phase":1,"match_date":1,"status":1,"first_half":1,"final_score":1,
    "match_name":1,"home_team":1,"away_team":1,"odds_jingcai":1,"handicap":1,"odds_rangqiu":1,"display_flag":1,"hot_flag":1};

    //初始化
    init();

    //数据拉取入口
    /*this.run = function(timestamp){
        if(null != _pullTimer && _pullTimer.toNextTime()){
            //console.log('DataPull...'+timestamp);
            //获取期号
            var phase= Func.getDate(_phaseday);
            //获取历史数据完成
            if(0 == _switch && (phase - _endTime >0)){
                console.log('-----Pull history of data is finished!-----');
            }
            else{
                console.log('期号:'+phase);
                OBJ('HttpClientMgr').Get(_pageUrl+phase,reqCallBack);
            }
        }
    };*/

    /*
        @func 数据拉取路口
    */
    this.dataToPull = function(){
        //获取期号
        var phase= Func.getDate(_phaseday);
        //获取历史数据完成
        if(0 == _switch && (phase - _endTime >0)){
            console.log('-----Pull history of data is finished!-----');
        }
        else{
            console.log('期号:'+phase);
            OBJ('HttpClientMgr').Get(_pageUrl+phase,reqCallBack);
        }
    }

    


/*
    @func 初始化函数
*/
function init(){
    //_pullTimer = new SingleTimer();
    _switch = (_switch = parseInt(config['switch']))?_switch:0;
    _beginTime =  config['beginTime'];
    _endTime = parseInt(config['endTime']);
    //_pullTimer.startup(config.pullInterval*1000);
    _phaseday = _switch?Date.now():Func.getStamp(_beginTime);
    _freq = (_freq = parseInt(config['pullInterval'])*1000)?_freq:6000;
    _noDataTotal = (_noDataTotal = parseInt(config['noDataTotal']))?_noDataTotal:3;
    _pageUrl = 'http://api.caipiaokong.com/live/?name=jczq&format=json&uid=889953&token=007a12e40291b9b6d4a6516afcd79f58b059f2fc&phase=';

}

/*
    @func 数据拉取请求的回调函数
    @html 网页原生数据
*/
function reqCallBack(html){
    var result =dataStatus(html);
    SetNextPhase(result);
    if(result!=0 && result !=-1){
        dataDeal(html);
    }
}

/*
    @func      获取数据状态
    @data      数据
    @return    返回状态 0 空数据 1 本期号的比赛全部结束 2 继续轮询
*/
function dataStatus(html){
    //空数据
    if(html.indexOf('"code":"204","text":"空数据！"') >0){
        console.log('"code":"204","text":"空数据！"');
        return 0;
    }
    if(html=="[]"){                 //20170128
        console.log('html:'+html);
        return 0;
    }
    if(html.indexOf('{"id":"') >0){
        var finishNum = 0;
        var dataArr = JSON.parse(html);
        var len = dataArr.length;
        var idArr = [];
        for(var i=0;i<len;i++){
            if(dataArr[i]['status'] == '4'){
                finishNum++;
            }
            //mapDeleteSchedule 赋值
            var id = parseInt(dataArr[i]['id']);
            idArr.push(id);
            if(Date.parse(data['match_date']).getTime() > Date.now().getTime()){
                if(mapDeleteSchedule.get(id) == null){
                    mapDeleteSchedule.set(parseInt(dataArr[i]['id']),0);
                }
            }
            //end mapDeleteSchedule 赋值
        }
        //本期号比赛结束
        if(finishNum == len){
            //删除mapDeleteSchedule 值
            for(var i =0;i<idArr.length;i++){
                mapDeleteSchedule.delete(idArr[i]);
            }
            //end 删除mapDeleteSchedule 值
            return 1;
        }
        return 2;
    }else{
        //可能第三方数据有问题
        console.log('error data format not json  :'+html);
        return -1;
    }

}

/*  
    @func    设置next期号
    @status  上期号数据状态
*/
function SetNextPhase(status){
    //第三方网页数据出问题,本期重新做请求
    if(-1 == status){
        return ;
    }
    _totalNum++;
    if(0 == status){
        _noDataNum++;
    }else{
        _noDataNum = 0;
    }

    //获取下一期号时间戳
    if((_noDataNum ==_noDataTotal) && _switch){
        _noDataNum = 0;
        //连续_noDataNum期取到空数据,不再往下判断
        _phaseday = _phaseday-_totalNum*24*60*60*1000;  
        _totalNum = 0;
        if(_startSvrflag){
            _startSvrflag = 0;
            getCurData();
        }
    }else if(1 == status && _switch){
        _totalNum = 0;
        _noDataNum = 0;
        _phaseday = _phaseday+24*60*60*1000;
    }else{
        _phaseday = _phaseday+24*60*60*1000;
    }
}

/*
    @func 解析schedule数据
    
 */
function scheduleDeal(data){
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

    scheduleDoc.odds_jingcai_admin =data['odds_jingcai'];
    //赛事
    scheduleDoc.score_dateline = new Date(parseInt(data['score_dateline'])*1000);
    scheduleDoc.odds_dateline = new Date(parseInt(data['odds_dateline'])*1000);
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

    //scheduleDoc.official_date = moment.utc(data['official_date']).format();
    return scheduleDoc;

}

/*
    @func 批量插入数据回调函数
 */
function onInsert(err, docs) {
    if (err) {
        // TODO: handle error
        console.log('onInsert error '+err);
    } else {
        console.info('%d docs were successfully stored.',docs['insertedCount']);
    }
}


/*
    @func schedule数据比较
    @data 抓取得数据
    @doc  本地数据
 */
function scheduleComp(data,doc){
    var docValue = {};
    var time_endsale =Date.parse(data['time_endsale']);
    var match_date = Date.parse(data['match_date']);
    var status = parseInt(data['status']);
    if(Date.parse(doc['time_endsale']) != time_endsale){
        docValue['time_endsale'] =new Date(time_endsale);
    }
    if(Date.parse(doc['match_date']) != match_date){
        docValue['match_date'] =new Date(match_date);
    }
    if(doc['first_half'] != data['first_half']){
        docValue['first_half']=data['first_half'];
    }
    if(doc['final_score'] != data['final_score']){
        docValue['final_score']=data['final_score'];
    }
    if(doc['status'] != status){
        docValue['status']=status;
    }
    if(doc['handicap'] != data['handicap']){
        docValue['handicap'] =data['handicap'];
    }
    if(doc['weekday'] != data['weekday']){
        docValue['weekday']=data['weekday'];
    }

    //odds数据比较
    if(doc['odds_jingcai'] != null && !Func.isObjectValueEqual(doc['odds_jingcai'][0],data['odds_jingcai'])){
        docValue['odds_jingcai'] = data['odds_jingcai'];
    }
    if(doc['odds_avg'] != null && !Func.isObjectValueEqual(doc['odds_avg'][0],data['odds_avg'])){
        docValue['odds_avg'] = data['odds_avg'];
    }
    if(doc['odds_wlxe'] != null && !Func.isObjectValueEqual(doc['odds_wlxe'][0],data['odds_wlxe'])){
        docValue['odds_wlxe'] = data['odds_wlxe'];
    }
    if(doc['odds_aomen'] != null && !Func.isObjectValueEqual(doc['odds_aomen'][0],data['odds_aomen'])){
        docValue['odds_aomen'] = data['odds_aomen'];
    }
    if(doc['odds_libo'] != null && !Func.isObjectValueEqual(doc['odds_libo'][0],data['odds_libo'])){
        docValue['odds_libo'] = data['odds_libo'];
    }
    if(doc['odds_bet365'] != null && !Func.isObjectValueEqual(doc['odds_bet365'][0],data['odds_bet365'])){
        docValue['odds_bet365'] = data['odds_bet365'];
    }
    if(doc['odds_bwin'] != null && !Func.isObjectValueEqual(doc['odds_bwin'][0],data['odds_bwin'])){
        docValue['odds_bwin'] = data['odds_bwin'];
    }
    if(doc['odds_weide'] != null && !Func.isObjectValueEqual(doc['odds_weide'][0],data['odds_weide'])){
        docValue['odds_weide'] = data['odds_weide'];
    }
    if(doc['odds_hg'] != null && !Func.isObjectValueEqual(doc['odds_hg'][0],data['odds_hg'])){
        docValue['odds_hg'] = data['odds_hg'];
    }
    if(doc['odds_ysb'] != null && !Func.isObjectValueEqual(doc['odds_ysb'][0],data['odds_ysb'])){
        docValue['odds_ysb'] = data['odds_ysb'];
    }

    //yapan数据比较
    if(doc['odds_yapan'] != null && !Func.isObjectValueEqual(doc['odds_yapan'][0],data['odds_yapan'])){
        docValue['odds_yapan'] = data['odds_yapan'];
    }
    if(doc['odds_yapan_bet365'] != null && !Func.isObjectValueEqual(doc['odds_yapan_bet365'][0],data['odds_yapan_bet365'])){
        docValue['odds_yapan_bet365'] = data['odds_yapan_bet365'];
    }
    if(doc['odds_yapan_hg'] != null && !Func.isObjectValueEqual(doc['odds_yapan_hg'][0],data['odds_yapan_hg'])){
        docValue['odds_yapan_hg'] = data['odds_yapan_hg'];
    }
    if(doc['odds_yapan_ysb'] != null && !Func.isObjectValueEqual(doc['odds_yapan_ysb'][0],data['odds_yapan_ysb'])){
        docValue['odds_yapan_ysb'] = data['odds_yapan_ysb'];
    }
    if(doc['odds_yapan_weide'] != null && !Func.isObjectValueEqual(doc['odds_yapan_weide'][0],data['odds_yapan_weide'])){
        docValue['odds_yapan_weide'] = data['odds_yapan_weide'];
    }

    //rangqiu数据比较
    if(doc['odds_rangqiu'] != null && !Func.isObjectValueEqual(doc['odds_rangqiu'][0],data['odds_rangqiu'])){
        docValue['odds_rangqiu'] = data['odds_rangqiu'];
    }
    if(doc['odds_rangqiu_wlxe'] != null && !Func.isObjectValueEqual(doc['odds_rangqiu_wlxe'][0],data['odds_rangqiu_wlxe'])){
        docValue['odds_rangqiu_wlxe'] = data['odds_rangqiu_wlxe'];
    }
    if(doc['odds_rangqiu_libo'] != null && !Func.isObjectValueEqual(doc['odds_rangqiu_libo'][0],data['odds_rangqiu_libo'])){
        docValue['odds_rangqiu_libo'] = data['odds_rangqiu_libo'];
    }
    if(doc['odds_rangqiu_bet365'] != null && !Func.isObjectValueEqual(doc['odds_rangqiu_bet365'][0],data['odds_rangqiu_bet365'])){
        docValue['odds_rangqiu_bet365'] = data['odds_rangqiu_bet365'];
    }

    if(doc['input_flag'] == 0){
        if(doc['odds_rangqiu_admin'] != null && !Func.isObjectValueEqual(doc['odds_rangqiu_admin'][0],data['odds_rangqiu'])){
            docValue['odds_rangqiu_admin'] = data['odds_rangqiu'];
        }
        if(doc['odds_jingcai_admin'] != null && !Func.isObjectValueEqual(doc['odds_jingcai_admin'][0],data['odds_jingcai'])){
            docValue['odds_jingcai_admin'] = data['odds_jingcai'];
        }
    }
    return docValue;
    
}

/*
    @func 数据保存
    @data 抓取的数据
    @len  条数
*/
function dataSave(data,len){
    var schedule = [];
    var batchSize = 10;
    var size = 0;

    try{
        for(var i= 1;i<=len;i++){
            schedule.push(scheduleDeal(data[i-1]));
            if(0 == i%batchSize){
                //写数据库
                if(schedule.length != 0)
                    _ScheduleStatement.collection.insert(schedule,onInsert);
                schedule = [];
            }
        }
        if(schedule.length != 0){
            //写数据库
            if(schedule.length != 0)
                _ScheduleStatement.collection.insert(schedule,onInsert);
        }
    }catch(err){
        console.log('dataSave err ' ,err);
    }

}


/*
    @func            数据更新
    @data            抓取的数据
    @scheduledocs    本地数据
 */
function dataUpdate(data,scheduledocs){

    if(data.length != scheduledocs.length){
        console.log('func dataUpdate length illegal');
        return ;
    }
    var len = data.length;
    var Id = 0;
    for(var i =0;i<len;i++){
        Id = parseInt(data[i]['id']);

        //schedule判断
        try{
            for(var j =0;j<len;j++){
                if(data[i]['id'] == scheduledocs[j]['_doc']['id']){
                    var schedocValue = scheduleComp(data[i],scheduledocs[j]['_doc']);
                    for(var key in schedocValue){
                         _ScheduleStatement.collection.update({id:Id},{$set:schedocValue},false,true);
                        break;
                    }
                    break;
                } 
            }
        }catch(err){
            console.log('dataUpdate err ', err);
        }
    }
}

/*
    @func              数据保存+更新
    @dataArr           抓取数据
    @scheduledocs      本地数据
    @len               条数
 */
function dataSaveAndUpdate(dataArr,scheduledocs,len){
    var docsId = [];
    var saveDate = [];
    var updateData = [];
    var length = 0;
    for(var i= 0 ;i<scheduledocs.length;i++){
        docsId.push(parseInt(scheduledocs[i]['_doc']['id']));
    }
    for(var i=0;i<len;i++){
        if(contains(docsId, parseInt(dataArr[i]['id']))){
            updataData.push(dataArr[i]);
        }else{
            length++;
            saveDate.push(dataArr[i]);
        }
    }
    //数据保存
    if(length >0){
        dataSave(saveDate,length);
    }

    //更新数据
    dataUpdate(updataData,scheduledocs);
}


/*
    @func 数据处理
    @html 抓取的原生数据
*/
function dataDeal(html){
    var dataArr = JSON.parse(html);
    var len = dataArr.length;
    var Id = [];
    for(var i=0;i<len;i++){
        Id.push(parseInt(dataArr[i]['id']));
    }
    //TODO schedule查询数据
    try{
        _ScheduleStatement.find({},function(err,scheduledocs){
            if(!err){
                if(0 == scheduledocs.length){
                    console.log('func dataDeal dataSave');
                    dataSave(dataArr,len);
                }
                else if(len == scheduledocs.length){
                    console.log('func dataDeal dataUpdate');
                    dataUpdate(dataArr,scheduledocs);
                }else{
                    console.log('func dataDeal dataSaveAndUpdate');
                    dataSaveAndUpdate(dataArr,scheduledocs,len);
                }
            }else{
                console.log('func dataDel _ScheduleStatement.find '+err);
            }
        }).where('id').in(Id);
    }catch(error){
        console.log('dataDeal err ', error);
    }
}

/*
    @func 获取所有比赛的赛事列表
*/
function getCurData(){
    var filter ={"match_date":{"$gte":Date.now()},"display_flag":1};
    try{
        _ScheduleStatement.find(filter,scehduleSelect,
            {sort:{'match_num':1}},function(error,docs){
                if(error){
                    console.log('Module DataPull getCurData() _ScheduleStatement.find :',error);
                    return;
                }else if(0 == docs.length){
                    return;
                }
                var arr ={};
                for(var i= 0;i<docs.length;i++){
                    arr['sceheduleId'] = parseInt(docs[i]['id']);
                    arr['phase'] = docs[i]['phase'];
                    arr['matchName'] = docs[i]['match_name'];
                    arr['weekday'] = docs[i]['weekday'];
                    arr['officialNum'] = docs[i]['weekday']+docs[i]['official_num'];
                    arr['endSale'] = docs[i]['match_date'].toLocaleString();
                    arr['homeName'] = docs[i]['home_team'];
                    arr['awayName'] = docs[i]['away_team'];
                    arr['handicap'] = docs[i]['handicap'];
                    if(docs[i]['input_flag']){
                        arr['oddsJingcai'] = docs[i]['odds_jingcai_admin'];
                        arr['oddsRangqiu'] = docs[i]['odds_rangqiu_admin'];
                    }else{
                        arr['oddsJingcai'] = docs[i]['odds_jingcai'];
                        arr['oddsRangqiu'] = docs[i]['odds_rangqiu'];
                    }
                    arr['hotFlag'] = docs[i]['hot_flag'];

                    mapScheduleList.set(arr['sceheduleId'],arr);
                }
            OBJ('GameSvrAgentModule').send(source, {
                module:'RealFootball',
                func:'resCurData',
                data:{
                    map:mapScheduleList.values()
                }
            });
            mapScheduleList.clear();
        });
    }catch(err){
        console.log('DataPull getCurData() :', err);
    }
}

/*
    @func 
 */
function addCurData(){

}

/*
    @func 比赛开始删除相应的赛事信息
*/
function deleteCurData(){
    var idArr = [];
    for(var key in mapDeleteSchedule){
        var item = mapDeleteSchedule[key];
            if(0 == item){
                var tmp = key;
                mapDeleteSchedule.delete(key);
                mapDeleteSchedule.set(tmp,1);
                idArr.push(tmp);
            }
    }

    OBJ('GameSvrAgentModule').send(source, {
        module:'RealFootball',
        func:'refreshStopBetSchedule',
        data:{
            id:idArr
        }
    });

}

/*
    @func 
*/
function updateCurData(){

}

}