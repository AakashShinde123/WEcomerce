import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedAdmin() {
  const existingAdmin = await storage.getUserByUsername("sudhamrit");
  if (existingAdmin) {
    console.log("Admin account already exists");
    return;
  }

  const admin = await storage.createUser({
    username: "sudhamrit",
    password: await hashPassword("mysudhamrit"),
    fullName: "Sudhamrit Admin",
    role: "admin",
    address: "Sudhamrit HQ",
    phone: "1234567890",
  });

  console.log("Created admin account:", admin.username);
}

seedAdmin().catch(console.error);
