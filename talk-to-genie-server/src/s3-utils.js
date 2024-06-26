const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1',
  });

const s3 = new AWS.S3();

const uploadUrl = (params) => {
  return `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`
}

function uploadFileInternal(params) {
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
        if (err) {
            reject(err);
        } else {
            resolve(uploadUrl(params));
        }
    });
  });
}


function uploadFile(fileName, data) {
    const params = {
        Bucket: process.env.AWS_AUDIO_BUCKET,
        Key: `${process.env.AWS_USER_AUDIO_BUCKET_PREFIX}/${fileName}`,
        Body: data
      };

      return uploadFileInternal(params);
      
}

function downloadFile(fileName) {
    const params = {
        Bucket: process.env.AWS_TRANSCRIBE_BUCKET,
        Key: fileName,
      };

      return new Promise((resolve, reject) => {
        s3.getObject(params, (err, data) => {
            if (err) {
              reject(err);
            } else {
              const jsonContent = JSON.parse(data.Body.toString());
              const transcript = jsonContent.results.transcripts.reduce((acc, val) => acc + " " + val.transcript, "");
              resolve(transcript);
            }
        });
      });
      
}

module.exports = { uploadFile, uploadFileInternal, downloadFile };