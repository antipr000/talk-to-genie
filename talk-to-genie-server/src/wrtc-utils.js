const { PassThrough } = require('stream');
const { nonstandard: {
    RTCAudioSink,
    RTCVideoSink
  },
RTCPeerConnection,
RTCSessionDescription,
RTCIceCandidate } = require('wrtc');
const child = require('child_process');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
// const { StreamInput } = require('fluent-ffmpeg-multistream');
const path = require('path');
const fs = require('fs');

const offers = {};

let pc = new RTCPeerConnection({
    sdpSemantic: 'unified-plan'
});

let audioStream, audioSink;


pc.ondatachannel = e => {
    console.log("Received data channel", e);
    const receiveChannel = e.channel;
    receiveChannel.onmessage =e =>  console.log("messsage received!!!"  + e.data )
    receiveChannel.onopen = e => console.log("open!!!!");
    receiveChannel.onclose =e => console.log("closed!!!!!!");
};

const GuardarDatosAudio = (stream)=>{
  var myREPL = child.spawn('node');
  myFile = fs.createWriteStream('./4.sock');
  myREPL.stdout.pipe(process.stdout, { end: false });
  myREPL.stdout.pipe(myFile);
  myREPL.stdin.on("end", function() {
    process.stdout.write("REPL stream ended.");
    console.log('Salir')
  });
  
  myREPL.on('exit', function (code) {
    console.log('Salir')
    process.exit(code);
  });
  stream.pipe(myREPL.stdin, { end: false });
  stream.pipe(myFile);
  return './4.sock'
}

const onAudioData = ({ samples: { buffer } }) => {
  audioStream.write(Buffer.from(buffer));
}

const handleTrack = (event) => {
  console.log("Track event received!", event.track.kind);
  if (event.track.kind !== 'audio') {
      return null;
  }

  audioStream = new PassThrough();
  audioSink = new RTCAudioSink(event.track);
  console.log('id ', event.track.id)
  console.log('label ', event.track.label)
  console.log('enabled ', event.track.enabled)
  console.log('muted ', event.track.muted)
  console.log('readyState', event.track.readyState)


  audioSink.addEventListener('data', onAudioData);

  audioStream.on('end', () => {
    console.log("Stream ended!");
    audioSink.removeEventListener('data', onAudioData);
  });
}

function startStreaming() {
  pc.addEventListener("track", handleTrack);
}

function stopStreaming(fileName) {
  audioSink.removeEventListener('data', onAudioData);
  pc.removeEventListener("track", handleTrack);
  const guardarAudio = GuardarDatosAudio(audioStream);
  const outputAudioPath = path.join("generated", fileName);
  return new Promise((resolve, reject) => {
    ffmpeg()
      .addInput(guardarAudio)
      .addInputOptions([
        '-f s16le',
        '-ar 48k',
        '-ac 1',
      ])
      .on('start', () => {
        console.log('Creating audio file.');
      })
      .on('end', () => {
        console.log('Created audio file');
        audioStream = null;
        audioSink = null;
        resolve(outputAudioPath);
      })
      .output(outputAudioPath)
      .run();
  });
}


async function initiateConnection(sdp, remoteId) {
    if (offers[remoteId]) {
        console.log(`${remoteId} is already connected. Skipping!`);
        return null;
    } else {
        console.log("Initiating new connection w: ", sdp, remoteId);
        offers[remoteId] = sdp;
        await pc.setRemoteDescription(sdp);
        console.log("Creating new answer!");
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        return answer;
    }
}

module.exports = { pc, initiateConnection, startStreaming, stopStreaming };