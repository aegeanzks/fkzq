module.exports =VirtualRecordsModule;

var LogVirtualBetSchema = require('../../../db_structure').LogVirtualBet;
var OBJ = require('../../../Utils/ObjRoot').getObj;
var config = require('../../../config').adminSvrConfig();
var Func = require('../../../Utils/Functions');

/*
    Real比赛记录管理module
 */
function VirtualRecordsModule(){
    // 'schema':{
    //     user_id: {           //用户ID
    //         type: Number,
    //         index: true,
    //     },
    //     user_name: {         //用户账号
    //         type: String,
    //         index: true,
    //     },
    //     bet_date: {          //下注时间
    //         type: Date,
    //         default: Date.now,
    //         index: true,
    //     },
    //     bet_coin: Number,          //下注金额
    //     bet_times: Number,			//下注时的赔率
    //     bet_distribute_coin: Number,		//将配发的金额（先计算在这边，不显示给后台）
    //     bet_area: Number,			//下注区域
    //     distribute_coin: Number,   //派发金额
    //     before_bet_coin: Number,    //下注前金额
    //     status: {           //状态 0未开奖 1不中 2中
    //         type: Number,
    //         index: true,     
    //     },
    //     balance_schedule_id: {    //结算场次，如果是单场下注，则这个值就是这场比赛的id，如果是二串一或三串一，则这个值就是最后一场的id
    //         type: String,
    //         index: true,
    //     },
    //     server_id: String,
    //     out_trade_no: {
    //         type: String,
    //         unique: true,
    //     },
    //     trade_no: String,
    //     settlement_out_trade_no:String,
    //     settlement_trade_no:String,
    //     host_team_id:Number,
    //     guest_team_id:Number
  

    var limit = config.limit;
    var logVirtualBetStatement = OBJ('DbMgr').getStatement(LogVirtualBetSchema);
    var findSelectList = {"user_name":1,"bet_date":1,"bet_coin":1,"bet_times":1,"bet_distribute_coin":1,
                          "bet_area":1,"distribute_coin":1,"before_bet_coin":1,"status":1};
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
            logRealBetStatement.count(filter,function(error,count){
                if(!error){
                    if(count >0){
                        scheduleStatement.find(filter,findSelectList,function(finderr,docs){
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
        var filter = {"user_name":user_name};
        var funcname = 'vrecordListByName';
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
        var funcname = 'vrecordListBytime';
        findList(filter,page,res,funcname); 
    }
}