module.exports = RlRecordsController;

var RecordsModule = require('../../Module/RealFootball/RecordsModule');
//var formidable = require('formidable');
var checkSign  = require('../Sign').checkSign;
var signValue = require('../../../config').adminSvrConfig()['sign'];

/*  
    Real比赛记录管理controller类
 */
function RlRecordsController(){
	recordsModule = new RecordsModule();
}


RlRecordsController.recordslist=function(req,res,next){
	const type = req.query.type;
	//校验sign
	var sign ;
	if(req.query.type != 7){
		sign = req.query.page+signValue+req.query.type;
	}else{
		sign = req.query.out_trade_no+signValue+req.query.type;
	}
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
				const page1 = parseInt(req.query.page);
				if(!page1 &&  !Number(page1)){
					res.send({
						status:2,
						type: 'ERROR_PAGE',
						message: 'page参数错误',
					})
					return 
				}
				//获取数据
				recordsModule.recordListByPage(page1,res);
				break;
			case '2':
				//校验参数合法性 
				const user_name = req.query.user_name;
				const page2 = parseInt(req.query.page);
				if(!user_name || !page2 && !Number(page2)){
					res.send({
						status:2,
						type: 'ERROR_PHASE',
						message: 'phase参数错误',
					})
					return 
				}
				//获取数据
				recordsModule.recordListByName(user_name,page2,res);
				break;
			case '3': 
				//校验参数合法性 
				const status3 = req.query.status;
				const page3 = parseInt(req.query.page);
				if(!status3  || (!page3 && !Number(page3))){
					res.send({
						status:2,
						type: 'ERROR_STATUS_PAGE',
						message: 'status||page参数错误',
					})
					return 
				}
				//获取数据
				recordsModule.recordListByStatus(parseInt(status3),page3,res);
				break;
			case '4': 
				//校验参数合法性
				const begin_time4 = req.query.start_time;
				const end_time4 = req.query.end_time;
				const page4= parseInt(req.query.page);
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
				recordsModule.recordListBytime(begin_time4,end_time4,page4,res);
				break;
		
			case '5': 
				//校验参数合法性
				const status5 = req.query.status;
				const begin_time5 = req.query.start_time;
				const end_time5 = req.query.end_time;
				const page5 = parseInt(req.query.page);
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
				recordsModule.recordListBystatusandtime(parseInt(status5),begin_time5,end_time5,page5,res);
				break;
			case '6':
				//检验参数的合法性
				const out_trade_no6 = req.query.out_trade_no;
				const page6 = parseInt(req.query.page);
				if(!out_trade_no6 || (!page6 && !Number(page6))){
					res.send({
						status:2,
						type: 'ERROR_RECORDID_PAGE',
						message: 'out_trade_no||page参数错误',
					})
					return 
				}
				//获取数据
				recordsModule.recordListByRecordId(out_trade_no6,page6,res);
				break;
			case '7':
				//校验参数的合法性
				const out_trade_no7 = req.query.out_trade_no;
				if(!out_trade_no7){
					res.send({
						status:2,
						type:'ERROR_RECORDID',
						message:'out_trade_no参数错误',
					})
					return
				}
				//获取投注方案
				recordsModule.betPlanByRecordId(out_trade_no7,res);
				break;
			case '8':
				//校验参数的合法性
				const user_name8 = req.query.user_name;
				const status8 = req.query.status;
				const page8 = parseInt(req.query.page);
				if(!user_name8 || !status8 || !page8){
					res.send({
						status:2,
						type:'ERROR_PARAMS',
						message:'user_name || status || page参数错误',
					})
					return
				}
				//获取数据
				recordsModule.recordListByUserStatus(user_name8,parseInt(status8),page8,res);
				break;
			case '9':
				//校验参数的合法性
				const user_name9 = req.query.user_name;
				const begin_time9 = req.query.start_time;
				const end_time9 = req.query.end_time;
				const page9 = parseInt(req.query.page);
				if(!user_name9 || !begin_time9 || !end_time9 || !page9){
					res.send({
						status:2,
						type:'ERROR_PARAMS',
						message:'user_name||begin_time||end_time||page参数错误',
					})
					return
				}
				//获取数据
				recordsModule.recordListByUserTime(user_name9,begin_time9,end_time9,page9,res);
				break;
			case '10':
				//校验参数的合法性
				const user_name10 = req.query.user_name;
				const status10 = req.query.status;
				const begin_time10 = req.query.start_time;
				const end_time10 = req.query.end_time;
				const page10 = parseInt(req.query.page);
				if(!user_name10 || !status10 || !begin_time10 || !end_time10){
					res.send({
						status:2,
						type:'ERROR_PARAMS',
						message:'参数错误',
					})
					return
				}
				//获取数据
				recordsModule.recordListByall(user_name10,parseInt(status10),begin_time10,end_time10,page10,res);
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