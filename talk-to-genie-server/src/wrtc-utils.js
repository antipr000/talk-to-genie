const { PassThrough } = require('stream');
const { nonstandard: {
    RTCAudioSink,
  },
RTCPeerConnection} = require('wrtc');
const { createAudioFile } = require('./ffmpeg.processor');

const offers = {};

let pc;

let audioStream, audioSink;

const initialisePeerConnection = () => {
  pc = new RTCPeerConnection({
    sdpSemantic: 'unified-plan'
  });

  pc.ondatachannel = e => {
    console.log("Received data channel", e);
    const receiveChannel = e.channel;
    receiveChannel.onmessage =e =>  console.log("messsage received!!!"  + e.data )
    receiveChannel.onopen = e => console.log("open!!!!");
    receiveChannel.onclose =e => console.log("closed!!!!!!");
  };
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
}

function startStreaming() {
  pc.addEventListener("track", handleTrack);
}

function stopStreaming(fileName) {
  audioSink.removeEventListener('data', onAudioData);
  pc.removeEventListener("track", handleTrack);
  audioSink = null;
  return createAudioFile(fileName, audioStream);
}


async function initiateConnection(sdp, remoteId) {
    if (offers[remoteId]) {
        console.log(`${remoteId} is already connected. Skipping!`);
        return null;
    } else {
        console.log("Initiating new connection w: ", sdp, remoteId);
        if (pc) {
          pc.close();
        }
        initialisePeerConnection();
        offers[remoteId] = sdp;
        await pc.setRemoteDescription(sdp);
        console.log("Creating new answer!");
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        return {pc, answer};
    }
}

module.exports = { pc, initiateConnection, startStreaming, stopStreaming, audioSink };