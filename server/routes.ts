import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { insertProductSchema, orderItemSchema, insertCategorySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Category routes
  app.get("/api/categories", async (_req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.post("/api/categories", async (req, res) => {
    if (req.user?.role !== "admin") {
      return res.status(403).send("Unauthorized");
    }
    const category = await storage.createCategory(insertCategorySchema.parse(req.body));
    res.status(201).json(category);
  });

  app.delete("/api/categories/:id", async (req, res) => {
    if (req.user?.role !== "admin") {
      return res.status(403).send("Unauthorized");
    }
    await storage.deleteCategory(parseInt(req.params.id));
    res.sendStatus(200);
  });

  // Product routes
  app.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    if (req.user?.role !== "admin") {
      return res.status(403).send("Unauthorized");
    }
    const product = await storage.createProduct(insertProductSchema.parse(req.body));
    res.status(201).json(product);
  });

  app.patch("/api/products/:id", async (req, res) => {
    if (req.user?.role !== "admin") {
      return res.status(403).send("Unauthorized");
    }
    const product = await storage.updateProduct(
      parseInt(req.params.id),
      req.body
    );
    res.json(product);
  });

  app.delete("/api/products/:id", async (req, res) => {
    if (req.user?.role !== "admin") {
      return res.status(403).send("Unauthorized");
    }
    await storage.deleteProduct(parseInt(req.params.id));
    res.sendStatus(200);
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    const cart = await storage.getCart(req.user.id);
    res.json(cart);
  });

  app.post("/api/cart", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    const cart = await storage.updateCart(req.user.id, req.body);
    res.json(cart);
  });

  // Order routes
  app.post("/api/orders", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    const items = z.array(orderItemSchema).parse(req.body.items);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Find available delivery partner
    const deliveryPartners = await storage.getDeliveryPartners();
    const availablePartner = deliveryPartners.find(partner => {
      const activeOrders = partner.orders?.filter(o => 
        o.status === "assigned" || o.status === "delivering"
      );
      return !activeOrders || activeOrders.length < 3;
    });

    const order = await storage.createOrder({
      userId: req.user.id,
      items,
      total,
      status: availablePartner ? "assigned" : "pending",
      deliveryPartnerId: availablePartner?.id,
      address: req.body.address,
      createdAt: new Date(),
    });

    res.status(201).json(order);
  });

  app.get("/api/orders", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    let orders;
    if (req.user.role === "admin") {
      orders = await storage.getOrders();
    } else if (req.user.role === "delivery") {
      orders = await storage.getOrdersByDeliveryPartner(req.user.id);
    } else {
      orders = await storage.getOrdersByUser(req.user.id);
    }

    res.json(orders);
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    const { status } = req.body;
    if (!status) return res.status(400).send("Status is required");

    const order = await storage.updateOrderStatus(
      parseInt(req.params.id),
      status,
      req.user.role === "delivery" ? req.user.id : undefined
    );

    res.json(order);
  });

  const httpServer = createServer(app);
  return httpServer;
}