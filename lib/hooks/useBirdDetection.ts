// Lokasi: lib/hooks/useBirdDetection.ts
import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import mqttService from '@/lib/mqtt'; 

import {
  birdDetectionConnectedAtom,
  totalBurungAtom,
  rataRataConfidenceAtom,
  resetBirdDetectionAtom
} from '@/store/birdDetectionStore'; 
import { useNormalizedURL } from '@/utils/useURLConvertion';

const BROKER_URL = process.env.EXPO_PUBLIC_MQTT_BROKER_URL || ''; 
const TOPIC_PREFIX = useNormalizedURL(BROKER_URL)
const BIRD_TOPIC = process.env.EXPO_PUBLIC_BIRD_TOPIC || ''; 



export const useBirdDetection = () => {
  const setConnected = useSetAtom(birdDetectionConnectedAtom);
  const setTotalBurung = useSetAtom(totalBurungAtom);
  const setConfidence = useSetAtom(rataRataConfidenceAtom);
  const resetState = useSetAtom(resetBirdDetectionAtom);

  useEffect(() => {
    const onConnected = () => {
      setConnected(true);
      mqttService.subscribe(BIRD_TOPIC);
    };

    const onDisconnected = () => {
      resetState();
    };

    const onMessage = (data: { topic: string; message: string }) => {
      if (data.topic === BIRD_TOPIC) {
        try {
          const payload = JSON.parse(data.message);

          setTotalBurung(payload.DeviceID);
          setTotalBurung(payload.TotalBirds); 
          setConfidence(payload.AvrConfidence);

        } catch (e) {
          console.error('Gagal parse data burung:', e);
        }
      }
    };

    mqttService.on('connected', onConnected);
    mqttService.on('disconnected', onDisconnected);
    mqttService.on('message', onMessage);

    if (!mqttService.isConnected()) {
      mqttService.connect(TOPIC_PREFIX)
        .catch(err => {
          console.error("Gagal koneksi MQTT saat mount:", err.message);
    
        });
    } else {
      mqttService.subscribe(BIRD_TOPIC);
    }

    return () => {
      mqttService.off('connected', onConnected);
      mqttService.off('disconnected', onDisconnected);
      mqttService.off('message', onMessage);

      mqttService.unsubscribe(BIRD_TOPIC);
    };
    
  }, [setConnected, setTotalBurung, setConfidence, resetState]);
};