import RoundIcon from "./RoundIcon";
import AudioPlayer from 'react-h5-audio-player';

const BotResponse = ({ encodedAudio }) => {
    return (
        <div className="d-flex" style={{ gap: "20px", visibility: "hidden" }}>
            <RoundIcon icon="desktop"/>
            <AudioPlayer src={encodedAudio} autoPlay={true}/>
        </div>
    )
}

export default BotResponse;