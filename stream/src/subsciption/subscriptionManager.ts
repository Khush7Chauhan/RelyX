export class SubscriptionManager {
  // Maps a topic to a Set of client_ids
  private topicSubscriptions = new Map<string, Set<string>>();

  public subscribe(clientId: string, topics: string[]) {
    for (const topic of topics) {
      if (!this.topicSubscriptions.has(topic)) {
        this.topicSubscriptions.set(topic, new Set());
      }
      this.topicSubscriptions.get(topic)!.add(clientId);
    }
  }

  public unsubscribeAll(clientId: string) {
    for (const [topic, clients] of this.topicSubscriptions.entries()) {
      clients.delete(clientId);
      if (clients.size === 0) {
        this.topicSubscriptions.delete(topic);
      }
    }
  }

  public getSubscribers(topic: string): string[] {
    const clients = this.topicSubscriptions.get(topic);
    return clients ? Array.from(clients) : [];
  }
}