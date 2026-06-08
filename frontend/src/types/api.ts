/**
 * Type definitions for KMI-30 API responses
 */

// ============================================================================
// Stock Data
// ============================================================================

export interface Company {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  shortName?: string;
}

export interface Price {
  id: string;
  companyId: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: bigint;
}

export interface KMI30Company {
  ranking: number;
  symbol: string;
  name: string;
  sector: string;
  weight: number;
  price?: number;
  volume?: number;
  change: number;
  shariaStatus: string;
  rating: number;
}

export interface StockDetails {
  symbol: string;
  name: string;
  sector: string;
  ranking?: number;
  weight?: number;
  fundamentals: Fundamentals;
  shariah: ShariaComplianceStatus;
  priceHistory: Price[];
}

// ============================================================================
// Financial Data
// ============================================================================

export interface Fundamentals {
  totalAssets?: number;
  totalDebt?: number;
  debtToAssets?: number;
  revenue?: number;
  netIncome?: number;
  operatingCashFlow?: number;
  marketCap?: number;
  peRatio?: number;
  pbRatio?: number;
  nonHalalIncome?: number;
  illiquidAssets?: number;
  roe?: number;
  roa?: number;
  fcf?: number;
  moatStrength?: string;
}

export interface DCFAnalysis {
  id: string;
  fundamentalId: string;
  forecastYears: number;
  terminalGrowthRate: number;
  wacc: number;
  terminalValue?: number;
  pvTerminalValue?: number;
  sumPVCashFlows?: number;
  enterpriseValue?: number;
  intrinsicValue?: number;
  fairValue?: number;
  downside?: number;
  upside?: number;
  marginOfSafety?: number;
  currentPrice?: number;
}

// ============================================================================
// AI Memo
// ============================================================================

export interface Recommendation {
  id: string;
  signal: 'BUY' | 'HOLD' | 'SELL';
  confidence: number;
  entryZone?: string;
  fairValue?: number;
  stopLoss?: number;
}

export interface AIMemo {
  id: string;
  companyId: string;
  headerBar?: string;
  executiveSummary?: string;
  scorecard?: string;
  recommendation?: Recommendation;
  dcfAnalysis?: string;
  businessMoat?: string;
  riskFactors?: string;
  macroContext?: string;
  technicalView?: string;
  sectorComparison?: string;
  valuationSummary?: string;
  disclaimer?: string;
  generatedBy: string;
  generatedAt: string;
  expiresAt?: string;
}

// ============================================================================
// Shariah Compliance
// ============================================================================

export interface ShariaComplianceStatus {
  isCompliant: boolean;
  rating: number;
  debtRatio?: number;
  halalIncome?: number;
  status: string;
}

export interface ShariaCompliance {
  id: string;
  companyId: string;
  debtAssetsRatio?: number;
  nonHalalIncomeRatio?: number;
  illiquidAssetsRatio?: number;
  isCompliant: boolean;
  complianceRating: number;
  marginOfSafety?: number;
  failingCriteria: string[];
  flaggedForReview: boolean;
  lastAuditedAt?: string;
}

export interface ShariaComplianceSummary {
  total: number;
  compliant: number;
  nonCompliant: number;
  flagged: number;
  complianceRate: string | number;
}

// ============================================================================
// System Health
// ============================================================================

export interface SystemHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  timestamp: string;
  database: 'CONNECTED' | 'DISCONNECTED';
  gemini: {
    status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
    latency?: number;
  };
  services: {
    dataEngine: string;
    intelligence: string;
    shariah: string;
  };
}

export interface GeminiPingResponse {
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  latency?: number;
  message: string;
}

// ============================================================================
// Admin/Logging
// ============================================================================

export interface ScraperLog {
  id: string;
  source: 'psx-api' | 'psxdata' | 'psx-dps';
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  recordsFetched: number;
  startTime: string;
  endTime?: string;
  duration?: number;
  error?: string;
}

export interface APILog {
  id: string;
  userId?: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  statusCode: number;
  latency: number;
  timestamp: string;
}

// ============================================================================
// User & Auth
// ============================================================================

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
  tier: 'FREE' | 'PRO' | 'INSTITUTIONAL';
}

export interface AuthResponse {
  access_token: string;
  expires_in: number;
  user: User;
}
