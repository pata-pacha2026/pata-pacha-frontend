import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const STATUS_FLOW: Record<string, string[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['shipped', 'refunded'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
  refunded: [],
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  shipped: 'bg-blue-100 text-blue-800',
  delivered: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-purple-100 text-purple-800',
};

export default function OrdersAdmin() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () => apiClient.post('/orders/list', { status: statusFilter || undefined, search: search || undefined, pageSize: 100 }).then(r => r.data?.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => apiClient.post('/orders/update-status', { id, status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Order status updated'); },
    onError: () => toast.error('Failed to update'),
  });

  const orders = data?.orders || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl">Orders</h1>
      </div>

      <div className="flex gap-3 mb-4">
        <Input placeholder="Search by name, email, phone..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-left text-xs font-semibold uppercase px-4 py-3">Order</th>
              <th className="text-left text-xs font-semibold uppercase px-4 py-3">Customer</th>
              <th className="text-left text-xs font-semibold uppercase px-4 py-3">Amount</th>
              <th className="text-left text-xs font-semibold uppercase px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold uppercase px-4 py-3">Date</th>
              <th className="text-right text-xs font-semibold uppercase px-4 py-3">Actions</th>
            </tr></thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-mono">#{order.id}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium">{order.fullName}</div>
                    <div className="text-xs text-muted-foreground">{order.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold">¥{order.totalAmount?.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>{order.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {(STATUS_FLOW[order.status] || []).map(nextStatus => (
                        <Button key={nextStatus} size="sm" variant="outline" onClick={() => { if (confirm(`Change status to ${nextStatus}?`)) updateStatus.mutate({ id: order.id, status: nextStatus }); }} className="cursor-pointer text-xs capitalize">
                          {nextStatus}
                        </Button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No orders</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
