const { nonstandard: {
    RTCAudioSink,
    RTCVideoSink
  },
RTCPeerConnection,
RTCSessionDescription,
RTCIceCandidate } = require('wrtc');

const offers = {};

let pc = new RTCPeerConnection({
    sdpSemantic: 'unified-plan'
});

pc.ondatachannel = e => {
    console.log("Received data channel", e);
    const receiveChannel = e.channel;
    receiveChannel.onmessage =e =>  console.log("messsage received!!!"  + e.data )
    receiveChannel.onopen = e => console.log("open!!!!");
    receiveChannel.onclose =e => console.log("closed!!!!!!");
};

pc.ontrack = (event) => {
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
        console.log("Received data", buffer);
    });
}


async function initiateConnection(sdp, remoteId) {
    if (offers[remoteId]) {
        console.log(`${remoteId} is already connected. Skipping!`);
        return null;
    } else {
        console.log("Closing existing connections if exists");
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