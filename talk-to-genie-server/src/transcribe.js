const AWS = require('aws-sdk');
const os = require('os');
const path = require('path');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1', // Set your desired AWS region
});

const transcribe = new AWS.TranscribeService();

function startTranscriptionJob(fileName) {
    const filePath = `s3://${process.env.AWS_AUDIO_BUCKET}/${process.env.AWS_USER_AUDIO_BUCKET_PREFIX}/${fileName}`

    const [name, _] = fileName.split(".");
    const params = {
        TranscriptionJobName: name,
        LanguageCode: 'en-US',
        Media: {
          MediaFileUri: filePath,
        },
        OutputBucketName: process.env.AWS_TRANSCRIBE_BUCKET, // Set the S3 bucket where the transcription results will be stored
      };
      
      return new Promise((resolve, reject) => {
        transcribe.startTranscriptionJob(params, (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(true);
            }
          });
      });
}

function checkIfTranscriptionDone(fileName) {
    const [name, _] = fileName.split(".");
    return new Promise((resolve, reject) => {
        const getParams = {
            TranscriptionJobName: name
          };
          
          transcribe.getTranscriptionJob(getParams, (err, data) => {
            if (err) {
                resolve(null);
            } else {
                resolve(data.TranscriptionJob.Transcript.TranscriptFileUri);
            }
          });
    });
}

module.exports = { startTranscriptionJob, checkIfTranscriptionDone };
