import React, { useEffect, useState } from 'react';
import { getProducts, getProducts as fetchProducts, getAllUsers, getAdminOrders } from '../../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function DashboardAdmin() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const [p, u, o] = await Promise.all([
        fetchProducts(),
        getAllUsers(),
        getAdminOrders()
      ]);

      setProducts(Array.isArray(p) ? p : []);
      setUsers(Array.isArray(u) ? u : []);

      if (Array.isArray(o)) {
        setOrders(o.map(order => ({
          id: order.Id || order.id,
          total: order.TotalAmount || order.totalAmount || order.total,
          status: order.Status || order.status,
          created_at: order.CreatedAt || order.createdAt || order.created_at,
          userId: order.UserId || order.userId
        })));
      }
    } catch (err) {
      console.error('Dashboard load failed:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const totalUsers = users.length;
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  const monthlyData = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 0; i < 12; i++) {
    const monthOrders = orders.filter(o => new Date(o.created_at).getMonth() === i);
    const monthRevenue = monthOrders.reduce((s, o) => s + (o.total || 0), 0);
    monthlyData.push({
      month: months[i],
      orders: monthOrders.length,
      revenue: monthRevenue
    });
  }

  if (loading) {
    return (
      <div className="admin-fade-in">
        <div className="dashboard-section">
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-fade-in">

      <div className="dashboard-stats-grid">
        <div className="stat-card stat-users">
          <div className="stat-card-content">

            <div className="stat-card-info">
              <div className="stat-card-label">Total Users</div>
              <div className="stat-card-value">{totalUsers}</div>
            </div>
          </div>
        </div>

        <div className="stat-card stat-products">
          <div className="stat-card-content">

            <div className="stat-card-info">
              <div className="stat-card-label">Total Products</div>
              <div className="stat-card-value">{totalProducts}</div>
            </div>
          </div>
        </div>

        <div className="stat-card stat-orders">
          <div className="stat-card-content">

            <div className="stat-card-info">
              <div className="stat-card-label">Total Orders</div>
              <div className="stat-card-value">{totalOrders}</div>
            </div>
          </div>
        </div>

        <div className="stat-card stat-revenue">
          <div className="stat-card-content">

            <div className="stat-card-info">
              <div className="stat-card-label">Total Revenue</div>
              <div className="stat-card-value">₹{totalRevenue}</div>
            </div>
          </div>
        </div>
      </div>


      <div className="dashboard-activity-grid">
        <div className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title">Analytics Overview</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="analytics-card">
              <div className="analytics-card-header">
                <div className="analytics-icon">
                  📊
                </div>
                <h4 className="analytics-title">Orders Trend</h4>
              </div>
              <div className="analytics-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="month" stroke="var(--admin-text-muted)" fontSize={12} />
                    <YAxis stroke="var(--admin-text-muted)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--admin-surface)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: 'var(--admin-radius)',
                        boxShadow: 'var(--admin-shadow)',
                        color: 'var(--admin-text-primary)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="var(--admin-accent)"
                      strokeWidth={3}
                      dot={{ fill: 'var(--admin-accent)', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, stroke: 'var(--admin-accent)', strokeWidth: 2, fill: 'var(--admin-surface)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-card-header">
                <div className="analytics-icon">
                  💰
                </div>
                <h4 className="analytics-title">Revenue Trend</h4>
              </div>
              <div className="analytics-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="month" stroke="var(--admin-text-muted)" fontSize={12} />
                    <YAxis stroke="var(--admin-text-muted)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--admin-surface)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: 'var(--admin-radius)',
                        boxShadow: 'var(--admin-shadow)',
                        color: 'var(--admin-text-primary)'
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="var(--admin-success)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title">Recent Activity</h3>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-5xl mb-4">📦</div>
              <div className="text-lg">No orders yet</div>
              <div className="text-sm text-gray-400 mt-2">Orders will appear here once customers start shopping</div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice().reverse().slice(0, 8).map(o => (
                <div key={o.id} className="activity-card">
                  <div className="activity-icon">🛒</div>
                  <div className="activity-content">
                    <h4 className="text-base font-semibold text-gray-900">Order #{o.id}</h4>
                    <p className="text-sm text-gray-600">{new Date(o.created_at).toLocaleString()}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="font-bold text-lg text-green-600">₹{o.total}</div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${o.status === 'paid' ? 'bg-green-100 text-green-800' :
                        o.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {o.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
