import { io as ioClient } from 'socket.io-client';
import { VITE_BACKEND_WEB_SOCKET_URI } from './url_helper.js';

let socket;

export function initSocket(token) {
  if (!socket) {
    socket = ioClient(VITE_BACKEND_WEB_SOCKET_URI, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: false,
    });
  }

  if (token) {
    socket.auth = { token };
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
