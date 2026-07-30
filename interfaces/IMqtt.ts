
import { EventEmitter } from 'eventemitter3';
import { IClientOptions } from "mqtt";
export type MqttProps = {
  brokerUrl: string;
  topic: string;
};

export interface ReceivedMessage {
  topic: string;
  message: string;
  parsedMessage?: Record<string, any>; 
  timestamp: Date;
}

// Define interface untuk MQTTService
export interface MQTTService extends EventEmitter {
  connect(brokerUrl: string, options?: IClientOptions): Promise<void>;
  subscribe(topic: string): void;
  unsubscribe(topic: string): void;
  publish(topic: string, message: string): void;
  disconnect(): void;
  isConnected(): boolean;
  getSubscribedTopics(): string[];

  // on(eventType: string, callback: (...args: any[]) => void): void;
  // off(eventType: string, callback: (...args: any[]) => void): void;
}