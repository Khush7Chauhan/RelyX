# RelayX Microservices Architecture

RelayX is a high-performance, distributed microservices architecture built with Node.js and TypeScript. It leverages **gRPC** and **Protocol Buffers** for blazing-fast inter-service communication and features a centralized API Gateway and a real-time StreamHub for event fan-out.

##  System Architecture

The system is designed around an API Gateway pattern that routes incoming client requests to isolated, domain-specific backend services.

- **Gateway (`:5000`):** Acts as a reverse proxy, routing incoming L7 traffic to the appropriate backend microservices.
- **User Service (`:50051`):** Manages user domain logic, entities, and state.
- **Order Service (`:50053`):** Manages order processing and references user data.
- **StreamHub (`:50054`):** Real-time event broker handling server-side streaming and bidirectional RPC fan-out.
- **Test Client:** CLI application for executing end-to-end routing and load-balancing tests.

## 🚀 Tech Stack

- **Runtime:** Node.js v20+
- **Language:** TypeScript
- **RPC Framework:** gRPC (`@grpc/grpc-js`)
- **Serialization:** Protocol Buffers (`protobuf`)
- **Package Manager:** pnpm (Monorepo Workspace)
- **Testing:** Vitest
- **Containerization:** Docker & Docker Compose

## 📁 Repository Structure

```text
RelayX/
├── client/                 # End-to-end CLI testing client
├── gateway/                # Main entry point and gRPC reverse proxy
├── proto/                  # Shared Protocol Buffer definitions (.proto)
├── services/
│   ├── order/              # Order domain microservice
│   └── user/               # User domain microservice
├── streamhub/              # Real-time event streaming service
├── tests/                  # Integration and reliability test suites
├── docker-compose.yml      # Container orchestration
└── package.json            # Monorepo workspace configuration
