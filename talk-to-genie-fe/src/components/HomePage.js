import { useEffect, useState } from "react";
import UserAudio from "./UserAudio";
import BotResponse from "./BotResponse";
import AudioInput from "./AudioInput";
import { socket } from "../socket";
import { initiateWebRTCConnection, peerConnection, dc } from "../webrtc.utils";
import { Button } from "@blueprintjs/core";
import RoundIcon from "./RoundIcon";
import ProcessingSpinner from "./ProcessingSpinner";

const AudioCompRenderer = ({type, audio, computed, loading, index, handleComputeEnd}) => {
    if (type === 'user') {
        return <UserAudio 
        key={index} 
        encodedAudio={audio} 
        computed={computed}
        loading={loading} 
        index={index} 
        handleComputeEnd={handleComputeEnd}/>
    } else {
        return <BotResponse key={index} encodedAudio={audio} index={index}/>
    }
}

export default function HomePage() {
    const [audios, setAudios] = useState([]);
    const [isSocketReady, setIsSocketReady] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleNewUserAudio = () => {
        setIsProcessing(true);
        setAudios(prevState => 
            [...prevState, 
                {type: "user", audio: null, computed: false, loading: true}]);
    }

    const handleComputeEnd = (index) => {
        const allAudios = [...audios];
        allAudios[index].computed = true;
        setAudios(allAudios);
    }

    

    useEffect(() => {
        socket.on('connect', () => {
            setIsSocketReady(true);
            initiateWebRTCConnection();
        });

        function handleAudioUpload(data) {
            const url = data.url;
            setAudios(prevState => {
                const allAudios = [...prevState];
                console.log(allAudios);
                const index = allAudios.findIndex(el => el.loading);
                allAudios[index].audio = url;
                allAudios[index].loading = false;
                console.log("updated audios", allAudios);
                return allAudios;
            });
        }
    
        function handleMessage(data) {
            console.log("Received message", data);
            const encodedAudio = data.audio;
            const id = data.id;
            
            setAudios(prevState => {
                if (!prevState.find(audio => audio.id === id)) {
                    return [...prevState, {type: "bot", audio: encodedAudio, id: id}]
                }
                return prevState;
            });

            setIsProcessing(false);
        }

        socket.on('audio-upload', handleAudioUpload);

        socket.on("message", handleMessage);
    }, []);

    if (!isSocketReady) {
        return (<div></div>)
    }

    return (
        <div className="fw d-flex flex-column" style={{ gap: "30px" }}>
            <div className="d-flex fw" style={{ gap: "30px", justifyContent: "center" }}>
                <AudioInput addUserAudio={handleNewUserAudio}/>
                <RoundIcon icon="send-message" onClick={() => {
                    if (dc) {
                        dc.send("Ping!")
                    }
                }}/>
            </div>
            {isProcessing && <ProcessingSpinner />}
            { audios.map((audio, index) => <AudioCompRenderer {...audio} index={index} handleComputeEnd={handleComputeEnd}/>) }
        </div>
    )
}