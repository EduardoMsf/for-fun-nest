# Ecommerce API

REST API for a Tesla-style e-commerce store built with **NestJS**, **Prisma**, and **PostgreSQL**. Includes JWT authentication, PayPal payment verification, and full Swagger documentation.

---

## Prerequisites

| Tool | Version |
|------|---------|
| [Node.js](https://nodejs.org) | 20 or higher |
| [npm](https://www.npmjs.com) | 10 or higher |
| [Docker](https://www.docker.com) | 24 or higher |
| [Docker Compose](https://docs.docker.com/compose) | v2 (bundled with Docker Desktop) |
| [Git](https://git-scm.com) | any |

---

## 1. Clone the repository

```bash
git clone <repository-url>
cd ecommerce-api
```

---

## 2. Configure environment variables

```bash
cp .env.template .env
```

Open `.env` and fill in the values:

```env
# Database connection (must match the Docker service credentials below)
DATABASE_URL="postgresql://postgres:your_password@localhost:5437/ecommerce_api?schema=public"
PORT=3001

# Docker Postgres credentials
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=ecommerce_api

# JWT — generate a strong secret:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_32_char_secret_here

# PayPal sandbox (optional — only needed for payment verification)
PAYPAL_CLIENT_ID=
PAYPAL_SECRET=
PAYPAL_OAUTH_URL=https://api-m.sandbox.paypal.com/v1/oauth2/token
PAYPAL_ORDERS_URL=https://api-m.sandbox.paypal.com/v2/checkout/orders

# CORS — origins allowed to call the API
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002
```

---

## Option A — Local development (Node + Docker for the database)

### 3A. Start PostgreSQL

```bash
docker compose up postgres-ecommerce -d
```

### 4A. Install dependencies

```bash
npm install
```

### 5A. Run database migrations

```bash
npx prisma migrate deploy
```

### 6A. Seed the database

```bash
npm run seed
```

This creates product categories, 35+ products with images, and three default users:

| Email | Password | Role |
|-------|----------|------|
| admin1@example.com | Admin1Pass! | admin |
| admin2@example.com | Admin2Pass! | admin |
| user1@example.com | User1Pass! | user |

### 7A. Start the development server

```bash
npm run start:dev
```

The API will be available at **http://localhost:3001**  
Swagger documentation: **http://localhost:3001/api**

---

## Option B — Full stack with Docker (database + API in containers)

### 3B. Build and start all services

```bash
docker compose up --build -d
```

### 4B. Run the seed inside the API container

```bash
docker compose exec api npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

The API will be available at **http://localhost:3001**  
Swagger documentation: **http://localhost:3001/api**

### Stop all services

```bash
docker compose down
```

To also delete the database volume:

```bash
docker compose down -v
rm -rf ./postgres
```

---

## Available scripts

```bash
npm run start:dev     # Development with hot-reload
npm run start:prod    # Production (requires a build first)
npm run build         # Compile TypeScript to dist/

npm run test          # Unit tests (Jest)
npm run test:e2e      # Integration tests (Supertest)
npm run test:cov      # Unit tests with coverage report

npx prisma studio     # Open Prisma Studio (visual DB browser)
npx prisma migrate dev --name <name>   # Create a new migration
```

---

## Project structure

```
src/
├── auth/           # JWT authentication (login, register, profile)
├── categories/     # Product categories
├── countries/      # Country catalog
├── order-addresses/# Shipping addresses linked to orders
├── order-items/    # Items within an order
├── orders/         # Order management + place-order transaction
├── payments/       # PayPal payment verification
├── prisma/         # PrismaService (global module)
├── product-images/ # Product image management
├── products/       # Product catalog with pagination and gender filter
├── user-addresses/ # User shipping address (upsert by userId)
├── users/          # User management
└── main.ts         # Bootstrap with ValidationPipe, CORS, Swagger
prisma/
├── schema.prisma   # Database schema
└── seed.ts         # Seed script
```

---

## API overview

All endpoints are documented in Swagger at `/api`. Protected endpoints require a Bearer JWT obtained from `POST /auth/login`.

| Module | Base path |
|--------|-----------|
| Auth | `/auth` |
| Products | `/products` |
| Orders | `/orders` |
| Payments | `/payments/paypal/verify` |
| Users | `/users` |
| Categories | `/categories` |
| Countries | `/countries` |
| User addresses | `/user-addresses` |

---

## Running tests

```bash
# Unit tests
npm run test

# Integration tests (no database required — Prisma is mocked)
npm run test:e2e

# Coverage report → coverage/index.html
npm run test:cov
```

Coverage target: **80%+ line coverage**.
