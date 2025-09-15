-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic devices and accessories'),
('Clothing', 'Apparel and fashion items'),
('Home & Garden', 'Home improvement and garden supplies'),
('Sports', 'Sports equipment and accessories'),
('Books', 'Books and educational materials');

-- Insert sample products
INSERT INTO products (name, category_id, sku, cost, price, stock_quantity, min_stock_level, description) 
SELECT 
    'Smartphone Pro Max', 
    c.id, 
    'SPM-001', 
    800.00, 
    1200.00, 
    25, 
    5, 
    'Latest smartphone with advanced features'
FROM categories c WHERE c.name = 'Electronics'
UNION ALL
SELECT 
    'Wireless Headphones', 
    c.id, 
    'WH-002', 
    50.00, 
    120.00, 
    40, 
    10, 
    'High-quality wireless headphones'
FROM categories c WHERE c.name = 'Electronics'
UNION ALL
SELECT 
    'Cotton T-Shirt', 
    c.id, 
    'CTS-003', 
    8.00, 
    25.00, 
    100, 
    20, 
    'Comfortable cotton t-shirt'
FROM categories c WHERE c.name = 'Clothing'
UNION ALL
SELECT 
    'Running Shoes', 
    c.id, 
    'RS-004', 
    45.00, 
    90.00, 
    30, 
    8, 
    'Professional running shoes'
FROM categories c WHERE c.name = 'Sports';

-- Insert sample shopkeepers
INSERT INTO shopkeepers (name, phone, email, role) VALUES
('Ahmed Khan', '+92-300-1234567', 'ahmed@example.com', 'manager'),
('Fatima Ali', '+92-301-2345678', 'fatima@example.com', 'staff'),
('Muhammad Hassan', '+92-302-3456789', 'hassan@example.com', 'staff'),
('Ayesha Malik', '+92-303-4567890', 'ayesha@example.com', 'staff'),
('Omar Sheikh', '+92-304-5678901', 'omar@example.com', 'staff');

-- Insert sample settings
INSERT INTO settings (key, value, description) VALUES
('shop_name', '"HZ Shop Management"', 'Name of the shop'),
('currency', '"PKR"', 'Default currency'),
('tax_rate', '0.17', 'Default tax rate (17%)'),
('receipt_footer', '"Thank you for shopping with us!"', 'Footer text for receipts'),
('low_stock_alert', '10', 'Alert when stock goes below this number');
