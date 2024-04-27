import { useRef, useState } from "react";
import RecordRTC, {StereoAudioRecorder} from "recordrtc";
import { peerConnection, negotiate } from "../webrtc.utils";
import { socket } from "../socket";

const sleep = async (ms) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

export default function useAudioRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const silenceTimer = useRef(0);
    const audioContext = useRef(null);

    async function startRecording(cb) {
        socket.emit('start-streaming', {});
        const audioStream = 
            await navigator.mediaDevices.getUserMedia({audio: true});
        peerConnection.onnegotiationneeded = () => {
            console.log("Negotiation needed!");
            negotiate(true).then(() => console.log("Negotiation done"));
        }
        peerConnection.addTrack(audioStream.getAudioTracks()[0], audioStream);
        audioContext.current = new (window.AudioContext || window.webkitAudioContex)();
        const audioStreamSource = audioContext.current.createMediaStreamSource(audioStream);
        setIsRecording(true);
    
        const analyzer = audioContext.current.createAnalyser();
        analyzer.fftSize = 2048;
        audioStreamSource.connect(analyzer);

        // Start analyzing audio data
        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const detectSilence = async () => {
            while(true) {
                analyzer.getByteTimeDomainData(dataArray);
                const amplitude = Math.max(...dataArray);
                if (amplitude < 129) {
                    silenceTimer.current += 1000;
                } else {
                    silenceTimer.current = 0;
                }

                if (silenceTimer.current >= 5000) {
                    console.log('Silence detected for over 5 seconds');
                    stopRecording(cb);
                    return; // Stop further detection
                }
                await sleep(1000); // Sleep for 1 second before retrying
            }
        };

        detectSilence();
          
    }

    async function stopRecording(cb) {
        socket.emit('stop-streaming', {});
        setIsRecording(false);
        cb();
    }

    return { startRecording, stopRecording, isRecording };
}