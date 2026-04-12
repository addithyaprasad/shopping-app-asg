import express from "express";
import cors from "cors";
import helmet from "helmet";

export function createApp({ query, healthCheck, allowedOrigin = "*" }) {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: allowedOrigin }));
  app.use(express.json());

 /* app.get("/health", async (_req, res) => {
    try {
      await healthCheck();
      res.json({ ok: true, service: "backend", timestamp: new Date().toISOString() });
    } catch {
      res.status(500).json({ ok: false, error: "database_unreachable" });
    }
  });*/
  app.get("/health", async (req, res) => {
    try {
      await healthCheck();
      res.json({ ok: true });
    } catch (err) {
      res.json({ ok: false, error: "db_unreachable" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const { q = "", category = "" } = req.query;
      const filters = [];
      const values = [];
      let i = 1;

      if (q) {
        filters.push(`(LOWER(name) LIKE LOWER($${i}) OR LOWER(description) LIKE LOWER($${i}))`);
        values.push(`%${q}%`);
        i += 1;
      }

      if (category) {
        filters.push(`LOWER(category) = LOWER($${i})`);
        values.push(category);
      }

      const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
      const sql = `
      SELECT id, name, description, category, price, image_url, inventory
      FROM products
      ${where}
      ORDER BY id
    `;
      const result = await query(sql, values);
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "failed_to_fetch_products" });
    }
  });

  app.get("/api/categories", async (_req, res) => {
    try {
      const result = await query(`
      SELECT DISTINCT category
      FROM products
      ORDER BY category
    `);
      res.json(result.rows.map((row) => row.category));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "failed_to_fetch_categories" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const result = await query(
        `SELECT id, name, description, category, price, image_url, inventory
       FROM products
       WHERE id = $1`,
        [req.params.id]
      );

      if (!result.rows.length) {
        return res.status(404).json({ error: "product_not_found" });
      }

      return res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "failed_to_fetch_product" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const customerName = String(req.body?.customerName || "").trim();
      const items = Array.isArray(req.body?.items) ? req.body.items : [];

      if (!customerName || items.length === 0) {
        return res.status(400).json({ error: "customerName_and_items_required" });
      }

      const ids = items.map((item) => Number(item.productId)).filter(Boolean);
      if (ids.length === 0) {
        return res.status(400).json({ error: "valid_productIds_required" });
      }

      const productResult = await query(
        `SELECT id, name, price, inventory
       FROM products
       WHERE id = ANY($1::int[])`,
        [ids]
      );

      const products = new Map(productResult.rows.map((row) => [row.id, row]));
      let total = 0;
      const normalizedItems = [];

      for (const item of items) {
        const productId = Number(item.productId);
        const quantity = Math.max(1, Number(item.quantity || 1));
        const product = products.get(productId);

        if (!product) {
          return res.status(400).json({ error: `product_${productId}_not_found` });
        }

        if (product.inventory < quantity) {
          return res.status(400).json({ error: `insufficient_inventory_for_${product.name}` });
        }

        total += Number(product.price) * quantity;
        normalizedItems.push({
          productId,
          quantity,
          unitPrice: Number(product.price)
        });
      }

      const orderResult = await query(
        `INSERT INTO orders (customer_name, total_amount, created_at)
       VALUES ($1, $2, NOW())
       RETURNING id, customer_name, total_amount, created_at`,
        [customerName, total.toFixed(2)]
      );

      const order = orderResult.rows[0];

      for (const item of normalizedItems) {
        await query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
          [order.id, item.productId, item.quantity, item.unitPrice]
        );

        await query(
          `UPDATE products
         SET inventory = inventory - $1
         WHERE id = $2`,
          [item.quantity, item.productId]
        );
      }

      return res.status(201).json({
        orderId: order.id,
        customerName: order.customer_name,
        totalAmount: Number(order.total_amount),
        createdAt: order.created_at
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "failed_to_create_order" });
    }
  });

  return app;
}
