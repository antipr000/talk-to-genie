import { useEffect, useState } from "react";
import UserAudio from "./UserAudio";
import BotResponse from "./BotResponse";
import AudioInput from "./AudioInput";
import { socket } from "../socket";

const AudioCompRenderer = ({type, audio, computed, index, handleComputeEnd}) => {
    if (type === 'user') {
        return <UserAudio key={index} encodedAudio={audio} computed={computed} index={index} handleComputeEnd={handleComputeEnd}/>
    } else {
        return <BotResponse key={index} encodedAudio={audio} index={index}/>
    }
}

export default function HomePage() {
    const [audios, setAudios] = useState([]);
    const [isSocketReady, setIsSocketReady] = useState(false);

    const handleNewUserAudio = (encodedAudio) => {
        setAudios(prevState => [...prevState, {type: "user", audio: encodedAudio, computed: false}]);
    }

    const handleComputeEnd = (index) => {
        const allAudios = [...audios];
        allAudios[index].computed = true;
        setAudios(allAudios);
    }

    useEffect(() => {
        socket.on('connect', () => {
            setIsSocketReady(true);
        });
        socket.on("message", (data) => {
            console.log("Received message", data);
            const encodedAudio = data.audio;
            const id = data.id;
            
            setAudios(prevState => {
                if (!prevState.find(audio => audio.id === id)) {
                    return [...prevState, {type: "bot", audio: encodedAudio, id: id}]
                }
                return prevState;
            });
        })
    }, []);

    if (!isSocketReady) {
        return (<div></div>)
    }

    return (
        <div className="d-flex flex-column" style={{ gap: "30px" }}>
            { audios.map((audio, index) => <AudioCompRenderer {...audio} index={index} handleComputeEnd={handleComputeEnd}/>) }
            <AudioInput addUserAudio={handleNewUserAudio}/>
        </div>
    )
}