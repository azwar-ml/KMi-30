# 🚀 KMI-30 Alpha v4.0 - Institutional Intelligence Platform

A high-performance SaaS platform for Top 30 PSX stocks, governed by the **KMI-30 Alpha v4.0 Institutional Intelligence Protocol**.

## 📋 Project Structure

```
KMI-30/
├── backend/              # NestJS + Prisma (The Engine)
│   ├── src/
│   │   ├── main.ts       # Entry point
│   │   ├── app.module.ts # Root module
│   │   ├── prisma/       # Database service
│   │   ├── auth/         # JWT & RBAC
│   │   ├── stocks/       # Core business logic
│   │   │   ├── data-engine.service.ts      # Path A/B/C fetchers
│   │   │   ├── intelligence.service.ts     # Gemini AI memos
│   │   │   ├── shariah.service.ts          # SECP compliance
│   │   │   └── stocks.controller.ts        # API endpoints
│   │   └── health/       # System health monitoring
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   ├── package.json
│   └── tsconfig.json
├── frontend/             # Next.js 15 (The Terminal)
│   ├── src/
│   ├── package.json
│   └── next.config.ts
├── .env                  # Shared environment variables
├── .env.example          # Environment template
└── package.json          # Root orchestration
```

## 🏗️ Architecture Overview

### Backend (NestJS + Prisma)

The engine that powers KMI-30, featuring:

#### 1. **Data Engine Module** (Triple-Path Fetcher)
- **Path A (Live)**: Real-time prices via `psx-api-py` bridge
- **Path B (Historical)**: Historical OHLCV from `psxdata`
- **Path C (The Crawler)**: PSX Header ZIP parser for constituents
- **Macro Sync**: Pakistan GDP/Inflation from IMF DataMapper
- **News Sync**: Headlines from NewsAPI

#### 2. **Intelligence Module** (KMI-30 Alpha v4.0)
- **AI Engine**: Gemini 1.5 Flash for analysis
- **PM-Grade Memos**: 12-section institutional analysis
  1. Header Bar (Symbol, Price, Change%)
  2. Executive Summary
  3. Scorecard (Key Metrics)
  4. Recommendation (Signal, Entry Zone, Fair Value, Stop Loss)
  5. 2-Stage DCF Analysis
  6. Business Moat
  7. Risk Factors
  8. Macro Context
  9. Technical View
  10. Sector Comparison
  11. Valuation Summary
  12. Disclaimer
- **Live Ping**: Gemini API status verification for Admin dashboard

#### 3. **Shariah Scanner** (2026 SECP Criteria)
- Hard gates: Debt/Assets < 33%, Non-halal income < 5%, Illiquid Assets > 25%
- 5-Star rating system
- 🔴 Flag UI alerts for breaches
- Margin of Safety calculations

#### 4. **ML Worker Module**
- **LSTM Models**: Price prediction (time-series)
- **Random Forest**: Classification tasks
- Training data from Path C (PSX Downloads)

### Frontend (Next.js 15 + shadcn/ui)

Bloomberg-style institutional UI with:

- **Live Ticker Ribbon**: Infinite scroll of Top 30 prices
- **Institutional Memo View**: Printable 12-section analysis
- **Dynamic Widgets**:
  - DCF Sensitivity sliders (interactive recalculation)
  - Macro Risk Matrix
  - Moat Radar Charts
- **Admin Panels**:
  - Admin: Scraper logs + API latency (Gemini ping)
  - Superadmin: Subscription analytics + Model config
- **Dark theme**: Data-dense Bloomberg interface

### Database (Prisma ORM)

PostgreSQL schema with:
- User/Subscription management (Free, Pro, Institutional tiers)
- MarketData: Company info + time-series prices/volume
- AnalysisCache: AI memos for fast loading + cost optimization
- ShariaCompliance: 2026 SECP audit records
- MLModels: Training metadata + predictions
- Logs: Scraper, API latency, Gemini health

## 🔐 Security & Access Control

- **JWT-based authentication**: 24-hour tokens
- **Role-Based Access Control (RBAC)**:
  - `USER`: Base access
  - `ADMIN`: Data sync, scraper logs, API monitoring
  - `SUPERADMIN`: Full system control, subscription analytics
- **Shariah Hard Gate**: 🔴 UI flags for Debt/Assets > 33%

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Gemini API key
- NewsAPI key (optional)

### Installation

```bash
# Install root dependencies
npm install

# Install backend
cd backend && npm install && cd ..

# Install frontend
cd frontend && npm install && cd ..

# Generate Prisma client
npm run prisma:generate

# Set up database
npm run prisma:migrate
```

### Configuration

1. Copy `.env.example` to `.env`
2. Fill in the required values:
   ```env
   GEMINI_API_KEY=your-key
   DATABASE_URL=postgresql://...
   NEWS_API_KEY=your-key
   ```

### Development

```bash
# Run both backend and frontend in development mode
npm run dev

# Backend only (http://localhost:3000)
npm run dev:backend

# Frontend only (http://localhost:3001)
npm run dev:frontend
```

### Database

```bash
# Run migrations
npm run prisma:migrate

# Open Prisma Studio (visual DB manager)
npm run prisma:studio
```

## 📊 Key API Endpoints

### Public
- `GET /health` - System health status
- `GET /stocks/kmi-30` - All KMI-30 companies with prices

### Authenticated (JWT)
- `GET /stocks/:symbol` - Stock details
- `GET /stocks/:symbol/memo` - AI memo (12-section analysis)
- `GET /stocks/shariah/summary` - Compliance status
- `GET /stocks/shariah/non-compliant` - 🔴 Flagged companies

### Admin Only
- `POST /stocks/sync/live` - Sync live prices (Path A)
- `POST /stocks/sync/historical` - Sync historical data (Path B)
- `POST /stocks/sync/psx-header` - Crawl PSX Header ZIP (Path C)
- `POST /stocks/audit/shariah` - Run Shariah audit
- `GET /stocks/admin/logs/scraper` - View scraper logs
- `GET /stocks/admin/logs/latency` - View API latency

## 🧮 Financial Logic (Backend-Only)

All financial calculations remain on the backend:
- DCF 2-stage valuation
- Ratio analysis (P/E, P/B, ROE, etc.)
- Margin of Safety calculations
- Shariah compliance checks
- Technical indicators

Frontend renders results via memo UI.

## 🔧 Configuration

### Feature Flags (.env)
```env
ENABLE_SCRAPER=true              # Enable data fetching
ENABLE_ML_TRAINING=false         # Enable model training
ENABLE_GEMINI_MEMOS=true         # Enable AI memos
ENABLE_SHARIAH_AUDIT=true        # Enable compliance checks
```

### Shariah Thresholds
Configured in `ShariaService`:
- Debt/Assets: < 33%
- Non-halal Income: < 5%
- Illiquid Assets: > 25%

### Gemini Configuration
- Model: `gemini-1.5-flash`
- API: Google AI Studio
- Pricing: Pay-per-use, optimized for institutional use

## 📈 Performance & Optimization

- **AI Memo Caching**: 24-hour TTL to minimize Gemini API costs
- **Database Indexing**: Optimized for time-series queries
- **Rate Limiting**: 100 requests/minute per user
- **Batch Operations**: Bulk insert/update for data sync

## 🧪 Testing

```bash
# Run all tests
npm test

# Backend tests
npm run test:backend

# Frontend tests
npm run test:frontend
```

## 📚 Documentation

- Backend API: Swagger docs at `http://localhost:3000/api/docs`
- Database: Prisma schema at `backend/prisma/schema.prisma`
- AI Prompts: See `IntelligenceService.buildGeminiPrompt()`

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## 📄 License

MIT

## 📞 Support

For issues or questions:
- Backend issues: Check logs in `STDOUT` or `ScraperLog` table
- Frontend issues: Browser console
- Database issues: `npm run prisma:studio`

---

**Built with FinTech ❤️ for Pakistan's Capital Markets**
