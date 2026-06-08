import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface MemoSections {
  headerBar: string;
  executiveSummary: string;
  scorecard: string;
  recommendation: {
    signal: string;
    confidence: number;
    entryZone: string;
    fairValue: number;
    stopLoss: number;
  };
  dcfAnalysis: string;
  businessMoat: string;
  riskFactors: string;
  macroContext: string;
  technicalView: string;
  sectorComparison: string;
  valuationSummary: string;
  disclaimer: string;
}

@Injectable()
export class IntelligenceService {
  private logger = new Logger('IntelligenceService');
  private geminiApiKey: string | undefined;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {
    this.geminiApiKey = this.configService.get<string>('GEMINI_API_KEY');
  }

  /**
   * Generate KMI-30 Alpha v4.0 AI Memo (12-Section PM-Grade Analysis)
   */
  async generateAIMemo(symbol: string): Promise<any> {
    try {
      this.logger.log(`📊 Generating KMI-30 Memo for ${symbol}...`);

      if (!this.geminiApiKey) {
        throw new Error('GEMINI_API_KEY not configured');
      }

      // Fetch company data
      const company = await this.prisma.company.findUnique({
        where: { symbol },
        include: {
          fundamentals: true,
          prices: { orderBy: { date: 'desc' }, take: 30 },
          shariah: true,
        },
      });

      if (!company) {
        throw new Error(`Company not found: ${symbol}`);
      }

      // Build context for Gemini
      const context = this.buildMemoContext(company);

      // Call Gemini 1.5 Flash
      const memo = await this.callGemini(context);

      // Parse and store memo
      const savedMemo = await this.prisma.aIMemo.create({
        data: {
          companyId: company.id,
          headerBar: memo.headerBar,
          executiveSummary: memo.executiveSummary,
          scorecard: memo.scorecard,
          dcfAnalysis: memo.dcfAnalysis,
          businessMoat: memo.businessMoat,
          riskFactors: memo.riskFactors,
          macroContext: memo.macroContext,
          technicalView: memo.technicalView,
          sectorComparison: memo.sectorComparison,
          valuationSummary: memo.valuationSummary,
          disclaimer: memo.disclaimer,
          generatedBy: 'Gemini-1.5-Flash',
          generatedAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24-hour cache
          recommendation: {
            create: {
              signal: memo.recommendation.signal,
              confidence: memo.recommendation.confidence,
              entryZone: memo.recommendation.entryZone,
              fairValue: memo.recommendation.fairValue,
              stopLoss: memo.recommendation.stopLoss,
            },
          },
        },
        include: { recommendation: true },
      });

      this.logger.log(`✓ Memo generated for ${symbol}`);
      return savedMemo;
    } catch (error) {
      this.logger.error(`Failed to generate memo for ${symbol}`, error);
      throw error;
    }
  }

  /**
   * Call Gemini 1.5 Flash API
   */
  private async callGemini(context: string): Promise<MemoSections> {
    try {
      const prompt = this.buildGeminiPrompt(context);

      const response = await firstValueFrom(
        this.httpService.post(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
          {
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          },
          {
            params: {
              key: this.geminiApiKey,
            },
          },
        ),
      );

      const content = response.data.candidates[0].content.parts[0].text;
      return this.parseMemoResponse(content);
    } catch (error) {
      this.logger.error('Gemini API call failed', error);
      throw error;
    }
  }

  /**
   * Build context from company data for Gemini prompt
   */
  private buildMemoContext(company: any): string {
    const latest = company.prices[0];
    const fundamental = company.fundamentals;
    const shariah = company.shariah;

    return `
Company: ${company.name} (${company.symbol})
Sector: ${company.sector}

Latest Price: ${latest?.close || 'N/A'}
Volume: ${latest?.volume || 'N/A'}

Fundamentals:
- Market Cap: ${fundamental?.marketCap || 'N/A'}
- P/E Ratio: ${fundamental?.peRatio || 'N/A'}
- Debt/Assets: ${fundamental?.debtToAssets || 'N/A'}
- ROE: ${fundamental?.roe || 'N/A'}
- FCF: ${fundamental?.fcf || 'N/A'}
- Moat: ${fundamental?.moatStrength || 'N/A'}

Shariah Compliance:
- Status: ${shariah?.isCompliant ? 'COMPLIANT ✓' : 'NON-COMPLIANT ✗'}
- Debt/Assets: ${shariah?.debtAssetsRatio || 'N/A'} (< 33% required)
- Non-Halal Income: ${shariah?.nonHalalIncomeRatio || 'N/A'} (< 5% required)
- Rating: ${shariah?.complianceRating || 'N/A'}/5 ⭐
    `;
  }

  /**
   * Build Gemini prompt for KMI-30 Alpha analysis
   */
  private buildGeminiPrompt(context: string): string {
    return `
You are a Principal Financial Analyst for KMI-30 Alpha v4.0, an institutional-grade investment platform for Pakistan's top 30 PSX stocks.

Generate a comprehensive, PM-grade institutional memo with the following 12 sections (use JSON format for easy parsing):

1. **Header Bar**: Symbol | Price | 24h Change% | Market Cap
2. **Executive Summary**: 2-3 sentences on investment thesis
3. **Scorecard**: Key metrics snapshot (P/E, P/B, ROE, Moat Rating)
4. **Recommendation**: Signal (BUY/HOLD/SELL), Confidence (0-1), Entry Zone, Fair Value, Stop Loss
5. **2-Stage DCF Analysis**: Terminal Value, WACC, Margin of Safety
6. **Business Moat**: Competitive advantages and sustainability
7. **Risk Factors**: Downside risks and catalysts
8. **Macro Context**: GDP/Inflation/FX impact on sector
9. **Technical View**: Trend, Support/Resistance levels
10. **Sector Comparison**: Peer benchmarking and relative valuation
11. **Valuation Summary**: P/E, P/B, EV/Sales context
12. **Disclaimer**: Standard legal boilerplate

Company Data:
${context}

Return ONLY a JSON object with these exact keys: headerBar, executiveSummary, scorecard, recommendation (with signal, confidence, entryZone, fairValue, stopLoss), dcfAnalysis, businessMoat, riskFactors, macroContext, technicalView, sectorComparison, valuationSummary, disclaimer.
    `;
  }

  /**
   * Parse Gemini response into memo sections
   */
  private parseMemoResponse(content: string): MemoSections {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        headerBar: parsed.headerBar || '',
        executiveSummary: parsed.executiveSummary || '',
        scorecard: parsed.scorecard || '',
        recommendation: parsed.recommendation || {
          signal: 'HOLD',
          confidence: 0.5,
          entryZone: 'N/A',
          fairValue: 0,
          stopLoss: 0,
        },
        dcfAnalysis: parsed.dcfAnalysis || '',
        businessMoat: parsed.businessMoat || '',
        riskFactors: parsed.riskFactors || '',
        macroContext: parsed.macroContext || '',
        technicalView: parsed.technicalView || '',
        sectorComparison: parsed.sectorComparison || '',
        valuationSummary: parsed.valuationSummary || '',
        disclaimer: parsed.disclaimer || '',
      };
    } catch (error) {
      this.logger.error('Failed to parse Gemini response', error);
      throw error;
    }
  }

  /**
   * Get cached memo or generate new one (with fallback to mock)
   */
  async getMemoOrGenerate(symbol: string): Promise<any> {
    try {
      const company = await this.prisma.company.findUnique({
        where: { symbol },
      });

      if (!company) {
        throw new Error(`Company not found: ${symbol}`);
      }

      // Check for valid cached memo
      const cachedMemo = await this.prisma.aIMemo.findFirst({
        where: {
          companyId: company.id,
          expiresAt: { gt: new Date() },
        },
        orderBy: { generatedAt: 'desc' },
        include: { recommendation: true },
      });

      if (cachedMemo) {
        this.logger.log(`📦 Returning cached memo for ${symbol}`);
        return cachedMemo;
      }

      // Generate new memo
      return await this.generateAIMemo(symbol);
    } catch (error) {
      this.logger.warn(`Failed to generate memo for ${symbol}, returning mock memo`);
      // Return mock memo instead of throwing error
      return this.getMockMemo(symbol);
    }
  }

  /**
   * Get mock memo when Gemini API fails or data is incomplete
   */
  private getMockMemo(symbol: string): any {
    const memos: Record<string, any> = {
      PSEL: {
        id: `mock-${symbol}`,
        symbol: 'PSEL',
        headerBar: 'PSEL | Rs 463.00 | +2.32% | PKR 1.2T',
        executiveSummary: 'Market infrastructure play with strong fundamentals. Beneficial owner of PSX platform. Steady dividend stream.',
        scorecard: 'P/E: 18.5x | P/B: 2.1x | ROE: 18% | Moat: Strong ★★★★',
        dcfAnalysis: 'Terminal Value: PKR 1.8T | WACC: 9.5% | MOS: 12% upside. Fair value estimated at Rs 520.',
        businessMoat: 'Monopoly operator of PSX with recurring regulatory fees. Network effects and switching costs create sustainable moat.',
        riskFactors: 'Regulatory changes, geopolitical risk to market volumes, PKR depreciation impact',
        macroContext: 'PKR depreciation headwind to international comparisons. Inflation cooling supports valuations.',
        technicalView: 'Above 200-DMA. RSI: 65 (overbought). Support: 445 | Resistance: 475.',
        sectorComparison: 'Trading at 18.5x P/E vs Financial Services median 15.2x. Premium justified by moat strength.',
        valuationSummary: 'Fair Value: Rs 520 (12% upside). Currently at fair value with limited margin of safety.',
        disclaimer: '[MOCK MEMO] This is generated when Gemini AI is unavailable. Past performance ≠ future results.',
        recommendation: { signal: 'HOLD', confidence: 0.75, entryZone: '445-450', fairValue: 520, stopLoss: 420 },
        generatedBy: 'Mock Generator (Gemini Unavailable)',
        generatedAt: new Date(),
      },
      HBL: {
        id: `mock-${symbol}`,
        symbol: 'HBL',
        headerBar: 'HBL | Rs 88.70 | +1.37% | PKR 620B',
        executiveSummary: 'Largest bank by assets with 15M+ customers. Strong deposit base and excellent FCF conversion.',
        scorecard: 'P/E: 12.8x | P/B: 1.2x | ROE: 16% | Moat: Strong ★★★★',
        dcfAnalysis: 'Terminal Value: PKR 92B | WACC: 10.0% | MOS: 18% upside. Fair value Rs 105.',
        businessMoat: 'Market leader in deposits, branching network, customer relationship depth, technology infrastructure.',
        riskFactors: 'Rising NPA risks, interest rate sensitivity, geopolitical concerns, regulatory changes',
        macroContext: 'Rate cycle turning favorable. Improving credit growth post-IMF program. PKR stabilization.',
        technicalView: 'Consolidation above 85 support. Volume increasing on upside. Breakout potential above 90.',
        sectorComparison: 'Trading at 12.8x vs Banking avg 13.2x. Fairly valued with attractive dividend yield.',
        valuationSummary: 'Fair Value: Rs 105 (18% upside). Attractive entry levels for long-term investors.',
        disclaimer: '[MOCK MEMO] This is generated when Gemini AI is unavailable. Past performance ≠ future results.',
        recommendation: { signal: 'BUY', confidence: 0.82, entryZone: '85-87', fairValue: 105, stopLoss: 78 },
        generatedBy: 'Mock Generator (Gemini Unavailable)',
        generatedAt: new Date(),
      },
      UNITY: {
        id: `mock-${symbol}`,
        symbol: 'UNITY',
        headerBar: 'UNITY | Rs 314.50 | +0.80% | PKR 185B',
        executiveSummary: 'Consumer staples giant with pricing power. Margin expansion underway. Strong brand portfolio.',
        scorecard: 'P/E: 22.3x | P/B: 3.2x | ROE: 22% | Moat: Very Strong ★★★★★',
        dcfAnalysis: 'Terminal Value: PKR 210B | WACC: 9.2% | MOS: 21% upside. Fair value Rs 380.',
        businessMoat: 'Dominant market share in FMCG, brand loyalty, distribution network, pricing power',
        riskFactors: 'Commodity input volatility, FX exposure, rural demand slowdown, regulatory changes',
        macroContext: 'Inflation peak passed. Consumer demand improving. PKR weakness easing supporting margins.',
        technicalView: 'Strong uptrend. Above all major MAs. RSI: 62 (neutral). Next target: 330-340.',
        sectorComparison: 'Trading at 22.3x P/E. Premium to peers but justified by superior growth and returns.',
        valuationSummary: 'Fair Value: Rs 380 (21% upside). Growth stock premium warranted given ROE.',
        disclaimer: '[MOCK MEMO] This is generated when Gemini AI is unavailable. Past performance ≠ future results.',
        recommendation: { signal: 'BUY', confidence: 0.79, entryZone: '300-310', fairValue: 380, stopLoss: 285 },
        generatedBy: 'Mock Generator (Gemini Unavailable)',
        generatedAt: new Date(),
      },
    };

    const mockMemo = memos[symbol] || {
      id: `mock-${symbol}`,
      symbol,
      headerBar: `${symbol} | Rs — | +0.00% | —`,
      executiveSummary: `High-quality PSX stock. Fundamentals strong. Growth prospects favorable.`,
      scorecard: `See fundamentals in stock details panel for ${symbol}`,
      dcfAnalysis: 'DCF model pending - add company fundamentals to enable valuation',
      businessMoat: 'Sector leader in its category with competitive advantages',
      riskFactors: 'Market risks, geopolitical risks, currency risks',
      macroContext: 'Pakistan economic recovery underway post-IMF program',
      technicalView: 'Chart analysis available in dashboard - monitor support/resistance',
      sectorComparison: 'Competitive positioning strong relative to peers',
      valuationSummary: 'Fairly valued at current levels - see detailed metrics',
      disclaimer: '[MOCK MEMO] Live AI analysis unavailable. Check back for detailed institutional memo.',
      recommendation: { signal: 'HOLD', confidence: 0.65, entryZone: 'Pending', fairValue: 0, stopLoss: 0 },
      generatedBy: 'Mock Generator',
      generatedAt: new Date(),
    };

    return mockMemo;
  }
}
