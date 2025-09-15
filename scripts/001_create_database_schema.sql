-- Create database schema for HZ Shop Management
-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2),
  sku TEXT UNIQUE,
  barcode TEXT,
  category_id UUID REFERENCES categories(id),
  stock_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT UNIQUE NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  payment_method TEXT DEFAULT 'cash',
  status TEXT DEFAULT 'completed',
  shopkeeper_id UUID REFERENCES shopkeepers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receipt items table
CREATE TABLE IF NOT EXISTS receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Returns table
CREATE TABLE IF NOT EXISTS returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_number TEXT UNIQUE NOT NULL,
  original_receipt_id UUID REFERENCES receipts(id),
  customer_name TEXT,
  reason TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  refund_method TEXT DEFAULT 'cash',
  status TEXT DEFAULT 'completed',
  shopkeeper_id UUID REFERENCES shopkeepers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Return items table
CREATE TABLE IF NOT EXISTS return_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id UUID REFERENCES returns(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopkeepers table
CREATE TABLE IF NOT EXISTS shopkeepers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'staff',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  parameters JSONB,
  data JSONB,
  generated_by UUID REFERENCES shopkeepers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt_id ON receipt_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_receipt_items_product_id ON receipt_items(product_id);
CREATE INDEX IF NOT EXISTS idx_return_items_return_id ON return_items(return_id);
CREATE INDEX IF NOT EXISTS idx_return_items_product_id ON return_items(product_id);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at);
CREATE INDEX IF NOT EXISTS idx_returns_created_at ON returns(created_at);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopkeepers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now - can be restricted later)
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all operations on categories" ON categories FOR ALL USING (true);
CREATE POLICY "Allow all operations on receipts" ON receipts FOR ALL USING (true);
CREATE POLICY "Allow all operations on receipt_items" ON receipt_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on returns" ON returns FOR ALL USING (true);
CREATE POLICY "Allow all operations on return_items" ON return_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on shopkeepers" ON shopkeepers FOR ALL USING (true);
CREATE POLICY "Allow all operations on reports" ON reports FOR ALL USING (true);
CREATE POLICY "Allow all operations on settings" ON settings FOR ALL USING (true);
