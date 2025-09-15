-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shopkeepers_updated_at BEFORE UPDATE ON shopkeepers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON receipts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_returns_updated_at BEFORE UPDATE ON returns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate receipt number
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    receipt_number TEXT;
BEGIN
    -- Get the next sequence number
    SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM 'RCP(\d+)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM receipts
    WHERE receipt_number ~ '^RCP\d+$';
    
    -- Format as RCPXXX
    receipt_number := 'RCP' || LPAD(next_number::TEXT, 3, '0');
    
    RETURN receipt_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate return number
CREATE OR REPLACE FUNCTION generate_return_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    return_number TEXT;
BEGIN
    -- Get the next sequence number
    SELECT COALESCE(MAX(CAST(SUBSTRING(return_number FROM 'RET(\d+)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM returns
    WHERE return_number ~ '^RET\d+$';
    
    -- Format as RETXXX
    return_number := 'RET' || LPAD(next_number::TEXT, 3, '0');
    
    RETURN return_number;
END;
$$ LANGUAGE plpgsql;

-- Function to update product stock on sale
CREATE OR REPLACE FUNCTION update_product_stock_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    -- Decrease stock for receipt items
    UPDATE products 
    SET 
        stock_quantity = stock_quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stock when receipt item is added
CREATE TRIGGER update_product_stock_trigger
    AFTER INSERT ON receipt_items
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock_on_sale();

-- Function to handle return items stock
CREATE OR REPLACE FUNCTION handle_return_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Increase stock for return items
    UPDATE products 
    SET 
        stock_quantity = stock_quantity + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stock when return item is added
CREATE TRIGGER handle_return_stock_trigger
    AFTER INSERT ON return_items
    FOR EACH ROW
    EXECUTE FUNCTION handle_return_stock();
