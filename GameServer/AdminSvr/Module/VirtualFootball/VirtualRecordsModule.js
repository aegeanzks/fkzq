module.exports =VirtualRecordsModule;

var Schema = require('../../../db_structure');
var OBJ = require('../../../Utils/ObjRoot').getObj;
var config = require('../../../config').adminSvrConfig();
var Func = require('../../../Utils/Functions');

/*
    Real比赛记录管理module
 */
function VirtualRecordsModule(){
    var limit = config.limit;
    var logVirtualBetStatement = OBJ('DbMgr').getStatement(Schema.LogVirtualBet());
    var findSelectList = {"user_name":1,"bet_date":1,"bet_coin":1,"bet_times":1,"bet_distribute_coin":1,
                          "bet_area":1,"distribute_coin":1,"before_bet_coin":1,"status":1,"balance_schedule_id":1};
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
            listOne['user_name'] = docs[i]['user_name'];
            listOne['bet_date'] = docs[i]['bet_date'].toLocaleString();
            listOne['bet_coin'] = docs[i]['bet_coin'];
            listOne['bet_times'] = docs[i]['bet_times'];
            listOne['bet_distribute_coin'] = docs[i]['bet_distribute_coin'];
            listOne['bet_area'] = docs[i]['bet_area'];
            listOne['distribute_coin'] = docs[i]['distribute_coin'];
            listOne['before_bet_coin'] = docs[i]['before_bet_coin'];
            listOne['status'] = docs[i]['status'];
            listOne['balance_schedule_id'] = docs[i]['balance_schedule_id'];
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
            logVirtualBetStatement.count(filter,function(error,count){
                if(!error){
                    if(count >0){
                        logVirtualBetStatement.find(filter,findSelectList,function(finderr,docs){
                            if(!finderr){
                                packages(docs,count,res);     
                            }else{
                                console.log('Module of RaceModule '+funcname +' err :'+error);
                            }
                        })
                        .skip((page-1) * limit)
                        .limit(limit)
                        .sort({'match_num':-1});
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
        @func   根据赛事记录
        @id     赛事id
     */
    this.vrecordListByPage = function(page,res){
        var filter = {};
        var funcname = 'recordListByPage';
        findList(filter,page,res,funcname);
    }


          /*
        @func   根据用户名记录
        @id     赛事id
     */
    this.vrecordListByName = function(user_name,page,res){
        eval('var tmp = /'+user_name+'/');
        var filter = {"user_name":tmp};
        var funcname = 'vrecordListByName';
        findList(filter,page,res,funcname);
    }
          /*
        @func   根据期号记录
        @id     赛事id
     */
    this.vrecordListBydatanum = function(balance_schedule_id,page,res){
        eval('var tmp = /'+balance_schedule_id+'/');
        var filter = {"balance_schedule_id":tmp};
        var funcname = 'vrecordListBydatanum';
        findList(filter,page,res,funcname);
    }

          /*
        @func   根据状态记录
        @id     赛事id
     */
    this.vrecordListByStatus= function(status,page,res){
        var filter = {"status":status};
        var funcname = 'vrecordListByStatus';
        findList(filter,page,res,funcname);
    }
    /*
        @func   根据时间记录
        @id     赛事id
     */
    this.vrecordListBytime= function(begin_time,end_time,page,res){
        var beginStamp = Func.getStamp(begin_time);
        var endStamp = Func.getStamp(end_time);
        var begin = new Date(beginStamp);
        var end = new Date(endStamp+24*60*60*1000);
        var filter={"bet_date":{"$gte":begin,"$lt":end}};
        var funcname = 'vrecordListBytime';
        findList(filter,page,res,funcname); 
    }

      /*
        @func   根据状态时间记录
        @id     赛事id
     */
    this.vrecordListBystatusandtime= function(status,begin_time,end_time,page,res){
        var beginStamp = Func.getStamp(begin_time);
        var endStamp = Func.getStamp(end_time);
        var begin = new Date(beginStamp);
        var end = new Date(endStamp+24*60*60*1000);
        var filter={"status":status,"bet_date":{"$gte":begin,"$lt":end}};
        var funcname = 'vrecordListBystatusandtime';
        findList(filter,page,res,funcname); 
    }

      /*
        @func   根据账号时间记录
        @id     赛事id
     */
    this.vrecordListBynameandtime= function(user_name,begin_time,end_time,page,res){
        eval('var tmp = /'+user_name+'/');
        var beginStamp = Func.getStamp(begin_time);
        var endStamp = Func.getStamp(end_time);
        var begin = new Date(beginStamp);
        var end = new Date(endStamp+24*60*60*1000);
        var filter={"user_name":tmp,"bet_date":{"$gte":begin,"$lt":end}};
        var funcname = 'vrecordListByusernameandtime';
        findList(filter,page,res,funcname); 
    }
      /*
        @func   根据期号时间记录
        @id     赛事id
     */
    this.vrecordListBydatenumandtime= function(balance_schedule_id,begin_time,end_time,page,res){
        var beginStamp = Func.getStamp(begin_time);
        var endStamp = Func.getStamp(end_time);
        var begin = new Date(beginStamp);
        var end = new Date(endStamp+24*60*60*1000);
        var filter={"balance_schedule_id":balance_schedule_id,"bet_date":{"$gte":begin,"$lt":end}};
        var funcname = 'vrecordListByusernameandtime';
        findList(filter,page,res,funcname); 
    }
    
          /*
        @func   根据期号状态时间记录
        @id     赛事id
     */
    this.vrecordListBydatenumtimestaus= function(balance_schedule_id,status,begin_time,end_time,page,res){
        eval('var tmp = /'+balance_schedule_id+'/');
        var beginStamp = Func.getStamp(begin_time);
        var endStamp = Func.getStamp(end_time);
        var begin = new Date(beginStamp);
        var end = new Date(endStamp+24*60*60*1000);
        var filter={"balance_schedule_id":tmp,"status":status,"bet_date":{"$gte":begin,"$lt":end}};
        var funcname = 'vrecordListByusertimestaus';
        findList(filter,page,res,funcname); 
    }

        
          /*
        @func   根据账号状态时间记录
        @id     赛事id
     */
    this.vrecordListByusertimestaus= function(user_name,status,begin_time,end_time,page,res){
        eval('var tmp = /'+user_name+'/');
        var beginStamp = Func.getStamp(begin_time);
        var endStamp = Func.getStamp(end_time);
        var begin = new Date(beginStamp);
        var end = new Date(endStamp+24*60*60*1000);
        var filter={"user_name":tmp,"status":status,"bet_date":{"$gte":begin,"$lt":end}};
        var funcname = 'vrecordListByusertimestaus';
        findList(filter,page,res,funcname); 
    }
}