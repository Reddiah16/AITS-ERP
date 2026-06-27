# AITS Rajampet ERP — Express.js Backend Server

Production-grade clean-architecture Express.js API server for Annamacharya Institute of Technology & Sciences (AITS) Rajampet ERP system, built with TypeScript, Prisma, and PostgreSQL.

## 🚀 Architecture Overview

```
backend/
├── prisma/
│   └── schema.prisma         # PostgreSQL DB schema configuration
├── src/
│   ├── server.ts             # Express application entrypoint
│   ├── config/
│   │   └── db.ts             # Prisma DB client connection
│   ├── controllers/          # Request handlers and orchestration
│   ├── routes/               # Express endpoints and middlewares mapping
│   ├── middleware/           # RBAC permission guards, JWT validations, Rate Limiters
│   └── validation/           # Zod schema request payload validations
├── Dockerfile                # Production multi-stage Docker build
└── docker-compose.yml        # Orchestration containing API Server & PostgreSQL database
```

## 🛠️ Installation & Setup

### Option 1: Run via Docker Compose (Recommended)
1. Build and boot the PostgreSQL database and Express server container:
   ```bash
   docker-compose up --build -d
   ```
2. Run database migrations:
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

### Option 2: Local Development
1. Install project dependencies:
   ```bash
   npm install
   ```
2. Configure `.env` environment file:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://aits_admin:AitsSecurePassword123@localhost:5432/aits_erp_production?schema=public"
   JWT_SECRET="aits-jwt-super-secret-key-2024"
   JWT_REFRESH_SECRET="aits-jwt-refresh-super-secret-key-2024"
   FACULTY_REGISTRATION_SECRET="AITS_FAC_2024"
   HOD_REGISTRATION_SECRET="AITS_HOD_2024"
   ```
3. Generate Prisma client & apply migrations:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```
