import { User, Product, Order, InsertUser, InsertProduct } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  
  // Order operations
  createOrder(order: Order): Promise<Order>;
  getOrders(): Promise<Order[]>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getOrdersByDeliveryPartner(partnerId: number): Promise<Order[]>;
  updateOrderStatus(id: number, status: Order['status'], partnerId?: number): Promise<Order>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  sessionStore: session.Store;
  private currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.currentId = { users: 1, products: 1, orders: 1 };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentId.products++;
    const newProduct = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    const existing = await this.getProduct(id);
    if (!existing) throw new Error("Product not found");
    const updated = { ...existing, ...product };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    this.products.delete(id);
  }

  async createOrder(order: Order): Promise<Order> {
    const id = this.currentId.orders++;
    const newOrder = { ...order, id };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId,
    );
  }

  async getOrdersByDeliveryPartner(partnerId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.deliveryPartnerId === partnerId,
    );
  }

  async updateOrderStatus(
    id: number,
    status: Order['status'],
    partnerId?: number,
  ): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) throw new Error("Order not found");
    
    const updated = {
      ...order,
      status,
      deliveryPartnerId: partnerId ?? order.deliveryPartnerId,
    };
    
    this.orders.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
