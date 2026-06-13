// Central place for the server address.
//
// There is no device discovery: the app and the IoT nodes are both clients that
// connect TO this fixed address. Set EXPO_PUBLIC_API_URL in .env to your domain
// (which resolves to your static IP). EXPO_PUBLIC_* vars are inlined at build time.
const FALLBACK = 'http://localhost:3000';

// Strip any trailing slash so we can safely concatenate paths.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? FALLBACK).replace(/\/+$/, '');

// The socket.io '/live' namespace is served on the same host/port as the REST API.
export const LIVE_URL = `${API_URL}/live`;
