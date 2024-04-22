const AWS = require('aws-sdk');
const { uploadFileInternal } = require('./s3-utils');


AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1',
});

const polly = new AWS.Polly();

function convertTextToSpeech(text, fileName) {
    const params = {
        OutputFormat: 'mp3',
        Text: text,
        VoiceId: 'Matthew'
    };

    const [name, _] = fileName.split(".");

    return new Promise((resolve, reject) => {
        polly.synthesizeSpeech(params, (err, data) => {
            if (err) {
                console.error('Error synthesizing speech:', err);
                reject(err);
            } else {
                console.log('Speech synthesized successfully');

                uploadFileInternal({
                    Bucket: process.env.AWS_AUDIO_BUCKET,
                    Key: `${process.env.AWS_POLLY_AUDIO_BUCKET_PREFIX}/${name}.mp3`,
                    Body: data.AudioStream
                }).then(() => {
                    resolve(`https://${process.env.AWS_AUDIO_BUCKET}.s3.amazonaws.com/${process.env.AWS_POLLY_AUDIO_BUCKET_PREFIX}/${name}.mp3`);
                }).catch((err) => {
                    reject(err);
                });
            }
        });
    });
}

module.exports = { convertTextToSpeech };