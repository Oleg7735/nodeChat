var express = require('express');
var router = express.Router();
var db = require('../lib/database');
var bCrypt = require('../lib/bCryptFunctions');
var multers3Upload = require('../lib/multers3-upload');
var upload = multers3Upload.getUpload();
var s3util = require('../lib/S3utils');
var sockets = require('../lib/sockets');
var aws = require('aws-sdk');
var transcoder = require('../lib/elasticTranscoder');
var config = require('../config');
var authorized = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('login');
};

/* GET users listing. */
router.use(authorized);
router.get('/', function(req, res) {
    res.render('chat', { userName: req.user.name });
});
router.get('/profile', function(req, res){
    var avatar = s3util.createS3ObjectUrl(req.user.avatar);
    res.render('profile', {login:req.user.name, email:req.user.email, avatarPath:avatar});
});
router.post('/profile', function(req, res){
    var user = {
        id:req.user.id,
        name:req.body.login,
        email:req.body.email
    };
    //пересохраняем старый
    var avatar = s3util.createS3ObjectUrl(req.user.avatar);
    db.updateUserWithoutPassword(user, function(){
            res.render('profile', {login:req.body.login, email:req.body.email, avatarPath:avatar, message:'Профль успешно обновлен.'});
    },
    function(error){
        //TODO: можно просто перенаправлять на profile указывая ошибку в req.flech, а в profile учитывать ошибку
        console.log('Ошибка обновления профиля пользователя: '+ error);
        res.render('profile', {login:req.user.name, email:req.user.email, avatarPath:avatar, message:'Не удалось обновить профиль. ' +
            'Попробуйте снова.'});
    });

});
router.post('/password', function(req, res){
    var avatar = s3util.createS3ObjectUrl(req.user.avatar);
    var oldpassword = req.body.oldPassword;
    var newPassword = req.body.newPassword;
    var newPasswordConfirm = req.body.newPasswordConfirm;
    if(! bCrypt.isPasswordCorrect(oldpassword, req.user.password)){
        return res.render('profile', {login:req.user.name, email:req.user.email, avatarPath:avatar, passwordMessage:'Старый пароль' +
            ' был введен не правильно. Пароль не был изменен.'});
    }
    if(newPassword !== newPasswordConfirm){
        return res.render('profile', {login:req.user.name, email:req.user.email, avatarPath:avatar, passwordMessage:'Новый пароль' +
            ' и подтверждение пароля не совпадают. Пароль не был изменен.'});
    }
    var user = {
        password: bCrypt.getHash(req.body.newPassword),
        id: req.user.id
    };
    db.updateUserPassword(user, function(){
        res.render('profile', {login:req.user.name, email:req.user.email, avatarPath:avatar, passwordMessage:'Новый пароль' +
            ' был успешно установлен.'});
    },
    function(error){
        console.log('Ошибка смены пароля: ' + error);
        res.render('profile', {login:req.user.name, email:req.user.email,avatarPath:avatar, passwordMessage:'Не удалось изменить' +
            ' пароль'});
    });

});
router.post('/avatar', upload.single('avatar'), function (req, res) {
    var avatar = s3util.createS3ObjectUrl(req.user.avatar);
    console.log('avatar posted');
    res.render('profile', {login:req.user.name, email:req.user.email, avatarPath:avatar});
    //TODO:Ограничивать размер файла
});
router.post('/video', multers3Upload.getVideoUpload().single('video'), function (req, res) {
    //var videoUpload = multers3Upload.getVideoUpload().single('video');
    /*videoUpload(req, res, function (err) {
        console.log("Failed to upload video to s3: "+err);
    });*/
    //var lambda  = new aws.Lambda();
    var params = {
        srcBucketName: config.bucketName,
        dstBucketName: config.bucketName,
        srcKey: req.file.key,
        dstKey: req.file.key.replace(config.tempVideoDirName, config.videoDirName)
    };
    transcoder.handler(params, null, function(error, resultKey){
        if(error === null) {
            var message = {
                send_time: Date.now(),
                message_text: '',
                attach: resultKey
            };
            db.addMessageWithAttach(req.user.id, message, function (err) {
                console.log('Faild to add new message with attachment to database: ' + err);
                res.end('error');
            });
            const messageToSend = {
                author: req.user.name,
                avatar:s3util.createS3ObjectUrl(req.user.avatar),
                send_time: Date.now(),
                message_text: '',
                attach: s3util.createS3ObjectUrl(resultKey)
            };
            sockets.sendBroadcastMessage(messageToSend);
            res.end('uploaded');
        }
        else{
            console.log('Ошибка при попытке перекодировки видео: '+error);
            res.end('error');
        }
    });
});
/*router.post('/test', function (req, res){

    var message = {
        author: req.user.name,
        avatar:s3util.createS3ObjectUrl(user.avatar),
        send_time: Date.now(),
        message_text: '',
        attach: s3util.createS3ObjectUrl('video/0bc4c60a162e374d22ae24d5220870c61520710036473')
    };
    sockets.sendBroadcastMessage(message);
    res.end('uploaded');
});*/
module.exports = router;
