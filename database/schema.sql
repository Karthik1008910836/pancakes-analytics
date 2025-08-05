-- 99 Pancakes Analytics Database Schema
-- PostgreSQL

-- Create database
-- CREATE DATABASE pancakes_analytics;

-- Users table for authentication and role management
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'normal')),
    outlet_id INTEGER,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Outlets table for store locations
CREATE TABLE outlets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    pincode VARCHAR(10),
    phone VARCHAR(15),
    manager_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Monthly targets configuration
CREATE TABLE monthly_targets (
    id SERIAL PRIMARY KEY,
    outlet_id INTEGER NOT NULL REFERENCES outlets(id),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    target_amount DECIMAL(12,2) NOT NULL,
    daily_target DECIMAL(12,2) NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(outlet_id, year, month)
);

-- Daily sales records
CREATE TABLE daily_sales (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    outlet_id INTEGER NOT NULL REFERENCES outlets(id),
    mtd_target DECIMAL(12,2) NOT NULL,
    daily_target DECIMAL(12,2) NOT NULL,
    gross_sale DECIMAL(12,2) NOT NULL DEFAULT 0,
    net_sale DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_tickets INTEGER NOT NULL DEFAULT 0,
    offline_net_sale DECIMAL(12,2) NOT NULL DEFAULT 0,
    offline_tickets INTEGER NOT NULL DEFAULT 0,
    apc DECIMAL(8,2) GENERATED ALWAYS AS (
        CASE 
            WHEN total_tickets > 0 THEN net_sale / total_tickets 
            ELSE 0 
        END
    ) STORED,
    cakes_sold INTEGER NOT NULL DEFAULT 0,
    pastries_sold INTEGER NOT NULL DEFAULT 0,
    entered_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, outlet_id)
);

-- Product categories for future expansion
CREATE TABLE product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product sales tracking (for detailed analytics)
CREATE TABLE product_sales (
    id SERIAL PRIMARY KEY,
    daily_sales_id INTEGER NOT NULL REFERENCES daily_sales(id),
    category_id INTEGER NOT NULL REFERENCES product_categories(id),
    quantity_sold INTEGER NOT NULL DEFAULT 0,
    revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Raw materials tracking (for inventory predictions)
CREATE TABLE raw_materials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    unit VARCHAR(20) NOT NULL,
    cost_per_unit DECIMAL(8,2),
    minimum_stock INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipe ingredients (for raw material calculations)
CREATE TABLE recipe_ingredients (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES product_categories(id),
    material_id INTEGER NOT NULL REFERENCES raw_materials(id),
    quantity_per_unit DECIMAL(8,3) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, material_id)
);

-- User sessions for security
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log for important operations
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_outlet ON users(outlet_id);
CREATE INDEX idx_daily_sales_date ON daily_sales(date);
CREATE INDEX idx_daily_sales_outlet ON daily_sales(outlet_id);
CREATE INDEX idx_daily_sales_date_outlet ON daily_sales(date, outlet_id);
CREATE INDEX idx_monthly_targets_outlet ON monthly_targets(outlet_id);
CREATE INDEX idx_monthly_targets_year_month ON monthly_targets(year, month);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token_hash);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);

-- Add foreign key constraint after outlets table is created
ALTER TABLE users ADD CONSTRAINT fk_users_outlet 
    FOREIGN KEY (outlet_id) REFERENCES outlets(id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outlets_updated_at BEFORE UPDATE ON outlets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_targets_updated_at BEFORE UPDATE ON monthly_targets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_sales_updated_at BEFORE UPDATE ON daily_sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for MTD calculations
CREATE OR REPLACE VIEW mtd_sales_summary AS
SELECT 
    outlet_id,
    EXTRACT(YEAR FROM date) as year,
    EXTRACT(MONTH FROM date) as month,
    SUM(net_sale) as mtd_net_sale,
    COUNT(*) as days_reported,
    AVG(net_sale) as avg_daily_sale,
    SUM(total_tickets) as total_tickets,
    SUM(cakes_sold) as total_cakes,
    SUM(pastries_sold) as total_pastries
FROM daily_sales
GROUP BY outlet_id, EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date);

-- Create view for outlet performance
CREATE OR REPLACE VIEW outlet_performance AS
SELECT 
    o.id,
    o.name as outlet_name,
    COUNT(ds.id) as total_entries,
    AVG(ds.net_sale) as avg_daily_sale,
    SUM(ds.net_sale) as total_revenue,
    AVG(ds.apc) as avg_apc,
    MAX(ds.date) as last_entry_date
FROM outlets o
LEFT JOIN daily_sales ds ON o.id = ds.outlet_id
WHERE o.is_active = true
GROUP BY o.id, o.name;