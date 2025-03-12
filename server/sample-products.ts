import { storage } from "./storage";

const SAMPLE_PRODUCTS = [
  {
    name: "Fresh Apples",
    description: "Sweet and crispy apples, perfect for snacking or baking",
    price: 120,
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6",
    category: "Fruits & Vegetables",
    stock: 100,
  },
  {
    name: "Whole Milk",
    description: "Fresh, pasteurized whole milk from local dairy farms",
    price: 60,
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150",
    category: "Dairy & Eggs",
    stock: 50,
  },
  {
    name: "Whole Wheat Bread",
    description: "Freshly baked whole wheat bread, rich in fiber",
    price: 40,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff",
    category: "Grocery & Staples",
    stock: 30,
  },
  {
    name: "Orange Juice",
    description: "100% pure orange juice, no added sugar",
    price: 80,
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423",
    category: "Beverages",
    stock: 40,
  },
  {
    name: "Trail Mix",
    description: "Healthy mix of nuts, dried fruits, and seeds",
    price: 150,
    image: "https://images.unsplash.com/photo-1556760544-74068565f05c",
    category: "Snacks & Packaged Foods",
    stock: 60,
  },
];

async function seedProducts() {
  const existingProducts = await storage.getProducts();
  if (existingProducts.length > 0) {
    console.log("Products already seeded");
    return;
  }

  for (const product of SAMPLE_PRODUCTS) {
    await storage.createProduct(product);
  }
  console.log("Sample products created");
}

seedProducts().catch(console.error);
