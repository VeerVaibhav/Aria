# APIx: National Airfare Intelligence Command Center

![APIx Dashboard](https://img.shields.io/badge/Status-Live-emerald?style=for-the-badge) ![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js) ![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase) ![Gemini](https://img.shields.io/badge/AI-Google_Gemini-4285F4?style=for-the-badge&logo=google)

A robust, enterprise-grade intelligence platform designed to measure, explain, forecast, and simulate India's airfare-driven inflation. Developed for macroeconomic monitoring by entities like the **Ministry of Statistics and Programme Implementation (MoSPI)** and the **Reserve Bank of India (RBI)**.

## 🌟 Key Features

### 1. Market Intelligence & Telemetry
* **10-Corridor Tracking**: Monitors India's highest-density DGCA air corridors (DEL-BOM, BLR-DEL, etc.).
* **Statutory Tax Decomposition**: Automatically splits gross spot fares into unbundled Base Fares and Statutory Taxes (Flat ₹350 Airport UDF/PSF + 5% GST).
* **Booking Window Elasticity**: Tracks advance purchase windows from T+1 (Immediate) to T+45 (Advance).

### 2. ARIA (Airfare Research & Intelligence Assistant)
* **AI Policy Copilot**: Powered by **Google Gemini 3.6 Flash**, ARIA synthesizes real-time telemetry into executive briefings.
* **Structured Insights**: Automatically parses and formats econometric data into actionable intelligence (Executive Summaries, Key Telemetry Metrics, CPI Transmission, and Policy Recommendations).
* **Market Concentration Analysis**: Tracks Herfindahl-Hirschman Index (HHI) for carrier monopolies and dynamic surge pricing.

### 3. Geospatial & Visual Analytics
* **Accurate India Vector Map**: Features a geographically projected SVG map of India, honoring official Survey of India boundary parameters (including exact contours for J&K, Ladakh, and NE boundaries).
* **Econometric Lab**: Real-time CPI transmission dashboards translating ticket shocks into basis-point inflation impacts.

### 4. GIGW 3.0 & Accessibility Standards
* **WCAG 2.1 AA Compliant**: High contrast typography, strictly zero glassmorphism, and zero inaccessible gradients.
* **Bilingual Support (EN/HI)**: Full localized toggle for English and Hindi across the entire dashboard interface.

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Recharts, Lucide React
* **Backend / Database**: Supabase (PostgreSQL), Next.js API Routes
* **AI Engine**: Google GenAI SDK (`@google/genai`)
* **Telemetry Scraper**: Python 3 (BeautifulSoup, Requests) for scheduled data ingestion

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or higher)
* Python 3.10+ (for the scraper scripts)
* Supabase Account & Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/VeerVaibhav/Aria.git
   cd Aria
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

---

## 📂 Project Structure

* `/app` - Next.js App Router (Pages, Layouts, API routes)
* `/components` - Modular React components (Sidebar, GeospatialMap, PolicyCopilot, etc.)
* `/lib` - Utilities (i18n, Supabase client, query fetchers)
* `/scripts` - Database schema deployment and historical seed scripts
* `/worker` - Python-based pricing scraper engine (`scraper.py`)

## 📝 Changelog

### [Latest] — 2026-09-25 · VeerVaibhav

#### 🐛 Bug Fixes
- **Fixed Heatmap**: Resolved rendering issues in the Sector Heatmap component; data now displays correctly across all corridors and booking windows.
- **Fixed Hindi Translation**: Corrected broken and missing localization strings in the `i18n` module — the full dashboard now renders accurately in Hindi (हिन्दी).

#### ✨ Improvements
- **Improved UI**: Polished visual consistency across multiple components including the Sidebar, Hero Metric Cards, KPI Tiles, Page Intro, Site Header/Footer, and Trust Badge. Improved spacing, typography, and responsiveness.

#### 🔧 Minor Fixes
- **Web Scraping Script**: Made minor fixes to `worker/scraper.py` for more robust and reliable airfare data ingestion.

---

## 📜 License

This project is intended for demonstration and analytical usage. All geospatial representations are illustrative approximations for dashboard telemetry.
