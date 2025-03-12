import { Product } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square overflow-hidden relative">
        <img
          src={product.image}
          alt={product.name}
          className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-200"
        />
        {product.stock <= 5 && product.stock > 0 && (
          <Badge variant="secondary" className="absolute top-2 right-2">
            Only {product.stock} left
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-2">
          <Badge variant="outline" className="mb-2">
            {product.category}
          </Badge>
        </div>
        <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {product.description}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold">
            ₹{Number(product.price).toFixed(2)}
          </span>
          <div className="flex items-center text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm ml-1">4.5</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={() => onAddToCart?.(product)}
          disabled={product.stock <= 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
}