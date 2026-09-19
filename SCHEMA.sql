-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. DGCA OFFICIAL ROUTE WEIGHTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS dgca_route_weights (
    route_code VARCHAR(10) PRIMARY KEY, -- e.g., 'DEL-BOM'
    origin_airport VARCHAR(3) NOT NULL,
    destination_airport VARCHAR(3) NOT NULL,
    route_name VARCHAR(100) NOT NULL,
    passenger_share_pct NUMERIC(6, 3) NOT NULL,
    weight_factor NUMERIC(6, 4) NOT NULL,
    base_fare_p0 NUMERIC(10, 2) NOT NULL DEFAULT 4500.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Baseline DGCA Domestic Passenger Shares
INSERT INTO dgca_route_weights (route_code, origin_airport, destination_airport, route_name, passenger_share_pct, weight_factor, base_fare_p0) VALUES
('DEL-BOM', 'DEL', 'BOM', 'Delhi - Mumbai', 12.500, 0.1250, 4850.00),
('BOM-DEL', 'BOM', 'DEL', 'Mumbai - Delhi', 12.500, 0.1250, 4800.00),
('BLR-DEL', 'BLR', 'DEL', 'Bengaluru - Delhi', 8.200, 0.0820, 5200.00),
('DEL-BLR', 'DEL', 'BLR', 'Delhi - Bengaluru', 8.200, 0.0820, 5150.00),
('BOM-BLR', 'BOM', 'BLR', 'Mumbai - Bengaluru', 6.800, 0.0680, 3600.00),
('BLR-BOM', 'BLR', 'BOM', 'Bengaluru - Mumbai', 6.800, 0.0680, 3650.00),
('DEL-CCU', 'DEL', 'CCU', 'Delhi - Kolkata', 5.100, 0.0510, 4900.00),
('CCU-DEL', 'CCU', 'DEL', 'Kolkata - Delhi', 5.100, 0.0510, 4950.00),
('MAA-DEL', 'MAA', 'DEL', 'Chennai - Delhi', 4.700, 0.0470, 5100.00),
('DEL-MAA', 'DEL', 'MAA', 'Delhi - Chennai', 4.700, 0.0470, 5050.00)
ON CONFLICT (route_code) DO NOTHING;

-- ============================================================================
-- 2. RAW AIRFARE QUOTES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS raw_airfare_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source_portal VARCHAR(50) NOT NULL, -- 'GoogleFlights', 'EaseMyTrip', 'Ixigo'
    airline_name VARCHAR(50) NOT NULL,   -- 'IndiGo', 'Air India', 'Akasa Air'
    flight_number VARCHAR(20) DEFAULT 'N/A',
    origin_airport VARCHAR(3) NOT NULL,
    destination_airport VARCHAR(3) NOT NULL,
    route_code VARCHAR(10) NOT NULL REFERENCES dgca_route_weights(route_code),
    departure_date DATE NOT NULL,
    lead_time_days INT NOT NULL CHECK (lead_time_days IN (1, 7, 15, 30, 45)),
    base_fare NUMERIC(10, 2) NOT NULL,
    tax_and_fees NUMERIC(10, 2) NOT NULL,
    total_fare NUMERIC(10, 2) NOT NULL,
    is_non_stop BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quotes_route_date ON raw_airfare_quotes(route_code, lead_time_days, captured_at);

-- ============================================================================
-- 3. JEVONS ELEMENTARY PRICE AGGREGATION VIEW
-- ============================================================================
CREATE OR REPLACE VIEW view_elementary_prices AS
SELECT 
    DATE(captured_at) AS quote_date,
    route_code,
    lead_time_days,
    COUNT(id) AS sample_size,
    ROUND(EXP(AVG(LN(total_fare))), 2) AS jevons_total_fare,
    ROUND(AVG(base_fare), 2) AS avg_base_fare,
    ROUND(AVG(tax_and_fees), 2) AS avg_tax_fees
FROM raw_airfare_quotes
WHERE total_fare >= 1000 -- Exclude abnormal low outliers/test rows
GROUP BY DATE(captured_at), route_code, lead_time_days;

-- ============================================================================
-- 4. ROUTE-LEVEL WEIGHTED FARE VIEW (T+1 to T+45)
-- Lambda weights renormalised over windows with observed quotes on each
-- route-date, so a missing scrape window cannot masquerade as a fare collapse.
-- ============================================================================
CREATE OR REPLACE VIEW view_route_daily_price AS
SELECT
    quote_date,
    route_code,
    ROUND(
        SUM(jevons_total_fare * lambda_w) / NULLIF(SUM(lambda_w), 0), 2
    ) AS weighted_route_price
FROM (
    SELECT
        quote_date,
        route_code,
        jevons_total_fare,
        CASE
            WHEN lead_time_days = 1  THEN 0.10
            WHEN lead_time_days = 7  THEN 0.35
            WHEN lead_time_days = 15 THEN 0.30
            WHEN lead_time_days = 30 THEN 0.15
            WHEN lead_time_days = 45 THEN 0.10
            ELSE 0.0
        END AS lambda_w
    FROM view_elementary_prices
) windowed
GROUP BY quote_date, route_code;

-- ============================================================================
-- 5. MACRO NATIONAL AIRFARE PRICE INDEX (APIx) VIEW
-- Laspeyres compilation per PRD Step 3. The stored weight_factor values are
-- official national passenger shares summing to 0.746 (not 1.000), so they are
-- renormalised over the routes reporting on each date. This guarantees
-- APIx = 100.00 at the base period and keeps the index stable under partial
-- live coverage; the coverage ratio itself is surfaced via active_routes.
-- ============================================================================
CREATE OR REPLACE VIEW view_national_apix AS
SELECT
    v.quote_date,
    ROUND(
        SUM(w.weight_factor * (v.weighted_route_price / w.base_fare_p0) * 100)
        / NULLIF(SUM(w.weight_factor), 0), 2
    ) AS apix_index_value,
    COUNT(v.route_code) AS active_routes
FROM view_route_daily_price v
JOIN dgca_route_weights w ON v.route_code = w.route_code
GROUP BY v.quote_date
ORDER BY v.quote_date DESC;

-- Security Policies (RLS)
ALTER TABLE dgca_route_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_airfare_quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read dgca_route_weights" ON dgca_route_weights;
DROP POLICY IF EXISTS "Public read raw_airfare_quotes" ON raw_airfare_quotes;
DROP POLICY IF EXISTS "Service write raw_airfare_quotes" ON raw_airfare_quotes;

CREATE POLICY "Public read dgca_route_weights" ON dgca_route_weights FOR SELECT USING (true);
CREATE POLICY "Public read raw_airfare_quotes" ON raw_airfare_quotes FOR SELECT USING (true);
CREATE POLICY "Service write raw_airfare_quotes" ON raw_airfare_quotes FOR INSERT WITH CHECK (true);