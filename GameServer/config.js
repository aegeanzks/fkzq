exports.common = function(){
    return {
        timeZone:8  //时区，东八区，格林威尔时间+8个小时，如果是西区则要加-号
    };
};

exports.mongodb = function(){
	return {
        DBURL:'mongodb://127.0.0.1:27017/kzgame', //数据库连接
        debug:false,
	};
};
//rpc
exports.rpc = function(){
    return {
        RPCURL:'mongodb://127.0.0.1:27017/mmq', //RPC
        /*consumeInterval: 1000,   //消费周期60毫秒
        maxConsumption: 1000,   //一次消费数量
        visibility: 30000, //消息可见时间，一个消息超过这个时间将会丢失，秒*/
        errorListener: console.error,//错误处理函数
    };
};

exports.gameSvrConfig = function(){
    return {
        //server集群端口（服务名：配置信息）
        servers:{
            'server1':{port:10010},
            'server2':{port:10011}
        },
        runInterval:300//帧率
    };
};


/*
	@pullInterval 请求间隔时间,单位s
	@noDataTotal  根据连续n期空数据,获取轮询截至期号
	@switch       获取历史数据开关,0-开启 1-关闭
	@beginTime    获取历史数据起始时间,@switch=1 设为空 ,other样式 20171216
	@endTime      获取历史数据截止时间,@switch=1 设为空 ,other样式 20171231
*/
exports.dataCenterSvrConfig = function(){
    return {
        serverId:'dataCenter',
        //数据采集频率
        pullInterval:6,
        runInterval:30, //帧率
        noDataTotal:'3',             
        switch:'1',                 
        beginTime:'',                
        endTime:'',      
    };
};

exports.agentSvrConfig = function(){
    return {
        serverId:'agent',
        //数据采集频率
        httpPort:11000,
        runInterval:300//帧率
    };
};

exports.log4jsConfig = function(){
    return {
        "customBaseDir" :"/logs/",  
        "customDefaultAtt" :{  
            "type": "dateFile",  
            "absolute": true,  
            "alwaysIncludePattern": true  
        },  
        "appenders": [  
                {"type": "console", "category": "console"},  
                {"pattern": "debug/yyyyMMddhh.txt", "category": "logDebug"},  
                {"pattern": "info/yyyyMMddhh.txt", "category": "logInfo"},  
                {"pattern": "warn/yyyyMMddhh.txt", "category": "logWarn"},  
                {"pattern": "err/yyyyMMddhh.txt", "category": "logErr"}  
        ],  
        "replaceConsole": true,  
        "levels":{ "logDebug": "DEBUG", "logInfo": "DEBUG", "logWarn": "DEBUG", "logErr": "DEBUG"} 
    };
};