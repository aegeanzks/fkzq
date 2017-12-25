module.exports = VirtualFootball;
var SingleTimer = require('../../../Utils/SingleTimer');
var VirtualFootballConf = require('./VirtualFootballConf');

function VirtualFootball(){
    var conf = new VirtualFootballConf();
    var pullTimer = new SingleTimer();
    pullTimer.startup(5000);

    this.run = function(timestamp){
        //console.log('VirtualFootball...'+timestamp);
    };
}