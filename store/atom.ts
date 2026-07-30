import { ReceivedMessage } from '@/interfaces/IMqtt'
import {atom, useAtom}from 'jotai'



export const mqqtMessageAtom = atom<ReceivedMessage[]>([]);
export const useMqqtMessageAtom = (p0: (prev: ReceivedMessage[]) => ReceivedMessage[]) => useAtom(mqqtMessageAtom);

export const mqttIsConnectedAtom = atom(false);
export const mqttConnectionStatusAtom = atom("Disconnected");
export const mqttSubscribedTopicsAtom = atom<string[]>([]);