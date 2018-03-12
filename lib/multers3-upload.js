var multer = require('multer');
var multers3 = require('multer-s3');
var db = require('./database');
var crypto = require('crypto');
var mime = require('mime');
var config = require('../config');
var s3Storage;
var upload;
//var videoUpload;

module.exports = {
    init: function (s3) {
        s3Storage = s3;
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
                            req.user.avatar = req.user.avatar + '?'+Date.now().toString();
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
        });
        /*videoUpload = multer({
            storage: multers3({
                s3: s3,
                bucket: config.bucketName,
                key: function (req, file, cb) {
                    crypto.pseudoRandomBytes(16, function (err, raw) {
                        var fileName = config.imageDirName+'/'+raw.toString('hex') + Date.now();
                        cb(null, fileName);
                    });
                }
            })
        });*/
    },
    getUpload: function () {
        return upload;
    },
    getVideoUpload: function(fileKey){
        var ms3Key;
        if(fileKey == undefined){
            ms3Key = function (req, file, cb) {
                crypto.pseudoRandomBytes(16, function (err, raw) {
                    cb(null, config.tempVideoDirName + '/' + raw.toString('hex') + Date.now());//+'.'+mime.getExtension(file.mimetype));
                });
            }

        }
        else{
            ms3Key = function(req, file, cb){
                cb(null, fileKey);
            }
        }
        return multer({
            storage: multers3({
                s3: s3Storage,
                bucket: config.bucketName,
                key: ms3Key
            })
        });


    }
};