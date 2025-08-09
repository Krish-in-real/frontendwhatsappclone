// socket.js
import { io } from "socket.io-client";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
const socketMap = {};

/**
 * Initialize a socket for a specific user
 */
export function initSocket(userId) {
    if (!userId) throw new Error("userId is required");

    // Reuse if socket already exists
    if (socketMap[userId]) return socketMap[userId];

    const socket = io(BACKEND, {
        path: "/socket.io",
        transports: ["websocket"],
        autoConnect: true
    });

    socket.on("connect", () => {
        console.log(`Socket connected for ${userId}:`, socket.id);
        socket.emit("register", { user_id: userId });
    });

    socket.on("disconnect", () => {
        console.log(`Socket disconnected for ${userId}`);
    });

    socketMap[userId] = socket;
    return socket;
}

/**
 * Get the socket for a specific user
 */
export function getSocket(userId) {
    return socketMap[userId] || null;
}

/**
 * Close the socket for a specific user
 */
export function closeSocket(userId) {
    if (socketMap[userId]) {
        socketMap[userId].disconnect();
        delete socketMap[userId];
    }
}
