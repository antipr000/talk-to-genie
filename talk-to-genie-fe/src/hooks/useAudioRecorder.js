import { useState } from "react";
import RecordRTC, {StereoAudioRecorder} from "recordrtc";
import { peerConnection, negotiate } from "../webrtc.utils";

export default function useAudioRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [audioStream, setAudioStream] = useState(null);

    async function startRecording() {
        const audio = await navigator.mediaDevices.getUserMedia({audio: true});
        peerConnection.onnegotiationneeded = () => {
            console.log("Negotiation needed!");
            negotiate().then(() => console.log("Negotiation done"));
        }
        setAudioStream(audio);
        peerConnection.addTrack(audio.getAudioTracks()[0], audio);
        setIsRecording(true);
    }

    async function stopRecording(cb) {
        const audioTrack = audioStream.getAudioTracks()[0];
        audioTrack.stop();
        setAudioStream(null);
        setIsRecording(false);
        cb(null);
    }

    return { startRecording, stopRecording, isRecording };
}