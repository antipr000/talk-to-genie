import { useState } from "react";
import RecordRTC, {StereoAudioRecorder} from "recordrtc";

export default function useAudioRecorder() {
    const [recorder, setRecorder] = useState(null);
    const [isRecording, setIsRecording] = useState(false);

    function startRecording() {
        navigator.getUserMedia({
            audio: true
        }, function (stream) {
            const recordAudio = RecordRTC(stream, {
                type: 'audio',
                mimeType: 'audio/webm',
                sampleRate: 44100,
                // used by StereoAudioRecorder
                // the range 22050 to 96000.
                // let us force 16khz recording:
                desiredSampRate: 16000,
             
                // MediaStreamRecorder, StereoAudioRecorder, WebAssemblyRecorder
                // CanvasRecorder, GifRecorder, WhammyRecorder
                recorderType: StereoAudioRecorder,
                // Dialogflow / STT requires mono audio
                numberOfAudioChannels: 1
            });
            setRecorder(recordAudio);
            recordAudio.startRecording();
            setIsRecording(true);
        }, function(error) {
            console.error("Error recording audio", JSON.stringify(error));
            setIsRecording(false);
            setRecorder(null);
        });
    }

    function stopRecording(cb) {
        if (!isRecording) {
            return;
        }

        recorder.stopRecording(function() {
            recorder.getDataURL(function(audioDataURL) {
                cb(audioDataURL);
            });
            setIsRecording(false);
        });
    }

    return { startRecording, stopRecording, isRecording };
}