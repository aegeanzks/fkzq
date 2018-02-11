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

/*
    @func     根据日期,获取星期几
    @date     日期   样式20180130
    @return   周几
 */
exports.getWeekDay = function(date){
    var str = date.substr(0,4)+'-'+date.substr(4,2)+'-'+date.substr(6,2)+' '+'00:00:00';
    var week = new Date(str).getDay();
    var weekDay = '周';
    switch (week){
        case 0 :
                weekDay += "日";
                break;
        case 1 :
                weekDay += "一";
                break;
        case 2 :
                weekDay += "二";
                break;
        case 3 :
                weekDay += "三";
                break;
        case 4 :
                weekDay += "四";
                break;
        case 5 :
                weekDay += "五";
                break;
        case 6 :
                weekDay += "六";
                break;
    }
    return weekDay;
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

/**
 * [getScatteredPointsInSomeSection 根据时间间隔，获取在某个区间内不重叠的随机散落的区间]
 * 当随机点不能够在区间内正确散落，结果集出现undefined元素
 * @param  {Array} internals   [随机点的区间间隔]
 * @param  {Number} maxRange   [最大随机区间]
 * @return {Array} [返回随机点落下的区间的起始位置]
 */
exports.getScatteredSectionBy = function(internals, maxRange) {
    let sections = [];
    let scatteredSectios = [];
    let unScatteredSections = [];
    let tmpUnScatteredSections = [];//产生下一个随机点时，先去除超出最大范围的随机点，再去除随机点：可能与已生成的随机点区间重叠的点,最后获得临时的未散落随机点的区间tmpUnScatteredSections
    for (var i = 0; i <= maxRange; i++) {
        unScatteredSections[i] = i;
    }
    for (let i = 0; i < internals.length; i++) {
        getTmpUnScatteredSections(tmpUnScatteredSections, unScatteredSections, internals[i], sections, maxRange);
        let pointIndex = Math.floor(Math.random() * tmpUnScatteredSections.length);
        let point = tmpUnScatteredSections[pointIndex];
        sections[i] = point;
        for (var j = 0; j < unScatteredSections.length;) {
            if (unScatteredSections[j] >= point && unScatteredSections[j] <= point + internals[i]) {
                unScatteredSections.splice(j, 1);
            } else {
                j++;
            }
        }
        // console.log(unScatteredSections.length);
    }
    let count = 0;
    for (var i = 0; i < sections.length; i++) {
        for (var j = 0; j < sections.length; j++) {
            if (i != j && sections[i] == sections[j]) {
                count++;
                console.log("repeat:" + count);
                count = 0;
                break;
            }
        }
    }
    console.log(sections);
    return sections;
}
/**
 * [getTmpUnScatteredSections 产生下一个随机点时，先去除超出最大范围的随机点，再去除随机点：可能与已生成的随机点区间重叠的点] 
 * @param  {Array} unScatteredSections [未分配的随机点集合]
 * @param  {Number} internal            [当前随机点的区间间隔]
 * @param  {Array} sections            [当前已获取的随机点]
 * @param  {Number} maxRange            [最大随机区间]
 */
function getTmpUnScatteredSections(tmpUnScatteredSections, unScatteredSections, internal, sections, maxRange) {
    tmpUnScatteredSections.length = 0;
    let index = 0;
    for (var i = 0; i < unScatteredSections.length; i++) {
        if (unScatteredSections[i] + internal > maxRange) {
            //去除超过最大范围的随机点
            continue;
        }
        tmpUnScatteredSections[index] = unScatteredSections[i];
        index++;
    }
    for (var i = 0; i < sections.length; i++) {
        for (var j = 0; j < tmpUnScatteredSections.length;) {
            if ((tmpUnScatteredSections[j] >= sections[i] - internal && tmpUnScatteredSections[j] < sections[i])) {
                tmpUnScatteredSections.splice(j, 1);
            } else {
                j++;
            }
        }
    }
    // console.log(tmpUnScatteredSections);
    return tmpUnScatteredSections;
}



