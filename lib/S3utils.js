var config = require('../config');
module.exports = {
    //Функция, генерирующая URL для публичного дочтупа к объектам из s3 корзины
    createS3ObjectUrl: function(objectName){
        return 'http://'+config.bucketName+'.s3.amazonaws.com/'+objectName;
    }
};
