export type Locale = 'en' | 'hi';

export const i18n = {
  en: {
    nationalPortal: "Government of India",
    ministryName: "Ministry of Statistics and Programme Implementation (MoSPI)",
    subDivision: "National Statistical Office (NSO) • Data Informatics & Innovation Division",
    title: "National Airfare Price Index (APIx)",
    subTitle: "Automated High-Frequency Aviation Inflation Tracking for CPI Augmentation",
    skipContent: "Skip to main content",
    fontSize: "Text Size",
    contrast: "Contrast",
    contrastNormal: "Standard",
    contrastHigh: "High Contrast",

    // Header Shell
    commandCenterTitle: "National Airfare Intelligence Command Center",
    commandCenterSub: "Measure, explain, forecast and simulate India's airfare-driven inflation.",
    liveStatus: "LIVE",
    apiAccess: "API Access",

    // Sidebar Navigation
    navOverviewHeader: "OVERVIEW",
    navHome: "Home",
    navDashboard: "Executive Dashboard",

    navIntelligenceHeader: "INTELLIGENCE",
    navIndex: "Airfare Index",
    navRoutes: "Corridor Market Table",
    navAirlines: "Airline Cost Breakdown",
    navWindows: "Booking Horizons (T+1 to T+45)",
    navHeatmap: "Geospatial Flight Map",

    navAnalyticsHeader: "ANALYTICS",
    navForecast: "14-Day ML Forecast",
    navAnomalies: "Surge & Cap Breaches",
    navSimulator: "Policy Shock Simulator",
    navTrust: "Data Trust Console",
    navCopilot: "Ask ARIA (AI Copilot)",

    // Hero Metric Cards
    heroCard1Title: "National Airfare Index",
    heroCard2Title: "Average Airfare",
    heroCard3Title: "Airfare Inflation Pressure (AIPS)",
    heroCard4Title: "Data Trust Score",

    // Geospatial Map
    geoMapTitle: "Interactive Geospatial Route Map",
    geoMapSub: "Real-time airfare pressure across DGCA high-density corridors",
    topMoversTitle: "Top Absolute Movers",

    // Tab Navigation
    tabOverview: "Executive Overview",
    tabLab: "Econometric Lab",
    tabCorridor: "Corridor Deep Dive",
    tabSimulator: "Policy Shock Simulator",
    tabTrust: "Data Trust & Audit",

    // KPI Tiles & Overview
    kpiIndexTitle: "National Airfare Price Index",
    kpiIndexSub: "Base Period (2026.08 = 100.00)",
    kpiRoutesTitle: "Monitored Corridors",
    kpiRoutesSub: "DGCA High-Density Sectors",
    kpiMedianTitle: "Metro Median Economy Fare",
    kpiMedianSub: "T+7 Advance Horizon",
    kpiSurgeTitle: "Surge & Volatility Watch",
    kpiSurgeSub: "Dynamic Fare Spikes (>2.5σ)",
    chartElasticityTitle: "Lead-Time Price Elasticity Curve",
    chartElasticityDesc: "Dynamic pricing escalation relative to departure proximity (T+45 to T+1)",
    chartIndexTrendTitle: "30-Day Airfare Index Trajectory vs DGCA Benchmark",
    chartIndexTrendDesc: "Laspeyres national compilation (DGCA passenger-weighted) · base {date} = 100.00",
    heatmapTitle: "Sector Heatmap & Fare Matrix",
    heatmapDesc: "Jevons mean economy fare per corridor × advance-purchase window on {date}",
    chartNationalLegend: "National (mean)",
    chartBaseLabel: "Base = 100",
    backtestTitle: "30-Day DGCA Backtesting Validation",
    backtestDesc: "Calculated APIx trajectory vs official DGCA monthly baseline reference (base-month tariff level, P₀ composite = 100.00)",
    backtestMape: "DGCA Benchmark Alignment: {alignment}% | MAPE: {mape}%",
    legendApixCalculated: "APIx (Calculated)",
    legendDgcaBaseline: "DGCA Monthly Baseline",
    provenanceLive: "Live Ingestion Active",
    provenanceHistorical: "DGCA Calibrated Baseline",
    exportBtn: "Download eSankhyiki Bulletin (CSV)",
    footerDisclaimers: "Developed in compliance with GIGW 3.0 standards and ILO/IMF CPI Price Index Compilation Guidelines.",

    // Econometric Lab Keys
    labTitle: "Index Methodology Sensitivity Analysis",
    labDesc: "Comparative multi-formula dispersion: Jevons (Geometric), Carli (Arithmetic), Laspeyres (Weighted), and Fisher Ideal.",
    labInsightTitle: "Methodology Insight & ILO/MoSPI Guidance",
    labInsightBody: "MoSPI and ILO CPI Manual recommendations specify the Jevons (geometric mean) formulation for elementary price index aggregation. Unlike the unweighted Carli index, Jevons satisfies the time-reversal test and eliminates upward operational bias caused by daily dynamic pricing volatility.",

    // Policy Simulator Keys
    simTitle: "Aviation Inflation Transmission Engine",
    fuelShock: "Aviation Turbine Fuel (ATF) Price Shift",
    capacityShock: "Sector Seat Capacity Disruption",
    surgeMultiplier: "Dynamic Surge Cap Multiplier",
    cpiImpact: "Projected 30-Day CPI Transport Impact",
    riskStable: "Macroeconomic Risk: Stable Impact (<10 bps)",
    riskModerate: "Macroeconomic Risk: Moderate Inflation Shift (10-25 bps)",
    riskCritical: "Macroeconomic Risk: Critical Inflation Surge (>25 bps)",

    // Data Trust Keys
    trustTitle: "Statistical Data Trust & Audit Console",
    consensusScore: "Cross-OTA Consensus Score",
    taxModelNotice: "Statutory Model: Airport UDF/PSF (₹350 avg) + 5% GST Base Fare decomposition active on Google Flights aggregator feeds.",
    imputationRate: "Imputation Rate",
    parserStatus: "Scraper Parser Status",
    provenanceTitle: "Data Provenance & System Health",
    auditTitle: "Methodological Audit & Statutory Tax Specifications",
    liveTriggerTitle: "On-Demand Scraper Ingestion Trigger",
    cliCommandNotice: "Execute localized sweeps via CLI directly from the worker environment:",

    // Deep Dive & Helper Keys
    allCorridors: "All Corridors",
    selectCorridor: "Select Corridor",
    selectHorizon: "Select Horizon",
    carrierComparison: "Carrier Average Fare Comparison",
    costDecomposition: "Statutory Fare Decomposition (Base vs Taxes & Airport Fees)",
    baseFareLabel: "Statutory Base Fare (ex-GST)",
    taxFeeLabel: "Taxes & Airport Fees (UDF/PSF + 5% GST)"
  },
  hi: {
    nationalPortal: "भारत सरकार",
    ministryName: "सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय (MoSPI)",
    subDivision: "राष्ट्रीय सांख्यिकी कार्यालय (NSO) • डेटा सूचना विज्ञान और नवाचार प्रभाग",
    title: "राष्ट्रीय विमान किराया मूल्य सूचकांक (APIx)",
    subTitle: "उपभोक्ता मूल्य सूचकांक (CPI) संवर्धन हेतु स्वचालित विमान किराया मुद्रास्फीति ट्रैकिंग",
    skipContent: "मुख्य सामग्री पर जाएं",
    fontSize: "फ़ॉन्ट आकार",
    contrast: "कंट्रास्ट",
    contrastNormal: "सामान्य",
    contrastHigh: "उच्च कंट्रास्ट",

    // Header Shell
    commandCenterTitle: "राष्ट्रीय विमान किराया आसूचना कमान केंद्र",
    commandCenterSub: "भारत की विमान किराया संचालित मुद्रास्फीति का मापन, स्पष्टीकरण, पूर्वानुमान और अनुकरण।",
    liveStatus: "लाइव",
    apiAccess: "API पहुँच",

    // Sidebar Navigation
    navOverviewHeader: "अवलोकन",
    navHome: "मुख्य पृष्ठ",
    navDashboard: "कार्यकारी डैशबोर्ड",

    navIntelligenceHeader: "आसूचना",
    navIndex: "विमान किराया सूचकांक",
    navRoutes: "कॉरिडोर बाजार तालिका",
    navAirlines: "एयरलाइन लागत अपघटन",
    navWindows: "अग्रिम बुकिंग विंडो (T+1 से T+45)",
    navHeatmap: "भौगोलिक उड़ान मानचित्र",

    navAnalyticsHeader: "विश्लेषण",
    navForecast: "14-दिवसीय एमएल पूर्वानुमान",
    navAnomalies: "सर्ज एवं कैप उल्लंघन",
    navSimulator: "नीतिगत प्रभाव सिम्युलेटर",
    navTrust: "डेटा विश्वसनीयता कंसोल",
    navCopilot: "ARIA से पूछें (AI कोपायलट)",

    // Hero Metric Cards
    heroCard1Title: "राष्ट्रीय विमान किराया सूचकांक",
    heroCard2Title: "औसत इकोनॉमी किराया",
    heroCard3Title: "विमान किराया मुद्रास्फीति दबाव (AIPS)",
    heroCard4Title: "डेटा विश्वसनीयता स्कोर",

    // Geospatial Map
    geoMapTitle: "इंटरएक्टिव भौगोलिक रूट मानचित्र",
    geoMapSub: "DGCA उच्च घनत्व वाले गलियारों में वास्तविक समय विमान किराया दबाव",
    topMoversTitle: "शीर्ष किराया परिवर्तन मार्ग",

    // Tab Navigation
    tabOverview: "कार्यकारी अवलोकन",
    tabLab: "अर्थमितीय प्रयोगशाला",
    tabCorridor: "कॉरिडोर विस्तृत विश्लेषण",
    tabSimulator: "नीतिगत प्रभाव सिम्युलेटर",
    tabTrust: "डेटा विश्वसनीयता एवं ऑडिट",

    // KPI Tiles & Overview
    kpiIndexTitle: "राष्ट्रीय विमान किराया मूल्य सूचकांक",
    kpiIndexSub: "आधार अवधि (2026.08 = 100.00)",
    kpiRoutesTitle: "निगरानी किए गए मार्ग",
    kpiRoutesSub: "DGCA उच्च घनत्व वाले सेक्टर",
    kpiMedianTitle: "मेट्रो औसत इकोनॉमी किराया",
    kpiMedianSub: "T+7 अग्रिम बुकिंग स्तर",
    kpiSurgeTitle: "सर्ज और मूल्य अस्थिरता वॉच",
    kpiSurgeSub: "तीव्र किराया वृद्धि अलर्ट (>2.5σ)",
    chartElasticityTitle: "अग्रिम-बुकिंग मूल्य लोच वक्र",
    chartElasticityDesc: "प्रस्थान निकटता के सापेक्ष किराया वृद्धि (T+45 से T+1)",
    chartIndexTrendTitle: "30-दिवसीय विमान किराया सूचकांक बनाम DGCA बेंचमार्क",
    chartIndexTrendDesc: "लासपेयर्स राष्ट्रीय संकलन (DGCA यात्री-भारित) · आधार {date} = 100.00",
    heatmapTitle: "सेक्टर हीटमैप और किराया मैट्रिक्स",
    heatmapDesc: "{date} को मार्ग × अग्रिम-बुकिंग विंडो के अनुसार जेवन्स औसत इकोनॉमी किराया",
    chartNationalLegend: "राष्ट्रीय (औसत)",
    chartBaseLabel: "आधार = 100",
    backtestTitle: "30-दिवसीय DGCA बैकटेस्टिंग सत्यापन",
    backtestDesc: "गणना किया गया APIx पथ बनाम आधिकारिक DGCA मासिक बेसलाइन संदर्भ (आधार-माह टैरिफ स्तर, P₀ मिश्रण = 100.00)",
    backtestMape: "DGCA बेंचमार्क अंशांकन: {alignment}% | MAPE: {mape}%",
    legendApixCalculated: "APIx (गणना)",
    legendDgcaBaseline: "DGCA मासिक बेसलाइन",
    provenanceLive: "लाइव डेटा अंतर्ग्रहण सक्रिय",
    provenanceHistorical: "DGCA कैलिब्रेटेड बेसलाइन",
    exportBtn: "eSankhyiki बुलेटिन डाउनलोड करें (CSV)",
    footerDisclaimers: "GIGW 3.0 मानकों और ILO/IMF उपभोक्ता मूल्य सूचकांक संकलन पद्धतियों के अनुरूप विकसित।",

    // Econometric Lab Keys
    labTitle: "सूचकांक पद्धति संवेदनशीलता विश्लेषण",
    labDesc: "तुलनात्मक बहु-सूत्र विश्लेषण: जेवन्स, कार्ली, लासपेयर्स और फिशर आदर्श सूचकांक।",
    labInsightTitle: "पद्धति संबंधी अंतर्दृष्टि और ILO/MoSPI मार्गदर्शन",
    labInsightBody: "MoSPI और ILO उपभोक्ता मूल्य सूचकांक नियमावली प्रारंभिक मूल्य संकलन के लिए जेवन्स (ज्यामितीय माध्य) सूत्र की सिफारिश करती है। जेवन्स सूचकांक समय-रिवर्सल परीक्षण को पूरा करता है और दैनिक गतिशील मूल्य अस्थिरता के कारण होने वाले कार्ली सूचकांक के उर्ध्वगामी पूर्वाग्रह को समाप्त करता है।",

    // Policy Simulator Keys
    simTitle: "विमानन मुद्रास्फीति ट्रांसमिशन इंजन",
    fuelShock: "विमानन ईंधन (ATF) मूल्य परिवर्तन",
    capacityShock: "सीट क्षमता में कमी",
    surgeMultiplier: "गतिशील सर्ज मूल्य सीमा",
    cpiImpact: "अनुमानित 30-दिवसीय परिवहन मुद्रास्फीति प्रभाव",
    riskStable: "मैक्रोइकॉनॉमिक जोखिम: स्थिर प्रभाव (<10 bps)",
    riskModerate: "मैक्रोइकॉनॉमिक जोखिम: मध्यम मुद्रास्फीति परिवर्तन (10-25 bps)",
    riskCritical: "मैक्रोइकॉनॉमिक जोखिम: गंभीर मुद्रास्फीति वृद्धि (>25 bps)",

    // Data Trust Keys
    trustTitle: "सांख्यिकीय डेटा विश्वसनीयता एवं ऑडिट कंसोल",
    consensusScore: "स्रोत आम सहमति स्कोर",
    taxModelNotice: "वैधानिक मॉडल: हवाई अड्डा शुल्क (₹350) + 5% जीएसटी आधारित किराया अपघटन सक्रिय।",
    imputationRate: "इम्प्यूटेशन दर",
    parserStatus: "स्क्रैपर पार्सर स्थिति",
    provenanceTitle: "डेटा उत्पत्ति एवं सिस्टम स्वास्थ्य",
    auditTitle: "पद्धतिगत ऑडिट एवं वैधानिक कर विनिर्देश",
    liveTriggerTitle: "ऑन-डिमांड स्क्रैपर अंतर्ग्रहण ट्रिगर",
    cliCommandNotice: "वर्कर वातावरण से सीधे CLI के माध्यम से लक्षित स्वीप निष्पादित करें:",

    // Deep Dive & Helper Keys
    allCorridors: "सभी कॉरिडोर",
    selectCorridor: "कॉरिडोर चुनें",
    selectHorizon: "अग्रिम बुकिंग विंडो चुनें",
    carrierComparison: "एयरलाइन औसत किराया तुलना",
    costDecomposition: "वैधानिक किराया अपघटन (मूल किराया बनाम कर और हवाई अड्डा शुल्क)",
    baseFareLabel: "मूल किराया (जीएसटी रहित)",
    taxFeeLabel: "कर एवं हवाई अड्डा शुल्क (UDF/PSF + 5% जीएसटी)"
  }
};