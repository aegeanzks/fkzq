module.exports = Player;

var UserSchema = require('../../../db_structure').User();
var OBJ = require('../../../Utils/ObjRoot').getObj;

function Player(userId, userName, gameCoin, socket){
    this.userId = userId;  //用户id
    this.userName = userName;//用户账号
    this.gameCoin = gameCoin; //游戏金币
    this.socket = socket; //网络连接

    var class_Users = OBJ('DbMgr').getStatement(UserSchema);

    this.send = function(msgid, data){
        OBJ('WsMgr').send(this.socket, msgid, data);
    };

    /**
     *  userId: {                   //用户ID
            type: Number,
            index: true,
        },
        userName: {                 //用户账号
            type: String,
            index: true,
        },
        lastLoginDate: Date,        //最后登录时间
        lastLoginIp: String,        //最后登录IP
        loginCount: Number,         //登录次数
        status: Number,             //状态 0启用，1不启用
        inventedProfitrate: Number, //虚拟长盈利率
        inventedSlewRate: Number,   //虚拟长杀率
     */
    this.updateLoginDb = function(){
        class_Users.find({'userid':this.userId}, function(err, data){
            if(data.length == 0){   //没有记录的就创建
                model_Users = OBJ('DbMgr').getModel(UserSchema);
                model_Users.userId = this.userId;
                model_Users.userName = this.userName;
                model_Users.lastLoginDate = Date.now();
                model_Users.lastLoginIp = 
            }else{                  //有记录的就更新
                
            }
        });
    };

    this.updateCoinDb = function(){

    };
}