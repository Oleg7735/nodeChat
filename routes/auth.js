var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/login', function(req, res, next) {
    res.render('login',{errorFlash: req.flash('error')});
});
router.get('/register', function (req, res) {
    res.render('register', {errorFlash: req.flash('error')});
});

router.get('/logout', function(req, res){
    req.session.destroy(function(err){
        res.redirect('login');
    });
});

module.exports = router;
