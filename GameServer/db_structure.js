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
            id:{                         //赛事标识
                type:Number,
                index:true,
                unique: true,
            },                   
            match_num:{                   //场次
                type:Number,
                index:true,
            }, 
            phase:{                      //期号
                type:Number,
                index:true,
            },             
            official_date:Date,          //正式时间
            official_num:String,                    
            create_at:Date,              //创建时间
            time_endsale:Date,           //停在时间
            match_name:String,           //赛事名
            match_date:{                 //比赛时间
                type:Date,
                index:true,
            },             
            home_team:String,            //主队名称
            away_team:String,            //客队名称
            first_half:String,           //半场比分
            final_score:String,          //全场比分
            status:Number,               //状态
            lottery_status:{             //开奖状态  0未开始  1 等待开奖  2 已开奖
                type:Number,
                default:0,
            },      
            fx_id:Number,
            priority:String,
            ext:String,
            handicap:String,             //让球
            weekday:String,              //星期
            odds_dateline:Date,
            score_dateline:Date,
            hot_flag:{                   //是否热门
                type: Number,
                default: 0,              //0 非热门  1显示
            },
            display_flag:{               //是否显示
                type:Number,
                default:1,               //0 不显示  1显示
            },
            input_flag:{                //是否录入管理员数据
                type:Number,
                default:0,              //0  不录入  1录入    
            },
            bet_num:{                  //胜平负  投注人数
               type: Array,
               default:{"h":0,"d":0,"a":0},    
            },            
            bet_num1:{                //让球胜平负 投注人数
                type:Array,
                default:{"h":0,"d":0,"a":0},
            },             
            //欧赔
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
            odds_jingcai_admin:{          //竞彩官方 启用管理员录入数据
                type:Array,
                default:null,
            }, 
            //亚赔
            odds_yapan:Array,             //澳门
            odds_yapan_bet365:Array,      //bet365
            odds_yapan_hg:Array,          //皇冠
            odds_yapan_ysb:Array,         //易胜博
            odds_yapan_weide:Array,       //伟德
            //让球
            odds_rangqiu:Array,           //竞彩官方
            odds_rangqiu_wlxe:Array,      //威廉希尔
            odds_rangqiu_libo:Array,      //立博
            odds_rangqiu_bet365:Array,    //bet365
            odds_rangqiu_admin:{          //竞彩官方 启用管理员录入数据
                type:Array,
                default:null,
            }
        }

    };
};

//真实数据赛事
exports.RealInfo = function(){
    return{
        'name':'realInfo',
        'schema':{
            status_name:{
                type:String,
                index:true,
                unique: true,
            },
            status_value:{
                type:Number,
                default:0
            }
        }
    }
}


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
            all_distribute_coin: Number,    //所有派奖金额
            all_bet_coin: Number,           //所有下注金额
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
            out_trade_no: {         //投注记录id
                type: String,
                unique: true,
            },
            user_id: {               //用户ID
                type: Number,
                index: true,
            },
            user_name: {             //用户账号
                type: String,
                index: true,
            },
            bet_date: {              //下注时间
                type: Date,
                default: Date.now,
                index: true,
            },
            bet_server:String,        //对应的游戏服
            bet_scheduleid:Array,     //投注赛事id列表
            bet_num: Number,          //注数
            bet_type: Number,         //投注类型   1场 2(2串1) 3(3串1) 4(4串1)
            jingcai_type:Number,      //竞猜类型  1胜平负  2让球胜平负 3混合过关
            bet_coin: Number,         //下注金额
            distribute_coin: Number,  //预派发金额
            realDistrobute_coin:{     //实际派发金额  可能有赛事取消
                type:Number,
                default:0,
            },
            before_bet_coin: Number,  //下注前金额
            status: Number,           //状态 0未开奖 1中 2不中 3结算失败
            bet_plan: Array,          //投注方案,格式为{'schedule_id':,'match_date':,'team_name':,'odds':,"betClass":,"betArea":,"handicap":,'schedule_result':,'status':}数组
                                      //schedule_id 赛事id,match_date 比赛时间,team_name 比赛队伍,odds 下注时赔率,betClass 下注类型 1胜平负 2让球胜平负
                                      //betArea 投注区域 1主 2平 3客，handicap 让球数, schedule_result 比赛结果 -1 取消比赛 0未知 1主胜 2平 3客胜
                                      //status竞猜状态  0未开奖  1中奖   2不中
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
            host_team_id: Number,   //主队ID
            host: String,           //主队    曼联
            host_team_goal: Number, //主队进球数
            guest_team_id: Number,  //客队ID
            guest: String,          //客队    曼城
            guest_team_goal: String,//客队进球数
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
            bet_coin: Number,          //下注金额
			bet_times: Number,			//下注时的赔率
			bet_distribute_coin: Number,		//将配发的金额（先计算在这边，不显示给后台）
			bet_area: Number,			//下注区域
            distribute_coin: Number,   //派发金额
            before_bet_coin: Number,    //下注前金额
            status: {           //状态 0未开奖 1不中 2中
                type: Number,
                index: true,     
            },
            balance_schedule_id: {    //结算场次，如果是单场下注，则这个值就是这场比赛的id，如果是二串一或三串一，则这个值就是最后一场的id
                type: String,
                index: true,
            },
			server_id: String,
			out_trade_no: {
                type: String,
                unique: true,
            },
            trade_no: String,
            settlement_out_trade_no:String,
            settlement_trade_no:String,
            host_team_id:Number,
            guest_team_id:Number,
            bet_server:{
                type:String,
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
            id:{                   //id标识
                type:Number,
                unique: true,
                index:true,
            },
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
            game_id: {                   //游戏id
                type:Number,
                unique: true,
            },             
            game_name: String,           //游戏名字
            cur_stock: Number,           //当前库存
            stock_initial_value: Number,  //库存初始值
            cheat_chance_1: Number,       //作弊概率1
            stock_threshold_1: Number,    //作弊阀值1
            cheat_chance_2: Number,       //作弊概率2
            stock_threshold_2: Number,    //作弊阀值2
            cheat_chance_3: Number,       //作弊概率3
        }
    }
};

//下注项配置
exports.ConfBetItem = function(){
    return {
        'name':'conf_bet_item',
        'schema':{
            game_id: Number,              //游戏ID    1虚拟足球 2真实足球
            item1: Number,
            item2: Number,
            item3: Number,
            num_limit:Number,            //最多压几场比赛
            coin_limit:Number,           //最高下注金额
        }
    };
};

//创建公告
exports.Announcement=function(){
    return {
        'name':'conf_announcements',
        'schema':{
            a_id: {                   //公告id
                type:Number,
                unique: true,
                index: true,
            },
            type:Number,      //0-系统公告 1--弹窗公告
            createtime:{          //创建时间
                type: Date,
                default: Date.now,
                index: true,
            },
            starttime:Date,
            endtime:Date,
            content:String
        }
    };
};