// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = ObjRoot;

function ObjRoot(name){
    ObjRoot.objMap.set(name, this);
};
ObjRoot.objMap = new Map();
ObjRoot.getObj = function(name){
    var obj = ObjRoot.objMap.get(name);
    if(null == obj)
        return null;
    return obj;
}
