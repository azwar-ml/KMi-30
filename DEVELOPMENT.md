# 🛠️ Development Guide - KMI-30 Alpha v4.0

Complete guide for developing KMI-30, from local setup to production deployment.

## 📋 Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **PostgreSQL**: 14.x or higher (or Docker)
- **Git**: For version control

## 🚀 Quick Start (5 minutes)

### 1. Clone & Install

```bash
# Clone repository
git clone <repo-url>
cd KMI-30

# Install all dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Configure Environment

```bash
# Copy template
cp .env.example .env

# Fill in values
# - GEMINI_API_KEY: Get from https://ai.google.dev/
# - DATABASE_URL: Your PostgreSQL connection string
# - NEWS_API_KEY: Get from https://newsapi.org/
```

### 3. Setup Database

```bash
# Run migrations
npm run prisma:migrate

# (Optional) Seed with sample data
npm run prisma:seed
```

### 4. Start Development

```bash
# Terminal 1: Backend (http://localhost:3000)
npm run dev:backend

# Terminal 2: Frontend (http://localhost:3001)
npm run dev:frontend
```

## 📦 Docker Setup (Recommended)

Easier way to manage PostgreSQL and other services:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

**Services**:
- Backend: http://localhost:3000
- Frontend: http://localhost:3001
- PostgreSQL: localhost:5432 (postgres/postgres)
- Redis: localhost:6379

## 🏗️ Project Structure Deep Dive

### Backend Architecture

```
backend/src/
├── main.ts                      # Entry point with CORS/security
├── app.module.ts                # Root module imports
├── app.controller/service.ts    # Root endpoints
├── prisma/
│   ├── prisma.service.ts        # Database connection
│   └── prisma.module.ts         # Export for other modules
├── auth/
│   ├── jwt.strategy.ts          # Passport JWT strategy
│   ├── jwt-auth.guard.ts        # Protected routes
│   ├── roles.guard.ts           # RBAC decorator
│   └── auth.module.ts           # Auth setup
├── stocks/                      # Core business logic
│   ├── data-engine.service.ts   # Path A/B/C fetchers
│   ├── intelligence.service.ts  # Gemini AI integration
│   ├── shariah.service.ts       # SECP compliance
│   ├── stocks.service.ts        # Orchestration
│   ├── stocks.controller.ts     # API endpoints
│   └── stocks.module.ts         # Module export
└── health/
    ├── health.service.ts        # System health + Gemini ping
    ├── health.controller.ts     # Health endpoints
    └── health.module.ts         # Module export
```

### Key Services

#### **DataEngineService** (Triple-Path Fetcher)

```typescript
// Path A: Real-time prices
await dataEngine.fetchLivePrices()

// Path B: Historical data (365 days)
await dataEngine.fetchHistoricalData(symbol, 365)

// Path C: PSX Header ZIP crawler
await dataEngine.fetchPSXHeaderZip()

// Store prices in database
await dataEngine.storePrices(prices)

// Seed companies
await dataEngine.seedKMI30Companies(constituents)
```

#### **IntelligenceService** (Gemini AI)

```typescript
// Generate or get cached memo
const memo = await intelligence.getMemoOrGenerate('PSEL')

// Format: 12-section PM-grade analysis
// 1. Header | 2. Summary | 3. Scorecard | 4. Recommendation
// 5. DCF | 6. Moat | 7. Risks | 8. Macro | 9. Technical
// 10. Peers | 11. Valuation | 12. Disclaimer

// Returns with Recommendation object
// { signal: "BUY", confidence: 0.75, fairValue: 150.5, ... }
```

#### **ShariaService** (SECP Compliance)

```typescript
// Audit single company
const compliance = await sharia.auditCompliance(companyId)
// Returns: { isCompliant: boolean, rating: 0-5, marginOfSafety: %, ... }

// Audit all KMI-30
await sharia.auditAllKMI30()

// Get non-compliant (🔴 flagged)
const flagged = await sharia.getNonCompliantCompanies()

// Check threshold breach
const breached = await sharia.checkAndFlagThresholdBreach('PSEL')
```

### Database Schema

Key tables:

```sql
-- Users & Auth
User              -- id, email, role (USER|ADMIN|SUPERADMIN), tier (FREE|PRO|INSTITUTIONAL)
Subscription      -- userId, tier, features, startDate, endDate

-- Market Data
Company           -- symbol, name, sector (core reference)
Price             -- companyId, date, OHLCV (time-series)
CompanyFundamental -- companyId, DCF, ratios, moat strength
KMI30Index        -- companyId, ranking, weight

-- AI & Analysis
AIMemo            -- companyId, 12 sections, generatedAt, expiresAt (cache)
Recommendation    -- memoId, signal, fairValue, entryZone, stopLoss
SavedMemo         -- userId, memoId (bookmarks)

-- Compliance
ShariaCompliance  -- companyId, ratios, isCompliant, rating, flaggedForReview

-- Monitoring
ScraperLog        -- source, status, recordsFetched, duration, error
APILog            -- endpoint, statusCode, latency, timestamp
GeminiPingLog     -- status, latency, message, timestamp

-- ML
MLModel           -- symbol, modelType (LSTM|RandomForest), accuracy, status
ModelPrediction   -- modelId, predictedPrice, confidence, horizon
```

## 🔌 API Development

### Creating a New Endpoint

1. **Add to Controller**:

```typescript
@Get('new-endpoint')
@UseGuards(JwtAuthGuard)
async newEndpoint() {
  return this.service.getData();
}
```

2. **Implement in Service**:

```typescript
async getData() {
  // Business logic
  return data;
}
```

3. **Test with curl**:

```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/new-endpoint
```

### RBAC (Role-Based Access Control)

```typescript
// Admin only
@Post('admin-action')
@UseGuards(JwtAuthGuard)
@UseGuards(RolesGuard)
@Roles(['ADMIN', 'SUPERADMIN'])
async adminAction() {
  // Only ADMIN and SUPERADMIN can access
}
```

## 🤖 AI Integration (Gemini)

### Generating a Memo

```typescript
const memo = await intelligence.generateAIMemo('PSEL');
// Returns 12-section analysis with recommendation

// Response format:
{
  headerBar: "PSEL | 1,250.50 | +2.34%",
  executiveSummary: "...",
  scorecard: "{ P/E: 15.2, ROE: 18%, ... }",
  recommendation: {
    signal: "BUY",
    confidence: 0.82,
    entryZone: "1,200-1,230",
    fairValue: 1,450.00,
    stopLoss: 1,150.00
  },
  // ... 8 more sections
}
```

### Cost Optimization

- **Caching**: 24-hour TTL on memos
- **Batch processing**: Generate 30 memos once daily
- **Model**: Using Gemini 1.5 Flash (cheaper than Pro)

## 🕌 Shariah Compliance Audit

### How It Works

```typescript
// 2026 SECP Criteria (Hard Gates)
const criteria = {
  debtToAssets: 0.33,      // < 33% PASS
  nonHalalIncome: 0.05,    // < 5% PASS
  illiquidAssets: 0.25     // > 25% PASS
};

// Each criterion: ✓ PASS or ✗ FAIL
// Rating: 5 ⭐ if all pass, down to 0 if all fail
// UI flags 🔴 if Debt/Assets > 33%
```

### Running Audit

```bash
# Via API (Admin only)
POST /stocks/audit/shariah
# Returns: { status: 'SUCCESS', summary: { total: 30, compliant: 28, ... } }

# Check results
GET /stocks/shariah/summary
# Returns: { total: 30, compliant: 28, nonCompliant: 2, flagged: 1, ... }

# Get flagged companies
GET /stocks/shariah/non-compliant
# Returns: [ { symbol: 'XYZ', rating: 2, debtRatio: 0.42, ... } ]
```

## 📊 Data Sync (Triple-Path)

### Path A: Live Prices

```bash
# Via API (Admin)
POST /stocks/sync/live

# Fetches from psx-api-py bridge
# Updates latest prices in real-time
# Logs to ScraperLog table
```

### Path B: Historical Data

```bash
# Fetch 365-day history for all KMI-30
POST /stocks/sync/historical

# Or specific symbols
POST /stocks/sync/historical
{ "symbols": ["PSEL", "UNITY", "HBL"] }
```

### Path C: PSX Header ZIP

```bash
# Download and parse constituents
POST /stocks/sync/psx-header

# Extracts from https://dps.psx.com.pk/downloads
# Seeds Company and KMI30Index tables
# Great for keeping index membership current
```

## 🧪 Testing

### Unit Tests

```bash
npm run test:backend
npm run test:frontend
```

### Writing a Test

```typescript
describe('DataEngineService', () => {
  let service: DataEngineService;

  beforeEach(() => {
    service = new DataEngineService(...);
  });

  it('should fetch live prices', async () => {
    const prices = await service.fetchLivePrices();
    expect(prices.length).toBeGreaterThan(0);
  });
});
```

## 🐛 Debugging

### Backend Logs

```bash
# Development mode (watch)
npm run dev:backend

# Check Prisma logs
export DEBUG=prisma:*
npm run dev:backend

# View database directly
npm run prisma:studio
```

### Frontend Logs

```bash
# Browser console logs
Open http://localhost:3001 → F12 → Console

# Next.js debug
export DEBUG=next:*
npm run dev:frontend
```

### Gemini API Debugging

```typescript
// In IntelligenceService
this.logger.log('Gemini Request:', prompt);
this.logger.log('Gemini Response:', content);
```

## 📈 Performance Tips

### Database Queries

```typescript
// ❌ Bad: N+1 query problem
const companies = await prisma.company.findMany();
for (const company of companies) {
  const prices = await prisma.price.findMany({ where: { companyId: company.id } });
}

// ✅ Good: Fetch with relations
const companies = await prisma.company.findMany({
  include: { prices: { take: 1, orderBy: { date: 'desc' } } }
});
```

### Caching

```typescript
// Check cache before calling Gemini
const cached = await prisma.aIMemo.findFirst({
  where: {
    companyId,
    expiresAt: { gt: new Date() }  // Not expired
  }
});

if (cached) return cached;  // Use cache
else return generateNewMemo();  // Or generate
```

### Rate Limiting

```typescript
// Built-in: 100 requests/minute per user
@UseGuards(ThrottlerGuard)
@Throttle(10, 60)  // 10 requests per 60 seconds
async limitedEndpoint() {
  // ...
}
```

## 🚀 Deployment

### Build for Production

```bash
# Build both backend and frontend
npm run build

# Backend
npm run build:backend    # Creates dist/ folder

# Frontend
npm run build:frontend   # Creates .next/ folder
```

### Environment for Production

```env
NODE_ENV=production
LOG_LEVEL=error
DATABASE_URL=<production-db-url>
GEMINI_API_KEY=<production-key>
JWT_SECRET=<long-random-secure-string>
```

### Docker Deployment

```bash
# Build and push images
docker build -t kmi-30-backend:latest backend/
docker push <your-registry>/kmi-30-backend:latest

# Deploy with docker-compose or Kubernetes
docker-compose -f docker-compose.prod.yml up -d
```

## 📞 Troubleshooting

### Database Connection Error

```bash
# Check if PostgreSQL is running
psql -U postgres -d kmi_30_dev -c "SELECT 1"

# If using Docker
docker-compose logs db

# Reset database
npm run prisma:migrate -- reset
```

### Gemini API Error

```bash
# Check API key
echo $GEMINI_API_KEY

# Test API connectivity
curl https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$GEMINI_API_KEY
```

### Port Already in Use

```bash
# Backend (3000)
lsof -i :3000

# Frontend (3001)
lsof -i :3001

# Kill process
kill -9 <PID>
```

## 📚 Resources

- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Next.js Docs](https://nextjs.org/docs/)
- [Google AI Studio](https://ai.google.dev/)
- [PSX Website](https://www.psx.com.pk/)

---

**Happy Coding! 🚀**
