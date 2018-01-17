// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = BaseModule;

var ObjRoot = require('../../Utils/ObjRoot');
var OBJ = ObjRoot.getObj;

function BaseModule() {
    ObjRoot.call(this, this.constructor.name);
    OBJ('ModuleMgr').register(this);
    //一帧
    this.run = function (timestamp) { }
}