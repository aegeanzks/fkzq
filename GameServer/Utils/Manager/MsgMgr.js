// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = MsgMgr;

var ObjRoot = require('../../Utils/ObjRoot');
var OBJ = ObjRoot.getObj;

function MsgMgr(){
    ObjRoot.call(this, this.constructor.name);
    
    var msgMap = new Map();

    this.register = function(id, data){
        msgMap.set(id, data);
    };

    this.getObject = function(id){
        var obj = msgMap.get(id);
        if(null == obj)
            return null;
        return obj;
    };
}

