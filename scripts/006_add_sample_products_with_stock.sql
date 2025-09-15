-- Add sample products with proper stock levels
INSERT INTO products (
  id,
  name,
  sku,
  description,
  cost_price,
  selling_price,
  current_stock,
  min_stock_level,
  category_id,
  is_active,
  created_at,
  updated_at
) VALUES 
-- Get the first category ID for our sample products
(
  gen_random_uuid(),
  'tedy',
  'TEDY001',
  'High-quality tedy product with excellent specifications',
  50.00,
  75.00,
  25,
  5,
  (SELECT id FROM categories LIMIT 1),
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Sample Product 2',
  'PROD002',
  'Another great product for testing',
  30.00,
  45.00,
  15,
  3,
  (SELECT id FROM categories LIMIT 1),
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Sample Product 3',
  'PROD003',
  'Third sample product with good stock',
  20.00,
  35.00,
  30,
  5,
  (SELECT id FROM categories LIMIT 1),
  true,
  NOW(),
  NOW()
);

-- Update any existing products to have proper stock if they exist
UPDATE products 
SET current_stock = 20, min_stock_level = 5 
WHERE current_stock = 0 AND is_active = true;
