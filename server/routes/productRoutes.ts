import express, { Request, Response } from 'express';
import { db } from '../db';
import { products, insertProductSchema } from 'shared/schema';
import { eq } from 'drizzle-orm'; // Import the `eq` function

const router = express.Router();

// Fetch products by category
router.get('/products', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    let result;
    if (category && category !== 'All') {
      // Use the `eq` function to filter by category
      result = await db.select().from(products).where(eq(products.category, category as string));
    } else {
      // Fetch all products
      result = await db.select().from(products);
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error });
  }
});

// Add a new product
router.post('/products', async (req: Request, res: Response) => {
  try {
    const parsedData = insertProductSchema.parse(req.body); // Validate input with Zod
    const newProduct = await db.insert(products).values(parsedData).returning();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(400).json({ message: 'Error adding product', error });
  }
});

// Delete a product
router.delete("/products/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedProduct = await db.delete(products).where(products.id.eq(Number(id)));
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

export default router;