
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./db');
const { createProduct } = require('./controllers/productController');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define routes
app.post('/api/products', createProduct);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});