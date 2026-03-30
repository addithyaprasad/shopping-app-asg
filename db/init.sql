CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(80) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT NOT NULL,
  inventory INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(120) NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL
);

INSERT INTO products (name, description, category, price, image_url, inventory) VALUES
('Classic White Sneakers', 'Comfortable everyday sneakers with clean design.', 'Footwear', 69.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', 50),
('Minimalist Backpack', 'Water-resistant backpack for work, school, and travel.', 'Accessories', 54.99, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80', 40),
('Wireless Headphones', 'Over-ear headphones with strong battery life and deep bass.', 'Electronics', 129.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', 35),
('Smart Fitness Watch', 'Track workouts, steps, sleep, and notifications.', 'Electronics', 149.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', 25),
('Ceramic Coffee Mug', 'Modern matte mug for coffee and tea.', 'Home', 18.50, 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80', 100),
('Desk Lamp', 'Adjustable LED lamp for focused desk lighting.', 'Home', 42.00, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80', 30),
('Cotton Hoodie', 'Soft unisex hoodie with relaxed fit.', 'Apparel', 39.99, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80', 60),
('Travel Water Bottle', 'Insulated stainless steel bottle that keeps drinks cold.', 'Accessories', 24.99, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80', 90)
ON CONFLICT DO NOTHING;
