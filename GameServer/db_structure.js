//游戏服列表
exports.GameServerInfos = function(){
    return {
        'name':'game_server_info',
        'schema':{
            server_id: String,
            ip: String,           //ip                
            port: Number,         //端口                           
            online_num: Number,    //当前在线数         
            update_time: Date,
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
            user_id: {                   //用户ID
                type: Number,
                index: true,
            },
            user_name: {                 //用户账号
                type: String,
                index: true,
            },
            last_login_date: Date,        //最后登录时间
            last_login_ip: String,        //最后登录IP
            login_count: Number,         //登录次数
            status: Number,             //状态 0启用，1不启用
            invented_profitrate: Number, //虚拟场盈利率
            invented_slew_rate: Number,   //虚拟场杀率
        }
    };
};

//竞彩足球记录表(真实比赛)
exports.LogRealBet = function(){    
    return {
        'name':'log_real_bet',
        'schema':{
            user_id: {               //用户ID
                type: Number,
                index: true,
            },
            user_name: {             //用户账号
                type: String,
                index: true,
            },
            bet_date: Date,          //下注时间
            bet_num: Number,         //注数
            multiple: Number,       //倍数
            bet_coin: Number,        //下注金额
            distribute_coin: Number, //派发金额
            before_bet_coin: Number,  //下注前金额
            status: Number,         //状态 0未开奖 1不中 2中
            balance_schedule_id: {    //结算场次，如果是单场下注，则这个值就是这场比赛的id，如果是二串一或三串一，则这个值就是最后一场的id
                type: Number,
                index: true,
            },
            bet_plan: String         //投注方案,格式为{'scheduleIds':[11,12,13,14],'area':[0,1,1,2]} //0主胜 1平 2客胜（有几个场次就是几串1）
        }
    };
};

//虚拟足球开奖记录
exports.VirtualSchedule = function(){    
    return {
        'name':'virtual_schedule',
        'schema':{
            date: String,           //期数    20171213
            date_num: String,       //期号    20171213001
            host: String,           //主队    曼联
            guest: String,          //客队    曼城
            score: String,          //比分    1:0
            all_bet: Number,         //下注金额
            distribution: Number,   //派发金额 包含下注金额
        }
    };
};

//虚拟足球全部竞猜记录
exports.LogVirtualBet = function(){
    return {
        'name':'log_virtual_bet',
        'schema':{
            user_id: {           //用户ID
                type: Number,
                index: true,
            },
            user_name: {         //用户账号
                type: String,
                index: true,
            },
            bet_date: {          //下注时间
                type: Date,
                default: Date.now,
                index: true,
            },
            bet_num: Number,           //注数
            multiple: Number,         //倍数
            bet_coin: Number,          //下注金额
            distribute_coin: Number,   //派发金额
            before_bet_coin: Number,    //下注前金额
            status: {           //状态 0未开奖 1不中 2中
                type: Number,
                index: true,     
            },
            balance_schedule_id: {    //结算场次，如果是单场下注，则这个值就是这场比赛的id，如果是二串一或三串一，则这个值就是最后一场的id
                type: Number,
                index: true,
            }
        }
    };
};

//虚拟足球时间配置
exports.ConfVirtualEvent = function(){
    return {
        'name':'conf_virtual_event',
        'schema':{
            event_id : Number,              //事件ID
            event_name : String,                 //事件
            host_ball_handling : Number,      //主队控球
            host_attack: Number,             //主队进攻
            host_dangerous_attack: Number,    //主队危险进攻
            guest_ball_handling : Number,     //客队控球
            guest_attack: Number,            //客队进攻
            guest_dangerous_attack: Number,   //客队危险进攻
            animation_time: Number,          //动画事件（秒）
            blockade: Number,               //伴随封盘动画
        }
    };
};

//危险进攻动画时间最大值
exports.ConfDangerousAttackTime = function(){
    return {
        'name':'conf_dangerous_attack_time',
        'schema':{
            max_time: Number,                //动画最大时间
        }
    }
};

//虚拟足球赔率配置
exports.ConfVirtualOdds = function(){
    return {
        'name':'conf_virtual_odds',
        'schema':{
            both_sides: String,      //上下、上中/中下等
            sides_dvalue: Number,    //上2，中1，下0；上下=（2-0=2）上中=（2-1=1）这里的值就是填差值
            host_win: Number,        //主胜
            drawn: Number,          //平
            guest_win: Number,       //客胜
            host_goal: Number,       //主队进球
            zero: Number,           //无进球
            guest_goal: Number,      //客队进球
        }
    }
};

//进球数配置
exports.ConfVirtualGoal = function(){
    return {
        'name':'conf_virtual_goal',
        'schema':{
            all_goal_num: Number,     //总进球数
            chance: Number,         //总进球数概率
        }
    }
};

//库存配置
exports.ConfStock = function(){
    return {
        'name':'conf_stock',
        'schema':{
            cur_stock: Number,           //当前库存
            stock_initial_value: Number,  //库存初始值
            cheat_chance_1: Number,       //作弊概率1
            stock_threshold_1: Number,    //作弊阀值1
            cheat_chance_2: Number,       //作弊概率2
            stock_threshold_2: Number,    //作弊阀值2
            cheat_chance_3: Number,       //作弊概率3
        }
    }
}

//