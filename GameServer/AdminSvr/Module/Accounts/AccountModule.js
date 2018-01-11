module.exports =AccounteModule;

var Schema = require('../../../db_structure');
var OBJ = require('../../../Utils/ObjRoot').getObj;
var config = require('../../../config').adminSvrConfig();
var Func = require('../../../Utils/Functions');

/*
    Real比赛记录管理module
 */
function AccounteModule(){
    // 'schema':{
    //     user_id: {                   //用户ID
    //         type: Number,
    //         index: true,
    //     },
    //     user_name: {                 //用户账号
    //         type: String,
    //         index: true,
    //     },
    //     last_login_date: Date,        //最后登录时间
    //     last_login_ip: String,        //最后登录IP
    //     login_count: Number,         //登录次数
    //     status: Number,             //状态 0启用，1不启用
    //     invented_profitrate: Number, //虚拟场盈利率
    //     invented_slew_rate: Number,   //虚拟场杀率
    // }
    var limit = config.limit;
    var AccountStatement = OBJ('DbMgr').getStatement(Schema.User());
    var findSelectList = {"user_id":1,"user_name":1,"last_login_date":1,"last_login_ip":1,"login_count":1,"status":1,"invented_profitrate":1,"invented_slew_rate":1};
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
            listOne['user_id'] = docs[i]['user_id'];
            listOne['user_name'] = docs[i]['user_name'];
            listOne['last_login_date'] = docs[i]['last_login_date'].toLocaleString();
            listOne['last_login_ip'] = docs[i]['last_login_ip']
            listOne['login_count'] = docs[i]['login_count'];
            listOne['status'] = docs[i]['status'];
            listOne['invented_profitrate'] = docs[i]['invented_profitrate'];
            listOne['invented_slew_rate'] = docs[i]['invented_slew_rate'];
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
            AccountStatement.count(filter,function(error,count){
                if(!error){
                    if(count >0){
                        AccountStatement.find(filter,findSelectList,function(finderr,docs){
                            if(!finderr){
                                packages(docs,count,res);     
                            }else{
                                console.log('Module of RaceModule '+funcname +' err :'+error);
                            }
                        })
                        .skip((page-1) * limit)
                        .limit(limit)
                        .sort({'user_id':-1});
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

    this.accountslist=function(page,res){
        var filter = {};
        var funcname = 'accountslist';
        findList(filter,page,res,funcname);
    }

    this.accountlistbyusername=function(user_name,page,res){
        eval('var tmp = /'+user_name+'/');
        var filter = {"user_name":tmp};
        var funcname = 'accountlistbyusername';
        findList(filter,page,res,funcname);
    }

this.accountslewrateupdate= function (fields,res)
    {
            var condition = {"user_id":fields.user_id};
            var values = {"invented_slew_rate":fields.invented_slew_rate};
        try{
            AccountStatement.findOneAndUpdate(condition,{$set:values},function(error,docs){
                if(!error){
                    res.send({
                        status: 200,
                        type: 'UPDATE_DATA_SUCESS',
                        message: '更新成功'
                    });
                }else{
                    console.log('Module of RaceModule slewrateupdate err :'+error);
                }
            });
        }catch(err){
            console.log('更新失败', err);
            res.send({
                status: 1,
                type: 'UPDATE_DATA_ERROR',
                message: '更新失败'
            });
        }
    }
/*
        @func        通过USERID 解冻/冻结账号
        @values       待更新的值   
     */
    this.freezeaccount=function(fields,res){
        var id = [];
        var values = {};
        var str =  fields.userid.split(",");
        for(var i = 0 ;i<str.length;i++){
            id.push(parseInt(str[i]));
        }
        var values = {"status":fields.status};
        updateListById(id,values,res);
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
                AccountStatement.findOneAndUpdate({user_id:Id[i]},{$set:values},function(error,docs){
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


}