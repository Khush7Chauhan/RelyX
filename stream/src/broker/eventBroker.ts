import { EventEmitter } from 'events';

export interface HubEvent {
  eventId: string;
  topic: string;
  payloadJson: string;
  timestamp: number;
}

export class EventBroker extends EventEmitter {
  public publish(event: HubEvent): void {
    this.emit(event.topic, event);
  }
}