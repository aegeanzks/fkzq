// +----------------------------------------------------------------------
// | 疯狂足球
// +----------------------------------------------------------------------
// | Copyright (c) 2017 All rights reserved.
// +----------------------------------------------------------------------
// | Author: Zhengks
// +----------------------------------------------------------------------
module.exports = HttpClientMgr;

var ObjRoot = require('../../Utils/ObjRoot');
var OBJ = ObjRoot.getObj;

var http = require('http');
var Func = require('../../Utils/Functions');

function HttpClientMgr(){
    ObjRoot.call(this, this.constructor.name);

    this.Get = function(PageUrl,callBack){
       var req =http.get(PageUrl, function(res) {
            var html = '';
            res.setEncoding('utf-8');
            res.on('data', function(data) {
                html += data;
            });
            res.on('end', function() {
                if(Func.isExitsFunction(callBack))
                    callBack(html);
            });
            res.on('error',function(e){
                console.log('-----'+e.message);
            });
        }).on('error', function (e) {
            console.log("Got error: " + e.message);
        });
        req.end();
    };
}