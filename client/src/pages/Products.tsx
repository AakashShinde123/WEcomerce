import React, { useEffect, useState } from 'react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<string>('All');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          category === 'All'
            ? '/api/products'
            : `/api/products?category=${encodeURIComponent(category)}`
        );
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [category]);

  return (
    <div>
      <h1>Products</h1>
      <div>
        <button onClick={() => setCategory('All')}>All</button>
        <button onClick={() => setCategory('Sweets')}>Sweets</button>
        <button onClick={() => setCategory('Snacks')}>Snacks</button>
        <button onClick={() => setCategory('Beverages')}>Beverages</button>
      </div>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p>Price: ₹{product.price}</p>
            <p>Category: {product.category}</p>
            {product.image ? (
              <img src={product.image} alt={product.name} style={{ width: '100px' }} />
            ) : (
              <p>No image available</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Products;