// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');
const os = require('os');
const { uploadFile, downloadFile } = require('./s3-utils');
const { startTranscriptionJob, checkIfTranscriptionDone } = require('./transcribe');
 
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server);




io.on('connection', (socket) => {
  console.log('Here connected to client');
  // Handle events (e.g., chat messages, notifications) here
  socket.on('message', (data) => {
    const dataURL = data.audio.dataURL;
    const fileName = `${uuidv4()}.wav`; 
    const blob = dataURLtoBlob(dataURL);
    console.log("Blob is: ", blob);
    saveBlob(blob, fileName);
  })
});

server.listen(8000, () => {
  console.log('Server listening on port 8000');
});

function dataURLtoBlob(dataURL) {
  const byteString = atob(dataURL.split(',')[1]);
  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

async function saveBlob(blob, fileName) {
  // Convert Blob to Buffer
  const buffer = Buffer.from( await blob.arrayBuffer() );
  uploadFile(fileName, buffer);
}

async function orchestrator(blob, fileName) {
  // Upload the audio file to s3
  try {
    await uploadFile(fileName, data);
    await startTranscriptionJob(fileName);

    iterations = 10;
    let outputFile = null;
    while(iterations > 0) {
      const result = await checkIfTranscriptionDone(fileName);
      if (result === null) {
        // Sleep for a second
        await sleep(1000);
      } else {
        const splitted = result.split("/");
        outputFile = splitted[splitted.length - 1];
        break;
      }
      iterations -= 1;
    }

    if (outputFile === null) {
      throw new Error("Failed to fetch transcription result");
    }

    const transcripts = await downloadFile(outputFile);

  } catch (e) {
    console.log("Failed to do job for file: ", fileName);
  }
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
