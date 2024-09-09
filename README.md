# EMURGO Backend Engineer Challenge - Development Guide

This document outlines the development process, implementations, and key aspects of the EMURGO Backend Engineer Challenge project.

## Table of Contents

1. [Project Setup](#project-setup)
2. [Database Schema](#database-schema)
3. [API Implementation](#api-implementation)
4. [Services Implementation](#services-implementation)
5. [Testing](#testing)
6. [Running the Project](#running-the-project)

## Project Setup

1. The project uses Bun as its runtime. Install Bun by following the instructions on the [official website](https://bun.sh/).

2. Clone the repository and install dependencies:

   ```bash
   git clone <repository-url>
   cd <project-directory>
   bun install
   ```

3. Set up the PostgreSQL database using Docker:

   ```bash
   docker-compose up -d
   ```

4. Generate Prisma client and apply migrations:

   ```bash
   bun run db:generate
   bun run db:push
   ```

## Database Schema

The database schema is defined in the Prisma schema file:

```bash
src/prisma/schema.prisma
```

The schema includes the following key components:

The API routes are defined in separate files:

1. Block routes: `src/routes/block-route.ts`
2. Balance routes: `src/routes/balance-route.ts`
3. Rollback routes: `src/routes/rollback-route.ts`

Each route file defines the endpoints and their handlers, using the corresponding service for business logic.

## Services Implementation

The core business logic is implemented in service classes:

1. Block Service: `src/services/block-service.ts`

   - Handles processing of new blocks
   - Validates block data
   - Calculates block IDs

2. Balance Service: `src/services/balance-service.ts`

   - Calculates the balance for a given address
   - Handles the UTXO model calculations

3. Rollback Service: `src/services/rollback-service.ts`
   - Implements the rollback functionality
   - Handles deletion of blocks, transactions, inputs, and outputs above a given height

## Testing

Integration tests are implemented for each service:

1. Block Service: `spec/block-service.integration.spec.ts`
2. Balance Service: `spec/balance-service.integration.spec.ts`
3. Rollback Service: `spec/rollback-service.integration.spec.ts`

These tests use a seeded database to ensure consistent test data. The seed data is defined in `prisma/seed-test.ts`.

To run the tests:

```bash
bun run test
```

## Running the Project

1. Start the database and API server:

   ```bash
   bun run-docker
   ```

   Generate Prisma client and apply migrations:

   ```bash
   bun run db:generate
   bun run db:push
   ```

   ```bash
   bun run dev
   ```

   To run the project with a fresh database, use:

   ```bash
   bun run dev:fresh
   ```

2. The API will be available at `http://localhost:3000`

3. Use the following endpoints:
   - POST `/blocks`: Process a new block
   - GET `/balance/:address`: Get balance for an address
   - POST `/rollback?height=<number>`: Rollback the blockchain to a specific height

Remember to validate your implementation against the requirements specified in the main README file.

## API Implementation

Use these cURL commands to test the API endpoints of the EMURGO Backend Engineer Challenge project.

### Check API Status

```bash
curl http://localhost:3000/status
```

### Process a New Block

```bash
curl -X POST http://localhost:3000/blocks \
-H "Content-Type: application/json" \
-d '{
  "id": "block1",
  "height": 1,
  "transactions": [
    {
      "id": "tx1",
      "inputs": [
        {
          "txId": "genesis",
          "index": 0
        }
      ],
      "outputs": [
        {
          "address": "addr1",
          "value": 50
        }
      ]
    }
  ]
}'
```

### Get Balance for an Address

```bash
curl http://localhost:3000/balance/addr1
```

### Rollback the Blockchain

```bash
curl "http://localhost:3000/rollback?height=1"
```
