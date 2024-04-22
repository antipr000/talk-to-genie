import RoundIcon from "./RoundIcon";
import useAudioRecorder from "../hooks/useAudioRecorder";



const AudioInput = ({addUserAudio}) => {
    const { startRecording, stopRecording, isRecording } = useAudioRecorder();


    return (
        <div className="fw h-auto d-flex flex-start">
            {!isRecording ? <RoundIcon icon="microphone" onClick={startRecording}/> : 
            <RoundIcon icon="stop" onClick={() => { stopRecording(addUserAudio) }}/>}
        </div>
    )
};


export default AudioInput;