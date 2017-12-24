module.exports = Player;

var UserSchema = require('../../../db_structure').User();
var OBJ = require('../../../Utils/ObjRoot').getObj;

function Player(userId, userName, gameCoin, socket){
    var self = this;
    self.userId = userId;  //用户id
    self.userName = userName;//用户账号
    self.gameCoin = gameCoin; //游戏金币
    self.socket = socket; //网络连接

    var class_Users = OBJ('DbMgr').getStatement(UserSchema);

    self.send = function(msgid, data){
        OBJ('WsMgr').send(self.socket, msgid, data);
    };

    /**
     *  user_id: {                   //用户ID
            type: Number,
            index: true,
        },
        user_name: {                 //用户账号
            type: String,
            index: true,
        },
        last_login_date: Date,        //最后登录时间
        last_login_ip: String,        //最后登录IP
        login_count: Number,         //登录次数
        status: Number,             //状态 0启用，1不启用
        invented_profitrate: Number, //虚拟场盈利率
        invented_slew_rate: Number,   //虚拟场杀率
     */
    self.updateLoginDb = function(){
        class_Users.find({'user_id':self.userId}, function(err, data){
            if(data.length == 0){   //没有记录的就创建
                model_Users = OBJ('DbMgr').getModel(UserSchema);
                model_Users.user_id = self.userId;
                model_Users.user_name = self.userName;
                model_Users.last_login_date = Date.now();
                model_Users.last_login_ip = '';
                model_Users.login_count = 1;
                model_Users.status = 0;
                model_Users.invented_profitrate = 0;
                model_Users.invented_slew_rate = 0;
                model_Users.save();
            }else{                  //有记录的就更新
                var updateVar = {
                    user_name : self.userName,
                    last_login_date : Date.now(),
                    last_login_ip : '',
                    login_count : data[0].login_count+1,
                };
                class_Users.update({'user_id':self.userId}, {$set:updateVar}, function(err){
                    if(err){
                        console.log(err);
                        OBJ('LogMgr').writeErr(err);
                    }
                });
            }
        });
    };
}