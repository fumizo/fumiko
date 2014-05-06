var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/fumiko");
mongoose.connect("mongodb://fumiko:yamafumi12@novus.modulusmongo.net:27017/e3Jimysa");
var Calendar = new mongoose.Schema({
    group: String,
    date: Date,
    empty: Boolean
});
mongoose.model("Calendar",Calendar);
Calendar = mongoose.model("Calendar");
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


var server = app.listen(process.env.PORT || 3000);  // 3000番ポートでサーバーを起動
var io = require('socket.io').listen(server);
io.sockets.on('connection',function(socket){
    
    // ○月の予定をくれ
    socket.on('getSchedule', function(mon){
        // データベースからmon月の予定を取得
        var gDate = new Date(2014,mon,1);
        var lDate = new Date(2014,mon+1,0);
        Calendar.find({date: {$gte: gDate}, date:{$lte: lDate}},function(err, cals){
            socket.emit('getSchedule', cals); // イベントを起こしたユーザーに伝える
        });
    });

    // 「カレンダーの選択」イベント（押された日付を受信）
    socket.on('selected', function(date){
        var selectedDate = new Date(date);
        Calendar.findOne({date:selectedDate}, function(err,cal){
            if (cal) {
                //既にある予定の変更
                cal.empty = !cal.empty;
            }else{
                //新しい予定の作成
                cal = new Calendar({
                    group: "グループ",
                    date: selectedDate,
                    empty: false
                });

            }
            cal.save(function(err){
                if(err){
                }else{
                    socket.emit('selected', date); // イベントを起こしたユーザーと
                    socket.broadcast.emit('selected', date); // その他のユーザー全員に伝える
                }
            });
        })

        
    });

    // ソケットが切断されたときの処理
    socket.on('disconnect',function(){
        console.log('disconnected');
    });
});

module.exports = app;
