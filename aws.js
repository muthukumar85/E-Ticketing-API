var AWS = require('aws-sdk');
AWS_ACCESS_KEY_ID = 'AKIAV6VLTVNGHXLDQNVJ';
AWS_SECRET_ACCESS_KEY = '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';
AWS.config.update({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: 'ap-south-1',
});

module.exports = AWS;