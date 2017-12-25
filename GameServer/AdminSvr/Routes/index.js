module.exports = Routes;
 
var RealFootballRouter = require('./RealFootballRouter');

function Routes(app){
    app.use('/RealFootball', RealFootballRouter);
}








