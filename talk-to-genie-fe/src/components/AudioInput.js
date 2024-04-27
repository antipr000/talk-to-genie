import RoundIcon from "./RoundIcon";
import useAudioRecorder from "../hooks/useAudioRecorder";



const AudioInput = ({addUserAudio}) => {
    const { startRecording, stopRecording, isRecording } = useAudioRecorder();


    return (
        <div className="d-flex flex-start">
            {!isRecording ? <RoundIcon icon="microphone" onClick={() => { startRecording(addUserAudio) }}/> : 
            <RoundIcon icon="stop"/>}
        </div>
    )
};


export default AudioInput;