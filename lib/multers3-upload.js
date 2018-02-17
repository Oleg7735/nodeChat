var multer = require('multer');
var multers3 = require('multer-s3');
var db = require('./database');
var crypto = require('crypto');
var mime = require('mime');
var config = require('../config');

var upload;

module.exports = {
    init: function (s3) {
        upload = multer({
            storage: multers3({
                s3:s3,
                bucket: config.bucketName,
                key: function (req, file, cb) {
                    db.getUserAvatar(req.user.id, function (data) {
                        if (data.avatar === null || data.avatar === config.defaultAvatarName) {
                            crypto.pseudoRandomBytes(16, function (err, raw) {
                                var fileName = config.imageDirName+'/'+raw.toString('hex') + Date.now() + '.' + mime.getExtension(file.mimetype);
                                db.updateUserAvatar(req.user.id, fileName);
                                req.user.avatar = fileName;
                                cb(null, fileName);
                            });
                        } else{
                            req.user.avatar = req.user.avatar + '?'+Math.random();
                            cb(null, data.avatar);
                        }
                    }, function (error) {
                        console.log("avatar path load error: " + error);
                    });

                }
            })/*,
            limits: {
                fileSize: 4048
            }*/
        })
    },
    getUpload: function () {
        return upload;
    }
};