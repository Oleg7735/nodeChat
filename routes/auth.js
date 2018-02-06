var express = require('express');
var db = require('../lib/database');
var router = express.Router();

/* GET home page. */
router.get('/login', function(req, res, next) {
    res.render('login',{errorFlash: req.flash('error')});
});
router.get('/register', function (req, res) {
    res.render('register', {errorFlash: req.flash('error')});
});

router.get('logout', function(req, res){
    reg.session.destroy(function(err){
        res.redirect('login');
    });
});
/*router.post('/login', function(req, res){

    db.findUserById(1, function (data){
        res.render('index', {title:data.name});
    },
    function (error) {
        console.log('database error: ' + error);
    });
});*/
/*router.post('/register', function(req, res){
    var user = {
        name:req.body.login,
        email:req.body.email,
        password:req.body.password
    };
    db.addUser(user,function(data){
            res.render('chat', {title:data.name});
        },
        function (error) {
            console.log('database error: ' + error);
        }
    );
});*/
module.exports = router;
