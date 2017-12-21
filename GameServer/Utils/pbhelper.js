
var protobuf = require("protobufjs");
var builder = protobuf.newBuilder();

var protoFiles = [
    'msg.svrcli.proto',
];

function PBHelper() {
    this.sequence = 0;
}

/*let window = global || window;*/

PBHelper.prototype = {
    loadFile: function(path, packageName) {
    
        builder.importRoot = path;
        protoFiles.forEach(function (fileName) {
            let filePath = `${path}/${fileName}`;
            protobuf.protoFromFile(filePath, builder);
        });
        
        return builder.build(packageName);
    },

};
module.exports = PBHelper;