var aws = require('aws-sdk');
exports.handler = function(params, context, callback) {
    var key = params.srcKey;
    var dstKey = params.dstKey;
    var eltr = new aws.ElasticTranscoder({
        region: 'us-west-2'
    });
    var eltrParams = {
        PipelineId: '1520791477867-y5lgcc',
        //OutputKeyPrefix: 'video/',
        Input:{
            Key: key
        },
        Output:{
            Key: dstKey,
            PresetId: '1351620000001-100070'
        }
    };
    var job = eltr.createJob(eltrParams);
    job.on('error', function(error, response){
        console.log('Faild to transcode a video '+key+' :'+error);
        callback(error, dstKey);
    });
    job.on('success', function (response){
        callback(null, dstKey);
    });
    job.send();
};