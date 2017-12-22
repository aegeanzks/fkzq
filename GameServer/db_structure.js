//游戏服列表
exports.GameServerInfos = function(){
    return {
        'name':'gameserverinfo',
        'schema':{
            serverid: {
                type: String,
                required: true,
                index: true
            },
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
                //required: true,
                //default: 0
            },          
            updateTime: {
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
//用户
exports.User = function(){      //用户表
    return {
        'name':'user',
        'schema':{
            userid: {           //用户ID
                type: Number,
                required: true,
                default:0,
                unique: true,
                index: true,
            },
            username: {         //用户账号
                type: String,
                required: true,
                default: '',
                unique: true,
                index: true,
            },
            lastLoginDate: {    //最后登录时间
                type: Date,
                default: Date.now,
            },
            lastLoginIp: {      //最后登录IP
                type: String,
                default: '',
            },
            loginCount: {       //登录次数
                type: Number,
                default: 0,
            },
            status: {           //状态 0启用，1不启用
                type: Number,
                default: 0,
            },
            inventedProfitrate: {       //虚拟长盈利率
                type: Number,
                default: 0,
            },
            inventedSlewRate: {         //虚拟长杀率
                type: Number,
                default: 0,
            }
        }
    };
};

//竞彩足球记录表(真实比赛)
exports.logRealBet = function(){    
    return {
        'name':'logRealBet',
        'schema':{
            userid: {           //用户ID
                type: Number,
                required: true,
                default:0,
                index: true,
            },
            username: {         //用户账号
                type: String,
                required: true,
                default: '',
                index: true,
            },
            betDate: {          //下注时间
                type: Date,
                default: Date.now,
                index: true,
            },
            betNum: {           //注数
                type: Number,
                default: 0,
            },
            multiple: {         //倍数
                type: Number,
                default: 1,
            },
            betCoin: {          //下注金额
                type: Number,
                default: 0,
            },
            distributeCoin: {   //派发金额
                type: Number,
                default: 0,
            },
            beforeBetCoin: {    //下注前金额
                type: Number,
                default: 0,
            },
            status: {           //状态 0未开奖 1不中 2中
                type: Number,
                default: 0,
                index: true,     
            },
            balanceScheduleId: {    //结算场次，如果是单场下注，则这个值就是这场比赛的id，如果是二串一或三串一，则这个值就是最后一场的id
                type: Number,
                default: 0,
                index: true,
            },
            betPlan: {      //投注方案,格式为{'scheduleIds':[11,12,13,14],'area':[0,1,1,2]} //0主胜 1平 2客胜（有几个场次就是几串1）
                type: String,
                default: '',    
            }
        }
    };
};

//虚拟足球开奖记录
exports.logVirtualResult = function(){    
    return {
        'name':'logVirtualResult',
        'schema':{
            date: String,       //期数    20171213
            dateNum: String,    //期号    20171213001
            host: String,       //主队    曼联
            guest: String,      //客队    曼城
            score: String,      //比分    1:0
            allBet: Number,     //下注金额
            distribution: Number,//派发金额 包含下注金额
        }
    };
};