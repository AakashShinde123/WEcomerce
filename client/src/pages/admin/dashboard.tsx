import { useQuery, useMutation } from "@tanstack/react-query";
import { Order, Category, insertCategorySchema, User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Plus, Trash2, Bell, Sun, Moon, Search, Filter, Settings, User as UserIcon } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [widgets, setWidgets] = useState([
    { id: "stats", name: "Stats" },
    { id: "revenueChart", name: "Revenue Trend" },
    { id: "ordersChart", name: "Orders by Status" },
    { id: "categories", name: "Category Management" },
    { id: "recentOrders", name: "Recent Orders" },
  ]);
  const [notifications, setNotifications] = useState<Order[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: deliveryPartners } = useQuery<User[]>({
    queryKey: ["/api/delivery-partners"],
  });

  // Simulate real-time updates and notifications
  useEffect(() => {
    let previousOrdersLength = orders?.length || 0;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });

      // Check for new orders
      if (orders && orders.length > previousOrdersLength) {
        const newOrder = orders[orders.length - 1]; // Get the latest order
        setNotifications((prev) => [newOrder, ...prev]);
        setUnreadCount((prev) => prev + 1);
        toast({
          title: "New Order Received",
          description: `Order #${newOrder.id} has been placed.`,
        });
        previousOrdersLength = orders.length; // Update the previous orders length
      }
    }, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [orders]);

  // Mark notifications as read
  const markAsRead = () => {
    setUnreadCount(0);
  };

  // Calculate revenue trend from the start of the business
  const revenueTrend = useMemo(() => {
    if (!orders) return [];

    const revenueByDate = orders.reduce((acc, order) => {
      const date = format(new Date(order.createdAt), "yyyy-MM-dd");
      acc[date] = (acc[date] || 0) + Number(order.total);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(revenueByDate).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  }, [orders]);

  const stats = useMemo(() => {
    if (!orders) return null;

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const activeDeliveryPartners = new Set(
      orders.filter((o) => o.deliveryPartnerId).map((o) => o.deliveryPartnerId)
    ).size;

    // Orders by status
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(ordersByStatus).map(([status, count]) => ({
      status,
      count,
    }));

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      activeDeliveryPartners,
      chartData,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toString().includes(searchQuery) ||
        order.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus ? order.status === filterStatus : true;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, filterStatus]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // Category Management
  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await apiRequest("POST", "/api/categories", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Category created",
        description: "The category has been created successfully.",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/categories/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Category deleted",
        description: "The category has been deleted successfully.",
      });
    },
  });

  const categoryForm = useForm({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: {
      name: "",
    },
  });

  return (
    <div className={`space-y-6 ${theme === "dark" ? "dark" : ""}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute top-0 right-0 px-1.5 py-0.5 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              <div className="p-2">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Notifications</h3>
                  <Button variant="ghost" size="sm" onClick={markAsRead}>
                    Mark all as read
                  </Button>
                </div>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="cursor-pointer">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">New Order #{notification.id}</p>
                        <p className="text-xs text-muted-foreground">
                          Total: ₹{Number(notification.total).toFixed(2)}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No new notifications.</p>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <UserIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <Select onValueChange={(value) => setFilterStatus(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Drag-and-Drop Widgets */}
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) return;
          const items = Array.from(widgets);
          const [reorderedItem] = items.splice(result.source.index, 1);
          items.splice(result.destination.index, 0, reorderedItem);
          setWidgets(items);
        }}
      >
        <Droppable droppableId="widgets">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {widgets.map((widget, index) => (
                <Draggable key={widget.id} draggableId={widget.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      {widget.id === "stats" && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Stats</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                              <StatCard title="Total Orders" value={stats?.totalOrders} />
                              <StatCard title="Total Revenue" value={`₹${stats?.totalRevenue.toFixed(2)}`} />
                              <StatCard title="Pending Orders" value={stats?.pendingOrders} />
                              <StatCard title="Active Partners" value={stats?.activeDeliveryPartners} />
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      {widget.id === "revenueChart" && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Revenue Trend</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueTrend}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="date" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      {widget.id === "categories" && (
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Category Management</CardTitle>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Category
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Add New Category</DialogTitle>
                                </DialogHeader>
                                <Form {...categoryForm}>
                                  <form
                                    onSubmit={categoryForm.handleSubmit((data) =>
                                      createCategoryMutation.mutate(data)
                                    )}
                                    className="space-y-4"
                                  >
                                    <FormField
                                      control={categoryForm.control}
                                      name="name"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Category Name</FormLabel>
                                          <FormControl>
                                            <Input {...field} />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                    <Button type="submit" className="w-full">
                                      Create Category
                                    </Button>
                                  </form>
                                </Form>
                              </DialogContent>
                            </Dialog>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {categories?.map((category) => (
                                <div
                                  key={category.id}
                                  className="flex items-center justify-between p-2 border rounded"
                                >
                                  <span>{category.name}</span>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteCategoryMutation.mutate(category.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

const StatCard = ({ title, value }: { title: string; value: string | number }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="p-4 border rounded-lg shadow-sm"
  >
    <div className="text-sm text-muted-foreground">{title}</div>
    <div className="text-2xl font-bold">{value}</div>
  </motion.div>
);