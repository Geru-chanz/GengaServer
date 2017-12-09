var http = require('http')
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');

var app = express();

// WebSocket => 8000番に繋ぐとできるよ
// ws://localhost:8000
var WebSocketServer = require('ws').Server;
var port = process.env.PORT || 8000;

// setting ws
var server = http.createServer(app);
var wss = new WebSocketServer({port:port});
console.log("websocket server created");

var connections = [];

// 接続開始
wss.on('connection', function(ws) {
  console.log('websocket connection open');

  connections.push(ws);
  /**
   * ws受信時
   * 操作元のrender updateを受けたら、全員に最新のrenderを返す
   */
  ws.on('message', function(data) {
    console.log(connections.indexOf(ws) + 1 +'さんが動かしました。更新します');
    console.log(data);
    wss.clients.forEach(function(client) {
      client.send("{user:" + (connections.indexOf(ws) + 1) +", send:" + data + "}");
    });
  });

  // クローズ
  ws.on('close', function() {
    const idx = connections.indexOf(ws);

    connections = connections.splice(idx + 1, 1);
    broadcast(JSON.stringify(idx + 1 + 'さんが落ちました'));
  });
});

//ブロードキャストする
function broadcast(message) {
    console.log('called');
    connections.forEach(function (con, i) {
        con.send(message);
    });
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

module.exports = app;
