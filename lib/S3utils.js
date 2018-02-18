var config = require('../config');
module.exports = {
    createS3ObjectUrl: function(objectName){
        return 'http://'+config.bucketName+'.s3.amazonaws.com/'+objectName;
    }
};
