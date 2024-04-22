import './App.css';
import { useEffect, useState } from 'react';
import MicrophonePermissionModal from './components/PermissionModal';
import { Navbar, NavbarGroup, NavbarHeading, Alignment } from '@blueprintjs/core';
import "@blueprintjs/core/lib/css/blueprint.css";
// include blueprint-icons.css for icon font support
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import 'react-h5-audio-player/lib/styles.css';
import HomePage from './components/HomePage';

const getMicrophonePermissionState = async () => {
  const permission = await navigator.permissions.query({ name: 'microphone' });
  return permission.state;
}

function App() {
  const [microphonePermissionState, setMicrophonePermissionState] = useState(null);
  useEffect(() => {
    // Check if the browser supports mediaDevices and enumerateDevices method
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      // Check if the browser has microphone permission
      getMicrophonePermissionState().then(state => {
        console.log("Microphone permissions state: ", state);
        setMicrophonePermissionState(state);
      });
    } else {
      console.log("Browser does not support mediaDevices");
    }
  }, []);

  return (
    <div className='App'>
      <MicrophonePermissionModal 
        permissionState={microphonePermissionState} 
        onClose={async () => {setMicrophonePermissionState(await getMicrophonePermissionState())}}/>
        <Navbar fixedToTop style={{ backgroundColor: '#454545', color: 'white'}}>
        <NavbarGroup align={Alignment.LEFT}>
            <NavbarHeading style={{ display: 'flex', flexDirection: 'row', gap: "5px", alignItems: "center" }}>
              <img src='logo-main.png' width={50} height={50} alt='logo'/>
              <h3> Talk to Genie  </h3>
            </NavbarHeading>
        </NavbarGroup>
      </Navbar>

      <div className="body-container">
        <HomePage />
      </div>
    </div>
  );
}

export default App;
