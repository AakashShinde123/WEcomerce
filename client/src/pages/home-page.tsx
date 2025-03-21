import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Product, Category } from "@shared/schema";
import ProductGrid from "@/components/products/product-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { Search, ShoppingCart } from "lucide-react";

export default function HomePage() {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const filteredProducts = products?.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  if (productsLoading || categoriesLoading) {
    return (
      <div>
        <div className="space-y-4 mb-8">
          <Skeleton className="h-12 w-full" />
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24 flex-shrink-0" />
            ))}
          </div>
        </div>
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
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === "All" ? "default" : "outline"}
          className="flex-shrink-0"
          onClick={() => setSelectedCategory("All")}
        >
          All
        </Button>
        {categories?.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.name ? "default" : "outline"}
            className="flex-shrink-0"
            onClick={() => setSelectedCategory(category.name)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">
          {selectedCategory === "All" ? "All Products" : selectedCategory}
        </h2>
        {filteredProducts?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No products found. Try adjusting your filters.
          </div>
        ) : (
          <ProductGrid products={filteredProducts || []} onAddToCart={handleAddToCart} />
        )}
      </div>

      <div className="fixed bottom-4 right-4">
        <Button
          size="lg"
          className="rounded-full p-3"
          onClick={() => {
            // Navigate to cart or open cart modal
          }}
        >
          <ShoppingCart className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}