# 🔌 KMI-30 Backend API Reference

## Overview

Complete API documentation for KMI-30 Alpha v4.0 backend.

**Base URL**: `http://localhost:3000`

**Authentication**: JWT Bearer token in Authorization header
```
Authorization: Bearer <jwt_token>
```

---

## 📊 Public Endpoints (No Auth)

### System Health

```http
GET /health
```

**Response**:
```json
{
  "status": "HEALTHY",
  "timestamp": "2026-05-18T10:30:00Z",
  "database": "CONNECTED",
  "gemini": {
    "status": "ONLINE",
    "latency": 45
  },
  "services": {
    "dataEngine": "READY",
    "intelligence": "READY",
    "shariah": "READY"
  }
}
```

---

### Get KMI-30 Companies

```http
GET /stocks/kmi-30
```

**Response**:
```json
[
  {
    "ranking": 1,
    "symbol": "PSEL",
    "name": "Pakistan Stock Exchange Limited",
    "sector": "Financial Services",
    "weight": 3.33,
    "price": 1450.50,
    "volume": 5000000,
    "change": 2.34,
    "shariaStatus": "✓",
    "rating": 5
  },
  {
    "ranking": 2,
    "symbol": "HBL",
    "name": "HBL - The Hongkong and Shanghai Banking Corporation Limited",
    "sector": "Banking",
    "weight": 3.33,
    "price": 225.00,
    "volume": 3500000,
    "change": -1.05,
    "shariaStatus": "🔴",
    "rating": 2
  }
]
```

---

## 🔐 Authenticated Endpoints (JWT Required)

### Get Stock Details

```http
GET /stocks/:symbol
Authorization: Bearer <token>
```

**Example**:
```http
GET /stocks/PSEL
```

**Response**:
```json
{
  "symbol": "PSEL",
  "name": "Pakistan Stock Exchange Limited",
  "sector": "Financial Services",
  "ranking": 1,
  "weight": 3.33,
  "fundamentals": {
    "totalAssets": 50000000000,
    "totalDebt": 10000000000,
    "debtToAssets": 0.20,
    "revenue": 5000000000,
    "netIncome": 1000000000,
    "peRatio": 15.2,
    "roe": 0.20,
    "roa": 0.02,
    "moatStrength": "Strong"
  },
  "shariah": {
    "isCompliant": true,
    "rating": 5,
    "debtRatio": 0.20,
    "halalIncome": 0.02,
    "status": "✓ COMPLIANT"
  },
  "priceHistory": [
    {
      "date": "2026-05-18",
      "open": 1420.00,
      "high": 1460.00,
      "low": 1418.00,
      "close": 1450.50,
      "volume": 5000000
    }
  ]
}
```

---

### Get AI Memo

```http
GET /stocks/:symbol/memo
Authorization: Bearer <token>
```

**Example**:
```http
GET /stocks/PSEL/memo
```

**Response**:
```json
{
  "id": "memo-1",
  "companyId": "company-1",
  "headerBar": "PSEL | 1,450.50 | +2.34% | Market Cap: $500B",
  "executiveSummary": "PSEL demonstrates strong institutional positioning as Pakistan's premier bourse with expanding market depth and robust regulatory framework. Current valuation appears reasonable given steady earnings growth and margin expansion.",
  "scorecard": "P/E: 15.2 | P/B: 1.8 | ROE: 20% | Moat: Strong | FCF Yield: 4.5%",
  "recommendation": {
    "signal": "BUY",
    "confidence": 0.82,
    "entryZone": "1,400-1,430",
    "fairValue": 1650.00,
    "stopLoss": 1350.00
  },
  "dcfAnalysis": "2-stage DCF with 5-year explicit forecast and 2.5% terminal growth yields intrinsic value of $1,650 per share. WACC at 9.5%. Margin of safety: 14%.",
  "businessMoat": "Regulatory franchise + network effects + switching costs for listed companies",
  "riskFactors": "Economic downturn, regulatory changes, FX volatility",
  "macroContext": "Pakistan GDP growth 3.2%, inflation 11.5%, PKR under pressure. Corporate earnings under pressure but market breadth improving.",
  "technicalView": "Bullish breakout above 1,440 resistance. 200-day SMA support at 1,320.",
  "sectorComparison": "PSEL trading at 15.2x P/E vs sector average 18.5x. Relative value attractive.",
  "valuationSummary": "P/E: 15.2x (discount to history), P/B: 1.8x (fair), EV/Sales: 2.1x",
  "disclaimer": "This analysis is for institutional investors only. Conduct your own due diligence.",
  "generatedBy": "Gemini-1.5-Flash",
  "generatedAt": "2026-05-18T10:15:00Z"
}
```

---

### Get Shariah Compliance Summary

```http
GET /stocks/shariah/summary
Authorization: Bearer <token>
```

**Response**:
```json
{
  "total": 30,
  "compliant": 28,
  "nonCompliant": 2,
  "flagged": 1,
  "complianceRate": 93.33
}
```

---

### Get Non-Compliant Companies

```http
GET /stocks/shariah/non-compliant
Authorization: Bearer <token>
```

**Response**:
```json
[
  {
    "id": "compliance-1",
    "companyId": "company-2",
    "company": {
      "symbol": "XYZ",
      "name": "Sample Company",
      "sector": "Finance"
    },
    "debtAssetsRatio": 0.42,
    "nonHalalIncomeRatio": 0.07,
    "illiquidAssetsRatio": 0.18,
    "isCompliant": false,
    "complianceRating": 1,
    "failingCriteria": ["DEBT_THRESHOLD", "HALAL_INCOME"],
    "flaggedForReview": true,
    "marginOfSafety": -27.5,
    "lastAuditedAt": "2026-05-18T09:00:00Z"
  }
]
```

---

## 👨‍💼 Admin Endpoints (ADMIN | SUPERADMIN role)

### Sync Live Prices (Path A)

```http
POST /stocks/sync/live
Authorization: Bearer <admin_token>
```

**Response**:
```json
{
  "status": "SUCCESS",
  "recordsFetched": 30,
  "timestamp": "2026-05-18T10:30:00Z"
}
```

---

### Sync Historical Data (Path B)

```http
POST /stocks/sync/historical
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "symbols": ["PSEL", "HBL", "UNITY"]
}
```

**Optional**: Omit `symbols` to fetch for all KMI-30 companies.

**Response**:
```json
{
  "status": "SUCCESS",
  "recordsFetched": 10950,
  "details": "Fetched 365 days for 3 companies"
}
```

---

### Sync PSX Header (Path C)

```http
POST /stocks/sync/psx-header
Authorization: Bearer <admin_token>
```

**Response**:
```json
{
  "status": "SUCCESS",
  "companiesSeeded": 30,
  "details": "Extracted from https://dps.psx.com.pk/downloads"
}
```

---

### Run Shariah Audit

```http
POST /stocks/audit/shariah
Authorization: Bearer <admin_token>
```

**Response**:
```json
{
  "status": "SUCCESS",
  "summary": {
    "total": 30,
    "compliant": 28,
    "nonCompliant": 2,
    "flagged": 1,
    "complianceRate": 93.33
  },
  "auditedAt": "2026-05-18T10:30:00Z"
}
```

---

### View Scraper Logs

```http
GET /stocks/admin/logs/scraper
Authorization: Bearer <admin_token>
```

**Response**:
```json
[
  {
    "id": "log-1",
    "source": "psx-api",
    "status": "SUCCESS",
    "recordsFetched": 30,
    "startTime": "2026-05-18T09:00:00Z",
    "endTime": "2026-05-18T09:00:15Z",
    "duration": 150
  },
  {
    "id": "log-2",
    "source": "psxdata",
    "status": "SUCCESS",
    "recordsFetched": 10950,
    "startTime": "2026-05-18T09:01:00Z",
    "endTime": "2026-05-18T09:02:30Z",
    "duration": 1500
  }
]
```

---

### View API Latency Logs

```http
GET /stocks/admin/logs/latency
Authorization: Bearer <admin_token>
```

**Response**:
```json
[
  {
    "id": "api-log-1",
    "userId": "user-1",
    "endpoint": "/stocks/kmi-30",
    "method": "GET",
    "statusCode": 200,
    "latency": 45,
    "timestamp": "2026-05-18T10:15:30Z"
  },
  {
    "id": "api-log-2",
    "userId": "user-2",
    "endpoint": "/stocks/PSEL/memo",
    "method": "GET",
    "statusCode": 200,
    "latency": 1200,
    "timestamp": "2026-05-18T10:16:00Z"
  }
]
```

---

### Check Gemini API Health

```http
GET /health/gemini-ping
Authorization: Bearer <admin_token>
```

**Response**:
```json
{
  "status": "ONLINE",
  "latency": 45,
  "message": "Gemini API ping successful"
}
```

---

## 🔴 Error Responses

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Missing or invalid JWT token"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "User role \"USER\" does not have required roles: ADMIN, SUPERADMIN"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Not Found",
  "error": "Company not found: INVALID"
}
```

### 429 Rate Limited

```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "error": "Exceeded rate limit of 100 requests per minute"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Internal Server Error",
  "error": "Database connection failed"
}
```

---

## 🔑 Authentication Flow

### 1. Get JWT Token

**Endpoint**: `POST /auth/login` (Not yet implemented - add this)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kmi30.local",
    "password": "password"
  }'
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400
}
```

### 2. Use Token in Requests

```bash
curl -H "Authorization: Bearer <access_token>" \
  http://localhost:3000/stocks/PSEL/memo
```

---

## 📊 Data Models

### Company

```typescript
{
  id: string;
  symbol: string;           // e.g., "PSEL"
  name: string;             // Full company name
  sector: string;           // e.g., "Financial Services"
  shortName?: string;       // Trading symbol
  kmi30Index?: KMI30Index;  // Index membership
  prices?: Price[];         // Time-series data
  fundamentals?: CompanyFundamental;
  shariah?: ShariaCompliance;
}
```

### Price

```typescript
{
  id: string;
  companyId: string;
  date: DateTime;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: bigint;
}
```

### AIMemo

```typescript
{
  id: string;
  companyId: string;
  headerBar: string;
  executiveSummary: string;
  scorecard: string;
  recommendation: Recommendation;
  dcfAnalysis: string;
  businessMoat: string;
  riskFactors: string;
  macroContext: string;
  technicalView: string;
  sectorComparison: string;
  valuationSummary: string;
  disclaimer: string;
  generatedBy: "Gemini-1.5-Flash";
  generatedAt: DateTime;
  expiresAt?: DateTime;  // Cache TTL
}
```

### ShariaCompliance

```typescript
{
  id: string;
  companyId: string;
  debtAssetsRatio?: number;       // Must be < 0.33
  nonHalalIncomeRatio?: number;   // Must be < 0.05
  illiquidAssetsRatio?: number;   // Must be > 0.25
  isCompliant: boolean;
  complianceRating: number;       // 0-5 stars
  marginOfSafety?: number;        // % below threshold
  failingCriteria: string[];      // List of failed checks
  flaggedForReview: boolean;
}
```

---

## 🚀 Usage Examples

### cURL

```bash
# Get KMI-30
curl http://localhost:3000/stocks/kmi-30

# Get memo (authenticated)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/stocks/PSEL/memo

# Sync live prices (admin)
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:3000/stocks/sync/live
```

### JavaScript/TypeScript

```typescript
// Fetch KMI-30
const response = await fetch('http://localhost:3000/stocks/kmi-30');
const companies = await response.json();

// Get memo with auth
const memoResponse = await fetch('http://localhost:3000/stocks/PSEL/memo', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const memo = await memoResponse.json();

// Sync data (admin)
const syncResponse = await fetch('http://localhost:3000/stocks/sync/live', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});
const result = await syncResponse.json();
```

### Python

```python
import requests

# Get KMI-30
response = requests.get('http://localhost:3000/stocks/kmi-30')
companies = response.json()

# Get memo
headers = {'Authorization': f'Bearer {token}'}
memo_response = requests.get(
  'http://localhost:3000/stocks/PSEL/memo',
  headers=headers
)
memo = memo_response.json()
```

---

## ⚡ Rate Limiting

- **Default Limit**: 100 requests per minute per user
- **Applies to**: All endpoints except `/health`
- **Response Header**: `X-RateLimit-Remaining: 99`

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- Monetary values in PKR (Pakistani Rupees)
- Ratios are decimals (0.33 = 33%)
- Volume in units
- Market cap in PKR (currency units, e.g., billions)

---

**Last Updated**: May 18, 2026
**Backend Version**: 1.0.0
**API Status**: 🟢 Live
