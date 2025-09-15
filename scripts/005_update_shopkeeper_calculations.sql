-- Create function to calculate shopkeeper balances
CREATE OR REPLACE FUNCTION calculate_shopkeeper_balance(shopkeeper_name TEXT, shopkeeper_phone TEXT)
RETURNS TABLE (
  total_orders INTEGER,
  total_amount DECIMAL(10,2),
  total_received DECIMAL(10,2),
  pending_amount DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_orders,
    COALESCE(SUM(r.total_amount), 0) as total_amount,
    COALESCE(SUM(r.amount_received), 0) as total_received,
    COALESCE(SUM(r.total_amount - r.amount_received), 0) as pending_amount
  FROM receipts r
  WHERE r.customer_name = shopkeeper_name 
    AND r.customer_phone = shopkeeper_phone;
END;
$$ LANGUAGE plpgsql;

-- Update shopkeepers table with calculated balances
UPDATE shopkeepers s
SET 
  current_balance = calc.total_received - calc.total_amount,
  total_purchases = calc.total_orders
FROM (
  SELECT 
    s2.name,
    s2.contact,
    COALESCE(SUM(r.total_amount), 0) as total_amount,
    COALESCE(SUM(r.amount_received), 0) as total_received,
    COUNT(r.id) as total_orders
  FROM shopkeepers s2
  LEFT JOIN receipts r ON r.customer_name = s2.name AND r.customer_phone = s2.contact
  GROUP BY s2.name, s2.contact
) calc
WHERE s.name = calc.name AND s.contact = calc.contact;
