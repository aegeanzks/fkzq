module.exports = GlobalModule;

var BaseModule = require('../BaseModule');

function GlobalModule(){
    BaseModule.call(this);

    var uniqueId = 0;
    this.getUniqueId = function(){
        if(uniqueId >= 10000)
            uniqueId = 0;
        return Math.floor(Date.now()%100000)*10000+uniqueId++;
    };
}