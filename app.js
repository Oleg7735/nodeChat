var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var connectPg = require('connect-pg-simple')(session);
var flash = require('express-flash');

var aws = require('aws-sdk');
require('./lib/multers3-upload').init(new aws.S3());

var bodyParser = require('body-parser');

var credentials = require('./credentials');

var index = require('./routes/auth');
var users = require('./routes/chat');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

var dbConnectionString;
switch(app.get('env')){
    case 'development': {
        /*const cn = {
            host: 'localhost',
            port: 5432,
            database: 'testChat',
            user: 'postgres',
            password: '753114'
        };*/

        dbConnectionString = 'postgresql://postgres:753114@192.168.0.103/testChat';//'postgresql://postgres:753114@localhost/testChat';
        break;
    }
    case 'production':{
        //for Heroku
        //dbConnectionString = process.env.DATABASE_URL;
        dbConnectionString = 'postgresql://'+process.env.RDS_USERNAME+':'+process.env.RDS_PASSWORD+'@'+process.env.RDS_HOSTNAME+':'+process.env.RDS_PORT+'/'+process.env.RDS_DB_NAME;
        //dbConnectionString = 'postgresql://oltest:otW6bemnp@chatdb.co0fgmovb804.us-east-2.rds.amazonaws.com:5432/ebdb';
        break;
    }
}
var sessionMiddleware = session({
    store: new connectPg({
        conString: dbConnectionString
    }),
    secret: credentials.sesionSecret,
    resave: true,
    saveUninitialized:true
});
app.use(sessionMiddleware);
app.use(flash());

require('./lib/passportsetup')(app);

require('./lib/database').init(dbConnectionString);

app.use(express.static(path.join(__dirname, 'public')));

/*app.use('/', function(req, res, next){
    req.flash('success', 'This is a flash message using the express-flash module.');
    //res.locals.flash = 'message';
    next();
});*/
app.use('/', index);
app.use('/', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
module.exports = {
    app: app,
    sesMiddle: sessionMiddleware
};
