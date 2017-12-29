module.exports = Routes;
 
var RealFootballRouter = require('./RealFootballRouter');
var SystemManageRouter = require('./SystemManageRouter');

function Routes(app){
    app.use('/RealFootball', RealFootballRouter);
    app.use('/SystemManage',SystemManageRouter);
}








