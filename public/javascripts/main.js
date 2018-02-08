$(document).ready(function () {
    var socket = io();
    //Количество загруженых сообщений
    var numberOfLoadedMessages = 0;
    var $mContainer = $('.messageContainer');
    var $sendButton = $('#mainButton');
    //Формирование сообщения для вывода на экран
    var formateMessage = function(data){
        var date;
        var dateString;
        date = new Date(data.send_time);
        dateString = date.toLocaleString();
        var messageDiv = $('<div></div>');
        messageDiv.addClass('message');
        messageDiv[0].innerHTML = data.author + '<br>' + dateString + '<br>' + data.message_text;
        return messageDiv;
    };
    function sendMessage(){
        if($('#messageText').val()){
            socket.emit('client message', {message: $('#messageText').val()});
            $('#messageText').val('');
        }
    }
    $sendButton.on("click", sendMessage);
    $mContainer[0].onscroll = function (ev) {
        if($mContainer[0].scrollTop === 0){
            socket.emit('load more messages', {offset: numberOfLoadedMessages});
        }
    };
    //Отправка сообщения по нажатию Enter
    window.onkeydown = function(key){
        if(key.which === 13) {
            sendMessage();
        }
    };
    //Загрузка дополнительных сообщений
    socket.on('extra messages loaded', function(data){
        numberOfLoadedMessages += data.length;
        var currTop = $mContainer[0].scrollHeight;

        for(var i = 0; i < data.length; i++){

            $mContainer.prepend(formateMessage(data[i]));
        }
        $mContainer[0].scrollTop = $mContainer[0].scrollHeight - currTop;
    });
    //Загрузка сообщений
    socket.on('load messages', function(data){

        numberOfLoadedMessages += data.length;
        for(var i = 0; i < data.length; i++){

            $mContainer.prepend(formateMessage(data[i]));
        }
        $mContainer[0].scrollTop = $mContainer[0].scrollHeight;
    });
    //Получение нового сообщения
    socket.on('new message', function(data){
        numberOfLoadedMessages += 1;
        $mContainer.append(formateMessage(data));

    });
    //Возврат отправленного сообщения пользователю(уже с именем пользователя и датой отправки)
    socket.on('resending message', function(myMessage){
        numberOfLoadedMessages += 1;
        $mContainer.append(formateMessage(myMessage));
        $mContainer[0].scrollTop = $mContainer[0].scrollHeight;
    });
});


