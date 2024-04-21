import { useEffect, useState } from "react";
import RoundIcon from "./RoundIcon";
import useAudioRecorder from "../hooks/useAudioRecorder";
import useSocket from "../hooks/useSocket";



const AudioInput = ({}) => {
    const [history, setHistory] = useState([]);
    const { startRecording, stopRecording, isRecording } = useAudioRecorder();
    
   const { socket, isSocketReady } = useSocket();

   useEffect(() => {
    if(socket) {
        // Add listeners here
        socket.on('message', (data) => {
            console.log("Received on ws: ", data);
        })
    }
   }, [socket]);

    

    return (
        <div className="fw h-auto d-flex flex-start">
            {!isRecording ? <RoundIcon icon="microphone" onClick={isSocketReady && startRecording}/> : <RoundIcon icon="stop" onClick={stopRecording}/>}
        </div>
    )
};


export default AudioInput;