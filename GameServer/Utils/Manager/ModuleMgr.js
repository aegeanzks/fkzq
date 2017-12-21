// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = ModuleMgr;

var ObjRoot = require('../../Utils/ObjRoot');
var OBJ = ObjRoot.getObj;

function ModuleMgr(){
    ObjRoot.call(this, this.constructor.name);
    
    moduleSet = new Set();
    
    this.register = function(moduleOne){
        moduleSet.add(moduleOne);
    };

    function runFunc(){
        var timestamp = (new Date()).valueOf();
        for(moduleOne of moduleSet){
            try {
                moduleOne.run(timestamp);
            } catch (error) {
                console.log(error);
            }
        }
    };

    this.run = function(runInterval){
        setInterval(runFunc, runInterval);
    };
}