-- Seed data for 99 Pancakes Analytics

-- Insert sample outlets
INSERT INTO outlets (name, address, city, state, pincode, phone, manager_name) VALUES
('Kompally', 'Shop No. 15, Main Road, Kompally', 'Hyderabad', 'Telangana', '500014', '9876543210', 'Rajesh Kumar'),
('Madhapur', 'Plot No. 42, HITEC City, Madhapur', 'Hyderabad', 'Telangana', '500081', '9876543211', 'Priya Sharma'),
('Jubilee Hills', 'Road No. 36, Jubilee Hills', 'Hyderabad', 'Telangana', '500033', '9876543212', 'Amit Patel'),
('Banjara Hills', 'Road No. 12, Banjara Hills', 'Hyderabad', 'Telangana', '500034', '9876543213', 'Sneha Reddy');

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role, first_name, last_name) VALUES
('admin', 'admin@99pancakes.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'System', 'Administrator');

-- Insert sample normal users for each outlet
INSERT INTO users (username, email, password_hash, role, outlet_id, first_name, last_name) VALUES
('kompally_user', 'kompally@99pancakes.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'normal', 1, 'Ravi', 'Kumar'),
('madhapur_user', 'madhapur@99pancakes.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'normal', 2, 'Lakshmi', 'Devi'),
('jubilee_user', 'jubilee@99pancakes.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'normal', 3, 'Suresh', 'Babu'),
('banjara_user', 'banjara@99pancakes.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'normal', 4, 'Kavitha', 'Reddy');

-- Insert product categories
INSERT INTO product_categories (name, description) VALUES
('Cakes', 'All varieties of cakes including birthday, celebration, and designer cakes'),
('Pastries', 'Individual pastries, croissants, and small baked goods'),
('Beverages', 'Hot and cold beverages including coffee, tea, and juices'),
('Desserts', 'Other dessert items excluding cakes and pastries');

-- Insert monthly targets for current year (2024)
INSERT INTO monthly_targets (outlet_id, year, month, target_amount, daily_target, created_by) VALUES
-- Kompally targets
(1, 2024, 1, 400000, 12903, 1),
(1, 2024, 2, 380000, 13103, 1),
(1, 2024, 3, 420000, 13548, 1),
(1, 2024, 4, 400000, 13333, 1),
(1, 2024, 5, 450000, 14516, 1),
(1, 2024, 6, 430000, 14333, 1),
-- Madhapur targets
(2, 2024, 1, 500000, 16129, 1),
(2, 2024, 2, 480000, 16552, 1),
(2, 2024, 3, 520000, 16774, 1),
(2, 2024, 4, 500000, 16667, 1),
(2, 2024, 5, 550000, 17742, 1),
(2, 2024, 6, 530000, 17667, 1),
-- Jubilee Hills targets
(3, 2024, 1, 600000, 19355, 1),
(3, 2024, 2, 580000, 20000, 1),
(3, 2024, 3, 620000, 20000, 1),
(3, 2024, 4, 600000, 20000, 1),
(3, 2024, 5, 650000, 20968, 1),
(3, 2024, 6, 630000, 21000, 1),
-- Banjara Hills targets
(4, 2024, 1, 350000, 11290, 1),
(4, 2024, 2, 330000, 11379, 1),
(4, 2024, 3, 370000, 11935, 1),
(4, 2024, 4, 350000, 11667, 1),
(4, 2024, 5, 380000, 12258, 1),
(4, 2024, 6, 360000, 12000, 1);

-- Insert sample raw materials
INSERT INTO raw_materials (name, unit, cost_per_unit, minimum_stock) VALUES
('Flour', 'kg', 45.00, 100),
('Sugar', 'kg', 50.00, 50),
('Butter', 'kg', 400.00, 20),
('Eggs', 'dozen', 60.00, 30),
('Milk', 'liter', 55.00, 25),
('Vanilla Extract', 'ml', 2.50, 500),
('Cocoa Powder', 'kg', 350.00, 10),
('Cream Cheese', 'kg', 450.00, 15),
('Fresh Cream', 'liter', 180.00, 20),
('Baking Powder', 'kg', 120.00, 5);

-- Insert recipe ingredients (approximate quantities per unit)
INSERT INTO recipe_ingredients (category_id, material_id, quantity_per_unit) VALUES
-- Cakes (per cake)
(1, 1, 0.5),  -- Flour
(1, 2, 0.3),  -- Sugar
(1, 3, 0.2),  -- Butter
(1, 4, 0.5),  -- Eggs (dozen)
(1, 5, 0.3),  -- Milk
(1, 6, 10),   -- Vanilla Extract (ml)
(1, 10, 0.02), -- Baking Powder
-- Pastries (per pastry)
(2, 1, 0.1),  -- Flour
(2, 2, 0.05), -- Sugar
(2, 3, 0.08), -- Butter
(2, 4, 0.1),  -- Eggs
(2, 5, 0.05); -- Milk

-- Insert sample daily sales data for the last 30 days
INSERT INTO daily_sales (date, outlet_id, mtd_target, daily_target, gross_sale, net_sale, total_tickets, offline_net_sale, offline_tickets, cakes_sold, pastries_sold, entered_by) VALUES
-- Kompally sales
('2024-03-01', 1, 420000, 13548, 15200, 14500, 72, 4200, 18, 35, 120, 2),
('2024-03-02', 1, 420000, 13548, 14800, 14100, 68, 3800, 16, 32, 115, 2),
('2024-03-03', 1, 420000, 13548, 16500, 15800, 78, 4500, 20, 38, 125, 2),
('2024-03-04', 1, 420000, 13548, 13200, 12600, 65, 3600, 15, 28, 98, 2),
('2024-03-05', 1, 420000, 13548, 17800, 17000, 85, 5200, 25, 42, 135, 2),
-- Madhapur sales
('2024-03-01', 2, 520000, 16774, 18500, 17600, 88, 5100, 22, 45, 145, 3),
('2024-03-02', 2, 520000, 16774, 17200, 16400, 82, 4600, 19, 41, 138, 3),
('2024-03-03', 2, 520000, 16774, 19800, 18900, 94, 5800, 28, 48, 152, 3),
('2024-03-04', 2, 520000, 16774, 16800, 16000, 80, 4200, 17, 38, 128, 3),
('2024-03-05', 2, 520000, 16774, 20500, 19500, 98, 6200, 30, 52, 165, 3),
-- Jubilee Hills sales
('2024-03-01', 3, 620000, 20000, 22500, 21400, 107, 6800, 32, 58, 175, 4),
('2024-03-02', 3, 620000, 20000, 21200, 20200, 101, 6200, 28, 54, 168, 4),
('2024-03-03', 3, 620000, 20000, 24800, 23600, 118, 7400, 36, 62, 185, 4),
('2024-03-04', 3, 620000, 20000, 20800, 19800, 99, 5800, 26, 51, 162, 4),
('2024-03-05', 3, 620000, 20000, 25500, 24200, 121, 8200, 40, 68, 195, 4),
-- Banjara Hills sales
('2024-03-01', 4, 370000, 11935, 12800, 12200, 61, 3400, 14, 28, 98, 5),
('2024-03-02', 4, 370000, 11935, 11500, 10900, 55, 3000, 12, 25, 88, 5),
('2024-03-03', 4, 370000, 11935, 13500, 12800, 64, 3800, 16, 32, 105, 5),
('2024-03-04', 4, 370000, 11935, 10800, 10200, 51, 2800, 11, 22, 82, 5),
('2024-03-05', 4, 370000, 11935, 14200, 13500, 68, 4200, 18, 35, 112, 5);