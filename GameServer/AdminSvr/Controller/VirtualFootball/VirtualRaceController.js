module.exports = RlVirtualRaceController;

var VirtualRaceModule = require('../../Module/VirtualFootball/VirtualRaceModule');
//var formidable = require('formidable');
var checkSign  = require('../Sign').checkSign;
var signValue = require('../../../config').adminSvrConfig()['sign'];

/*  
    Real比赛记录管理controller类
 */
function RlVirtualRaceController(){
	virtualRaceModule = new VirtualRaceModule();
}


/*
	@func  获取赛事列表
*/
RlVirtualRaceController.getList = function(req,res,next){
	const type = req.query.type;
	//校验sign
	var sign ;
    sign = req.query.id+signValue+type;
	if(!checkSign(sign,req.query.sign)){
		res.send({
			status:2,
			type: 'ERROR_SIGN',
			message: 'sign错误',
		})
		return 
	}
	try{
		switch (type){
			case '1': 
				//校验参数合法性
				const page1 = req.query.page;
				if(!page1 &&  !Number(page1)){
					res.send({
						status:2,
						type: 'ERROR_PAGE',
						message: 'page参数错误',
					})
					return 
				}
				//获取数据
				virtualRaceModule.vraceListByPage(page1,res);
				break;
			case '2':
				//校验参数合法性 
				const date = req.query.date;
				const page2 = req.query.page;
				if(!date || !page2 && !Number(page2)){
					res.send({
						status:2,
						type: 'ERROR_DATE',
						message: 'date参数错误',
					})
					return 
				}
				//获取数据
				virtualRaceModule.vraceListBydate(date,page2,res);
				break;
			case '3': 
				//校验参数合法性 
				const date_num = req.query.date_num;
				const page3 = req.query.page;
				if(!date_num  || (!page3 && !Number(page3))){
					res.send({
						status:2,
						type: 'ERROR_DATE_NUM_PAGE',
						message: 'date_num||page参数错误',
					})
					return 
				}
				//获取数据
				virtualRaceModule.vraceListBydatenum(date_num,page3,res);
				break;
		
			default: 
				res.json({
					status:2,
					type: 'ERROR_QUERY_TYPE',
					message: '参数错误',
				})
				return
		}
	}catch(err){
		console.log('getList 获取数据失败', err);
		res.send({
			status: 1,
			type: 'GET_DATA_ERROR',
			message: '获取数据失败'
		})
	}
}


