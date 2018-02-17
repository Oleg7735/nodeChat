var express = require('express');
var router = express.Router();
var db = require('../lib/database');
var bCrypt = require('../lib/bCryptFunctions');
var config = require('../config');
var upload = require('../lib/multers3-upload').getUpload();
var authorized = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('login');
};
var createS3ObjectUrl = function(objectName){
    return 'http://'+config.bucketName+'.s3.amazonaws.com/'+objectName;
};
/* GET users listing. */
router.use(authorized);
router.get('/', function(req, res) {
    res.render('chat', { userName: req.user.name });
});
router.get('/profile', function(req, res){
    var avatar = createS3ObjectUrl(req.user.avatar);
    res.render('profile', {login:req.user.name, email:req.user.email, avatarPath:avatar});
});
router.post('/profile', function(req, res){
    var user = {
        id:req.user.id,
        name:req.body.login,
        email:req.body.email
    };
    var avatar = createS3ObjectUrl(req.user.avatar);
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
    var avatar = createS3ObjectUrl(req.user.avatar);
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
    var avatar = createS3ObjectUrl(req.user.avatar);
    console.log('avatar posted');
    res.render('profile', {login:req.user.name, email:req.user.email, avatarPath:avatar});
    //TODO:Ограничивать размер файла
});

module.exports = router;
