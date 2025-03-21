import { Product } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  className?: string;
}

export default function ProductCard({ product, onAddToCart, className }: ProductCardProps) {
  return (
    <Card className={`w-[250px] h-[350px] overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 ${className}`}>
      {/* Image Section */}
      <div className="w-full h-[150px] overflow-hidden relative">
        <img
          src={product.image}
          alt={product.name}
          className="object-cover w-full h-full transform hover:scale-110 transition-transform duration-300"
        />
        {product.stock <= 5 && product.stock > 0 && (
          <Badge variant="secondary" className="absolute top-2 right-2">
            Only {product.stock} left
          </Badge>
        )}
      </div>

      {/* Content Section */}
      <CardContent className="p-4 h-[150px] flex flex-col justify-between">
        <div>
          <div className="mb-1">
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
          </div>
          <h3 className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
            {product.description}
          </p>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold">
            ₹{Number(product.price).toFixed(2)}
          </span>
          <div className="flex items-center text-yellow-500">
            <Star className="h-3 w-3 fill-current" />
            <span className="text-xs ml-1">4.5</span>
          </div>
        </div>
      </CardContent>

      {/* Footer Section */}
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full text-xs"
          onClick={() => onAddToCart?.(product)}
          disabled={product.stock <= 0}
        >
          <ShoppingCart className="mr-1 h-3 w-3" />
          {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
}