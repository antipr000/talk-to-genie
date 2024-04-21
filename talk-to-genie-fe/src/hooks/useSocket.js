import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { WS_SERVER_URL } from "../constants";

export default function useSocket() {
    const [socketIO, setSocketIO] = useState(null);
    const [socket, setSocket] = useState(null);
    const [isSocketReady, setIsSocketReady] = useState(false);

    useEffect(() => {
        const socketio = io(WS_SERVER_URL);
        const socket = socketio.on('connect', function() {
            setIsSocketReady(true);
        });
        setSocketIO(socketio);
        setSocket(socket);
    }, []);

    
    return { socket, socketIO, isSocketReady };
}