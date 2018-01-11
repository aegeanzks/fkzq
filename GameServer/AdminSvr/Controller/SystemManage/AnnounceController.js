module.exports = AnnounceController;

var AnnounceModule = require('../../Module/SystemManage/AnnounceModule');
var checkSign  = require('../Sign').checkSign;
var signValue = require('../../../config').adminSvrConfig()['sign'];;

/*  
    游戏配置controller类
 */
function AnnounceController(){
	announceModule =	new AnnounceModule();
}


/*
    @func  获取游戏列表库存值
 */
AnnounceController.getlist = function(req,res,next){
    try{
        //校验sign
        var sign ="Announce"+signValue+req.query.page;
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
		announceModule.announcelist(page,res);
    }catch(err){
        console.log('list 获取数据失败', err);
		res.send({
			status: 1,
			type: 'GET_DATA_ERROR',
			message: '获取数据失败'
		})
    }
}

/*
    @func  获取赔率记录
 */
AnnounceController.info = function(req,res,next){
    try{
        //校验sign
        var sign = "Announce"+signValue;
        if(!checkSign(sign,req.query.sign)){
            res.send({
                status:2,
                type: 'ERROR_SIGN',
                message: 'sign错误',
            })
            return 
        }
        //校验参数合法性
        const a_id = req.query.a_id;
        if(!a_id &&  !Number(a_id)){
            res.send({
                status:2,
                type: 'ERROR_ID',
                message: 'id参数错误',
            })
            return 
        }
        //获取数据
		announceModule.announceiteminfo(a_id,res);
    }catch(err){
        console.log('info 获取数据失败', err);
		res.send({
			status: 1,
			type: 'GET_DATA_ERROR',
			message: '获取数据失败'
		})
    }
}



/*
@func  添加赔率记录
*/
AnnounceController.addinfo = function(req,res,next){
try{
    //校验sign
    var sign = 'Announce'+signValue;
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
  fields.content = req.query.content;
  fields.type = req.query.type;
 // fields.createtime= time(); 
  fields.starttime = req.query.starttime;
  fields.endtime = req.query.endtime;
  if(!fields.content || !fields.type || !fields.starttime || !fields.endtime ){
          res.send({
              status:2,
              type: 'ERROR_PARAMS',
              message: '参数错误',
          })
          return 
  }
  //更新数据
  announceModule.addinfo(fields,res);
}catch(err){
  console.log('addinfo 添加数据失败', err);
  res.send({
      status: 1,
      type: 'ADD_DATA_ERROR',
      message: '添加更新数据失败'
  })
}
}

/*
@func 更新游戏库存信息
*/
AnnounceController.delinfo = function(req,res,next){
try{
    //校验sign
    var sign = req.query.a_id+signValue;
    if(!checkSign(sign,req.query.sign)){
        res.send({
            status:2,
            type: 'ERROR_SIGN',
            message: 'sign错误',
        })
        return 
    }

    if(!req.query.a_id &&  !Number(req.query.a_id)){
            res.send({
                status:2,
                type: 'ERROR_PARAMS',
                message: '参数错误',
            })
            return 
    }


    //更新数据
    announceModule.delinfobyId(parseInt(req.query.a_id),res);
}catch(err){
    console.log('delinfobyId 删除数据失败', err);
    res.send({
        status: 1,
        type: 'DEL_DATA_ERROR',
        message: '更新数据失败'
    })
}
}


/*
@func 更新游戏库存信息
*/
AnnounceController.updateinfo = function(req,res,next){
try{
    //校验sign
    var sign = 'Announce'+signValue;
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
    fields.a_id = req.query.a_id;
    fields.content = req.query.content;
    fields.type = req.query.type;
    fields.starttime = req.query.starttime;
    fields.endtime = req.query.endtime;
  
    if(!fields.a_id && !Number(fields.a_id) || !fields.content|| (!fields.type && !Number(fields.type)) || !fields.starttime 
        || !fields.endtime ){
            res.send({
                status:2,
                type: 'ERROR_PARAMS',
                message: '参数错误',
            })
            return 
    }


    //更新数据
    announceModule.updateinfo(fields,res);
}catch(err){
    console.log('updateinfo 更新数据失败', err);
    res.send({
        status: 1,
        type: 'UPDATE_DATA_ERROR',
        message: '更新数据失败'
    })
}
}
