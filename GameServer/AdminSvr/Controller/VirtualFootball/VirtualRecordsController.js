
module.exports = RlVirtualRecordsController;

var VirtualRecordsModule = require('../../Module/VirtualFootball/VirtualRaceModule');
//var formidable = require('formidable');
var checkSign  = require('../Sign').checkSign;
var signValue = require('../../../config').adminSvrConfig()['sign'];

/*  
    Real比赛记录管理controller类
 */
function RlVirtualRecordsController(){
	VRecordsModule = new VirtualRecordsModule();
}


RlVirtualRecordsController.recordslist=function(req,res,next){
	const type = req.query.type;
	//校验sign
	var sign ;
    sign = req.query.page+signValue+req.query.type;
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
				VRecordsModule.vrecordListByPage(page1,res);
				break;
			case '2':
				//校验参数合法性 
				const user_name = req.query.user_name;
				const page2 = req.query.page;
				if(!user_name && !Number(phase) || !page2 && !Number(page2)){
					res.send({
						status:2,
						type: 'ERROR_PHASE',
						message: 'phase参数错误',
					})
					return 
				}
				//获取数据
				recordsModule.vrecordListByName(user_name,page2,res);
				break;
			case '3': 
				//校验参数合法性 
				const status3 = req.query.status;
				const page3 = req.query.page;
				if(!status3  || (!page3 && !Number(page3))){
					res.send({
						status:2,
						type: 'ERROR_STATUS_PAGE',
						message: 'status||page参数错误',
					})
					return 
				}
				//获取数据
				recordsModule.vrecordListByStatus(status3,page3,res);
				break;
			case '4': 
				//校验参数合法性
				const begin_time4 = req.query.begin_time;
				const end_time4 = req.query.end_time;
				const page4= req.query.page;
				if(!begin_time4 && !Number(begin_time4) || (!end_time4 && !Number(end_time4))
					|| (!page4 && !Number(page4))){
					res.send({
						status:2,
						type: 'ERROR_BEGINTIME_ENDTIME_PAGE',
						message: 'begin_time||end_time||page参数错误',
					})
					return 
				}
				//获取数据
				recordsModule.vrecordListBytime(begin_time4,end_time4,page4,res);
				break;
		
			case '5': 
				//校验参数合法性
				const status5 = req.query.status;
				const begin_time5 = req.query.begin_time;
				const end_time5 = req.query.end_time;
				const page5 = req.query.page;
				if(!status5 ||(!begin_time5 && !Number(begin_time5)) 
					|| (!end_time5 && !Number(end_time5))|| (!page5 && !Number(page5))){
					res.send({
						status:2,
						type: 'ERROR_STATUS_BEGINTIME_ENDTIME_PAGE',
						message: 'status||begin_time||end_time||page参数错误',
					})
					return 
				}
				//获取数据
				recordsModule.vrecordListBystatusandtime(status5,begin_time5,end_time5,page5,res);
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
		console.log(' 获取数据失败', err);
		res.send({
			status: 1,
			type: 'GET_DATA_ERROR',
			message: '获取数据失败'
		})
	}
}