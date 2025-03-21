import express, { Request, Response } from 'express';
import { db } from '../db';
import { users } from 'server/schema';
import passport from 'passport';
const router = express.Router();

// Fetch all users
router.get('/users', async (_req: Request, res: Response) => {
  try {
    const allUsers = await db.select().from(users);
    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// Register a new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, fullName, address, phone } = req.body;

    // Validate input
    if (!username || !password || !fullName) {
      return res.status(400).json({ message: 'Username, password, and full name are required' });
    }

    // Insert user into the database
    const newUser = await db.insert(users).values({
      username,
      password, // In production, hash the password before storing it
      fullName,
      address,
      phone,
    }).returning();

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error });
  }
});

router.post("/login", (req, res, next) => {
  console.log("Login request received:", req.body);
  passport.authenticate("local", (err: Error | null, user: any, info: { message: string }) => {
    if (err) {
      console.error("Error during authentication:", err);
      return next(err);
    }
    if (!user) {
      console.log("Authentication failed:", info.message);
      return res.status(401).json({ message: info.message });
    }

    req.login(user, (err) => {
      if (err) {
        console.error("Error during login:", err);
        return next(err);
      }
      console.log("Login successful for user:", user.username);
      res.status(200).json({ message: "Login successful", user });
    });
  })(req, res, next);
});

export default router;