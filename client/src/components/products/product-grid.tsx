import { Product } from "@shared/schema";
import ProductCard from "./product-card";

interface ProductGridProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
}

export default function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 bg-gray-50">
      {products.map((product) => (
        <div
          key={product.id}
          className="transform transition-transform duration-300 hover:scale-105 hover:shadow-lg"
        >
          <ProductCard
            product={product}
            onAddToCart={onAddToCart}
            className="w-full h-full shadow-md hover:shadow-xl transition-shadow duration-300"
          />
        </div>
      ))}
    </div>
  );
}