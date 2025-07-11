import React, { useState, useEffect } from 'react';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

  useEffect(() => {
    fetch(`${API_BASE}/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, [API_BASE]);

  const addProduct = async () => {
    if (!name || !price || !stock) return alert('Fill all product fields');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price: parseFloat(price), stock: parseInt(stock) })
      });
      if (res.ok) {
        const newProduct = await res.json();
        setProducts([...products, newProduct]);
        setName(''); setPrice(''); setStock('');
      } else {
        alert('Error adding product');
      }
    } catch (e) {
      alert('Network error');
    }
    setLoading(false);
  };

  const addToCart = (product) => {
    if (product.stock < 1) {
      alert('Out of stock!');
      return;
    }
    const itemInCart = cart.find(item => item._id === product._id);
    if (itemInCart) {
      if (itemInCart.quantity + 1 > product.stock) {
        alert('Not enough stock');
        return;
      }
      setCart(cart.map(item => item._id === product._id ? {...item, quantity: item.quantity + 1} : item));
    } else {
      setCart([...cart, {...product, quantity: 1}]);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const checkout = async () => {
    if (cart.length === 0) return alert('Cart is empty');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart })
      });
      if (res.ok) {
        alert('Sale recorded!');
        setCart([]);
        // Refresh products stock
        const res2 = await fetch(`${API_BASE}/products`);
        const data = await res2.json();
        setProducts(data);
      } else {
        alert('Error processing sale');
      }
    } catch(e) {
      alert('Network error');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: 'auto' }}>
      <h1>TSM POS & Stock</h1>
      <h2>Add Product</h2>
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} /><br />
      <input placeholder="Price" type="number" value={price} onChange={e => setPrice(e.target.value)} /><br />
      <input placeholder="Stock" type="number" value={stock} onChange={e => setStock(e.target.value)} /><br />
      <button onClick={addProduct} disabled={loading}>Add Product</button>
      <h2>Products</h2>
      <ul>
        {products.map(p => (
          <li key={p._id}>
            {p.name} - ${p.price.toFixed(2)} - Stock: {p.stock}
            <button onClick={() => addToCart(p)} disabled={loading}>Add to Cart</button>
          </li>
        ))}
      </ul>
      <h2>Cart</h2>
      <ul>
        {cart.map(item => (
          <li key={item._id}>{item.name} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}</li>
        ))}
      </ul>
      <h3>Total: ${total.toFixed(2)}</h3>
      <button onClick={checkout} disabled={loading}>Checkout</button>
    </div>
  );
}

export default App;
