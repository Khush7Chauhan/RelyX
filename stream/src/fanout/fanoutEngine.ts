import { EventBroker, HubEvent } from '../broker/eventBroker';
import { ConnectionManager } from '../connection/connectionManager';
import { SubscriptionManager } from '../subscription/subscriptionManager';

export class FanoutEngine {
  constructor(
    private broker: EventBroker,
    private connectionManager: ConnectionManager,
    private subscriptionManager: SubscriptionManager
  ) {}

  public startListening(topics: string[]) {
    for (const topic of topics) {
      this.broker.on(topic, (event: HubEvent) => this.dispatch(topic, event));
    }
  }

  private dispatch(topic: string, event: HubEvent) {
    const clientIds = this.subscriptionManager.getSubscribers(topic);
    
    for (const clientId of clientIds) {
      const stream = this.connectionManager.getConnection(clientId);
      if (stream) {
        // Push the event down the gRPC stream to the client
        stream.write({
          event_id: event.eventId,
          topic: event.topic,
          payload_json: event.payloadJson,
          timestamp: event.timestamp
        });
      }
    }
  }
}