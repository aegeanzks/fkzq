module.exports = RlRaceController;

var RlRaceModule = require('../../Module/RealFootball/RaceModule');
var formidable = require('formidable');

/*  
    Real比赛管理controller类
 */
function RlRaceController(){
	rlRaceModule =	new RlRaceModule();
}

/*
	@func  获取赛事列表
*/
RlRaceController.getList = function(req,res,next){
	const type = req.query.type;
	try{
		switch (type){
			case '1': 
				const page1 = req.query.page;
				if(!page1 &&  !Number(page1)){
					res.send({
						status:2,
						type: 'ERROR_PAGE',
						message: 'page参数错误',
					})
					return 
				}
				rlRaceModule.getListByPage(page1,res);
				break;
			case '2': 
				const phase = req.query.phase;
				const page2 = req.query.page;
				if(!phase && !Number(phase) || !page2 && !Number(page2)){
					res.send({
						status:2,
						type: 'ERROR_PHASE',
						message: 'phase参数错误',
					})
					return 
				}
				rlRaceModule.getListByPhase(phase,page2,res);
				break;
			case '3': 
				const status3 = req.query.status;
				const page3 = req.query.page;
				if(!status3 && !Number(status3) || (!page3 && !Number(page3))){
					res.send({
						status:2,
						type: 'ERROR_STATUS_PAGE',
						message: 'status||page参数错误',
					})
					return 
				}
				rlRaceModule.getListByStatus(status3,page3,res);
				break;
			case '4': 
				const display4 = req.query.display;
				const page4 = req.query.page;
				if(!display4 && !Number(displa4y) || (!page4 && !Number(page4))){
					res.send({
						status:2,
						type: 'ERROR_DISPLAY_PAGE',
						message: 'display||page参数错误',
					})
					return 
				}
				rlRaceModule.getListByDisplay(display4,page4,res);
				break;
			case '5': 
				const begin_time5 = req.query.begin_time;
				const end_time5 = req.query.end_time;
				const page5 = req.query.page;
				if(!begin_time5 && !Number(begin_time5) || (!end_time5 && !Number(end_time5))
					|| (!page5 && !Number(page5))){
					res.send({
						status:2,
						type: 'ERROR_BEGINTIME_ENDTIME_PAGE',
						message: 'begin_time||end_time||page参数错误',
					})
					return 
				}
				rlRaceModule.getListByTime(begin_time5,end_time5,page5,res);
				break;
			case '6': 
				const status6 = req.query.status;
				const display6 = req.query.display;
				const page6 = req.query.page;
				if(!status6 && !Number(statu6s) || (!display6 && !Number(display6)) 
					|| (!page6 && !Number(page6))){
					res.send({
						status:2,
						type: 'ERROR_STATUS_DISPLAY_PAGE',
						message: 'status||display||page参数错误',
					})
					return 
				}
				rlRaceModule.getListByStatusAndDisplay(status6,display6,page6,res);
				break;
			case '7': 
				const status7 = req.query.status;
				const begin_time7 = req.query.begin_time;
				const end_time7 = req.query.end_time;
				const page7 = req.query.page;
				if(!status7 && !Number(status7) ||(!begin_time7 && !Number(begin_time7)) 
					|| (!end_time7 && !Number(end_time7))|| (!page7 && !Number(page7))){
					res.send({
						status:2,
						type: 'ERROR_STATUS_BEGINTIME_ENDTIME_PAGE',
						message: 'status||begin_time||end_time||page参数错误',
					})
					return 
				}
				rlRaceModule.getListByStatusAndTime(status7,begin_time7,end_time7,page7,res);
				break;
			case '8': 
				const display8 = req.query.display;
				const begin_time8 = req.query.begin_time;
				const end_time8 = req.query.end_time;
				const page8 = req.query.page;
				if(!display8 && !Number(display8) ||(!begin_time8 && !Number(begin_time8)) 
					|| (!end_time8 && !Number(end_time8))|| (!page8 && !Number(page8))){
					res.send({
						status:2,
						type: 'ERROR_DISPLAY_BEGINTIME_ENDTIME_PAGE',
						message: 'display||begin_time||end_time||page参数错误',
					})
					return 
				}
				rlRaceModule.getListByDisplayAndTime(display8,begin_time8,end_time8,page8,res);
				break;
			case '9': 
				const status9 = req.query.status;
				const display9 = req.query.display;
				const begin_time9 = req.query.begin_time;
				const end_time9 = req.query.end_time;
				const page9 = req.query.page;
				if(!status9 && !Number(status9) ||(!display9 && !Number(display9)) 
					|| (!begin_time9 && !Number(begin_time9)) 
					|| (!end_time9 && !Number(end_time9))|| (!page9 && !Number(page9))){
					res.send({
						status:2,
						type: 'ERROR_STATUS_DISPLAY_BEGINTIME_ENDTIME_PAGE',
						message: 'status||display||begin_time||end_time||page参数错误',
					})
					return 
				}
				rlRaceModule.getListByStatusAndDisplayAndTime(status9,display9,begin_time9,end_time9,page9,res);
				break;
			case '10':
				const id10 = req.query.id;
				if(!id10 && !Number(id10)){
					res.send({
						status:2,
						type: 'ERROR_ID',
						message: 'id参数错误',
					})
					return
				}
				rlRaceModule.getListById(id10,res);
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
		console.log('获取数据失败', err);
		res.send({
			status: 1,
			type: 'GET_DATA_ERROR',
			message: '获取数据失败'
		})
	}
}


/*
	@func  编辑赛事信息
 */
RlRaceController.updateRaceInfo = function(req,res,next){
	const form = new formidable.IncomingForm();
	form.parse(req,  function(err, fields, files){   
		if (err) {
			console.log('获取编辑赛事form出错', err);
			res.send({
				status: 2,
				type:'UPDATE_DATA_ERROR',
				message: '编辑赛事失败',
			});
			return ;
		}else{
			try{
				const type = req.query.type;
				switch(type)
				{
					case '1':
						{
							const  {id,display} = fields;
							if(!id ||!display){
								res.json({
									status:1,
									type: 'ERROR_FORM_TYPE',
									message: '表单参数错误',
								})
								return 
							}
							break;
						}
					case '2':
						{
							const {id,hot_flag} = fields;
							if(!id  || !hot_flag){
								res.json({
									status:1,
									type: 'ERROR_FORM_TYPE',
									message: '表单参数错误',
								})
								return 
							}
							break;
						}

					case '3':
						{
							const {id,home_team ,away_team , odds_jingcai , odds_rangqiu ,input_flag} = fields;
							if (!id || !Number(id) || !home_team || !away_team || !odds_jingcai || !odds_rangqiu || !input_flag ) {
								res.json({
									status:1,
									type: 'ERROR_FORM_TYPE',
									message: '表单参数错误',
								})
								return 
							}
							break;
						}
					default: 
						res.json({
							status:2,
							type: 'ERROR_QUERY_TYPE',
							message: '参数错误',
						})
						return
				}
				rlRaceModule.updateInfo(fields,type,res);
			}catch(err){
				console.log(err.message, err);
				res.send({
					status: 1,
					type: 'UPDATE_DATA_ERROR',
					message: '更新数据失败',
				})
			}
		}
	})
}


