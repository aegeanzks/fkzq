module.exports =AnnounceModule;

var Schema = require('../../../db_structure');
var OBJ = require('../../../Utils/ObjRoot').getObj;
var config = require('../../../config').adminSvrConfig();
var Func = require('../../../Utils/Functions');

/*
    Real比赛记录管理module
 */
function AnnounceModule(){

    // a_id: {                   //公告id
    //     type:Number,
    //     unique: true,
    //     index: true,
    // },
    // type:Number,      //0-系统公告 1--弹窗公告
    // createtime:{          //创建时间
    //     type: Date,
    //     default: Date.now,
    //     index: true,
    // },
    // starttime:Date,
    // endtime:Date,
    // content:String

    var limit = config.limit;
    var AnnounceStatement = OBJ('DbMgr').getStatement(Schema.Announcement());
    var findSelectList = {"a_id":1,"type":1,"createtime":1,"starttime":1,"endtime":1,"content":1,};
    //end 定义变量

    /*
        @func    组包
        @count   总条数
     */
    function packages(docs,count,res){
        var len = docs.length;
        var data = [];
        var list = [];
        var header = {};
        header['status'] = 200;
        header['totalCount'] = count;
        data.push(header);

        for(var i = 0;i<len;i++){
            var listOne ={};
            listOne['a_id'] = docs[i]['a_id'];
            listOne['createtime'] = docs[i]['createtime'].toLocaleString();
            listOne['starttime'] = docs[i]['starttime'].toLocaleString();
            listOne['endtime'] = docs[i]['endtime'].toLocaleString();
            listOne['content'] = docs[i]['content'];
            listOne['type'] = docs[i]['type'];
            list.push(listOne);
        }
        data.push(list);
        res.send(data);
    }
  /*
        @func     查找数据库
        @filter   过滤条件
        @funcname 被那个函数调用
     */
    function findList(filter,page,res,funcname){
        try{
            AnnounceStatement.count(filter,function(error,count){
                if(!error){
                    if(count >0){
                        AnnounceStatement.find(filter,findSelectList,function(finderr,docs){
                            if(!finderr){
                                packages(docs,count,res);     
                            }else{
                                console.log('Module of RaceModule '+funcname +' err :'+error);
                            }
                        })
                        .skip((page-1) * limit)
                        .limit(limit)
                        .sort({'a_id':-1});
                    }else{
                        res.send({
                            status: 0,
                            type: 'GET_DATA_EMPTY',
                            message: '无相关记录'
                        })
                    }
                }else{
                    console.log('Module of RaceModule '+funcname +' find count err :'+error);
                }
            });
        }catch(err){
            console.log('获取数据失败', err);
            res.send({
                status: 1,
                type: 'GET_DATA_ERROR',
                message: '获取数据失败'
            })
        }

    }
      /*
        @func   根据赛事记录
        @id     赛事id
     */
    this.announcelist = function(page,res){
        var filter = {};
        var funcname = 'announcelist';
        findList(filter,page,res,funcname);
    }

    this.announceiteminfo = function(a_id,res){
        var filter = {"a_id":a_id};
        var funcname = 'announceiteminfo';
        findList(filter,1,res,funcname);
    }

        /*
        @func    添加公告信息
        @fields  字段
     */
    this.addinfo = function(fields,res){
        $id=1;
        $dataarray={};
           try{
            AnnounceStatement.find({},function(finderr,docs){
                   if(!finderr){
                       $dataarray=docs;
                       if($dataarray.length>0){
                           $id=$dataarray[0]['a_id']+1;
                       }
                          var starttime = Date.parse(fields.starttime+' 00:00:00');
                          var endtime = Date.parse(fields.endtime+' 23:59:59');
                          var doc = OBJ('DbMgr').getModel(Schema.Announcement());
                          doc.a_id = $id;
                          doc.starttime = starttime;
                          doc.endtime = endtime;
                          doc.type = parseInt(fields.type);
                          doc.content = fields.content;
                          doc.createtime = Date.now();
                          addnewannouceinfo(doc,res);
                   }
               })
               .sort({'a_id':-1});
           }catch(err){
           }
      
       }

    function addnewannouceinfo(doc,res){
        try{
            doc.save(function (error) {
                 if(!error){
                     res.send({
                         status: 200,
                         type: 'ADD_DATA_SUCESS',
                         message: '添加数据成功'
                     });
                     var curTime = Date.now();
                     if(0 == doc.type && doc.starttime<curTime && doc.endtime > curTime){
                        pushAnnounce(1,doc.a_id,doc.content);
                     }
                 }else{
                     console.log('Module of RaceModule updateListById err :'+error);
                 }
             });
         }catch(err){
             console.log('添加数据失败', err);
             res.send({
                 status: 1,
                 type: 'ADD_DATA_ERROR',
                 message: '添加数据失败'
             })
         }
    }



 /*
        @func    更新游戏的赔率
        @fields  字段
     */
    this.updateinfo=function(fields,res){
        
                var condition = {"a_id":parseInt(fields.a_id)};
                var starttime ;
                var endtime ;
                if(fields.starttime.indexOf(':') > 0){
                    starttime =  Date.parse(fields.starttime);
                }else{
                    starttime =  Date.parse(fields.starttime+' 00:00:00');
                }
                if(fields.endtime.indexOf(':') > 0){
                    endtime = Date.parse(fields.endtime);
                }else{
                    endtime = Date.parse(fields.endtime+' 23:59:59');
                }
                var values = {"starttime":starttime,"endtime":endtime,"content":fields.content,"type":parseInt(fields.type)};
                try{
                    AnnounceStatement.findOneAndUpdate(condition,{$set:values},function(error,docs){
                        if(!error){
                            res.send({
                                status: 200,
                                type: 'UPDATE_DATA_SUCESS',
                                message: '数据更新成功'
                            });
                            var curTime = Date.now();
                            if(0 == values['type'] && starttime<curTime && endtime > curTime){
                               pushAnnounce(2,parseInt(fields.a_id),values['content']);
                            }
                        }else{
                            console.log('Module of RaceModule updateOodInfo err :'+error);
                        }
                    });
                }catch(err){
                    console.log('更新数据失败', err);
                    res.send({
                        status: 1,
                        type: 'UPDATE_DATA_ERROR',
                        message: '更新数据失败'
                    })
                }
             }
   /*
        @func    删除赔率配置通过id
        @id  标识id
     */
    this.delinfobyId=function(id,res){
        var condition = {"a_id":id};
        try{
            AnnounceStatement.collection.remove(condition,function(error){
                 if(!error){
                     res.send({
                         status: 200,
                         type: 'DEL_DATA_SUCESS',
                         message: '删除数据成功'
                     });
                     pushAnnounce(3,id);
                 }else{
                     console.log('Module of RaceModule delinfobyId err :'+error);
                 }
             });
         }catch(err){
             console.log('删除数据失败', err);
             res.send({
                 status: 1,
                 type: 'DEL_DATA_ERROR',
                 message: '删除数据失败'
             })
         }
    }

    /*
        @func  公告有变化做推送
    */
    function pushAnnounce(operType,id,content = ''){
            //推送给游戏服
            OBJ('RpcModule').broadcastGameServer('RealFootball', 'refreshAnnounce', {
                type:operType,
                id:id,
                content: content
            });
        /*try {
            var curTime = Date.now();
            var filter = { "starttime": { "$lte": curTime }, "endtime": {"$gte":curTime}, "content": { $ne: '' },"type":0};
            AnnounceStatement.find(filter, null, function (error, docs) {
                if (error) {
                    OBJ('LogMgr').error(error);
                }
                if(null == docs){
                    OBJ('RpcModule').broadcastGameServer('RealFootball', 'refreshAnnounce', {
                        size:0,
                    });
                }
                var announceArr = [];
                for(var i =0;i<docs.length;i++){
                    var announce = {};
                    announce['a_id'] = docs[i]['a_id'];
                    announce['content'] = docs[i]['content'];
                    announceArr.push(announce);
                }
                //推送给游戏服
                OBJ('RpcModule').broadcastGameServer('RealFootball', 'refreshAnnounce', {
                    size:docs.length,
                    Announce: announceArr
                });
            });
        } catch (err) {
            OBJ('LogMgr').error(err);
        }*/
    }
}

