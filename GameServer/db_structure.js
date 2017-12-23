//游戏服列表
exports.GameServerInfos = function(){
    return {
        'name':'gameserverinfo',
        'schema':{
            serverid: String,
            ip: String,           //ip                
            port: Number,         //端口                           
            onLineNum: Number,    //当前在线数         
            updateTime: Date,
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
exports.User = function(){              //用户表
    return {
        'name':'user',
        'schema':{
            userid: {                   //用户ID
                type: Number,
                index: true,
            },
            username: {                 //用户账号
                type: String,
                index: true,
            },
            lastLoginDate: Date,        //最后登录时间
            lastLoginIp: String,        //最后登录IP
            loginCount: Number,         //登录次数
            status: Number,             //状态 0启用，1不启用
            inventedProfitrate: Number, //虚拟长盈利率
            inventedSlewRate: Number,   //虚拟长杀率
        }
    };
};

//竞彩足球记录表(真实比赛)
exports.LogRealBet = function(){    
    return {
        'name':'logrealbet',
        'schema':{
            userid: {               //用户ID
                type: Number,
                index: true,
            },
            username: {             //用户账号
                type: String,
                index: true,
            },
            betDate: Date,          //下注时间
            betNum: Number,         //注数
            multiple: Number,       //倍数
            betCoin: Number,        //下注金额
            distributeCoin: Number, //派发金额
            beforeBetCoin: Number,  //下注前金额
            status: Number,         //状态 0未开奖 1不中 2中
            balanceScheduleId: {    //结算场次，如果是单场下注，则这个值就是这场比赛的id，如果是二串一或三串一，则这个值就是最后一场的id
                type: Number,
                index: true,
            },
            betPlan: String         //投注方案,格式为{'scheduleIds':[11,12,13,14],'area':[0,1,1,2]} //0主胜 1平 2客胜（有几个场次就是几串1）
        }
    };
};

//虚拟足球开奖记录
exports.VirtualSchedule = function(){    
    return {
        'name':'virtualschedule',
        'schema':{
            date: String,           //期数    20171213
            dateNum: String,        //期号    20171213001
            host: String,           //主队    曼联
            guest: String,          //客队    曼城
            score: String,          //比分    1:0
            allBet: Number,         //下注金额
            distribution: Number,   //派发金额 包含下注金额
        }
    };
};

//虚拟足球全部竞猜记录
exports.LogVirtualBet = function(){
    return {
        'name':'logvirtualbet',
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
            }
        }
    };
};

//虚拟足球时间配置
exports.ConfVirtualEvent = function(){
    return {
        'name':'confvirtualevent',
        'schema':{
            event : String,                 //事件
            hostBallHandling : Number,      //主队控球
            hostAttack: Number,             //主队进攻
            hostDangerousAttack: Number,    //主队危险进攻
            guestBallHandling : Number,     //客队控球
            guestAttack: Number,            //客队进攻
            guestDangerousAttack: Number,   //客队危险进攻
            AnimationTime: Number,          //动画事件（秒）
            blockade: Number,               //伴随封盘动画
        }
    }
};

//危险进攻动画时间最大值
exports.ConfDangerousAttackTime = function(){
    return {
        'name':'confdangerousattacktime',
        'schema':{
            maxTime: Number,                //动画最大时间
        }
    }
};

//虚拟足球赔率配置
exports.ConfVirtualOdds = function(){
    return {
        'name':'confvirtualodds',
        'schema':{
            bothSides: String,      //上下、上中/中下等
            sidesDValue: Number,    //上2，中1，下0；上下=（2-0=2）上中=（2-1=1）这里的值就是填差值
            hostWin: Number,        //主胜
            drawn: Number,          //平
            guestWin: Number,       //客胜
            hostGoal: Number,       //主队进球
            zero: Number,           //无进球
            guestGoal: Number,      //客队进球
        }
    }
};

//进球数配置
exports.ConfVirtualGoal = function(){
    return {
        'name':'confvirtualgoal',
        'schema':{
            allGoalNum: Number,     //总进球数
            chance: Number,         //总进球数概率
        }
    }
};

//库存配置
exports.ConfStock = function(){
    return {
        'name':'confstock',
        'schema':{
            curStock: Number,           //当前库存
            stockInitialValue: Number,  //库存初始值
            cheatChance1: Number,       //作弊概率1
            stockThreshold1: Number,    //作弊阀值1
            cheatChance2: Number,       //作弊概率2
            stockThreshold2: Number,    //作弊阀值2
            cheatChance3: Number,       //作弊概率3
        }
    }
}