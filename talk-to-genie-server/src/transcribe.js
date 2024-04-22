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
    console.log("Filename: ", fileName);
    const [name, _] = fileName.split(".");
    console.log("Name: ", name);
    return new Promise((resolve, reject) => {
        const getParams = {
            TranscriptionJobName: name
          };
          
          transcribe.getTranscriptionJob(getParams, (err, data) => {
            if (err) {
                resolve(null);
            } else {
                if (!data.TranscriptionJob.Transcript.TranscriptFileUri) {
                  resolve(null);
                }
                console.log("Here", data.TranscriptionJob.Transcript.TranscriptFileUri);
                resolve(data.TranscriptionJob.Transcript.TranscriptFileUri);
            }
          });
    });
}

// checkIfTranscriptionDone('1a2590ba-ab26-4c23-8bc0-bb751d4d4e66.wav').then((res) => {
//   const splitted = res.split("/");
//   const outputFile = splitted[splitted.length - 1];
//   console.log(outputFile);
// });

module.exports = { startTranscriptionJob, checkIfTranscriptionDone };
