import express, { Request, Response } from 'express';
import { db } from '../db';
import { orders } from '../schema';
import { authenticateUser } from '../auth';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    address: string | null;
    username: string;
    password: string;
    role: "user" | "admin" | "delivery";
    fullName: string;
    phone: string | null;
  };
}

const router = express.Router();

// Place an order
router.post('/orders', authenticateUser, async (req: Request, res: Response) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { items, address } = req.body;

    if (!items || !address) {
      return res.status(400).json({ message: 'Items and address are required' });
    }
    const newOrder = await db.insert(orders).values({
      userId: authenticatedReq.user.id, // Use the authenticated user's ID
      items,
      total: items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
      address,
      status: 'pending',
    }).returning();

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Error placing order', error });
  }
});

export default router;