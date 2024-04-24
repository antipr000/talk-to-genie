import { socket } from "./socket";
import { v4 } from 'uuid';

let peerConnection, dc;
const remoteOffers = {};

const setupDataChannel = () => {
    dc = peerConnection.createDataChannel("sendChannel", {
        reliable: false
    });
    dc.onmessage =e =>  console.log("messsage received!!!"  + e.data )
    dc.onopen = e => console.log("open!!!!");
    dc.onclose = e => console.log("closed!!!!!!");
}

const negotiate = async () => {
    const id = v4();
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('peer-connect', {sdp: peerConnection.localDescription, id: id});
}

const initiateWebRTCConnection = async () => {
    peerConnection = new RTCPeerConnection({
        sdpSemantics: 'unified-plan'
    });
    peerConnection.onicecandidate = e =>  {
        console.log("New ICE candidate", e.candidate);
        socket.emit('newICECandidate', e.candidate);
    };
    setupDataChannel();
    await negotiate();
}

socket.on('newICECandidate', (params) => {
    console.log("Received ICE candidate!", params);
    peerConnection.addIceCandidate(params.candidate);
});

socket.on('peer-connect', async ({ sdp, id }) => {
    console.log("Received remote sdp!", sdp);
    if (remoteOffers[id]) {
        console.log("Already setup with offer!")
    } else {
        console.log("Received new offer!");
        remoteOffers[id] = sdp;
        await peerConnection.setRemoteDescription(sdp);
    }
})


export { peerConnection, dc, initiateWebRTCConnection, negotiate };