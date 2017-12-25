module.exports = RlRaceController;

var RlRaceModule = require('../../Module/RealFootball/RaceModule');

/*  
    Real比赛管理controller类
 */
function RlRaceController(){
	rlRaceModule =	new RlRaceModule();
}

/*
	@func  获取page页的赛事
*/
RlRaceController.getList = function(req,res,next){
	const {page} = req.query;
	try{
		let filter = {};
		if (page && Number(page)) {
			filter = {page}
		}
		const racelist = rlRaceModule.getListByPage(page);
		res.send(racelist);
	}catch(err){
		console.log('获取数据失败', err);
		res.send({
			status: 0,
			type: 'GET_DATA_ERROR',
			message: '获取数据失败'
		})
	}
}



