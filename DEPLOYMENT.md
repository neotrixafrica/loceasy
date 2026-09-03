# LocEasy Deployment Guide

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudinary account (for image uploads)
- Domain name with SSL (HTTPS required for production)

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/loceasy

# JWT Authentication (IMPORTANT: Use a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Payment Mode
# Set to 'demo' for simulated payments (accepts any 4-6 digit code)
# Set to 'production' for real payment integration
PAYMENT_MODE=demo

# Environment
NODE_ENV=production
```

## Database Setup

### Development
```bash
cd server
npm run db:generate
npm run db:push
npm run db:seed  # Seeds test data
```

### Production
```bash
cd server
npm run db:generate
npm run db:migrate
npm run db:seed:prod  # Empty seed (no test data)
```

## Building

### Server
```bash
cd server
npm install
npm run build
```

### Client
```bash
cd client
npm install
npm run build
```

## Running

### Development
```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

### Production
```bash
# Server
cd server
npm run start

# Client (deploy separately via Vercel, Netlify, or similar)
# Or use a reverse proxy to serve both
```

## Health Check

The server includes a health check endpoint:
```
GET /api/health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2026-09-03T10:00:00.000Z",
  "database": "connected",
  "environment": "production"
}
```

## Security Headers

The server automatically applies security headers in production:
- HSTS (Strict-Transport-Security)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- X-XSS-Protection
- Content-Security-Policy

## Payment Integration

### Demo Mode (Default)
- Set `PAYMENT_MODE=demo`
- Accepts any 4-6 digit code for verification
- UI shows "Mode démo activé" banner

### Production Mode
- Set `PAYMENT_MODE=production`
- Implement real payment provider integration in:
  - `server/src/app/api/payments/route.ts`
  - `server/src/app/api/payments/verify/route.ts`
- Provider APIs to integrate:
  - Flooz (Moov Money)
  - T-Money
  - Wave
  - Orange Money

## Email Integration (Optional)

Currently, the app uses in-app notifications only. To add email:

1. Configure SMTP in `.env`:
```bash
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@loceasy.com
```

2. Implement email sending in:
   - `server/src/app/api/auth/register/route.ts` (verification email)
   - `server/src/app/api/verify/route.ts` (confirmation)

## Docker Deployment

```bash
# Build and start with Docker Compose
docker-compose up -d

# Run database migrations
docker-compose exec server npm run db:migrate
docker-compose exec server npm run db:seed:prod
```

## Monitoring

- Health check: `/api/health`
- Database logs: Check PostgreSQL logs
- Application logs: Use stdout/stderr from server process

## Post-Deployment Checklist

- [ ] Replace placeholder environment variables with real values
- [ ] Set `NODE_ENV=production`
- [ ] Configure `JWT_SECRET` with a strong random string
- [ ] Set up Cloudinary account and credentials
- [ ] Configure production database
- [ ] Run database migrations
- [ ] Test health check endpoint
- [ ] Test image upload functionality
- [ ] Test payment flow (demo mode first)
- [ ] Verify HTTPS/SSL is working
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy for database
- [ ] Review and update legal pages (Conditions, Confidentialité)
