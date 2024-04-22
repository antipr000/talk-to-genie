import RoundIcon from "./RoundIcon";
import AudioPlayer from 'react-h5-audio-player';

const BotResponse = ({ encodedAudio }) => {
    return (
        <div className="d-flex" style={{ gap: "20px" }}>
            <RoundIcon icon="desktop"/>
            <AudioPlayer src={encodedAudio} autoPlay={false}/>
        </div>
    )
}

export default BotResponse;