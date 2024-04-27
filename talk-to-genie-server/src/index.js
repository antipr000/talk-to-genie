// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4, v4 } = require('uuid');
const cors = require('cors');
const { uploadFile, downloadFile } = require('./s3-utils');
const { startTranscriptionJob, checkIfTranscriptionDone } = require('./transcribe');
const { getChatCompletionCached, getChatCompletion } = require('./openai-utils');
const { convertTextToSpeech } = require('./polly-utils');
const { initiateConnection, startStreaming, stopStreaming } = require('./wrtc-utils');
const fs = require('fs');
 
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server);


io.on('connection', (socket) => {
  console.log('Here connected to client');
  
  let peerConnection;

  socket.on('connected', () => {
    console.log("Connected via socket");
  });

  socket.on('newICECandidate', async (candidate) => {
    if (candidate) {
      console.log('Received ICE candidate', candidate);
      if (peerConnection) {
        await peerConnection.addIceCandidate(candidate);
      }
    }
  });

  socket.on('peer-connect', async ({ sdp, id, reneg }) => {
    console.log("Here, sdp is", sdp);
    const remoteId = uuidv4();
    const {pc, answer} = await initiateConnection(sdp, id, reneg);
    if (pc) {
      peerConnection = pc;
      peerConnection.onicecandidate = (event) => {
        console.log("ICE candidate: ", event.candidate);
        socket.emit('newICECandidate', event);
      }
      if (answer) {
        socket.emit('peer-connect', { sdp: answer, id: remoteId });
      }
    }
  });

  socket.on('start-streaming', () => {
    startStreaming();
  });

  socket.on('stop-streaming', async () => {
    console.log("Stream stopped!");
    const fileName = `${v4()}.mp3`;
    const localPath = await stopStreaming(fileName);

    // Upload file to S3
    const data = fs.readFileSync(localPath);
    const uploadedUrl = await uploadFile(fileName, data);
  
    console.log("File uploaded");
    socket.emit('audio-upload', { url: uploadedUrl });

    const audioUrl = await orchestrator(fileName);
    if (audioUrl) {
      socket.emit("message", { audio: audioUrl, id: fileName.split(".")[0] });
    }
  });
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


async function orchestrator(fileName) {
  // Upload the audio file to s3
  console.log("Orchestrating: ", fileName);
  try {
    console.log("File uploaded");
    await startTranscriptionJob(fileName);
    console.log("Transcription job started.");
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

    console.log("Transcription completed: ", outputFile);

    if (outputFile === null) {
      throw new Error("Failed to fetch transcription result");
    }

    const transcripts = await downloadFile(outputFile);
    console.log("Transcripts generated");

    const openAISuggestion = await getChatCompletion(transcripts);
    console.log("OpenAI suggestions generated: ", openAISuggestion);

    if (!openAISuggestion) {
      console.log("Failed to generate OpenAI suggestion for given request");
      return null;
    }

    return await convertTextToSpeech(openAISuggestion, fileName);
  } catch (e) {
    console.log("Failed to do job for file: ", fileName);
    console.log(e);
    return null;
  }
}

async function fakeOrchestrator(blob, fileName) {
  await sleep(1000);
  return "https://intermediary-audio-files.s3.amazonaws.com/response-audios/filename.mp3";
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
