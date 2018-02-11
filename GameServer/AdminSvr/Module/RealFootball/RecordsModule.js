module.exports =RecordsModule;

var LogRealBetSchema = require('../../../db_structure').LogRealBet();
var OBJ = require('../../../Utils/ObjRoot').getObj;
var config = require('../../../config').adminSvrConfig();
var Func = require('../../../Utils/Functions');

/*
    Real比赛记录管理module
 */
function RecordsModule(){

    var limit = config.limit;
    var logRealBetStatement = OBJ('DbMgr').getStatement(LogRealBetSchema);
    var findSelectList = {"_id":0,"out_trade_no":1,"user_id":1,"user_name":1,"bet_date":1,"bet_num":1,"multiple":1,
                          "bet_coin":1,"distribute_coin":1,"before_bet_coin":1,"status":1,"bet_items":1,"bet_types":1,"realDistrobute_coin":1};
    //end 定义变量

    /*
        @func    组包
        @count   总条数
     */
    function packages(docs,count,res){
        var len = docs.length;
        var data = [];
        var list = [];
        var header = {};
        header['status'] = 200;
        header['totalCount'] = count;
        data.push(header);

        for(var i = 0;i<len;i++){
            var listOne ={};
            listOne['out_trade_no'] = docs[i]['out_trade_no'];
            listOne['user_id'] = docs[i]['user_id'];
            listOne['user_name'] = docs[i]['user_name'];
            listOne['bet_date'] = docs[i]['bet_date'].toLocaleString();
            listOne['bet_num'] = docs[i]['bet_num'];
            listOne['multiple'] = docs[i]['multiple'];
            listOne['bet_coin'] = docs[i]['bet_coin'];
            listOne['distribute_coin'] = docs[i]['distribute_coin'];
            listOne['before_bet_coin'] = docs[i]['before_bet_coin'];
            listOne['realDistrobute_coin'] = docs[i]['realDistrobute_coin'];
            listOne['status'] = docs[i]['status'];
            list.push(listOne);
        }
        data.push(list);
        res.send(data);
    }

    /*
        @func  投注方案组包 
    */
    function packagesBetPlan(doc,res){
        var data = [];
        var list = [];
        var header = {};
        header['status'] = 200;
        header['totalCount'] = 1;
        data.push(header);

        var listOne ={};
        //投注信息
        var betInfo = '';
        var betItemsArr = [];
        listOne['bet_num'] = doc['bet_num'];
        listOne['multiple'] = doc['multiple'];
        listOne['bet_coin'] = doc['bet_coin'];
        var scheduleNum = doc['bet_items'].length;
        betInfo += scheduleNum + '场';
        for(var j=0;j<doc['bet_types'].length;j++){
            //单场
            if(1 == doc['bet_types'][j]['judged']){
                continue;
            }else if(2 == doc['bet_types'][j]['judged']){
                betInfo += ', 2串1';
            }else if(3 == doc['bet_types'][j]['judged']){
                betInfo += ', 3串1';
            }else if(4 == doc['bet_types'][j]['judged']){
                betInfo += ', 4串1';
            }

        }
        listOne['bet_info'] = betInfo;

        for(var j =0;j<doc['bet_items'].length;j++){
            var betItems = {};
            var classInfo = '';
            var raceResultInfo = '';
            var betAreaInfo = '';
            var betContentArr = [];
            betItems['phase'] = doc['bet_items'][j]['phase'];
            betItems['scheduleId'] = doc['bet_items'][j]['schedule_id'];
            betItems['official_num'] = doc['bet_items'][j]['official_num'];
            betItems['team_name'] = doc['bet_items'][j]['team_name'];
            var betClassInfo = {"wfl":0,"rangqiuwfl":0};
            var betClassResult = {"wfl":0,"rangqiuwfl":0};
            for(var k=0;k<doc['bet_items'][j]['bet_content'].length;k++){
                var betClass = doc['bet_items'][j]['bet_content'][k]['bet_class'];
                var result = doc['bet_items'][j]['bet_content'][k]['schedule_result'];
                var area = doc['bet_items'][j]['bet_content'][k]['bet_area'];
                if(1 == betClass){
                    betClassInfo['wfl'] = 1;
                    betClassResult['wfl'] = result;

                    if(area.h){
                        var str = '主胜('+doc['bet_items'][j]['odds'].h+')';
                        betAreaInfo +=str;
                    }
                    if(area.d){
                        var str = '';
                        if(betAreaInfo.length >0){
                            str = '/平('+doc['bet_items'][j]['odds'].d+')';
                        }else{
                            str = '平('+doc['bet_items'][j]['odds'].d+')';
                        }
                        betAreaInfo += str;
                    }
                    if(area.a){
                        var str = '';
                        if(betAreaInfo.length >0){
                            var str = '/主负('+doc['bet_items'][j]['odds'].a+')';
                        }else{
                            var str = '主负('+doc['bet_items'][j]['odds'].a+')';
                        }
                        betAreaInfo += str;
                    }
                }else if(2 == betClass){
                    betClassInfo['rangqiuwfl'] = 1;
                    betClassResult['rangqiuwfl'] = result;
                    if(area.h){
                        var str = '';
                        if(betAreaInfo.length >0){
                            var str = '/让球胜('+doc['bet_items'][j]['rangqiu_odds'].h+')';
                        }else{
                            var str = '让球胜('+doc['bet_items'][j]['rangqiu_odds'].h+')';
                        }
                        betAreaInfo += str;
                    }
                    if(area.d){
                        var str = '';
                        if(betAreaInfo.length >0){
                            var str = '/让球平('+doc['bet_items'][j]['rangqiu_odds'].d+')';
                        }else{
                            var str = '让球平('+doc['bet_items'][j]['rangqiu_odds'].d+')';
                        }
                        betAreaInfo += str;
                    }
                    if(area.a){
                        var str = '';
                        if(betAreaInfo.length >0){
                            var str = '/让球负('+doc['bet_items'][j]['rangqiu_odds'].a+')';
                        }else{
                            var str = '让球负('+doc['bet_items'][j]['rangqiu_odds'].a+')';
                        }
                        betAreaInfo += str;
                    }
                }
                
            }
            if(betClassInfo['wfl']){
                classInfo += '胜平负';
            }
            if(betClassInfo['rangqiuwfl']){
                if(classInfo.length !=0){
                    classInfo += '/让球胜平负';
                }else{
                    classInfo += '让球胜平负';
                }

            }
            if(betClassResult['wfl'] == -1 && betClassResult['rangqiuwfl'] == -1){
                raceResultInfo +='取消赛事';
            }else{
                if(betClassResult['wfl'] == 0 && betClassResult['rangqiuwfl'] == 0){
                    raceResultInfo +='--';
                }
                if(betClassResult['wfl'] == 1){
                    raceResultInfo +='主胜';
                }else if(betClassResult['wfl'] == 2){
                    raceResultInfo +='平';
                }else if(betClassResult['wfl'] == 3){
                    raceResultInfo +='主负';
                }
                if(betClassResult['rangqiuwfl'] == 1){
                    if(raceResultInfo.length >0){
                        raceResultInfo +='/让球胜';
                    }else{
                        raceResultInfo +='让球胜';
                    }
                    
                }else if(betClassResult['rangqiuwfl'] == 2){
                    if(raceResultInfo.length >0){
                        raceResultInfo +='/让球平';
                    }else{
                        raceResultInfo +='让球平';
                    }
                }else if(betClassResult['rangqiuwfl'] == 3){
                    if(raceResultInfo.length >0){
                        raceResultInfo +='/让球负';
                    }else{
                        raceResultInfo +='让球负';
                    }
                }
            }
            betItems['bet_class'] = classInfo;
            betItems['class_result'] = raceResultInfo;
            betItems['bet_area'] = betAreaInfo;
            
            betItemsArr.push(betItems);
        }
        listOne['bet_items'] = betItemsArr;
        list.push(listOne);

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
            logRealBetStatement.count(filter,function(error,count){
                if(!error){
                    if(count >0){
                        logRealBetStatement.find(filter,findSelectList,function(finderr,docs){
                            if(!finderr){
                                packages(docs,count,res);      
                            }else{
                                console.log('Module of RaceModule '+funcname +' err :'+error);
                            }
                        })
                        .skip((page-1) * limit)
                        .limit(limit)
                        .sort({'bet_date':-1});
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
        @func     查找数据库
        @filter   过滤条件
        @funcname 被那个函数调用
     */
    function findBetPlan(filter,res,funcname){
        try{
            logRealBetStatement.findOne(filter,findSelectList,function(error,doc){
                if(!error){
                    if(null == doc){
                        res.send({
                            status: 0,
                            type: 'GET_DATA_EMPTY',
                            message: '无相关记录'
                        })
                    }else{
                        packagesBetPlan(doc,res);
                    }
                }else{
                    console.log('Module of findBetPlan '+funcname +' find count err :'+error);   
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
        @func   根据赛事记录
        @id     赛事id
     */
    this.recordListByPage = function(page,res){
        var filter = {};
        var funcname = 'recordListByPage';
        findList(filter,page,res,funcname);
    }


          /*
        @func   根据用户名记录
        @id     赛事id
     */
    this.recordListByName = function(user_name,page,res){
        eval('var tmp = /'+user_name+'/');
        var filter = {"user_name":tmp};
        var funcname = 'recordListByName';
        findList(filter,page,res,funcname);
    }

          /*
        @func   根据状态记录
        @id     赛事id
     */
    this.recordListByStatus= function(status,page,res){
        var filter = {"status":status};
        var funcname = 'recordListByStatus';
        findList(filter,page,res,funcname);
    }
    /*
        @func   根据时间记录
        @id     赛事id
     */
    this.recordListBytime= function(begin_time,end_time,page,res){
        var beginStamp = Func.getStamp(begin_time);
        var endStamp = Func.getStamp(end_time);
        var begin = new Date(beginStamp);
        var end = new Date(endStamp+24*60*60*1000);
        var filter={"bet_date":{"$gte":begin,"$lt":end}};
        var funcname = 'recordListBytime';
        findList(filter,page,res,funcname); 
    }

    /*
        @func   根据状态时间记录
        @id     赛事id
     */
    this.recordListBystatusandtime= function(status,begin_time,end_time,page,res){
        var beginStamp = Func.getStamp(begin_time);
        var endStamp = Func.getStamp(end_time);
        var begin = new Date(beginStamp);
        var end = new Date(endStamp+24*60*60*1000);
        var filter={"status":status,"bet_date":{"$gte":begin,"$lt":end}};
        var funcname = 'recordListBytime';
        findList(filter,page,res,funcname); 
    }

    /*
        @func  根据订单id查询
        @out_trade_no 订单id
        @page  页数
     */
    this.recordListByRecordId= function(out_trade_no,page,res){
        var filter={"out_trade_no":out_trade_no};
        var funcname = 'recordListByRecordId';
        findList(filter,page,res,funcname);
    }   
    
    /*
        @func   根据订单id获取投注方案
        @out_trade_no 订单id
     */
    this.betPlanByRecordId= function(out_trade_no,res){
        var filter={"out_trade_no":out_trade_no};
        var funcname = 'betPlanByRecordId';
        findBetPlan(filter,res,funcname);
    }

    this.recordListByUserStatus=function(user_name,status,page,res){
        eval('var tmp = /'+user_name+'/');
        var filter = {"user_name":tmp,"status":status};
        var funcname = 'recordListByUserStatus';
        findList(filter,page,res,funcname);
    }

    this.recordListByUserTime=function(user_name,begin_time,end_time,page,res){
        eval('var tmp = /'+user_name+'/');
        var beginStamp = Func.getStamp(begin_time);
        var endStamp = Func.getStamp(end_time);
        var begin = new Date(beginStamp);
        var end = new Date(endStamp+24*60*60*1000);
        var filter = {"user_name":tmp,"bet_date":{"$gte":begin,"$lt":end}};
        var funcname = 'recordListByUserTime';
        findList(filter,page,res,funcname);
    }

    this.recordListByall = function(user_name,status,begin_time,end_time,page,res){
        eval('var tmp = /'+user_name+'/');
        var beginStamp = Func.getStamp(begin_time);
        var endStamp = Func.getStamp(end_time);
        var begin = new Date(beginStamp);
        var end = new Date(endStamp+24*60*60*1000);
        var filter = {"user_name":tmp,"status":status,"bet_date":{"$gte":begin,"$lt":end}};
        var funcname = 'recordListByUserTime';
        findList(filter,page,res,funcname);
    }



}