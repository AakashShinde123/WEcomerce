import { useQuery, useMutation } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Package, CheckCircle } from "lucide-react";

export default function DeliveryTasks() {
  const { toast } = useToast();
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

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Delivery Tasks</h1>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Active Orders</h2>
        {activeOrders?.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <CardTitle>Order #{order.id}</CardTitle>
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
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Completed Orders</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {completedOrders?.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle>Order #{order.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Delivered to: {order.address}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {completedOrders?.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No completed orders
          </div>
        )}
      </div>
    </div>
  );
}
