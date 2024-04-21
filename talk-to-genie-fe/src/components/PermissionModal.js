import React, { useState } from 'react';
import { Button, Dialog, DialogBody, DialogFooter, Intent } from '@blueprintjs/core';

const PERMISSION_MODAL_TEXT_MAP = {
    'prompt': 'This website requires access to your microphone for certain features. Please grant permission when prompted.',
    'denied': 'You have denied access to your microphone. Enable the permission manually by going to site settings.',
    'granted': ''
}

const MicrophonePermissionModal = ({ permissionState, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
  
    const handleGrantPermission = () => {
        // Open the browser's permissions dialog to request microphone permission
        setIsLoading(true);
        navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            // Microphone permission is granted
            onClose();
        })
        .catch(error => {
            console.error('Error granting microphone permission:', error);
            onClose();
        });
        setIsLoading(false);
     };
    
  
    return (
      <Dialog
        isOpen={permissionState !== 'granted'}
        title="Microphone Permissions"
        isCloseButtonShown={false}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
      >
        <DialogBody>
            <p>{PERMISSION_MODAL_TEXT_MAP[permissionState]}</p>
        </DialogBody>

        {(permissionState === 'prompt') &&
        <DialogFooter>
            <Button intent={Intent.PRIMARY} onClick={handleGrantPermission} loading={isLoading} disabled={isLoading}>Grant Permission</Button>
        </DialogFooter>}
        
      </Dialog>
    );
  };
  
  export default MicrophonePermissionModal;