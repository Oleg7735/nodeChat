//$(function(){
//document.addEventListener('DOMContentLoaded', function(){
    var socket = io();
    //var but = document.getElementById('mainButton');
    //var form = document.getElementById('mainForm');
    var numberOfLoadedMessages = 0;
    //but.onclick = function(){
    //mainButton.onclick = sendMessage;
    /*mainButton.onclick = function(){
        console.log('message sent');
        sendMessage();
    };*/
    //var $message = $('#messageText');
    //$('#mainButton').click(sendMessage);
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
    var $mContainer = $('.messageContainer');
    $mContainer[0].onscroll = function (ev) {
        if($mContainer[0].scrollTop === 0){
            socket.emit('load more messages', {offset: numberOfLoadedMessages});
        }
    };


    function sendMessage(){
        /*var currTop = $mContainer[0].scrollHeight;
        for(var i = 0; i < 10; i++)            {
            $mContainer.prepend('<br>' + 'test');
        }
        $mContainer[0].scrollTop = $mContainer[0].scrollHeight - currTop;*/
        if($('#messageText').val()){
            socket.emit('client message', {message: $('#messageText').val()});
            $('#messageText').val('');
        }
    }
    window.onkeydown = function(key){
        if(key.which === 13) {
            sendMessage();
        }
    };

    socket.on('extra messages loaded', function(data){
        numberOfLoadedMessages += data.length;
        var currTop = $mContainer[0].scrollHeight;
        /*var date;
        var dateString;*/
        for(var i = 0; i < data.length; i++){
            /*date = new Date(data[i].send_time);
            dateString = date.toLocaleString();*/
            $mContainer.prepend(formateMessage(data[i]));
        }
        $mContainer[0].scrollTop = $mContainer[0].scrollHeight - currTop;
    });
    socket.on('load messages', function(data){
        /*var date;
        var dateString;*/
        numberOfLoadedMessages += data.length;
        for(var i = 0; i < data.length; i++){
            /*date = new Date(data[i].send_time);
            dateString = date.toLocaleString();*/
            $mContainer.prepend(formateMessage(data[i]));
        }
        $mContainer[0].scrollTop = $mContainer[0].scrollHeight;
    });

    socket.on('new message', function(data){
        /*var date;
        var dateString;
        date = new Date(data.send_time);
        dateString = date.toLocaleString();*/
        numberOfLoadedMessages += 1;
        $mContainer.append(formateMessage(data));

    });
    //Возврат отправленного сообщения пользователю(уже с именем пользователя и датой отправки)
    socket.on('resending message', function(myMessage){
        /*var date;
        var dateString;
        date = new Date(myMessage.send_time);
        dateString = date.toLocaleString();*/
        numberOfLoadedMessages += 1;
        $mContainer.append(formateMessage(myMessage));
        $mContainer[0].scrollTop = $mContainer[0].scrollHeight;
    });
//});


