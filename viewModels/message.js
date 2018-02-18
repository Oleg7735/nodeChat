var s3Utils = require('../lib/S3utils');
module.exports = {
    getMessageViewModel: function(message){
        message.avatar = s3Utils.createS3ObjectUrl(message.avatar);
        return message;
    },
    getMessagesCollectionViewModel: function(messages){
        for(var i = 0; i < messages.length; i++){
            var m = {
                author:messages[i].author,
                avatar:s3Utils.createS3ObjectUrl(messages[i].avatar),
                message_text:messages[i].message_text,
                send_time: messages[i].send_time
            };
            messages[i] = m;
        }
        return messages;
    }
};