import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, User, LogOut, Package, Home, ChevronDown } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const isAdmin = user?.role === "admin";
  const isDelivery = user?.role === "delivery";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">
            Sudhamrit
          </Link>

          <nav className="flex items-center gap-4">
            {isAdmin ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Admin
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/products">Products</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : isDelivery ? (
              <Link href="/delivery">
                <Button variant="outline">
                  <Package className="mr-2 h-4 w-4" />
                  Delivery Tasks
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/">
                  <Button variant="ghost">
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Button>
                </Link>
                <Button variant="outline">
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>
                  {user?.fullName}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => logoutMutation.mutate()}
                  className="text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
