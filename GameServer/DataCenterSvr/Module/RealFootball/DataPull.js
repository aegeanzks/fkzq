module.exports = DataPull;

//加载模块
var SingleTimer = require('../../../Utils/SingleTimer');
var config = require('../../../config').dataCenterSvrConfig();
var Schema = require('../../../db_structure');
var OBJ = require('../../../Utils/ObjRoot').getObj;
var Func = require('../../../Utils/Functions');
//var moment = require('moment');
//end 加载模块

//数据拉取
function DataPull(){
    //变量定义
    var _pullTimer;                             //定时器
    var _phaseday = 0;                          //请求的期号时间戳
    var _pageUrl ;                              //请求数据网址
    var _freq ;                                 //请求时间间隔
    var _noDataNum = 0;                         //连续取到空数据期号统计
    var _noDataTotal = 0;                       //连续n天取到为空成立,截至轮询
    var _totalNum = 0;                          //轮询的期号数统计
    var _switch = 1;                            //获取历史数据开关
    var _beginTime ='';                         //获取历史数据起始时间
    var _endTime = '';                          //获取历史数据截止时间
    //var _path = '';                             
    //end 变量定义

    //数据库statement
    var _ScheduleStatement = OBJ('DbMgr').getStatement(Schema.Schedule());
    var _OddsStatement = OBJ('DbMgr').getStatement(Schema.Odds());
    var _YapanStatement = OBJ('DbMgr').getStatement(Schema.Yapan());
    var _RangqiuStatement = OBJ('DbMgr').getStatement(Schema.Rangqiu());
    //end 数据库statement

    //初始化
    init();

    //数据拉取入口
    this.run = function(timestamp){
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
                OBJ('HttpClientMgr').Get(_pageUrl+20171221,reqCallBack);
            }
        }
    };


/*
    @func 初始化函数
*/
function init(){
    _pullTimer = new SingleTimer();
    _switch = (_switch = parseInt(config['switch']))?_switch:0;
    _beginTime =  config['beginTime'];
    _endTime = parseInt(config['endTime']);
    _pullTimer.startup(config.pullInterval*1000);
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
        for(var i=0;i<len;i++){
            if(dataArr[i]['status'] == '4'){
                finishNum++;
            }
        }
        //本期号比赛结束
        if(finishNum == len){
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
    @func 解析odds数据
 */
function oddsDeal(data){
    var oddsDoc = OBJ('DbMgr').getModel(Schema.Odds());
    oddsDoc.odds_12bet = data['odds_12bet']
    oddsDoc.odds_coral = data['odds_coral'];
    oddsDoc.odds_ysb = data['odds_ysb'];
    oddsDoc.odds_hg = data['odds_hg'];
    oddsDoc.odds_weide = data['odds_weide'];
    oddsDoc.odds_bwin = data['odds_bwin'];
    oddsDoc.odds_bet365 = data['odds_bet365'];
    oddsDoc.odds_libo = data['odds_libo'];
    oddsDoc.odds_aomen = data['odds_aomen'];
    oddsDoc.odds_wlxe = data['odds_wlxe'];
    oddsDoc.odds_avg = data['odds_avg'];
    oddsDoc.odds_jingcai = data['odds_jingcai'];
    oddsDoc.id = parseInt(data['id']);
    return oddsDoc;

}

/*
    @func 解析yapan数据
 */
function yapanDeal(data){
    var yapanDoc = OBJ('DbMgr').getModel(Schema.Yapan());
    yapanDoc.odds_yapan_weide = data['odds_yapan_weide'];
    yapanDoc.odds_yapan_ysb = data['odds_yapan_ysb'];
    yapanDoc.odds_yapan_hg = data['odds_yapan_hg'];
    yapanDoc.odds_yapan_bet365 = data['odds_yapan_bet365'];
    yapanDoc.odds_yapan = data['odds_yapan'];
    yapanDoc.id = parseInt(data['id']);
    return yapanDoc;
}

/*
    @func 解析rangqiu数据
 */
function rangqiuDeal(data){
    var rangqiuDoc = OBJ('DbMgr').getModel(Schema.Rangqiu()); 
    rangqiuDoc.odds_rangqiu_bet365 = data['odds_rangqiu_bet365'];
    rangqiuDoc.odds_rangqiu_libo = data['odds_rangqiu_libo'];
    rangqiuDoc.odds_rangqiu_wlxe = data['odds_rangqiu_wlxe'];
    rangqiuDoc.odds_rangqiu = data['odds_rangqiu'];
    rangqiuDoc.id = parseInt(data['id']);
    return rangqiuDoc;
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
    @func 查找回调函数
 */
function onFind(err,docs){

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
    return docValue;
    
}

/*
    @func odds数据比较
    @data 抓取得数据
    @doc  本地数据
 */
function oddsComp(data,doc){
    var docValue = {};
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
    return docValue;
    
}

/*
    @func yapan数据比较
    @data 抓取得数据
    @doc  本地数据
 */
function yapanComp(data,doc){
    var docValue = {};
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
    return docValue;
    
}

/*
    @func rangqiu数据比较
    @data 抓取得数据
    @doc  本地数据
 */
function rangqiuComp(data,doc){
    var docValue = {};
    if(doc['odds_rangqiu_wlxe'] != null && !Func.isObjectValueEqual(doc['odds_rangqiu'][0],data['odds_rangqiu'])){
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
    return docValue;
    
}

/*
    @func 数据保存
    @data 抓取的数据
    @len  条数
*/
function dataSave(data,len){
    var schedule = [];
    var odds = [];
    var yapan = [];
    var rangqiu = [];
    var batchSize = 10;
    var size = 0;
    for(var i= 1;i<=len;i++){
        schedule.push(scheduleDeal(data[i-1]));
        odds.push(oddsDeal(data[i-1]));
        yapan.push(yapanDeal(data[i-1]));
        rangqiu.push(rangqiuDeal(data[i-1]));
        if(0 == i%batchSize){
            //写数据库
            if(schedule.length != 0)
                _ScheduleStatement.collection.insert(schedule,onInsert);
            if(odds.length !=0)
                _OddsStatement.collection.insert(odds,onInsert);
            if(yapan.length !=0)
                _YapanStatement.collection.insert(yapan,onInsert);
            if(rangqiu.length !=0)
                _RangqiuStatement.collection.insert(rangqiu,onInsert);
    
            schedule = [];
            odds = [];
            yapan = [];
            rangqiu = [];
        }
    }
    if(schedule.length != 0 || odds.length !=0 || yapan.length !=0 || rangqiu.length !=0){
        //写数据库
        if(schedule.length != 0)
            _ScheduleStatement.collection.insert(schedule,onInsert);
        if(odds.length !=0)
            _OddsStatement.collection.insert(odds,onInsert);
        if(yapan.length !=0)
            _YapanStatement.collection.insert(yapan,onInsert);
        if(rangqiu.length !=0)
            _RangqiuStatement.collection.insert(rangqiu,onInsert);
    }
}


/*
    @func            数据更新
    @data            抓取的数据
    @scheduledocs    本地数据
    @oddsdocs        本地数据
    @yapandocs       本地数据
    @rangqiudocs     本地数据
 */
function dataUpdate(data,scheduledocs,oddsdocs,yapandocs,rangqiudocs){

    if(data.length != scheduledocs.length || data.length != oddsdocs.length 
        || data.length != yapandocs.length ||data.length != rangqiudocs.length){
            console.log('func dataUpdate length illegal');
            return ;
    }
    var len = data.length;
    var Id = 0;
    for(var i =0;i<len;i++){
        Id = parseInt(data[i]['id']);

        //schedule判断
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

        //odds判断
        for(var m =0;m<len;m++){
            if(data[i]['id'] == oddsdocs[m]['_doc']['id']){
                var oddsdocValue = oddsComp(data[i],oddsdocs[m]['_doc']);
                for(var key in oddsdocValue){
                     _OddsStatement.collection.update({id:Id},{$set:oddsdocValue},false,true);
                    break;
                }
                break;
            } 
        }

        //yapan判断
        for(var n =0;n<len;n++){
            if(data[i]['id'] == yapandocs[n]['_doc']['id']){
                var yapandocValue = yapanComp(data[i],yapandocs[n]['_doc']);
                for(var key in yapandocValue){
                    _YapanStatement.collection.update({id:Id},{$set:yapandocValue},false,true);
                    break;
                }
                break;
            }

        }

        //让球判断
        for(var k = 0;k<len;k++){
            if(data[i]['id'] == rangqiudocs[k]['_doc']['id']){
                var rangqiudocValue = rangqiuComp(data[i],rangqiudocs[k]['_doc']);
                for(var key in rangqiudocValue){
                    _RangqiuStatement.collection.update({id:Id},{$set:rangqiudocValue},false,true);
                    break;
                }
                break;
            }
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
    var oddsdocs = [];
    var yapandocs = [];
    var rangqiudocs = [];
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
    updateDeal(updataData,scheduledocs,docsId);
}

/*
    @func         获取本地数据,做更新
    @updataData   待更新数据
    @scheduledocs 本地数据     
 */
function updateDeal(updataData,scheduledocs,Id){
    var count = 0;
    var oddsdocs = [];
    var yapandocs = [];
    var rangqiudocs = [];

    //TODO Odds查询数据
    _OddsStatement.find({},function(err,docs){
        if(!err){
            oddsdocs = docs;
            count++;
            if(count == 3){
                dataUpdate(updataData,scheduledocs,oddsdocs,yapandocs,rangqiudocs);
            }
        }else{
            console.log('func dataSaveAndUpdate _OddsStatement.find '+err);
            return ;
        }
    }).where('id').in(Id);

    //TODO Yapan查询数据
    _YapanStatement.find({},function(err,docs){
        if(!err){
            yapandocs = docs;
            count++;
            if(count == 3){
                dataUpdate(updataData,scheduledocs,oddsdocs,yapandocs,rangqiudocs);
            }
        }else{
            console.log('func dataSaveAndUpdate _YapanStatement.find '+err);
            return ;
        }
    }).where('id').in(Id);

    //TODO Rangqiu查询数据
    _RangqiuStatement.find({},function(err,docs){
        if(!err){
            rangqiudocs = docs;
            count++;
            if(count == 3){
                dataUpdate(updataData,scheduledocs,oddsdocs,yapandocs,rangqiudocs);
            }
        }else{
            console.log('func dataSaveAndUpdate _RangqiuStatement.find '+err);
            return ;
        }
    }).where('id').in(Id);
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
    _ScheduleStatement.find({},function(err,scheduledocs){
        if(!err){
            if(0 == scheduledocs.length){
                console.log('func dataDeal dataSave');
                dataSave(dataArr,len);
            }
            else if(len == scheduledocs.length){
                console.log('func dataDeal updateDeal');
                updateDeal(dataArr,scheduledocs,Id);
            }else{
                console.log('func dataDeal dataSaveAndUpdate');
                dataSaveAndUpdate(dataArr,scheduledocs,len);
            }
        }else{
            console.log('func dataDel _ScheduleStatement.find '+err);
        }
    }).where('id').in(Id);
}


}