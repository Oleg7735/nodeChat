var db = require('./database');
var s3util = require('./S3utils');
var messageViewMode = require('../viewModels/message');
var io;
//Допустимые поля: author, avatar(url), message_text, send_time, attach(url)
function sendBroadcast(message){
    io.emit('new message', message);
}
module.exports = {
    init:function (server, sesMiddle) {
            io = require('socket.io')(server)
            .use(function (socket, next) {
                sesMiddle(socket.request, {}, next);
            })
            .on('connection', function (socket) {
                var oldMessagesToSendCount = 100;
                var userId = socket.request.session.passport.user;
                console.log('connected socket');
                socket.broadcast.emit('Пользовтель вошел а чат');
                db.findLastMessagesWithUsers(0, oldMessagesToSendCount, function (data) {
                        socket.emit('load messages', messageViewMode.getMessagesCollectionViewModel(data));
                    },
                    function (error) {
                        console.log('Ошибка загрузки сообщений при подключении пользователя: ' + error);
                    });
                //Новое сообщение от клиента
                socket.on('client message', function (data) {
                    console.log('socket ' + userId + ' say ' + data.message);

                    var newMessage = {
                        send_time: Date.now(),
                        message_text: data.message
                    };

                    db.addUserMessage(userId, newMessage, function (error) {
                        console.log('Message save error: ' + error);
                    });
                    db.findUserById(userId, function (user) {
                            var sendibleMessage = {
                                send_time: newMessage.send_time,
                                message_text: data.message,
                                author: user.name,
                                avatar: s3util.createS3ObjectUrl(user.avatar)
                            };
                            socket.broadcast.emit('new message', sendibleMessage);
                            socket.emit('resending message', sendibleMessage);
                        },
                        function (error) {
                            console.log('Ошибка отправки нового сообщения: ' + error);
                        });

                });
                //Подгрузить еще старых сообщений
                socket.on('load more messages', function (data) {
                    db.findLastMessagesWithUsers(data.offset, oldMessagesToSendCount, function (loadedMessages) {
                            if (loadedMessages.length > 0) {
                                socket.emit('extra messages loaded', messageViewMode.getMessagesCollectionViewModel(loadedMessages));
                            }
                        },
                        function (error) {
                            console.log('Ошибка подгрузки старых сообщений: ' + error);
                        });
                });
                //Клиент отключился
                socket.on('disconnect', function () {
                    socket.broadcast.emit('user leave', {
                        message: 'Пользователь покинул чат'
                    });
                    console.log('socket disconnected');
                });
            });

    },
    sendBroadcastMessage: sendBroadcast
};
