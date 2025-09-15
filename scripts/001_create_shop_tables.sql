-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sku TEXT UNIQUE,
  cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shopkeepers table
CREATE TABLE IF NOT EXISTS shopkeepers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT,
  address TEXT,
  credit_limit DECIMAL(10,2) DEFAULT 0,
  current_balance DECIMAL(10,2) DEFAULT 0,
  total_purchases DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT UNIQUE NOT NULL,
  shopkeeper_id UUID REFERENCES shopkeepers(id) ON DELETE CASCADE,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  return_total DECIMAL(10,2) DEFAULT 0,
  final_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount_received DECIMAL(10,2) NOT NULL DEFAULT 0,
  pending_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create receipt_items table
CREATE TABLE IF NOT EXISTS receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create return_items table
CREATE TABLE IF NOT EXISTS return_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stock_movements table
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  receipt_id UUID REFERENCES receipts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_history table
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopkeeper_id UUID REFERENCES shopkeepers(id) ON DELETE CASCADE,
  receipt_id UUID REFERENCES receipts(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'payment')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create returns table
CREATE TABLE IF NOT EXISTS returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
  shopkeeper_id UUID REFERENCES shopkeepers(id) ON DELETE CASCADE,
  return_number TEXT UNIQUE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopkeepers ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now - adjust based on your auth needs)
CREATE POLICY "Allow all operations on categories" ON categories FOR ALL USING (true);
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all operations on shopkeepers" ON shopkeepers FOR ALL USING (true);
CREATE POLICY "Allow all operations on receipts" ON receipts FOR ALL USING (true);
CREATE POLICY "Allow all operations on receipt_items" ON receipt_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on return_items" ON return_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on stock_movements" ON stock_movements FOR ALL USING (true);
CREATE POLICY "Allow all operations on payment_history" ON payment_history FOR ALL USING (true);
CREATE POLICY "Allow all operations on returns" ON returns FOR ALL USING (true);
CREATE POLICY "Allow all operations on settings" ON settings FOR ALL USING (true);
