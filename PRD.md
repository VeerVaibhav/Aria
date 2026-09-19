# Product Requirements Document (PRD)
## Project: APIx - Real-Time Airfare Price Index for CPI Augmentation
**Sponsoring Body:** Ministry of Statistics and Programme Implementation (MoSPI) / NSO  
**Key Consumer:** Reserve Bank of India (RBI) Monetary Policy Committee  
**Problem Code:** SIH26056  

---

### 1. Mandate & Problem Definition
Under the Consumer Price Index (CPI) framework, air travel fares are grouped within 'Transport and Communication'. Currently, prices are compiled through periodic manual visits to airline booking offices. In an aviation market where >90% of bookings are dynamic and algorithmic, this manual frequency fails to capture 200–400% daily price swings driven by advance-purchase windows, route capacity, and seasonal surges[cite: 1, 2].

**The Solution:** An end-to-end automated platform that extracts multi-source airfares across fixed advance-purchase windows ($T+1$ to $T+45$), cleans and normalizes quotes, computes a DGCA traffic-weighted real-time Airfare Price Index (APIx), and renders an official GIGW 3.0 civic dashboard with REST APIs for MoSPI eSankhyiki ingestion[cite: 1, 2].

---

### 2. Monitored Sector Basket & Windows
The index tracks the top domestic high-density corridors based on Directorate General of Civil Aviation (DGCA) city-pair passenger volume[cite: 1, 2]:
1. `DEL-BOM` / `BOM-DEL` (Delhi ⇄ Mumbai)
2. `BLR-DEL` / `DEL-BLR` (Bengaluru ⇄ Delhi)
3. `BOM-BLR` / `BLR-BOM` (Mumbai ⇄ Bengaluru)
4. `DEL-CCU` / `CCU-DEL` (Delhi ⇄ Kolkata)
5. `MAA-DEL` / `DEL-MAA` (Chennai ⇄ Delhi)

**Advance Purchase Horizons:**
Every data capture sweep samples departure dates at:
- **$T+1$** (Immediate/Emergency travel)
- **$T+7$** (Short-horizon business/leisure)
- **$T+15$** (Standard advance booking)
- **$T+30$** (Planned vacation)
- **$T+45$** (Long-range discount tier)[cite: 1, 2]

---

### 3. Mathematical Index Specification
The computational pipeline follows international ILO/IMF CPI standards and MoSPI methodology[cite: 1, 2]:

#### Step 1: Elementary Price Aggregation (Jevons Index)
For each route $r$ and advance booking window $w$ on date $t$, the elementary price relative across $K$ quotes is computed as the geometric mean:
$$P_{r,w,t} = \left( \prod_{k=1}^{K} p_{r,w,t}^k \right)^{1/K}$$

#### Step 2: Advance-Purchase Window Aggregation
Prices across the 5 windows are combined using fixed empirical booking-distribution weights ($\lambda$):
$$P_{r,t} = \sum_{w \in \{1, 7, 15, 30, 45\}} \lambda_w \cdot P_{r,w,t}$$
*Standard Distribution:* $\lambda_{1}=0.10, \lambda_{7}=0.35, \lambda_{15}=0.30, \lambda_{30}=0.15, \lambda_{45}=0.10$.

#### Step 3: Macro Airfare Price Index (Laspeyres Formulation)
The overall national index ($\text{APIx}_t$) is compiled across all routes using official DGCA passenger traffic volume shares ($W_r$):
$$\text{APIx}_t = \sum_{r=1}^{R} W_r \left( \frac{P_{r,t}}{P_{r,0}} \right) \times 100$$
Where $P_{r,0}$ is the baseline period fare normalized to $100.00$.

---

### 4. GIGW 3.0 User Interface Requirements
- **Top Utility & Accessibility Strip:**
  - Font Sizing: `A-` (14px), `A` (16px base), `A+` (18px).
  - High-Contrast Inversion (WCAG 2.1 AA compliant, `#000000` background with `#FFE600` accent text).
  - Bilingual Toggle: `English` and `हिन्दी` powered by local dictionary mappings.
  - Skip to Main Content anchor.
- **Institutional Identity:**
  - Standard national header with Ashok Stambh emblem styling, MoSPI, and DIID labeling.
  - Official civic color palette: Deep Ashoka Navy (`#0B3C5D`), Saffron accent (`#FF9933`), India Green (`#138808`), and Light Slate background (`#F8FAFC`).
- **Dashboard Modules:**
  - **4 Core KPI Tiles:** National Airfare Price Index value (with 24h & 7d change), Monitored Corridors Count, Metro Median Economy Fare, and Volatility Surge Alerts ($>2.5\sigma$ price jumps).
  - **Lead-Time Elasticity Curve:** Chart displaying price escalation from $T+45$ down to $T+1$.
  - **Sector Heatmap & Matrix:** Comparative view of average fares across monitored routes.
  - **Data Trust & Provenance Badge:** Explicit indicator showing quote freshness, live coverage ratio, and whether data originates from live scraping or baseline validation.
  - **Official eSankhyiki Export:** Button to download standardized CSV/JSON feeds formatted for MoSPI statistical ingestion[cite: 1, 2].