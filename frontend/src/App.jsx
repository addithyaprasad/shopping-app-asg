import { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const IMAGE_FALLBACK_URL = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80";

function currency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [orderMessage, setOrderMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function loadProducts() {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);

    const response = await fetch(`${API_BASE_URL}/api/products?${params.toString()}`);
    const data = await response.json();
    setProducts(data);
  }

  async function loadCategories() {
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    const data = await response.json();
    setCategories(data);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [query, category]);

  const cartTotal = useMemo(
    () =>
      cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  function addToCart(product) {
    setOrderMessage("");
    setCart((current) => {
      const exists = current.find((item) => item.id === product.id);
      if (exists) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.inventory) }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  }

  function updateQuantity(id, quantity) {
    setCart((current) =>
      current
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item))
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(id) {
    setCart((current) => current.filter((item) => item.id !== id));
  }

  async function checkout() {
    if (!customerName.trim() || cart.length === 0) {
      setOrderMessage("Enter your name and add at least one item.");
      return;
    }

    setLoading(true);
    setOrderMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customerName,
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setOrderMessage(data.error || "Checkout failed.");
      } else {
        setOrderMessage(`Order #${data.orderId} placed successfully for ${data.customerName}.`);
        setCart([]);
        setCustomerName("");
        loadProducts();
        navigate("/");
      }
    } catch {
      setOrderMessage("Network error while placing order.");
    } finally {
      setLoading(false);
    }
  }

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const tax = cartTotal * 0.08;
  const grandTotal = cartTotal + tax;

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Multi-tier EC2 Auto Scaling Demo</p>
          <h1>ScaleCart</h1>
          <p className="subtext">
            A storefront built for ALB routing, stateless backend scaling, and a managed database tier.
          </p>
        </div>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <main className="layout">
              <section className="catalog">
                <div className="toolbar">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products"
                  />
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">All categories</option>
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid">
                  {products.map((product) => (
                    <article className="card" key={product.id}>
                      <img
                        src={product.image_url}
                        alt={product.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = IMAGE_FALLBACK_URL;
                        }}
                      />
                      <div className="cardBody">
                        <span className="pill">{product.category}</span>
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <div className="priceRow">
                          <strong>{currency(Number(product.price))}</strong>
                          <span>{product.inventory} in stock</span>
                        </div>
                        <button onClick={() => addToCart(product)}>Add to cart</button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <aside className="cartPanel">
                <h2>Cart</h2>
                <div className="cartItems">
                  {cart.length === 0 && <p>Your cart is empty.</p>}
                  {cart.map((item) => (
                    <div className="cartItem" key={item.id}>
                      <div>
                        <strong>{item.name}</strong>
                        <p>{currency(Number(item.price))}</p>
                      </div>
                      <div className="cartControls">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                        />
                        <button className="secondary" onClick={() => removeFromCart(item.id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="checkout">
                  <div className="total">Items: {itemCount}</div>
                  <div className="total">Subtotal: {currency(cartTotal)}</div>
                  <Link className="linkButton" to="/checkout">
                    Go to checkout
                  </Link>
                  {orderMessage && <p className="message">{orderMessage}</p>}
                </div>
              </aside>
            </main>
          }
        />
        <Route
          path="/checkout"
          element={
            <main className="checkoutPage">
              <section className="checkoutContent">
                <div className="checkoutHeader">
                  <h2>Checkout</h2>
                  <Link className="backLink" to="/">
                    Continue shopping
                  </Link>
                </div>

                {cart.length === 0 ? (
                  <div className="emptyCheckout">
                    <p>Your cart is empty. Add items before checking out.</p>
                    <Link className="linkButton" to="/">
                      Browse products
                    </Link>
                  </div>
                ) : (
                  <div className="checkoutGrid">
                    <div className="checkoutList">
                      {cart.map((item) => (
                        <div className="checkoutItem" key={item.id}>
                          <div>
                            <strong>{item.name}</strong>
                            <p>{currency(Number(item.price))} each</p>
                          </div>
                          <div className="cartControls">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                            />
                            <button className="secondary" onClick={() => removeFromCart(item.id)}>
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <aside className="orderSummary">
                      <h3>Order summary</h3>
                      <input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Customer name"
                      />
                      <div className="summaryRow">
                        <span>Items</span>
                        <strong>{itemCount}</strong>
                      </div>
                      <div className="summaryRow">
                        <span>Subtotal</span>
                        <strong>{currency(cartTotal)}</strong>
                      </div>
                      <div className="summaryRow">
                        <span>Estimated tax (8%)</span>
                        <strong>{currency(tax)}</strong>
                      </div>
                      <div className="summaryRow grand">
                        <span>Total</span>
                        <strong>{currency(grandTotal)}</strong>
                      </div>
                      <button disabled={loading} onClick={checkout}>
                        {loading ? "Placing order..." : "Place order"}
                      </button>
                      {orderMessage && <p className="message">{orderMessage}</p>}
                    </aside>
                  </div>
                )}
              </section>
            </main>
          }
        />
      </Routes>
    </div>
  );
}
