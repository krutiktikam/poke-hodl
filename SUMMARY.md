# PokéMarket: Professional TCG Terminal

## Project Overview
PokéMarket is an institutional-grade market terminal for Pokémon TCG assets. It provides real-time market discovery, advanced historical price interpolation, and AI-powered trend projections. The platform is designed for high-end collectors and market participants who require deep analytical insights.

## Key Features
- **Live Market Terminal:** Track top movers, gainers, and losers in real-time.
- **AI Price Projections:** 30-day future estimation using linear regression models.
- **"All Days" Price Estimation:** Seamless historical interpolation to fill data gaps.
- **Market Pulse Analytics:** Advanced sentiment, volatility, and momentum metrics.
- **Enhanced AI Scanner:** Instantly identify assets from screenshots or physical photos with dedicated modes for Standard and Pocket cards.
- **Personal Vault (Portfolio):** Create a secure profile to track your collection, view ROI, and analyze allocation distribution. Supports Google OAuth for instant login.
- **TCG Pocket Support:** Integrated dual-engine support for both physical TCG and digital-only Pocket series.

## Tech Stack
- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Analytics:** Custom Linear Regression & Interpolation Engines
- **Charts:** Recharts (Optimized for financial data)
- **Computer Vision:** Tesseract.js & Gemini Vision AI
- **APIs:** 
  - Pokémon TCG API (pokemontcg.io) - Physical/Live
  - TCGdex API - Digital/Pocket
  - Pokeprice API - Grading & History

## Phase Plan
1. **Phase 1: Foundation** - Next.js setup, API integration, Search page. [COMPLETED]
2. **Phase 2: Market Pivot** - Transformation from personal vault to global market terminal. [COMPLETED]
3. **Phase 3: Predictive Analytics** - Implementation of interpolation and regression models. [COMPLETED]
4. **Phase 4: Digital Expansion** - Integrating TCG Pocket support and TCGdex engine. [IN PROGRESS]
5. **Phase 5: Global Terminal v5** - Real-time supply/demand heatmaps and whale tracking. [PENDING]
