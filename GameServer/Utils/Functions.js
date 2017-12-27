exports.domofun = function(){

};

//IP转成整型
exports.ip2int = function(ip) 
{
    var num = 0;
    ip = ip.split(".");
    num = Number(ip[0]) * 256 * 256 * 256 + Number(ip[1]) * 256 * 256 + Number(ip[2]) * 256 + Number(ip[3]);
    num = num >>> 0;
    return num;
};

//整型解析为IP地址
exports.int2iP = function(num) 
{
    var str;
    var tt = new Array();
    tt[0] = (num >>> 24) >>> 0;
    tt[1] = ((num << 8) >>> 24) >>> 0;
    tt[2] = (num << 16) >>> 24;
    tt[3] = (num << 24) >>> 24;
    str = String(tt[0]) + "." + String(tt[1]) + "." + String(tt[2]) + "." + String(tt[3]);
    return str;
};
//生成guid
exports.guid =function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

/*
    @func      根据时间戳,获取年月日
    @timestamp unix时间戳,单位ms
    @return    样式 20171216
*/
exports.getDate = function(timestamp){
    var now = new Date(timestamp);
    var year = now.getFullYear();
    var month =(now.getMonth() + 1).toString();
    var day = (now.getDate()).toString();
    if (month.length == 1) {
        month = "0" + month;
    }
    if (day.length == 1) {
        day = "0" + day;
    }
    return year + month +  day;
}

/*
    @func    根据日期,获取时间戳
    @date    日期   样式20171216-00:00:00
    @return  返回时间戳,单位ms
 */
exports.getStamp =function(date){
    var str = date.substr(0,4)+'-'+date.substr(4,2)+'-'+date.substr(6,2)+' '+'00:00:00';
    var timeStamp = new Date(str).getTime();
    return timeStamp;  
}

//判断是否存在指定函数 
exports.isExitsFunction =function(funcName) {
    try {
        if (typeof (eval(funcName)) == "function") {
            return true;
        }
    } catch (e) {
    }
    return false;
}


//判断两个对象的值是否相等
exports.isObjectValueEqual=function(obj1, obj2) {
    var aProps = Object.getOwnPropertyNames(obj1);
    var bProps = Object.getOwnPropertyNames(obj2);
    
    if (aProps.length != bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i]; 
        if (obj1[propName] !== obj2[propName]) {
            return false;
        }
    }
    return true;
}

//获得范围内的随机数
exports.getRandomNum = function(Min,Max){   
    var Range = Max - Min;   
    var Rand = Math.random();   
    return(Min + Math.round(Rand * Range));   
};

//两数交换
exports.exchangeNum = function(one, two){
    var temp = one;
    one = two;
    two = temp;
    return [one, two];
};



