import { pgTable, text, serial, integer, boolean, jsonb, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["user", "admin", "delivery"] }).notNull().default("user"),
  fullName: text("full_name").notNull(),
  address: text("address"),
  phone: text("phone"),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  image: text("image").notNull(),
  category: text("category").notNull(),
  stock: integer("stock").notNull().default(0),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  status: text("status", { 
    enum: ["pending", "preparing", "assigned", "delivering", "delivered", "cancelled"] 
  }).notNull(),
  deliveryPartnerId: integer("delivery_partner_id"),
  items: jsonb("items").notNull(),
  total: numeric("total").notNull(),
  address: text("address").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  role: true,
  address: true,
  phone: true,
});

export const insertProductSchema = createInsertSchema(products);
export const insertOrderSchema = createInsertSchema(orders);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;

export const orderItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1),
  price: z.number(),
  name: z.string(),
});

export type OrderItem = z.infer<typeof orderItemSchema>;
