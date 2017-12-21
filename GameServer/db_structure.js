//游戏服列表
exports.GameServerInfos = function(){
    return {
        'name':'gameserverinfo',
        'schema':{
            ip: {           //ip
                type: String,
                required: true,
                default:'127.0.0.1'
            },                 
            port: {         //端口
                type: Number,
                required: true,
                default:0
            },                           
            onLineNum: {    //当前在线数
                type:Number,
                required: true,
                default: 0
            },          
            createTime: {
                type: Date,
                required: true,
                default: Date.now
            }
        }
    };
};

//赛事
exports.Schedule = function(){
    return {
        'name':'schedule',
        'schema':{
            id:Number,                   //赛事标识
            match_num:String,            //场次
            phase:Number,                //期号
            official_date:Date,          //正式时间
            official_num:String,                    
            create_at:Date,              //创建时间
            time_endsale:Date,           //停在时间
            match_name:String,           //赛事名
            match_date:Date,             //比赛时间
            home_team:String,            //主队名称
            away_team:String,            //客队名称
            first_half:String,           //半场比分
            final_score:String,          //全场比分
            status:Number,               //状态
            fx_id:Number,
            priority:String,
            ext:String,
            handicap:String,             //让球
            weekday:String,              //星期
            odds_dateline:Date,
            score_dateline:Date,
        }

    };
};

//赔率-欧赔
exports.Odds = function(){
    return{
        'name':'odds',
        'schema':{
            id:Number,                    //赛事标识
            odds_jingcai:Array,           //竞彩官方        
            odds_avg:Array,               //平均欧赔
            odds_wlxe:Array,              //威廉希尔 
            odds_aomen:Array,             //澳门
            odds_libo:Array,              //立博
            odds_bet365:Array,            //bet365
            odds_bwin:Array,              //bwin
            odds_weide:Array,             //伟德
            odds_hg:Array,                //皇冠
            odds_ysb:Array,               //易胜博
            odds_coral:Array,             //Coral
            odds_12bet:Array,             //12Bet(12博)
        }
    };
};

//赔率-亚盘
exports.Yapan = function(){
    return {
        'name':'yapan',
        'schema':{
            id:Number,                    //赛事标识
            odds_yapan:Array,             //澳门
            odds_yapan_bet365:Array,      //bet365
            odds_yapan_hg:Array,          //皇冠
            odds_yapan_ysb:Array,         //易胜博
            odds_yapan_weide:Array,       //伟德
        }
    };
};
//赔率-让球
exports.Rangqiu = function(){
    return {
        'name':'rangqiu',
        'schema':{
            id:Number,                    //赛事标识
            odds_rangqiu:Array,           //竞彩官方
            odds_rangqiu_wlxe:Array,      //威廉希尔
            odds_rangqiu_libo:Array,      //立博
            odds_rangqiu_bet365:Array,    //bet365
        }
    };
};