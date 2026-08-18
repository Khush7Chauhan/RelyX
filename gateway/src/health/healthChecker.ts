import * as grpc from '@grpc/grpc-js';
import { ServiceEndpoint } from '../config/config';
import { HealthRegistry } from './healthRegistry';

export class HealthChecker {
  private timers: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private registry: HealthRegistry,
    private checkIntervalMs: number = 10000
  ) {}

  public startChecking(
    endpoint: ServiceEndpoint,
    healthClient: any // 
  ): void {
    if (this.timers.has(endpoint.id)) return;

    const timer = setInterval(() => {
      this.ping(endpoint, healthClient);
    }, this.checkIntervalMs);

    this.timers.set(endpoint.id, timer);
    this.ping(endpoint, healthClient);
  }

  public stopChecking(endpointId: string): void {
    const timer = this.timers.get(endpointId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(endpointId);
    }
  }

  private ping(endpoint: ServiceEndpoint, healthClient: any): void {
    const deadline = new Date(Date.now() + 2000); 

    healthClient.CheckHealth(
      {},
      { deadline },
      (error: grpc.ServiceError | null, response: any) => {
        const isHealthy = !error && response?.status === 1; 
        
        if (error) {
          console.warn(`Health check failed for ${endpoint.id}: ${error.message}`);
        }
        this.registry.reportHealth(endpoint.id, isHealthy);
      }
    );
  }
}