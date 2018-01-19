module.exports =RecordsModule;

var LogRealBetSchema = require('../../../db_structure').LogRealBet();
var OBJ = require('../../../Utils/ObjRoot').getObj;
var config = require('../../../config').adminSvrConfig();
var Func = require('../../../Utils/Functions');

/*
    Real比赛记录管理module
 */
function RecordsModule(){
    //定义变量
    // 'schema':{
    //     out_trade_no: {         //投注记录id
    //         type: String,
    //         unique: true,
    //     },
    //     user_id: {               //用户ID
    //         type: Number,
    //         index: true,
    //     },
    //     user_name: {             //用户账号
    //         type: String,
    //         index: true,
    //     },
    //     bet_scheduleid:String,   //投注赛事id列表
    //     bet_date: Date,          //下注时间
    //     bet_num: Number,         //注数
    //     multiple: Number,       //倍数
    //     bet_type: Number,       //投注类型   
    //     jingcai_type:Number,     //竞猜类型  1胜平负  2让球胜平负 3混合过关
    //     bet_coin: Number,        //下注金额
    //     distribute_coin: Number, //派发金额
    //     before_bet_coin: Number,  //下注前金额
    //     status: Number,         //状态 0未开奖 1不中 2中 3结算失败
    //     bet_plan: String         //投注方案,

    var limit = config.limit;
    var logRealBetStatement = OBJ('DbMgr').getStatement(LogRealBetSchema);
    var findSelectList = {"_id":0,"out_trade_no":1,"user_id":1,"user_name":1,"bet_scheduleid":1,"bet_date":1,"bet_num":1,"multiple":1,"bet_type":1,
                          "jingcai_type":1,"bet_coin":1,"distribute_coin":1,"before_bet_coin":1,"status":1,"bet_plan":1};
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
            listOne['bet_scheduleid'] = docs[i]['bet_scheduleid'];
            listOne['out_trade_no'] = docs[i]['out_trade_no'];
            listOne['user_id'] = docs[i]['user_id'];
            listOne['user_name'] = docs[i]['user_name'];
            listOne['bet_date'] = docs[i]['bet_date'].toLocaleString();
            listOne['bet_num'] = docs[i]['bet_num'];
            listOne['multiple'] = docs[i]['multiple'];
            listOne['bet_type'] = docs[i]['bet_type'];
            listOne['jingcai_type'] = docs[i]['jingcai_type'];
            listOne['odds_jingcai'] = docs[i]['odds_jingcai'];
            listOne['bet_coin'] = docs[i]['bet_coin'];
            listOne['distribute_coin'] = docs[i]['distribute_coin'];
            listOne['before_bet_coin'] = docs[i]['before_bet_coin'];
            listOne['status'] = docs[i]['status'];
            listOne['bet_plan'] = docs[i]['bet_plan'];
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
                        logRealBetStatement.find(filter,findSelectList,function(finderr,docs){
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
}