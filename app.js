var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var db = require('./sql/connect');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const TicketRouter = require('./routes/ticketRouter');
const SPRouter = require('./routes/superAdminRouter');
const CLRouter = require('./routes/clientAdminRouter');
const cors = require('cors');
const OTPRouter = require('./routes/otpRouter');
const S3Router = require('./routes/S3bucketRouter');
const MsgRouter = require('./routes/messageRouter');
const ExcelRouter = require('./routes/excelRouter');
const cron = require('./routes/MailEvent');
const CompanyRouter = require('./routes/companyRouter');
var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
let corsoption = {
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
};
app.use(cors(corsoption));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/ticket', TicketRouter);
app.use('/superadmin', SPRouter);
app.use('/clientadmin', CLRouter);
app.use('/otp', OTPRouter);
app.use('/s3bucket', S3Router);
app.use('/msg', MsgRouter);
app.use('/excel', ExcelRouter);
app.use('/company', CompanyRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
