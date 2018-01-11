module.exports = AccountController;

var AccountModule = require('../../Module/Accounts/AccountModule');
var checkSign  = require('../Sign').checkSign;
var signValue = require('../../../config').adminSvrConfig()['sign'];;

/*  
    游戏配置controller类
 */
function AccountController(){
	accountModule =	new AccountModule();
}


AccountController.accountlist=function(req,res,next){
        var user_name = req.query.user_name;
        try{
            //校验sign
            var sign ="Accounts"+signValue+req.query.page;
            if(!checkSign(sign,req.query.sign)){
                res.send({
                    status:2,
                    type: 'ERROR_SIGN',
                    message: 'sign错误',
                })
                return 
            }
            //校验参数合法性
            const page = req.query.page;
            if(!page &&  !Number(page)){
                res.send({
                    status:2,
                    type: 'ERROR_PAGE',
                    message: 'page参数错误',
                })
                return 
            }
            //获取数据
            if(user_name!=""){
                accountModule.accountlistbyusername(user_name,page,res);
            }
            else
            {

                accountModule.accountslist(page,res);
            }
         
        }catch(err){
            console.log('list 获取数据失败', err);
            res.send({
                status: 1,
                type: 'GET_DATA_ERROR',
                message: '获取数据失败'
            })
        }
    }

    AccountController.accountfreeze=function(req,res,next){
        try{
            //校验sign
            var sign = 'Account'+signValue;
            if(!checkSign(sign,req.query.sign)){
                res.send({
                    status:2,
                    type: 'ERROR_SIGN',
                    message: 'sign错误',
                })
                return 
            }
            //校验参数合法性
            var fields ={};
            fields.userid = req.query.userid;
            fields.status = req.query.status;
          
            if(!fields.userid  ||  (!fields.status && !Number(fields.status)) ){
                    res.send({
                        status:2,
                        type: 'ERROR_PARAMS',
                        message: '参数错误',
                    })
                    return 
            }
        
            //更新数据
            accountModule.freezeaccount(fields,res);
        }catch(err){
            console.log('accountfreeze 更新数据失败', err);
            res.send({
                status: 1,
                type: 'UPDATE_DATA_ERROR',
                message: '更新数据失败'
            })
        }
    }


    AccountController.slewrateupdate=function(req,res,next){
        try{
            //校验sign
            var sign = 'Account'+signValue;
            if(!checkSign(sign,req.query.sign)){
                res.send({
                    status:2,
                    type: 'ERROR_SIGN',
                    message: 'sign错误',
                })
                return 
            }
            //校验参数合法性
            var fields ={};
            fields.user_id = req.query.user_id;
            fields.invented_slew_rate = req.query.invented_slew_rate;
          
          
            if(!fields.user_id && !Number(fields.user_id) || (!fields.invented_slew_rate&& !Number( feilds.invented_slew_rate ) )){
                    res.send({
                        status:2,
                        type: 'ERROR_PARAMS',
                        message: '参数错误',
                    })
                    return 
            }
        
        
            //更新数据
            accountModule.accountslewrateupdate(fields,res);
        }catch(err){
            console.log('slewrateupdate 更新数据失败', err);
            res.send({
                status: 1,
                type: 'UPDATE_DATA_ERROR',
                message: '更新数据失败'
            })
        }
    }

    