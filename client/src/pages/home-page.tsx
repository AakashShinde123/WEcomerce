import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductGrid from "@/components/products/product-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const { toast } = useToast();
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const handleAddToCart = (product: Product) => {
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Fresh Groceries</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Fresh Groceries</h1>
      </div>
      <ProductGrid products={products || []} onAddToCart={handleAddToCart} />
    </div>
  );
}
