import RoundIcon from "./RoundIcon";
import { Intent, ProgressBar } from "@blueprintjs/core";
import AudioPlayer from 'react-h5-audio-player';
const UserAudio = ({ encodedAudio, computed, loading, index, handleComputeEnd }) => {
    return (
        <div className="d-flex" style={{ gap: "20px", visibility: "hidden" }}>
            <RoundIcon icon="user"/>
            {loading? <ProgressBar animate intent={Intent.PRIMARY}/> : 
            <AudioPlayer src={encodedAudio} autoPlay={false} style={{width: "50%"}}/>}
        </div>
    )
}

export default UserAudio;