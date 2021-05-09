var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var exp = require('express');
var fs = require('fs');

var port = process.env.PORT || 7001;
var users = [];
var actualuser = '';
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use(exp.static('public'));

io.on('connection', function(socket) {

    socket.on('chat message', function(msg) {
        users.forEach(element => {
            if (element.username == msg.username) {
                msg = { username: msg.username, msg: msg.msg }
            }
        });
        // on = received chat.js to index.js
        // emit = send index.js to chat.js
        io.emit('chat message', msg);
    });

    socket.on('broadcast', function(data) {
        io.emit('broadcast', data)
    })

    socket.on('online', function(data) {
        if (!users.includes(data.username)) {
            users.push(data);
            actualuser = data.username;
        }
        io.emit('online', users);
    });

    socket.on("typing", function(data) {
        io.emit("typing", data);
    });

    socket.on("stop-typing", function(data) {
        io.emit("stop-typing", data);
    });

    socket.on('disconnect', function() {
        for (let i = 0; i < users.length; ++i) {
            if (users[i].username == actualuser) {
                users.splice(i, 1);
            }
        }
        io.emit('logout', users);
        // console.log("disonnect");
        // io.emit('disconnect', users)
    })

});

http.listen(port, function() {
    console.log('listening on', port);
});