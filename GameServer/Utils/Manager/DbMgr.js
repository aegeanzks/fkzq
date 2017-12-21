// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = DbMgr;

var ObjRoot = require('../../Utils/ObjRoot');
var OBJ = ObjRoot.getObj;

var mongoose = require('mongoose');
var schema = mongoose.Schema;

function DbMgr(){
    ObjRoot.call(this, this.constructor.name);

    var db = null;
    this.init = function(mongoCfg){
        mongoose.Promise = global.Promise;
        mongoose.set('debug', mongoCfg.debug);
        db = mongoose.connect(mongoCfg.DBURL, {useMongoClient:true});
        if(null == db){
            console.log('err'+err);
            //进程退出
            process.exit();
        }
        console.log("数据库连接成功...");
    };
    this.model = function(name, sche){
        return mongoose.model(name, sche);
    };
    /*this.save = function(node){
        node.save(function(err){
            if(err){
                OBJ('LogMgr').writeErr(err);
            }
        });
    };*/
    var scheMap = new Map();
    this.getStatement = function(dbStructure){
        var name = dbStructure.name;
        var Statement = scheMap.get(name);
        if(null == Statement){
            var sche = new schema(dbStructure.schema, { versionKey: false });
            Statement = this.model(name,sche);
            scheMap.set(name, Statement);
        } 
        return Statement;
    };

    this.getModel = function(dbStructure){
        var Doc =  this.getStatement(dbStructure);
        return new Doc();
    };
}