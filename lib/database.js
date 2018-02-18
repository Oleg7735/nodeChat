const promise = require('bluebird');
const initOptions = {
    promiseLib: promise
};
var pgp = require('pg-promise')(initOptions);

var db;
module.exports = {
    init:function (connectionString) {
        //использовать эту функцию в app.js для задания строки подключения в зависимости от окружения
        // перед использованием базы
        db = pgp(connectionString);
    },
    findUserById: function(id, onSuccess, onError){
        db.one('SELECT * FROM users WHERE id = $1', id)
            .then(onSuccess)
            .catch(onError);
            /*.then(function(data){
                console.log('user data:'+data);
            })
            .catch(function(error){
                console.log('database error: ' + error);
            });*/
    },
    findUserByName: function(name, onSuccess, onError){
        db.oneOrNone('SELECT * FROM users WHERE name = $1', name)
            .then(onSuccess)
            .catch(onError);
    },
    /**
     * Возвращает информацию о сообщениях(имя автора:author, текст: message_text, дату/время отправки: send_time)
     * @param messagesSkip количество пропускаемых сообщений ссобщений
     * @param messagesCount количество возвращаемых сообщений
     * @param onSuccess функция вызываемая в случае удачного выполнения запроса (получает в качестве параметра объект данных)
     * @param onError  функция вызываемая в случае ошибки (получает в каестве параметра ошибку)
     */
    findLastMessagesWithUsers:function(messagesSkip, messagesCount, onSuccess, onError){
        db.manyOrNone('SELECT users.name as author, users.avatar, message.message_text, message.send_time FROM users, message WHERE users.id = ' +
            'message.id_user ORDER BY message.send_time DESC LIMIT $1 OFFSET $2', [messagesCount, messagesSkip])
            .then(onSuccess)
            .catch(onError);
    },
    //Объект user должен содержать поля name, email, password, avatar
    addUser: function (user, onSuccess, onError) {
        db.one('INSERT INTO users(name, email, password, avatar) VALUES($1, $2, $3, $4) RETURNING id, name, email, password, avatar',
            [user.name, user.email, user.password, user.avatar])
            .then(onSuccess)
            .catch(onError);
    },
    updateUser: function(user, onError){
        db.none('UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4', [user.name, user.email, user.password, user.id])
            //.then(onSuccess)
            .catch(onError);
    },
    updateUserWithoutPassword: function(user, onSuccess, onError){
        db.none('UPDATE users SET name = $1, email = $2 WHERE id = $3', [user.name, user.email, user.id])
            .then(onSuccess)
            .catch(onError);
    },
    updateUserPassword: function(user, onSuccess, onError){
        db.none('UPDATE users SET password = $1 WHERE id = $2', [user.password, user.id])
            .then(onSuccess)
            .catch(onError);
    },
    addUserMessage: function (userId, message, onError) {
        db.none('INSERT INTO message(send_time, message_text, id_user) VALUES(to_timestamp($1 / 1000.0), $2, $3)', [message.send_time,
            message.message_text, userId])
            //.then(onSuccess)
            .catch(onError);
    },
    getUserAvatar: function(userId, onSuccess, onError){
        db.one('SELECT avatar FROM users WHERE id = $1', userId)
            .then(onSuccess)
            .catch(onError);
    },
    updateUserAvatar: function(userId, newAvatar, onSuccess, onError){
        db.none('UPDATE users SET avatar = $1 WHERE id = $2', [newAvatar, userId])
            .then(onSuccess)
            .catch(onError);
    }
};
