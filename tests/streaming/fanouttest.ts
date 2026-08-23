import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBroker } from '../../stream/src/broker/eventBroker';
import { ConnectionManager } from '../../stream/src/connection/connectionManager';
import { SubscriptionManager } from '../../stream/src/subscription/subscriptionManager';
import { FanoutEngine } from '../../stream/src/fanout/fanoutEngine';

describe('StreamHub: Fanout Engine', () => {
  let broker: EventBroker;
  let connManager: ConnectionManager;
  let subManager: SubscriptionManager;
  let fanoutEngine: FanoutEngine;

  beforeEach(() => {
    broker = new EventBroker();
    connManager = new ConnectionManager();
    subManager = new SubscriptionManager();
    fanoutEngine = new FanoutEngine(broker, connManager, subManager);
  });

  it('should route events only to subscribed clients', () => {
    fanoutEngine.startListening(['system_alerts']);

    // Mock Client A (Subscribed)
    const mockStreamA = { write: vi.fn() };
    connManager.addConnection('client_A', mockStreamA as any);
    subManager.subscribe('client_A', ['system_alerts']);

    // Mock Client B (Not Subscribed)
    const mockStreamB = { write: vi.fn() };
    connManager.addConnection('client_B', mockStreamB as any);

    // Publish event
    broker.publish({
      eventId: 'evt_1',
      topic: 'system_alerts',
      payloadJson: '{}',
      timestamp: Date.now()
    });

    expect(mockStreamA.write).toHaveBeenCalledTimes(1);
    expect(mockStreamB.write).not.toHaveBeenCalled();
  });
});