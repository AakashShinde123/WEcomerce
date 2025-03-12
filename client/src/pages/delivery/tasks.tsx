import { useQuery, useMutation } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Package, CheckCircle, TrendingUp, Clock, MapPin } from "lucide-react";
import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { format } from "date-fns";

export default function DeliveryTasks() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("active");

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: Order['status'] }) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order updated",
        description: "The order status has been updated successfully.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const activeOrders = orders?.filter(
    (order) => order.status === "assigned" || order.status === "delivering"
  );

  const completedOrders = orders?.filter(
    (order) => order.status === "delivered"
  );

  // Calculate earnings (assuming ₹50 per delivery)
  const totalEarnings = (completedOrders?.length || 0) * 50;
  const todayEarnings = completedOrders?.filter(
    order => format(new Date(order.createdAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ).length * 50;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{todayEarnings}</div>
            <p className="text-xs text-muted-foreground">
              {completedOrders?.filter(
                order => format(new Date(order.createdAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
              ).length} deliveries today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalEarnings}</div>
            <p className="text-xs text-muted-foreground">
              {completedOrders?.length} total deliveries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8★</div>
            <p className="text-xs text-muted-foreground">
              Average delivery time: 18 mins
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active Orders</TabsTrigger>
          <TabsTrigger value="completed">Completed Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeOrders?.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order #{order.id}</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    asChild
                  >
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MapPin className="h-4 w-4" />
                      Navigate
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="font-medium">Delivery Address</div>
                    <div className="text-sm text-muted-foreground">
                      {order.address}
                    </div>
                  </div>

                  <div>
                    <div className="font-medium">Items</div>
                    <div className="text-sm text-muted-foreground">
                      {(order.items as any[]).map((item, i) => (
                        <div key={i}>
                          {item.quantity}x {item.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    {order.status === "assigned" && (
                      <Button
                        onClick={() =>
                          updateOrderStatusMutation.mutate({
                            id: order.id,
                            status: "delivering",
                          })
                        }
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Start Delivery
                      </Button>
                    )}
                    {order.status === "delivering" && (
                      <Button
                        onClick={() =>
                          updateOrderStatusMutation.mutate({
                            id: order.id,
                            status: "delivered",
                          })
                        }
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Delivered
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {activeOrders?.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No active orders
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedOrders?.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order #{order.id}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Completed {format(new Date(order.createdAt), 'MMM d, h:mm a')}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Delivered to: {order.address}
                  </div>
                  <div className="text-sm">
                    Earnings: ₹50
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {completedOrders?.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No completed orders
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}