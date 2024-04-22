import { io } from "socket.io-client";
import { WS_SERVER_URL } from "./constants";

export const socket = io(WS_SERVER_URL);
