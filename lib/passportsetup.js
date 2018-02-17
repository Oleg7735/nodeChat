/*var bCrypt = require('bcrypt-nodejs');
var getHash = function(password){
    return hash =  bCrypt.hashSync(password, bCrypt.genSaltSync(10));
};
var isPasswordCorrect = function(userPassword, hash){
    return bCrypt.compareSync(userPassword, hash);
};*/
var bCrypt = require('./bCryptFunctions');
var config = require('../config');
//Вызывать после подключения express-session в app
module.exports = function (app) {

    var passport = require('passport');
    var LocalStrategy = require('passport-local');
    var db = require('./database');

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done){
        db.findUserById(id, function(user){
            done(null, user);
        },
        function(error){
            done(error, null);
        })
    });

    passport.use('local-signup', new LocalStrategy(
        {
            usernameField: 'login',
            passwordField: 'password',
            passReqToCallback: true
        },
        //TODO: реализовать проверку данных
        function (req, login, password, done) {
            db.findUserByName(login, function(user){
                if(user != null){
                    return done(null, false, {message:'Пользователь с таким именем уже существует'});
                }
                if(password !== req.body.passwordConfirm){
                    return done(null, false, {message:'Пароль и подтверждение пароля не совпадают'});
                }
                var hash = bCrypt.getHash(password);
                var data = {
                    name: login,
                    password:hash,
                    email: req.body.email,
                    avatar: config.defaultAvatarName
                };
                db.addUser(data, function(newUser){
                    return done(null, newUser);
                },
                function(error){
                    console.log("regisration error: " + error);
                    return done(null, false, {message:'Не удалось провести регистрацию. Попробуйте снова'});
                });

            },
            function(error){
                console.log("regisration error: " + error);
                return done(null, false, {message:'Не удалось провести регистрацию. Попробуйте снова'});
            });
        }
    ));

    passport.use('local-signin', new LocalStrategy(
        {
            usernameField: 'login',
            passwordField: 'password',
            passReqToCallback: true
        },
        //TODO: реализовать проверку данных
        function (req, login, password, done) {
            db.findUserByName(login, function (user) {
                    if (user == null) {
                        return done(null, false, {message: 'Пользователь с таким именем не существует'});
                    }
                    if(bCrypt.isPasswordCorrect(password, user.password)){
                        return done(null, user);
                    }
                    else{
                        return done(null, false, {message: 'Неправильный пароль'});
                    }
                },
                function (error) {
                    console.log("login error: " + error);
                    return done(null, false, {message:'Не удалось провести аутентификацию. Попробуйте снова'});
                })
        }));

    app.post('/register', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/register',
        failureFlash: true
    }));
    app.post('/login', passport.authenticate('local-signin', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));

};
