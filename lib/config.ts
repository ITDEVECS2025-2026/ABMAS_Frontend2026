//D:\APLIKASI TETA\ABMAS_Frontend2026\lib\config.ts
import { Platform } from 'react-native';

// Gunakan 10.0.2.2 khusus untuk Android Emulator, localhost untuk iOS/Web
const LOCAL_IP = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

const FALLBACK = LOCAL_IP;

// Strip any trailing slash so we can safely concatenate paths.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? FALLBACK).replace(/\/+$/, '');

// The socket.io '/live' namespace is served on the same host/port as the REST API.
export const LIVE_URL = `${API_URL}/live`;