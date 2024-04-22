import RoundIcon from "./RoundIcon";
import { Button, Intent } from "@blueprintjs/core";
import { useState } from "react";
import AudioPlayer from 'react-h5-audio-player';
import { socket } from "../socket";

const UserAudio = ({ encodedAudio, computed, index, handleComputeEnd }) => {
    const [loading, setLoading] = useState(false);


    const handleClick = () => {
        setLoading(true);
        socket.emit("message", {audio: encodedAudio});
        handleComputeEnd(index);
        setLoading(false);
    }

    return (
        <div className="d-flex" style={{ gap: "20px" }}>
            <RoundIcon icon="user"/>
            <AudioPlayer src={encodedAudio} autoPlay={false} style={{width: "50%"}}/>
            <Button 
                rightIcon="send-message" 
                large text="Ask GPT" 
                intent={Intent.PRIMARY} 
                outlined 
                disabled={computed}
                loading={loading}
                onClick={handleClick}/>
        </div>
    )
}

export default UserAudio;