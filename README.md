# RelayX Microservices Architecture

RelayX is a robust, TypeScript-based microservices ecosystem built from the ground up using
gRPC and Protocol Buffers. It is designed to handle high-throughput inter-service communication
with a centralized API Gateway, modular backend domain services, and a dedicated real-time
stream hub.

System Architecture
The system is composed of several decoupled services, each responsible for a distinct domain,
connected via HTTP/2 gRPC channels.

API Gateway Port: 5000
The centralized entry point for all external client traffic. It acts as a Layer-7 reverse proxy,
translating client requests and multiplexing them to the appropriate backend services. It
includes built-in reliability patterns such as a Retry Manager with exponential backoff for
transient failures.

User Service Port: 50051
Manages user lifecycle and identity. Implements a highly decoupled repository pattern

(currently utilizing an in-memory data store for local development) to ensure database-
agnostic domain logic.

Order Service Port: 50053
Handles transactional order creation, item processing, and fulfillment tracking. Exposes RPC
methods for listing and querying user-specific orders.

StreamHub Port: 50054
A real-time nervous system for the architecture. Utilizes gRPC server-side streaming and
bidirectional streams to fan out events (e.g., order updates, system alerts) to subscribed
clients using an in-memory Event Broker.

Project Structure

RelayX/
├── proto/ # Shared Protocol Buffer definitions
│ ├── user/user.proto
│ ├── order/order.proto
│ └── stream/stream.proto
├── gateway/ # gRPC API Gateway
├── services/ # Backend Microservices
│ ├── user/
│ └── order/
├── streamhub/ # Real-time Event Broadcaster
├── client/ # CLI Test Client for E2E validation
├── tests/ # Vitest Integration & Reliability Suites
├── package.json # Workspace Root Config
└── docker-compose.yml # Container Orchestration

Prerequisites
Node.js (v18 or higher recommended)
pnpm (v8 or higher)
Docker Desktop (optional, for containerized deployment)

Getting Started (Local Development)

Note: Due to cross-platform binary compilations (specifically for esbuild and @grpc/grpc-
js ), running the services natively on Windows is recommended for active development over

Docker volume mounts.

To run the cluster locally without Docker, open four separate terminal windows in the root
directory and start the components in the following order:
•
•
•

# Terminal 1: Start the User Service
pnpm dlx tsx services/user/src/server.ts
# Terminal 2: Start the Order Service
pnpm dlx tsx services/order/src/server.ts
# Terminal 3: Start the Gateway
pnpm dlx tsx gateway/src/server.ts
# Terminal 4: Execute the E2E Client Test
pnpm dlx tsx client/src/client.ts

Testing
The project utilizes Vitest for running integration and reliability tests, validating the Gateway's
routing logic, retry mechanisms, and the Fanout Engine's subscription models.
# Run the complete test suite
pnpm test
