module.exports =RlRaceModule;


/*
    Real比赛管理module
 */
function RlRaceModule(){
    //定义变量
    var limit ;
    //end 定义变量

    //初始化
    Init();

    /*
        @func 获取page页赛事
        @page 页数
     */
    this.getListByPage = function(page){
        return {'name':'123'};
 
    }

    /*
        @func 初始化函数
     */
    function Init(){
        limit = 10;
    }


}

