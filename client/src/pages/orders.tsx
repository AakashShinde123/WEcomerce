import React, { useEffect, useState } from 'react';

interface Order {
  id: number;
  userId: number;
  status: string;
  items: any[];
  total: number;
  address: string;
  createdAt: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div>
      <h1>Orders</h1>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            <p>Order ID: {order.id}</p>
            <p>User ID: {order.userId}</p>
            <p>Status: {order.status}</p>
            <p>Total: ₹{order.total}</p>
            <p>Address: {order.address}</p>
            <p>Created At: {new Date(order.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Orders;