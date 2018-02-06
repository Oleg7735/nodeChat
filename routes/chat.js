var express = require('express');
var router = express.Router();
var db = require('../lib/database');
var bCrypt = require('../lib/bCryptFunctions');
var authorized = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('login');
};

/* GET users listing. */
router.use(authorized);
router.get('/', function(req, res, next) {
    //TODO:выводить имя пользователя красиво
    res.render('chat', { userName: req.user.name });
});
router.get('/profile', function(req, res){
    res.render('profile', {login:req.user.name, email:req.user.email});
});
router.post('/profile', function(req, res){
    var user = {
        id:req.user.id,
        name:req.body.login,
        email:req.body.email
    };
    db.updateUserWithoutPassword(user, function(){
        res.render('profile', {login:req.body.login, email:req.body.email, message:'Профль успешно обновлен.'});
    },
    function(error){
        console.log('Ошибка обновления профиля пользователя: '+ error);
        res.render('profile', {login:req.user.name, email:req.user.email, message:'Не удалось обновить профиль. ' +
            'Попробуйте снова.'});
    });

});
router.post('/password', function(req, res){
    var oldpassword = req.body.oldPassword;
    var newPassword = req.body.newPassword;
    var newPasswordConfirm = req.body.newPasswordConfirm;
    if(! bCrypt.isPasswordCorrect(oldpassword, req.user.password)){
        return res.render('profile', {login:req.user.name, email:req.user.email, passwordMessage:'Старый пароль' +
            ' был введен не правильно. Пароль не был изменен.'});
    }
    if(newPassword !== newPasswordConfirm){
        return res.render('profile', {login:req.user.name, email:req.user.email, passwordMessage:'Новый пароль' +
            ' и подтверждение пароля не совпадают. Пароль не был изменен.'});
    }
    var user = {
        password: bCrypt.getHash(req.body.newPassword),
        id: req.user.id
    };
    db.updateUserPassword(user, function(){
        res.render('profile', {login:req.user.name, email:req.user.email, passwordMessage:'Новый пароль' +
            ' был успешно установлен.'});
    },
    function(error){
        console.log('Ошибка смены пароля: ' + error);
        res.render('profile', {login:req.user.name, email:req.user.email, passwordMessage:'Не удалось изменить' +
            ' пароль'});
    });

});


module.exports = router;
