module.exports = Routes;
 
var RealFootballRouter = require('./RealFootballRouter');
var SystemManageRouter = require('./SystemManageRouter');
var VirtualFootballRouter = require('./VirtualFootballRouter');
var AccountRouter = require('./AccountRouter');
var AnnounceRouter = require('./AnnounceRouter');
function Routes(app){
    app.use('/RealFootball', RealFootballRouter);
    app.use('/SystemManage',SystemManageRouter);
    app.use('/VFootball', VirtualFootballRouter);
    app.use('/Announcement', AnnounceRouter);
    app.use('/Accounts', AccountRouter);
}








