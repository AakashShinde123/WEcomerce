import { pgTable, serial, text, integer, jsonb, timestamp, numeric } from 'drizzle-orm/pg-core';


export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(),
  stock: integer('stock').notNull().default(0),
  category: text('category').notNull(), // Ensure category is defined
  image: text('image'), // Optional field for image URLs
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
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["user", "admin", "delivery"] }).notNull().default("user"),
  fullName: text("full_name").notNull(),
  address: text("address"),
  phone: text("phone"),
});