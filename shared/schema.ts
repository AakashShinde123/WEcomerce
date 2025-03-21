import { pgTable, text, serial, integer, boolean, jsonb, timestamp, numeric, text as file } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { object, z } from "zod";
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

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
  price: integer("price").notNull(), // Expects a number
  stock: integer("stock").notNull().default(0), // Expects a number
  category: text("category").notNull(),
  image: text("image").notNull(), // Ensure the image column is included
});

// Zod schema for validation
export const insertProductSchema = createInsertSchema(products).extend({
  name: z.string().min(1, 'Name must contain at least 1 character'),
  description: z.string().min(1, 'Description must contain at least 1 character'),
  price: z.number().min(1, 'Price must be greater than 0'),
  stock: z.number().min(0, 'Stock must be greater than or equal to 0'),
  category: z.string().min(1, 'Category must contain at least 1 character'),
  image: z.string().url('Image must be a valid URL'),
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

export const cart = pgTable("cart", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  items: jsonb("items").notNull(),
  total: numeric("total").notNull(),
});

export const insertUserSchema = createInsertSchema(users);
export const insertOrderSchema = createInsertSchema(orders);
export const insertCategorySchema = createInsertSchema(categories);
export const insertCartSchema = createInsertSchema(cart);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Cart = typeof cart.$inferSelect;

export const orderItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1),
  price: z.number(),
  name: z.string(),
});

export type OrderItem = z.infer<typeof orderItemSchema>;