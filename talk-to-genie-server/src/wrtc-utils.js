const { PassThrough } = require('stream');
const { nonstandard: {
    RTCAudioSink,
    RTCVideoSink
  },
RTCPeerConnection,
RTCSessionDescription,
RTCIceCandidate } = require('wrtc');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const { StreamInput } = require('fluent-ffmpeg-multistream');
const path = require('path');

const outputAudioPath = path.join(__dirname, 'out-audio.mp3');

const offers = {};

let pc = new RTCPeerConnection({
    sdpSemantic: 'unified-plan'
});

const { track } = pc.addTransceiver('audio').receiver;
const sink = new RTCAudioSink(track);

sink.ondata = (data) => {
    console.log("Sink ondata: ", data);
}

pc.ondatachannel = e => {
    console.log("Received data channel", e);
    const receiveChannel = e.channel;
    receiveChannel.onmessage =e =>  console.log("messsage received!!!"  + e.data )
    receiveChannel.onopen = e => console.log("open!!!!");
    receiveChannel.onclose =e => console.log("closed!!!!!!");
};

pc.ontrack = (event) => {
    console.log("Track event received!", event.track.kind);
    if (event.track.kind !== 'audio') {
        return null;
    }

      const audioStream = new PassThrough();
      const audioSink = new RTCAudioSink(event.track);
      console.log('id ', event.track.id)
      console.log('label ', event.track.label)
      console.log('enabled ', event.track.enabled)
      console.log('muted ', event.track.muted)
      console.log('readyState', event.track.readyState)
      audioSink.addEventListener('data', ({ samples: { buffer } }) => {
        audioStream.write(Buffer.from(buffer));
      });

      ffmpeg()
          .addInput((new StreamInput(audioStream)).url)
          .addInputOptions([
            '-f s16le',
            '-ar 48k',
            '-ac 1',
          ])
          .on('start', () => {
            console.log('Start recording')
          })
          .on('end', () => {
            console.log('Stop recording')
          })
          .output(outputAudioPath)
          .run();
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

module.exports = { pc, initiateConnection };