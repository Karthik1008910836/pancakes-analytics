-- Performance Optimization Indexes
-- Add these indexes to improve query performance as data grows

-- Critical indexes for daily_sales table (most queried)
CREATE INDEX IF NOT EXISTS idx_daily_sales_date_desc ON daily_sales(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_sales_outlet_date ON daily_sales(outlet_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_sales_created_at ON daily_sales(created_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_daily_sales_outlet_date_range ON daily_sales(outlet_id, date, net_sale, total_tickets);
CREATE INDEX IF NOT EXISTS idx_daily_sales_year_month ON daily_sales(outlet_id, EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date));

-- Indexes for monthly aggregations
CREATE INDEX IF NOT EXISTS idx_monthly_targets_outlet_year_month ON monthly_targets(outlet_id, year DESC, month DESC);

-- Indexes for user/outlet joins
CREATE INDEX IF NOT EXISTS idx_users_outlet_active ON users(outlet_id, is_active);
CREATE INDEX IF NOT EXISTS idx_outlets_active ON outlets(is_active, id);

-- Indexes for edit requests
CREATE INDEX IF NOT EXISTS idx_edit_requests_status ON edit_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_edit_requests_daily_sales ON edit_requests(daily_sales_id, status);

-- Performance monitoring view
CREATE OR REPLACE VIEW daily_sales_performance AS
SELECT 
    DATE_TRUNC('month', date) as month,
    outlet_id,
    COUNT(*) as total_entries,
    SUM(net_sale) as total_revenue,
    AVG(net_sale) as avg_daily_revenue,
    SUM(total_tickets) as total_tickets,
    AVG(total_tickets) as avg_daily_tickets
FROM daily_sales 
GROUP BY DATE_TRUNC('month', date), outlet_id
ORDER BY month DESC, outlet_id;

-- Materialized view for MTD calculations (PostgreSQL)
-- Note: For SQLite in development, this becomes a regular view
CREATE OR REPLACE VIEW mtd_summary_optimized AS
SELECT 
    ds.outlet_id,
    o.name as outlet_name,
    EXTRACT(YEAR FROM ds.date) as year,
    EXTRACT(MONTH FROM ds.date) as month,
    COUNT(*) as days_reported,
    SUM(ds.net_sale) as total_net_sale,
    SUM(ds.gross_sale) as total_gross_sale,
    SUM(ds.total_tickets) as total_tickets,
    SUM(ds.cakes_sold) as total_cakes,
    SUM(ds.pastries_sold) as total_pastries,
    AVG(ds.net_sale::DECIMAL / NULLIF(ds.total_tickets, 0)) as avg_apc,
    MAX(mt.target_amount) as mtd_target,
    CASE 
        WHEN MAX(mt.target_amount) > 0 
        THEN (SUM(ds.net_sale) / MAX(mt.target_amount) * 100)
        ELSE 0 
    END as achievement_percentage
FROM daily_sales ds
JOIN outlets o ON ds.outlet_id = o.id
LEFT JOIN monthly_targets mt ON ds.outlet_id = mt.outlet_id 
    AND EXTRACT(YEAR FROM ds.date) = mt.year 
    AND EXTRACT(MONTH FROM ds.date) = mt.month
WHERE o.is_active = true
GROUP BY ds.outlet_id, o.name, EXTRACT(YEAR FROM ds.date), EXTRACT(MONTH FROM ds.date)
ORDER BY year DESC, month DESC, outlet_id;