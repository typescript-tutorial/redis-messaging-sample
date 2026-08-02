# redis-messaging-sample

A complete example demonstrating how to build an event-driven application using **redis-messaging**.

This sample shows how to publish messages, consume them asynchronously, validate incoming data, retry failed processing, persist data into MySQL, and expose health endpoints suitable for Kubernetes and cloud-native deployments.

Rather than being a simple Redis Pub/Sub example, this project demonstrates how `redis-messaging` integrates with the Core TypeScript ecosystem to build production-ready services.

---

# Architecture

```
                HTTP Request
                     │
                     ▼
              REST Endpoint
                     │
                     ▼
            RedisPublisher<User>
                     │
                     ▼
               Redis Pub/Sub
                     │
                     ▼
           RedisSubscriber<User>
                     │
                     ▼
                 Processor
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
    Validation              Retry Handler
                                 │
                                 ▼
                            MySQL Writer
                                 │
                                 ▼
                               MySQL
```

---

# Features

- Publish messages to Redis Pub/Sub
- Consume messages asynchronously
- Strongly typed message processing
- Message validation
- Automatic retry handling
- MySQL persistence
- Health check endpoint
- Dependency Injection
- Structured logging
- Configuration management

---

# Technologies

- TypeScript
- Node.js
- Redis
- MySQL
- redis-messaging
- mysql2-core
- validation-core
- message-processing
- config-plus
- health-service

---

# Project Structure

```text
src
├── config.ts
├── context.ts
├── index.ts
└── user
    └── index.ts
```

---

# Prerequisites

- Node.js 18+
- Redis 6+
- MySQL 8+

---

# Installation

Clone the project.

```bash
git clone https://github.com/core-ts/redis-messaging-sample.git
```

Install dependencies.

```bash
npm install
```

---

# Configuration

Update the application configuration.

```typescript
export const config = {
  redis: {
    url: "redis://localhost:6379",
  },
  mysql: {
    host: "localhost",
    port: 3306,
    database: "sample",
    user: "root",
    password: "password",
  },
}
```

---

# Run Redis

Example using Docker.

```bash
docker run \
    -d \
    --name redis \
    -p 6379:6379 \
    redis:latest
```

---

# Run MySQL

Example using Docker.

```bash
docker run \
    -d \
    --name mysql \
    -e MYSQL_ROOT_PASSWORD=password \
    -e MYSQL_DATABASE=sample \
    -p 3306:3306 \
    mysql:8
```

---

# Start the Application

```bash
npm run dev
```

or

```bash
npm start
```

---

# Publish a Message

Send an HTTP request.

```http
POST /send
Content-Type: application/json
```

Example body

```json
{
  "id": "1001",
  "name": "John",
  "email": "john@example.com"
}
```

The application will

1. Receive the HTTP request
2. Publish the message to Redis
3. Redis broadcasts the message
4. Subscriber receives the message
5. Validate the payload
6. Retry on transient failures
7. Save the data into MySQL

---

# Health Check

```
GET /health
```

Example response

```json
{
  "status": "UP",
  "checks": {
    "redis": {
      "status": "UP"
    },
    "mysql": {
      "status": "UP"
    }
  }
}
```

This endpoint is suitable for Kubernetes liveness and readiness probes.

---

# Message Flow

```
  HTTP Client
       │
       ▼
PublishController
       │
       ▼
 RedisPublisher
       │
       ▼
  Redis Server
       │
       ▼
 RedisSubscriber
       │
       ▼
   Processor
       │
       ▼
   Validator
       │
       ▼
  RetryWriter
       │
       ▼
  MySQLWriter
       │
       ▼
     MySQL
```

---

# Retry Processing

The sample demonstrates retry processing for transient failures.

```
Attempt 1
    │
    ▼
 Failed
    │
    ▼
  Wait
    │
    ▼
Attempt 2
    │
    ▼
 Failed
    │
    ▼
  Wait
    │
    ▼
Attempt 3
```

This approach helps improve reliability when temporary database or network issues occur.

---

# Validation

Incoming messages are validated before persistence.

Typical validation includes

- Required fields
- String length
- Email format
- Business constraints

Invalid messages are rejected before reaching the database.

---

# Why This Sample?

This project demonstrates much more than Redis Pub/Sub.

It shows how to build a production-style event-driven service using small, reusable libraries.

Highlights include:

- Clean separation of concerns
- Dependency Injection
- Event-driven architecture
- Type-safe messaging
- Validation
- Retry handling
- Health monitoring
- Database persistence

---

# Libraries Used

| Library                                                                  | Purpose                        |
| ------------------------------------------------------------------------ | ------------------------------ |
| [`redis-messaging`](https://www.npmjs.com/package/redis-messaging)       | Publish and subscribe to Redis |
| [`message-processing`](https://www.npmjs.com/package/message-processing) | Retry and error handling       |
| [`mysql2-core`](https://www.npmjs.com/package/mysql2-core)               | Write data into MySQL          |
| [`validation-core`](https://www.npmjs.com/package/validation-core)       | Validate incoming messages     |
| [`health-service`](https://www.npmjs.com/package/health-service)         | Health endpoint                |
| [`logger-core`](https://www.npmjs.com/package/logger-core)               | Structured logging             |
| [`config-plus`](https://www.npmjs.com/package/config-plus)               | Configuration management       |

---

# License

MIT
