// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server);




io.on('connection', (socket) => {
  console.log('Here connected to client');
  // Handle events (e.g., chat messages, notifications) here
  socket.on('message', (data) => {
    const dataURL = data.audio.dataURL;
    const fileName = uuidv4(); 
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

  fs.writeFile(`${fileName}.wav`, buffer, () => console.log('audio saved!') );
}