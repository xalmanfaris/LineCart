import React, { useState, useEffect } from 'react';
import { getAllUsers, getAdminOrders, updateOrderStatus } from '../../api';
import './OrdersAdmin.css';


const OrdersAdmin = () => {
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [allUsers, allOrders] = await Promise.all([
                getAllUsers(),
                getAdminOrders()
            ]);

            setUsers(allUsers || []);

            if (allOrders && Array.isArray(allOrders)) {
                const userMap = (allUsers || []).reduce((acc, u) => {
                    acc[u.id] = u;
                    return acc;
                }, {});

                const mappedOrders = allOrders.map(o => ({
                    id: o.Id || o.id,
                    total: o.TotalAmount || o.totalAmount || o.total,
                    status: o.Status || o.status,
                    created_at: o.CreatedAt || o.createdAt || o.created_at,
                    user: userMap[o.UserId || o.userId] || { name: 'Unknown', email: 'N/A' },
                    items: o.Items || o.items || [],
                    address: {
                        name: o.ShippingName || o.shippingName,
                        street: o.ShippingLine1 || o.shippingLine1,
                        city: o.ShippingCity || o.shippingCity,
                        zipCode: o.ShippingPostalCode || o.shippingPostalCode,
                        country: o.ShippingCountry || o.shippingCountry,
                        phone: o.Phone || o.phone
                    }
                }));
                setOrders(mappedOrders);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const updated = await updateOrderStatus(orderId, newStatus);
            if (updated) {
                const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
                setOrders(updatedOrders);
                if (selectedOrder && selectedOrder.order.id === orderId) {
                    setSelectedOrder({ ...selectedOrder, order: { ...selectedOrder.order, status: newStatus } });
                }
            }
        } catch (error) {
            console.error('Failed to update order status:', error);
            alert('Failed to update status. Check console for details.');
        }
    };

    const getFilteredOrders = () => {
        let filtered = [...orders];


        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.id.toString().includes(searchTerm) ||
                order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }


        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => (order.status || 'placed') === statusFilter);
        }


        filtered.sort((a, b) => {
            let aValue, bValue;
            switch (sortBy) {
                case 'date':
                    aValue = new Date(a.created_at);
                    bValue = new Date(b.created_at);
                    break;
                case 'total':
                    aValue = a.total;
                    bValue = b.total;
                    break;
                case 'id':
                    aValue = a.id;
                    bValue = b.id;
                    break;
                default:
                    aValue = new Date(a.created_at);
                    bValue = new Date(b.created_at);
            }
            return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        });

        return filtered;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }) + ' (IST)';
    };



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
            <div className="dashboard-section">
                <div className="section-header">
                    <h3 className="section-title">Manage Orders</h3>
                </div>


                <div className="orders-controls">
                    <div className="search-filter-section">
                        <div className="search-input-wrapper">
                            <input
                                type="text"
                                placeholder="Search orders by ID, customer name, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="filter-controls">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Orders</option>
                                <option value="pending">Pending</option>
                                <option value="placed">Placed</option>
                                <option value="paid">Paid</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="filter-select"
                            >
                                <option value="date">Sort by Date</option>
                                <option value="total">Sort by Total</option>
                                <option value="id">Sort by ID</option>
                            </select>

                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="sort-toggle"
                                data-sort={`${sortBy} ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
                            >
                                {sortOrder === 'asc' ? '↑' : '↓'}
                            </button>
                        </div>
                    </div>

                    <div className="orders-stats">
                        <div className="stat-item">
                            <span className="stat-label">Total Orders:</span>
                            <span className="stat-value">{orders.length}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Filtered:</span>
                            <span className="stat-value">{getFilteredOrders().length}</span>
                        </div>
                    </div>
                </div>

                <div className="orders-container">
                    <div className="orders-list">
                        {getFilteredOrders().length === 0 ? (
                            <div className="orders-empty-state">
                                <div className="empty-icon">📦</div>
                                <div className="empty-title">No orders found</div>
                                <div className="empty-subtitle">
                                    {searchTerm || statusFilter !== 'all'
                                        ? 'Try adjusting your search or filters'
                                        : 'Orders will appear here once customers place them'
                                    }
                                </div>
                            </div>
                        ) : (
                            getFilteredOrders().map(order => {
                                const addrPreview = (order.address && order.address.street) || 'No address';
                                const isSelected = selectedOrder && selectedOrder.order && selectedOrder.order.id === order.id;
                                return (
                                    <div
                                        key={order.id}
                                        className={`order-card ${isSelected ? 'selected' : ''}`}
                                        onClick={() => setSelectedOrder({ order, user: order.user })}
                                        onDoubleClick={() => setSelectedOrder({ order, user: order.user })}
                                    >
                                        <div className="order-header">
                                            <div className="order-id">
                                                <span>#{order.id}</span>
                                                <span className={`order-status order-status-${order.status || 'placed'}`}>
                                                    {order.status || 'placed'}
                                                </span>
                                            </div>
                                            <div className="order-customer-name">
                                                {order.user.name}
                                            </div>
                                        </div>
                                        <div className="order-meta">
                                            <div className="order-date">{formatDate(order.created_at)}</div>
                                            <div className="order-address">{addrPreview}</div>
                                            <div className="order-customer">{order.user.email}</div>
                                        </div>
                                        <div className="order-total">
                                            <div className="order-total-amount">₹{order.total}</div>
                                            <div className="order-total-label">Total</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="order-details-panel">
                        {selectedOrder ? (
                            <div className="admin-card">
                                <div className="admin-card-header">
                                    <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        Order Details
                                        <select
                                            value={selectedOrder.order.status || 'placed'}
                                            onChange={(e) => handleStatusChange(selectedOrder.order.id, e.target.value)}
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--border)',
                                                fontSize: '14px',
                                                background: 'white',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                            className={`badge status-${selectedOrder.order.status || 'placed'}`}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="placed">Placed</option>
                                            <option value="paid">Paid</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </h3>
                                    <span style={{ color: 'var(--muted)', fontSize: 14 }}>{formatDate(selectedOrder.order.created_at)}</span>
                                </div>

                                <div style={{ marginBottom: 24 }}>
                                    <h4 style={{ marginBottom: 12, color: 'var(--accent-600)' }}>Customer Information</h4>
                                    <div style={{ display: 'grid', gap: 8 }}>
                                        <p style={{ margin: 0 }}><strong>Name:</strong> {selectedOrder.user.name}</p>
                                        <p style={{ margin: 0 }}><strong>Email:</strong> {selectedOrder.user.email}</p>
                                        {selectedOrder.order.address?.phone && <p style={{ margin: 0 }}><strong>Phone:</strong> {selectedOrder.order.address.phone}</p>}
                                    </div>
                                </div>

                                <div style={{ marginBottom: 24 }}>
                                    <h4 style={{ marginBottom: 12, color: 'var(--accent-600)' }}>Shipping Address</h4>
                                    {(() => {
                                        const addr = selectedOrder.order.address;
                                        return addr && addr.street ? (
                                            <div style={{ display: 'grid', gap: 4 }}>
                                                <p style={{ margin: 0 }}>{addr.name || selectedOrder.user.name}</p>
                                                <p style={{ margin: 0 }}>{addr.street}</p>
                                                <p style={{ margin: 0 }}>{addr.city}{addr.zipCode ? `, ${addr.zipCode}` : ''}</p>
                                                <p style={{ margin: 0 }}>{addr.country}</p>
                                            </div>
                                        ) : (
                                            <p style={{ color: 'var(--muted)', margin: 0 }}>No shipping address available</p>
                                        );
                                    })()}
                                </div>

                                <div style={{ marginBottom: 24 }}>
                                    <h4 style={{ marginBottom: 12, color: 'var(--accent-600)' }}>Items</h4>
                                    <div className="admin-table">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th>Quantity</th>
                                                    <th>Price</th>
                                                    <th>Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedOrder.order.items.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.name || `Product #${item.productId}`}</td>
                                                        <td>{item.quantity}</td>
                                                        <td>₹{item.price}</td>
                                                        <td>₹{item.price * item.quantity}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid rgba(11,17,28,0.08)', paddingTop: 16 }}>
                                    <h4 style={{ margin: 0, textAlign: 'right', color: 'var(--accent-600)' }}>
                                        Total Amount: ₹{selectedOrder.order.total}
                                    </h4>
                                </div>
                            </div>
                        ) : (
                            <div className="order-details-empty">
                                <div>
                                    <div className="order-details-empty-icon">📋</div>
                                    <div className="order-details-empty-text">Select an order to view details</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>



            </div>
        </div>
    );
};

export default OrdersAdmin;
