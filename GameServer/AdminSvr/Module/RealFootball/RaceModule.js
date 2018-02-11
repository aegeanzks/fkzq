module.exports =RlRaceModule;

var ScheduleSchema = require('../../../db_structure').Schedule();
var OBJ = require('../../../Utils/ObjRoot').getObj;
var config = require('../../../config').adminSvrConfig();
var Func = require('../../../Utils/Functions');


/*
    Real比赛管理module
 */
function RlRaceModule(){
    //定义变量
    var limit = config.limit;
    var scheduleStatement = OBJ('DbMgr').getStatement(ScheduleSchema);
    var findSelectList = {"_id":0,"id":1,"weekday":1,"official_num":1,"phase":1,"match_date":1,"status":1,"first_half":1,"final_score":1,
                          "match_name":1,"home_team":1,"away_team":1,"odds_jingcai":1,"handicap":1,"odds_rangqiu":1,"display_flag":1,
                          "hot_flag":1,"input_flag":1,"lottery_status":1,"odds_rangqiu_admin":1,"odds_jingcai_admin":1};
    //end 定义变量
    /*
        @func    组包
        @count   总条数
     */
    function packages(docs,count,res,funcname){
        var len = docs.length;
        var data = [];
        var list = [];
        var header = {};
        header['status'] = 200;
        header['totalCount'] = count;
        data.push(header);

        for(var i = 0;i<len;i++){
            var listOne ={};

            listOne['id'] = docs[i]['id'];
            listOne['official_num'] = docs[i]['weekday']+docs[i]['official_num'];
            listOne['phase'] = docs[i]['phase'];
            listOne['match_date'] = docs[i]['match_date'].toLocaleString();
            if(docs[i]['status'] == 0){
                listOne['status'] = 0;
            }else if(docs[i]['status'] == 3 || docs[i]['status'] == 4 || docs[i]['status'] == 5){
                listOne['status'] = 1;
            }else if(docs[i]['status'] == 1){
                listOne['status'] = 2;
            }else if(docs[i]['status'] == 6 || docs[i]['status'] == 7){
                listOne['status'] = 3;
            }else{
                listOne['status'] = docs[i]['status'];
            }
            listOne['home_team'] = docs[i]['home_team'];
            listOne['final_score'] = docs[i]['final_score'] == ""?docs[i]['first_half']:docs[i]['final_score'];
            listOne['away_team'] = docs[i]['away_team'];
            if(docs[i]['input_flag'] == 0 && funcname !='getListById'){           //启用拉取数据
                listOne['odds_jingcai'] = docs[i]['odds_jingcai'];
                listOne['odds_rangqiu'] = docs[i]['odds_rangqiu'];
            }else if(docs[i]['input_flag'] == 1 && funcname!='getListById'){      //启用后台管理员的录入数据
                listOne['odds_jingcai'] = docs[i]['odds_jingcai_admin'];
                listOne['odds_rangqiu'] = docs[i]['odds_rangqiu_admin'];
            }else if(funcname == 'getListById'){
                listOne['odds_jingcai'] = docs[i]['odds_jingcai'];
                listOne['odds_rangqiu'] = docs[i]['odds_rangqiu'];
                listOne['odds_jingcai_admin'] = docs[i]['odds_jingcai_admin'];
                listOne['odds_rangqiu_admin'] = docs[i]['odds_rangqiu_admin'];
            }
            listOne['handicap'] = docs[i]['handicap'];
            listOne['display_flag'] = docs[i]['display_flag'];
            listOne['hot_flag'] = docs[i]['hot_flag'];
            listOne['input_flag'] = docs[i]['input_flag'];
            listOne['lottery_status'] = docs[i]['lottery_status'];
            list.push(listOne);
        }
        data.push(list);
        res.send(data);
    }

    /*
        @func     查找数据库
        @filter   过滤条件
        @funcname 被那个函数调用
     */
    function findList(filter,page,res,funcname){
        try{
            scheduleStatement.count(filter,function(error,count){
                if(!error){
                    if(count >0){
                        scheduleStatement.find(filter,findSelectList,function(finderr,docs){
                            if(!finderr){
                                packages(docs,count,res,funcname);     
                            }else{
                                console.log('Module of RaceModule '+funcname +' err :'+error);
                            }
                        })
                        .skip((page-1) * limit)
                        .limit(limit)
                        .sort({'phase':-1});
                    }else{
                        res.send({
                            status: 0,
                            type: 'GET_DATA_EMPTY',
                            message: '无相关记录'
                        })
                    }
                }else{
                    console.log('Module of RaceModule '+funcname +' find count err :'+error);
                }
            });
        }catch(err){
            console.log('获取数据失败', err);
            res.send({
                status: 1,
                type: 'GET_DATA_ERROR',
                message: '获取数据失败'
            })
        }

    }


    /*
        @func         根据id更新数据库
        @values       待更新的值   
     */
    function updateListById(Id,values,res){
        try{
            var len = Id.length;
            var count = 0;
            for(var i= 0;i<len;i++){
                scheduleStatement.findOneAndUpdate({id:Id[i]},{$set:values},function(error,docs){
                    if(!error){
                        count++;
                        if(count == len){
                            res.send({
                                status: 200,
                                type: 'UPDATE_DATA_SUCESS',
                                message: '数据更新成功'
                            });
                        }
                    }else{
                        console.log('Module of RaceModule updateListById err :'+error);
                    }
                });
            }
        }catch(err){
            console.log('updateListById 更新数据失败', err);
            res.send({
                status: 1,
                type: 'UPDATE_DATA_ERROR',
                message: '更新数据失败'
            })
        }

    }

    /*
        @func   根据赛事id获取赛事
        @id     赛事id
     */
    this.getListById = function(id,res){
        var filter = {"id":id};
        var funcname = 'getListById';
        var page = 1;
        findList(filter,page,res,funcname);
    }

    /*
        @func 获取page页赛事
        @page 当前页数
    */
    this.getListByPage  = function(page,res){
        var filter={};
        var funcname = 'getListByPage';
        findList(filter,page,res,funcname);
    }

    /*
        @func   获取phase期号的赛事
        @phase  赛事期号
        @page   
    */
    this.getListByPhase = function(phase,page,res){
        var filter={"phase":phase};
        var funcname = 'getListByPhase';
        findList(filter,page,res,funcname);
    }

    /*
        @func     获取status状态的赛事
        @status   赛事状态
        @page     当前页数
    */
    this.getListByStatus = function(status,page,res){
        var filter = {};
        if(1 == status){
            filter = {"status":{"$in":[3,4,5]}};
        }else if(2 == status){
            filter = {"status":1}
        }else if(3 == status){
            filter = {"status":{"$in":[6,7]}};
        }else if(0 == status){
            filter = {"status":status};
        }
        var funcname = 'getListByStatus';
        findList(filter,page,res,funcname);

    }

    /*
        @func    获取是否显示设置的赛事
        @display 是否显示
        @page    当前页数
    */
    this.getListByDisplay = function(display,page,res){
        var filter={'display_flag':display};
        var funcname = 'getListByDisplay';
        findList(filter,page,res,funcname); 
    }

    /*
        @func        获取查询时间内的赛事
        @begin_time  开始时间
        @end_time    结束时间
        @page        当前页数
     */
    this.getListByTime = function(begin_time,end_time,page,res){
        var beginStamp = Func.getStamp(begin_time);
        var endStamp = Func.getStamp(end_time);
        var begin = new Date(beginStamp);
        var end = new Date(endStamp+24*60*60*1000);
        var filter={"match_date":{"$gte":begin,"$lt":end}};
        var funcname = 'getListByTime';
        findList(filter,page,res,funcname); 
    }

    /*
        @func        根据status和display字段获取赛事
        @status      赛事状态
        @display     是否显示
        @page        当前页数
     */
    this.getListByStatusAndDisplay = function(status,display,page,res){
        var filter={"status":status,"display_flag":display};
        var funcname = 'getListByStatusAndDisplay';
        findList(filter,page,res,funcname); 
    }

    /*
        @func           根据status和time获取赛事
        @status         赛事状态
        @begin_time     开始时间
        @end_time       结束时间
        @page           当前页数
     */
    this.getListByStatusAndTime = function(status,begin_time,end_time,page,res){
        var beginStamp = Func.getStamp(begin_time);
        var endStamp = Func.getStamp(end_time);
        var begin = new Date(beginStamp);
        var end = new Date(endStamp+24*60*60*1000);
        var filter={"status":status,"match_date":{"$gte":begin,"$lt":end}};
        var funcname = 'getListByStatusAndTime';
        findList(filter,page,res,funcname); 
    }

    /*
        @func          根据display和time获取赛事
        @display       是否显示
        @begin_time    开始时间
        @end_time      结束时间
        @page          当前页数         
     */
    this.getListByDisplayAndTime = function(display,begin_time,end_time,page,res){
        var beginStamp = Func.getStamp(begin_time);
        var endStamp = Func.getStamp(end_time);
        var begin = new Date(beginStamp);
        var end = new Date(endStamp+24*60*60*1000);
        var filter={"display_flag":display,"match_date":{"$gte":begin,"$lt":end}};
        var funcname = 'getListByDisplayAndTime';
        findList(filter,page,res,funcname); 

    }

    /*
        @func          根据status,display,begin_time,end_time获取赛事
        @status        赛事状态
        @display       是否显示
        @begin_time    开始时间
        @end_time      结束时间
        @page          当前页数
     */
    this.getListByStatusAndDisplayAndTime = function(status,display,begin_time,end_time,page,res){
        var beginStamp = Func.getStamp(begin_time);
        var endStamp = Func.getStamp(end_time);
        var begin = new Date(beginStamp);
        var end = new Date(endStamp+24*60*60*1000);
        var filter={"status":status,"display_flag":display,"match_date":{"$gte":begin,"$lt":end}};
        var funcname = 'getListByStatusAndDisplayAndTime';
        findList(filter,page,res,funcname); 
    }

    /*
        @func          编辑赛事
        @fields        字段
        @type          类型
     */
    this.updateInfo = function(fields,type,res){
        var id = [];
        var values = {};
        if(type != 3){
           var str =  fields.id.split(",");
           for(var i = 0 ;i<str.length;i++){
               id.push(parseInt(str[i]));
           }

        }else{
            id.push(parseInt(fields.id));
        }

        if(1 == type){
            var display =  parseInt(fields.display);
            values = {"display_flag":display};
        }else if(2 == type){
            var hot_flag = parseInt(fields.hot_flag);
            values = {"hot_flag":hot_flag};
        }else{
            var input_flag = parseInt(fields.input_flag);
            var lottery_status = parseInt(fields.lottery_status);
            if(lottery_status == 0){        //修改赔率的
                if(input_flag == 0){              //启用拉取的数据
                    values = {"input_flag":input_flag};
                    pushOdds(1,id,values,res);
                }else if(input_flag == 1){      //启用管理员录入的数据
                    var odds_jingcai = {h:0.00,d:0.00,a:0.00};
                    var odds_rangqiu = {h:0.00,d:0.00,a:0.00};
                    odds_jingcai.h = parseFloat(fields.odds_jingcai_admin.h);
                    odds_jingcai.d = parseFloat(fields.odds_jingcai_admin.d);
                    odds_jingcai.a = parseFloat(fields.odds_jingcai_admin.a);
                    odds_rangqiu.h = parseFloat(fields.odds_rangqiu_admin.h);
                    odds_rangqiu.d = parseFloat(fields.odds_rangqiu_admin.d);
                    odds_rangqiu.a = parseFloat(fields.odds_rangqiu_admin.a);
                    values = {"input_flag":input_flag,"odds_jingcai_admin":odds_jingcai,"odds_rangqiu_admin":odds_rangqiu};
                    pushOdds(2,id,values,res);
                }
            }else{                          //修改比分的
                if(fields.final_score.indexOf(':') > 0){
                    values = {"final_score":fields.final_score};
                    updateListById(id,values,res);
                }else{
                    res.json({
                        status:2,
                        type: 'ERROR_QUERY_TYPE',
                        message: '参数错误',
                    })
                    return 
                }
            }

        }
        if(type !=3){
            updateListById(id,values,res);
        }
        

        //推送给游戏服
        if(2 == type){
            pushGSofHotFlag(id,parseInt(fields.hot_flag));
        }else if(1 == type){
            var display = parseInt(fields.display);
            //不显示改为显示
            if(display){
                pushDSofDisplay(id);
            }else{
                pushDSofNotDisplay(id);
            }
        }
    }

    /*
        @func    热门非热门修改，推送给游戏服
        @id      修改的赛事id
    */
    function pushGSofHotFlag(idArr,hotFlag){
        try {
            scheduleStatement.find({}, function (err, docs) {
                if (!err) {
                    if(null == docs){
                        return ;
                    }
                    var updateScheduleList = [];
                    for(var i= 0;i< docs.length;i++){
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
                        arr['hotFlag'] = hotFlag;
                      
                        if(docs[i]['input_flag']){
                            arr['oddsJingcai'] = docs[i]['odds_jingcai_admin'];
                            arr['oddsRangqiu'] = docs[i]['odds_rangqiu_admin'];
                        }else{
                            arr['oddsJingcai'] = docs[i]['odds_jingcai'];
                            arr['oddsRangqiu'] = docs[i]['odds_rangqiu'];
                        }

                        updateScheduleList.push(arr);
                    }
                    //推送给游戏服
                    if(updateScheduleList.length >0){
                        OBJ('RpcModule').broadcastGameServer('RealFootball', 'refreshSchedule', {
                            map: updateScheduleList
                        });
                    }
                } else {
                    OBJ('LogMgr').error(err);
                }
            }).where('id').in(idArr);
        } catch (error) {
            OBJ('LogMgr').error(error);
        }
    }


    /*
        @func    显示改为不显示,推送给数据中心
        @id      修改的赛事id
    */
    function pushDSofNotDisplay(idArr){
        if (idArr.length > 0) {
            OBJ('RpcModule').sendToDataCenter('RealFootball', 'refreshNotDisplay', {
                list: idArr
            });
        }

    }

    /*
        @func    不显示改为显示,推送给数据中心
        @id      修改的赛事id
    */
    function pushDSofDisplay(idArr){
        try {
            var filter = { "match_date": { "$gt": Date.now() }, "status": 0 };
            scheduleStatement.find(filter, function (err, docs) {
                if (!err) {
                    if(null == docs){
                        return ;
                    }
                    var updateScheduleList = [];
                    for(var i= 0;i< docs.length;i++){
                        var arr = {};
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

                        var docValue = { bet_num: { h: 0, d: 0, a: 0 }, bet_num1: { h: 0, d: 0, a: 0 } };
                        arr['sceheduleId'] = parseInt(docs[i]['id']);
                        arr['phase'] = docs[i]['phase'];
                        arr['matchName'] = docs[i]['match_name'];
                        arr['weekday'] = docs[i]['weekday'];
                        arr['officialNum'] = docs[i]['weekday'] + docs[i]['official_num'];
                        arr['endSale'] = docs[i]['match_date'].toLocaleString();
                        arr['homeName'] = docs[i]['home_team'];
                        arr['awayName'] = docs[i]['away_team'];
                        arr['handicap'] = docs[i]['handicap'];
                        arr['hotFlag'] = docs[i]['hot_flag'];
                        arr['intputFlag'] = docs[i]['input_flag'];

                        docValue.bet_num.h = docs[i]['bet_num'][0]['h'];
                        docValue.bet_num.d = docs[i]['bet_num'][0]['d'];
                        docValue.bet_num.a = docs[i]['bet_num'][0]['a'];
                        docValue.bet_num1.h = docs[i]['bet_num1'][0]['h'];
                        docValue.bet_num1.d = docs[i]['bet_num1'][0]['d'];
                        docValue.bet_num1.a = docs[i]['bet_num1'][0]['a'];
                        arr['bet_info'] = docValue;
                      
                        updateScheduleList.push(arr);
                    }
                    //推送给数据中心
                    if(updateScheduleList.length >0){
                        OBJ('RpcModule').sendToDataCenter('RealFootball', 'refreshDisplay', {
                            list: updateScheduleList
                        });
                    }
                } else {
                    OBJ('LogMgr').error(err);
                }
            }).where('id').in(idArr);
        } catch (error) {
            OBJ('LogMgr').error(error);
        }
    }


    /*
        @func    推送赔率更改
    */
    function pushOdds(type,id,values,res){
        try{
            var filter = {"id":id[0]};
            scheduleStatement.findOne(filter,findSelectList,function(error,docs){
                if(error){
                    OBJ('LogMgr').error(error);
                    return ;
                }
                if(null == docs){
                    return ;
                }
                var pushFlag = 0;
                var updateScheduleList = [];
                if(type == 1){
                    if(values['input_flag'] == docs['input_flag']){
                        res.send({
                            status: 200,
                            type: 'UPDATE_DATA_SUCESS',
                            message: '数据更新成功'
                        });
                        return ;
                    }else{
                        pushFlag = 1;
                    }
                }else if(type == 2){
                    pushFlag = 1;
                }
                //推送给游戏服
                var arr = {};
                arr['sceheduleId'] = id[0];
                arr['phase'] = docs['phase'];
                arr['matchName'] = docs['match_name'];
                arr['weekday'] = docs['weekday'];
                arr['officialNum'] = docs['weekday'] + docs['official_num'];
                arr['endSale'] = docs['match_date'].toLocaleString();
                arr['homeName'] = docs['home_team'];
                arr['awayName'] = docs['away_team'];
                arr['handicap'] = docs['handicap'];
                arr['hotFlag'] = docs['hot_flag'];
               
                if(type == 1){
                    arr['oddsJingcai'] = docs['odds_jingcai'];
                    arr['oddsRangqiu'] = docs['odds_rangqiu'];
                }else if(type == 2){
                    arr['oddsJingcai'] = values['odds_jingcai_admin'];
                    arr['oddsRangqiu'] = values['odds_rangqiu_admin'];
                }
                updateScheduleList.push(arr);
                //推送游戏服
                if(updateScheduleList.length >0){
                    OBJ('RpcModule').broadcastGameServer('RealFootball', 'refreshSchedule', {
                        map: updateScheduleList
                    });
                }
                //更新数据库
                updateListById(id,values,res);
            }); 
        }catch(err){
            console.log(err);
        }
    }



}

