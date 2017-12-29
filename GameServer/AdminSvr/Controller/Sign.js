var md5 = require('crypto').createHash('md5');

exports.checkSign = function (str,sign) {
    md5.update(str);
    str = md5.digest('hex');
    if(str == sign){
        return 1;
    }
    return 0;
};