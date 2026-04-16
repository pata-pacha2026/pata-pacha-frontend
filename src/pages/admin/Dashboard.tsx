import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export default function Dashboard() {
  const { data: productData } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => apiClient.post('/products/list', { admin: true, pageSize: 1000 }).then(r => r.data),
  });

  const { data: orderData } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => apiClient.post('/orders/list', { pageSize: 1000 }).then(r => r.data),
  });

  const products = productData?.data?.products || [];
  const orders = orderData?.data?.orders || [];
  const totalRevenue = orders.filter((o: any) => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered').reduce((s: number, o: any) => s + o.totalAmount, 0);
  const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
  const publishedProducts = products.filter((p: any) => p.isPublished).length;
  const unpublishedProducts = products.filter((p: any) => !p.isPublished).length;

  const stats = [
    { label: 'Total Products', value: products.length, icon: '📦', sub: `${publishedProducts} published, ${unpublishedProducts} draft` },
    { label: 'Total Orders', value: orders.length, icon: '📋', sub: `${pendingOrders} pending` },
    { label: 'Revenue', value: `¥${totalRevenue.toFixed(2)}`, icon: '💰', sub: 'From paid orders' },
    { label: 'Avg Order', value: orders.length ? `¥${(totalRevenue / orders.filter((o: any) => o.status !== 'cancelled').length || 1).toFixed(2)}` : '¥0', icon: '📈', sub: 'Per non-cancelled order' },
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground font-medium">{s.label}</span>
              <span className="text-2xl">{s.icon}</span>
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h2 className="font-display font-bold text-lg">Recent Orders</h2>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No orders yet</div>
        ) : (
          <div className="divide-y divide-border">
            {recentOrders.map((order: any) => (
              <div key={order.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">#{order.id} - {order.fullName}</div>
                  <div className="text-xs text-muted-foreground">{order.email} &middot; {new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">¥{order.totalAmount.toFixed(2)}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'paid' ? 'bg-green-100 text-green-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'delivered' ? 'bg-gray-100 text-gray-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
