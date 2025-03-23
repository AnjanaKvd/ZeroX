DELIMITER //
CREATE TRIGGER IF NOT EXISTS inventory_update_trigger
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
    IF NEW.stock_quantity < NEW.low_stock_threshold THEN
        INSERT INTO stock_alerts (alert_id, product_id, current_stock, created_at)
        VALUES (UUID(), NEW.product_id, NEW.stock_quantity, NOW());
    END IF;
END//
DELIMITER ; 