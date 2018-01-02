var crypto = require('crypto');

exports.checkSign = function (str,sign) {
    var md5 = crypto.createHash('md5');
    md5.update(str);
    str = md5.digest('hex');
    if(str == sign){
        return 1;
    }
    return 0;
};