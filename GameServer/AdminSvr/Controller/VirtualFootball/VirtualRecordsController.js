
module.exports = RlVirtualRecordsController;

var VirtualRecordsModule = require('../../Module/VirtualFootball/VirtualRecordsModule');
//var formidable = require('formidable');
var checkSign  = require('../Sign').checkSign;
var signValue = require('../../../config').adminSvrConfig()['sign'];

/*  
    虚拟比赛记录管理controller类
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
				if(!user_name && !Number(user_name) || !page2 && !Number(page2)){
					res.send({
						status:2,
						type: 'ERROR_PHASE',
						message: 'user_name参数错误',
					})
					return 
				}
				//获取数据
				VRecordsModule.vrecordListByName(user_name,page2,res);
                break;
         case '3': 
				//校验参数合法性 
				const balance_schedule_id = req.query.balance_schedule_id;
				const page = req.query.page;
				if(!balance_schedule_id  || (!page && !Number(page))){
					res.send({
						status:2,
						type: 'ERROR_DATANUM_PAGE',
						message: 'balance_schedule_id||page参数错误',
					})
					return 
				}
				//获取数据
		       VRecordsModule.vrecordListBydatanum(balance_schedule_id,page,res);
				break;
			case '4': 
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
				VRecordsModule.vrecordListByStatus(status3,page3,res);
				break;
			case '5': 
				//校验参数合法性
				const begin_time4 = req.query.start_time;
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
				VRecordsModule.vrecordListBytime(begin_time4,end_time4,page4,res);
				break;
		
			case '6': 
				//校验参数合法性
				const status5 = req.query.status;
				const begin_time5 = req.query.start_time;
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
				VRecordsModule.vrecordListBystatusandtime(status5,begin_time5,end_time5,page5,res);
                break;
          case '7':
                //校验参数合法性
                const user_name6 = req.query.user_name;
				const begin_time6 = req.query.start_time;
				const end_time6 = req.query.end_time;
				const page6 = req.query.page;
				if(!user_name6 ||(!begin_time6 && !Number(begin_time6))|| (!end_time6 && !Number(end_time6))|| (!page6 && !Number(page6))){
					res.send({
						status:2,
						type: 'ERROR_USERNAME_BEGINTIME_ENDTIME_PAGE',
						message: 'username||begin_time||end_time||page参数错误',
					})
					return 
				}
				//获取数据
				VRecordsModule.vrecordListBynameandtime(user_name6,begin_time6,end_time6,page6,res);
                break;
        case '8': 
                //校验参数合法性
                const balance_schedule_id7 = req.query.balance_schedule_id;
				const begin_time7 = req.query.start_time;
				const end_time7 = req.query.end_time;
				const page7 = req.query.page;
				if(!balance_schedule_id7 ||(!begin_time7&& !Number(begin_time7)) 
					|| (!end_time7 && !Number(end_time7))|| (!page7 && !Number(page7))){
					res.send({
						status:2,
						type: 'ERROR_DATENUM_USERNAME_STATUS_BEGINTIME_ENDTIME_PAGE',
						message: 'balance_schedule_id||status||begin_time||end_time||page参数错误',
					})
					return 
				}
				//获取数据
				VRecordsModule.vrecordListBydatenumandtime(balance_schedule_id7,begin_time7,end_time7,page7,res);
                break;
        case '9':
                //校验参数合法性
                const user_name9= req.query.user_name;
				const status8 = req.query.status;
				const begin_time8 = req.query.start_time;
				const end_time8 = req.query.end_time;
				const page8 = parseInt(req.query.page);
				if(!user_name9 || !status8 ||(!begin_time8 && !Number(begin_time8)) || (!end_time8 && !Number(end_time8))|| (!page8 && !Number(page8))){
					res.send({
						status:2,
						type: 'ERROR_USERNAME_STATUS_BEGINTIME_ENDTIME_PAGE',
						message: 'user_name||status||begin_time||end_time||page参数错误',
					})
					return 
				}
				//获取数据
                VRecordsModule.vrecordListByusertimestaus(user_name9,parseInt(status8),begin_time8,end_time8,page8,res);
                break;
          case '10': 
                //校验参数合法性
                const balance_schedule_id10 = req.query.balance_schedule_id;
				const status9 = req.query.status9;
				const begin_time9 = req.query.start_time;
				const end_time9 = req.query.end_time;
				const page9 = req.query.page;
				if(!balance_schedule_id10|| !status9 ||(!begin_time9&& !Number(begin_time9)) 
					|| (!end_time9 && !Number(end_time9))|| (!page9 && !Number(page9))){
					res.send({
						status:2,
						type: 'ERROR_DATENUM_USERNAME_STATUS_BEGINTIME_ENDTIME_PAGE',
						message: 'balance_schedule_id||status||begin_time||end_time||page参数错误',
					})
					return 
				}
				//获取数据
				VRecordsModule.vrecordListBydatenumtimestaus(balance_schedule_id10,parseInt(status9),begin_time9,end_time9,page9,res);
				break;
			case '11':
				//校验参数合法性
				const balance_schedule_id11 = parseInt(req.query.balance_schedule_id);
				const user_name11 = req.query.user_name;
				const status11 = req.query.status;
				const begin_time11 = req.query.start_time;
				const end_time11 = req.query.end_time;
				const page11 = parseInt(req.query.page);
				if(!balance_schedule_id11|| !status11 ||(!begin_time11&& !Number(begin_time11)) 
					|| (!end_time11 && !Number(end_time11))|| (!page11 && !Number(page11))){
					res.send({
						status:2,
						type: 'ERROR_DATENUM_USERNAME_STATUS_BEGINTIME_ENDTIME_PAGE',
						message: 'balance_schedule_id||status||begin_time||end_time||page参数错误',
					})
					return 
				}
				//获取数据
				VRecordsModule.vrecordListByall(balance_schedule_id11,parseInt(status11),begin_time11,end_time11,user_name11,page11,res);
				break;
			case '12':
				//校验参数合法性
				const balance_schedule_id12 = parseInt(req.query.balance_schedule_id);
				const user_name12 = req.query.user_name;
				const page12 = parseInt(req.query.page);
				if(!balance_schedule_id12 || !user_name12|| (!page12 && !Number(page12))){
					res.send({
						status:2,
						type: 'ERROR_DATENUM_USERNAME_STATUS_BEGINTIME_ENDTIME_PAGE',
						message: 'balance_schedule_id||status||begin_time||end_time||page参数错误',
					})
					return 
				}
				//获取数据
				VRecordsModule.vrecordListByidAndUser(balance_schedule_id12,user_name12,page12,res);
				break;
			case '13':
				//校验参数合法性
				const balance_schedule_id13 = parseInt(req.query.balance_schedule_id);
				const user_name13 = req.query.user_name;
				const status13 = req.query.status;
				const page13 = parseInt(req.query.page);
				if(!balance_schedule_id13 || !user_name13|| !status13|| (!page13 && !Number(page13))){
					res.send({
						status:2,
						type: 'ERROR_DATENUM_USERNAME_STATUS_BEGINTIME_ENDTIME_PAGE',
						message: 'balance_schedule_id||status||begin_time||end_time||page参数错误',
					})
					return 
				}
				//获取数据
				VRecordsModule.vrecordListByidUserStatus(balance_schedule_id13,user_name13,parseInt(status13),page13,res);
				break;
			case '14':
				//校验参数合法性
				const user_name14 = req.query.user_name;
				const status14 = req.query.status;
				const page14 = parseInt(req.query.page);
				if(!user_name14 || !user_name14|| !status14|| (!page14 && !Number(page14))){
					res.send({
						status:2,
						type: 'ERROR_PARAMS',
						message: '参数错误',
					})
					return 
				}
				//获取数据
				VRecordsModule.vrecordListByUserStatus(user_name14,parseInt(status14),page14,res);
				break;
			case '15':
				//校验参数合法性
				const balance_schedule_id15 = parseInt(req.query.balance_schedule_id);
				const status15 = req.query.status;
				const page15 = parseInt(req.query.page);
				if(!balance_schedule_id15 || !status15|| (!page15 && !Number(page15))){
					res.send({
						status:2,
						type: 'ERROR_PARAMS',
						message: '参数错误',
					})
					return 
				}
				//获取数据
				VRecordsModule.vrecordListByidStatus(balance_schedule_id15,parseInt(status15),page15,res);
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