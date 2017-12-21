module.exports = VirtualFootball;
var SingleTimer = require('../../../Utils/SingleTimer');

function VirtualFootball(){
    var pullTimer = new SingleTimer();
    pullTimer.startup(5000);

    this.run = function(timestamp){
        console.log('VirtualFootball...'+timestamp);
    };
}