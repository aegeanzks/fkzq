// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = SingleTimer

function SingleTimer(){
    var intervalTime = 0;
    var updateTime = 0;

    function isTimeOut(){
        var timestamp = (new Date()).valueOf();
        return timestamp >= updateTime + intervalTime
    }

    function isActive(){
        return updateTime != 0;
    }

    this.startup = function(time){
        intervalTime = time;
        this.update();
    }

    this.toNextTime = function(){
        if(isActive() && isTimeOut()){
            this.update();
            return true;
        }
        return false;
    }
    this.timeOver = function(){
        if(isActive() && isTimeOut()){
            this.clear();
            return true;
        }
        return false;
    }
    this.getRemain = function(){
        if(!isActive()){
            return 0;
        }
        var timestamp = (new Date()).valueOf();
        var remain = intervalTime - (timestamp - updateTime);
        if(remain < 0){
            return 0;
        }
        return remain;
    }
    this.clear = function(){
        intervalTime = 0;
        updateTime = 0;
    }
    this.update = function(){
        updateTime = (new Date()).valueOf();
    }
}