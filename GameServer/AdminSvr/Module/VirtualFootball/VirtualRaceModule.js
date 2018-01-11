module.exports =VirtualRaceModule;

var Schema = require('../../../db_structure');
var OBJ = require('../../../Utils/ObjRoot').getObj;
var config = require('../../../config').adminSvrConfig();
var Func = require('../../../Utils/Functions');

/*
    Real比赛记录管理module
 */
function VirtualRaceModule(){

    // date: String,           //期数    20171213
    // date_num: String,       //期号    20171213001
    // host_team_id: Number,   //主队ID
    // host: String,           //主队    曼联
    // host_team_goal: Number, //主队进球数
    // guest_team_id: Number,  //客队ID
    // guest: String,          //客队    曼城
    // guest_team_goal: String,//客队进球数
    // score: String,          //比分    1:0
    // all_bet: Number,         //下注金额
    // distribution: Number,   //派发金额 包含下注金额
    var limit = config.limit;
    var virtualScheduleStatement = OBJ('DbMgr').getStatement(Schema.VirtualSchedule());
    var findSelectList = {"date":1,"date_num":1,"host_team_id":1,"host":1,"host_team_goal":1,"guest_team_id":1,"guest":1,"guest_team_goal":1,"score":1,"all_bet":1,
                          "distribution":1};
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
            listOne['date'] = docs[i]['date'];
            listOne['date_num'] = docs[i]['date_num'];
            listOne['host_team_id'] = docs[i]['host_team_id'];
            listOne['host'] = docs[i]['host'];
            listOne['host_team_goal'] = docs[i]['host_team_goal'];
            listOne['guest_team_id'] = docs[i]['guest_team_id'];
            listOne['guest'] = docs[i]['guest'];
            listOne['guest_team_goal'] = docs[i]['guest_team_goal'];
            listOne['score'] = docs[i]['score'];
            listOne['all_bet'] = docs[i]['all_bet'];
            listOne['distribution'] = docs[i]['distribution'];
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
            virtualScheduleStatement.count(filter,function(error,count){
                if(!error){
                    if(count >0){
                        virtualScheduleStatement.find(filter,findSelectList,function(finderr,docs){
                            if(!finderr){
                                packages(docs,count,res);     
                            }else{
                                console.log('Module of RaceModule '+funcname +' err :'+error);
                            }
                        })
                        .skip((page-1) * limit)
                        .limit(limit)
                        //.sort({'date_num':-1});
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
        @func   查询所有记录
        @id     赛事id
     */
    this.vraceListByPage = function(page,res){
        var filter = {};
        var funcname = 'vraceListByPage';
        findList(filter,page,res,funcname);
    }


          /*
        @func   根据期数记录
        @id     赛事id
     */
    this.vraceListBydate = function(date,page,res){
        var filter = {"date":date};
        var funcname = 'vraceListBydate';
        findList(filter,page,res,funcname);
    }

          /*
        @func   根据期号记录
        @id     赛事id
     */
    this.vraceListBydatenum= function(date_num,page,res){
        eval('var tmp = /'+date_num+'/');
        var filter = {"user_name":tmp};
        var funcname = 'vraceListBydatenum';
        findList(filter,page,res,funcname);
    }
   
    // this.vraceListByTime=function(start_time,end_time,page,res){
    //     var beginStamp = Func.getStamp(begin_time);
    //     var endStamp = Func.getStamp(end_time);
    //     var begin = new Date(beginStamp);
    //     var end = new Date(endStamp+24*60*60*1000);
    //     var filter={"status":status,"match_date":{"$gte":begin,"$lt":end}};
    //     var funcname = 'getListByStatusAndTime';
    //     findList(filter,page,res,funcname); 
    // }
}