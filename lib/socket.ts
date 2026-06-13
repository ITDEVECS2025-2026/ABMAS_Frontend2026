import { io, Socket } from 'socket.io-client';
import { LIVE_URL } from './config';

// Connect to the backend's /live namespace. The server points its A record at
// your static IP, so this single URL is all the app needs to reach it.
export function createLiveSocket(): Socket {
  return io(LIVE_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });
}
