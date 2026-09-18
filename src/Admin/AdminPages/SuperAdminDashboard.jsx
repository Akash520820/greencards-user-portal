import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import {
  FiUsers,
  FiShield,
  FiPackage,
  FiGrid,
  FiShoppingBag,
  FiRotateCcw,
  FiDollarSign,
  FiAlertTriangle,
  FiUserCheck,
  FiUserX,
  FiClock,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import * as adminApi from '../../api/admin.api';
import * as staffApi from '../../api/staff.api';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ALL_PERMISSIONS } from '../../constants/permissions';
import './SuperAdminDashboard.css';

const PAGE_SIZE = 10;
const TABS = ['Overview', 'Users', 'Staff', 'Access Requests', 'Audit Log'];

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('Overview');

  // ---- Overview ----
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      setDashboardLoading(true);
      const res = await adminApi.getFullDashboard();
      setDashboard(res.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load dashboard');
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  // ---- Users (customers & sellers only — staff moved to its own tab) ----
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [usersLoading, setUsersLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('All');
  const [actioningId, setActioningId] = useState(null);

  const loadUsers = useCallback(async (page = 1) => {
    try {
      setUsersLoading(true);
      const res = await adminApi.getAllUsers({ page, limit: PAGE_SIZE });
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error(err.message || 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const handleToggleCustomerActive = async (userId, name, isActive) => {
    setActioningId(userId);
    try {
      await adminApi.toggleCustomerActive(userId);
      toast.success(`${name} ${isActive ? 'deactivated' : 'activated'}`);
      loadUsers(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to update account status');
    } finally {
      setActioningId(null);
    }
  };

  const filteredUsers = roleFilter === 'All' ? users : users.filter((u) => u.role === roleFilter);

  // ---- Staff ----
  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [editingPermsFor, setEditingPermsFor] = useState(null);
  const [draftPermissions, setDraftPermissions] = useState([]);

  const loadStaff = useCallback(async () => {
    try {
      setStaffLoading(true);
      const res = await staffApi.getAllStaff();
      setStaff(res.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load staff');
    } finally {
      setStaffLoading(false);
    }
  }, []);

  const startEditingPermissions = (member) => {
    setEditingPermsFor(member._id);
    setDraftPermissions(member.permissions || []);
  };

  const togglePermission = (perm) => {
    setDraftPermissions((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]));
  };

  const savePermissions = async (staffId) => {
    setActioningId(staffId);
    try {
      await staffApi.updateStaffPermissions(staffId, draftPermissions);
      toast.success('Permissions updated');
      setEditingPermsFor(null);
      loadStaff();
    } catch (err) {
      toast.error(err.message || 'Failed to update permissions');
    } finally {
      setActioningId(null);
    }
  };

  const handleToggleStaffActive = async (staffId, name, isActive) => {
    setActioningId(staffId);
    try {
      await staffApi.toggleStaffActive(staffId);
      toast.success(`${name} ${isActive ? 'deactivated' : 'activated'}`);
      loadStaff();
    } catch (err) {
      toast.error(err.message || 'Failed to update staff status');
    } finally {
      setActioningId(null);
    }
  };

  // ---- Access Requests ----
  const [accessRequests, setAccessRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsFilter, setRequestsFilter] = useState('pending');
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    type: 'create_staff',
    targetEmail: '',
    targetFullName: '',
    requestedRole: 'admin',
    reason: '',
  });
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [reviewingId, setReviewingId] = useState(null);

  const loadAccessRequests = useCallback(async (status) => {
    try {
      setRequestsLoading(true);
      const res = await staffApi.getAccessRequests(status);
      setAccessRequests(res.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load access requests');
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setSubmittingRequest(true);
    try {
      await staffApi.createAccessRequest(newRequest);
      toast.success('Access request submitted');
      setShowNewRequestForm(false);
      setNewRequest({ type: 'create_staff', targetEmail: '', targetFullName: '', requestedRole: 'admin', reason: '' });
      loadAccessRequests(requestsFilter);
    } catch (err) {
      toast.error(err.message || 'Failed to submit request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleReviewRequest = async (requestId, decision) => {
    setReviewingId(requestId);
    try {
      const res = await staffApi.reviewAccessRequest(requestId, decision);
      toast.success(res.message || `Request ${decision}`);
      if (res.data?.generatedTempPassword) {
        toast.success(
          `Temp password (save now, shown once): ${res.data.generatedTempPassword}`,
          { duration: 15000 }
        );
      }
      loadAccessRequests(requestsFilter);
      loadStaff();
    } catch (err) {
      toast.error(err.message || 'Failed to review request');
    } finally {
      setReviewingId(null);
    }
  };

  // ---- Audit Log ----
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditPagination, setAuditPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [auditLoading, setAuditLoading] = useState(true);

  const loadAuditLogs = useCallback(async (page = 1) => {
    try {
      setAuditLoading(true);
      const res = await staffApi.getAuditLogs({ page, limit: PAGE_SIZE });
      setAuditLogs(res.data.logs);
      setAuditPagination(res.data.pagination);
    } catch (err) {
      toast.error(err.message || 'Failed to load audit logs');
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    loadUsers(1);
  }, [loadDashboard, loadUsers]);

  useEffect(() => {
    if (activeTab === 'Staff') loadStaff();
    if (activeTab === 'Access Requests') loadAccessRequests(requestsFilter);
    if (activeTab === 'Audit Log') loadAuditLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'Access Requests') loadAccessRequests(requestsFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestsFilter]);

  const statusLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1);
  const formatDate = (d) => new Date(d).toLocaleString();

  if (dashboardLoading) {
    return (
      <div className="superadmin-loading">
        <div className="spinner"></div>
        <p>Loading platform overview...</p>
      </div>
    );
  }

  return (
    <div className="superadmin-page">
      <Toaster position="top-center" />

      <div className="superadmin-header">
        <div className="superadmin-header-icon"><FiShield /></div>
        <div>
          <h1 className="superadmin-title">Super Admin</h1>
          <p className="superadmin-subtitle">
            Full platform control — {admin?.fullName}, you decide who gets staff access.
          </p>
        </div>
      </div>

      <div className="superadmin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`superadmin-tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <>
          <div className="superadmin-stats-grid">
            <div 
              className="superadmin-stat-card clickable-superadmin-card"
              onClick={() => setActiveTab('Users')}
              style={{ cursor: 'pointer' }}
              title="Click to manage Users"
            >
              <div className="superadmin-stat-icon users"><FiUsers /></div>
              <div><h3>{dashboard.totalUsers}</h3><p>Customers</p></div>
            </div>
            <div 
              className="superadmin-stat-card clickable-superadmin-card"
              onClick={() => setActiveTab('Staff')}
              style={{ cursor: 'pointer' }}
              title="Click to manage Staff"
            >
              <div className="superadmin-stat-icon admins"><FiShield /></div>
              <div><h3>{dashboard.totalAdmins + dashboard.totalSuperAdmins}</h3><p>Admins & Super Admins</p></div>
            </div>
            <div 
              className="superadmin-stat-card clickable-superadmin-card"
              onClick={() => navigate('/admin/inventory')}
              style={{ cursor: 'pointer' }}
              title="Click to view Inventory"
            >
              <div className="superadmin-stat-icon products"><FiPackage /></div>
              <div><h3>{dashboard.totalProducts}</h3><p>Products</p></div>
            </div>
            <div 
              className="superadmin-stat-card clickable-superadmin-card"
              onClick={() => navigate('/admin/site-content')}
              style={{ cursor: 'pointer' }}
              title="Click to view Categories"
            >
              <div className="superadmin-stat-icon categories"><FiGrid /></div>
              <div><h3>{dashboard.totalCategories}</h3><p>Categories</p></div>
            </div>
            <div 
              className="superadmin-stat-card clickable-superadmin-card"
              onClick={() => navigate('/admin/orders')}
              style={{ cursor: 'pointer' }}
              title="Click to view Orders"
            >
              <div className="superadmin-stat-icon orders"><FiShoppingBag /></div>
              <div><h3>{dashboard.totalOrders}</h3><p>Total Orders</p></div>
            </div>
            <div 
              className="superadmin-stat-card clickable-superadmin-card"
              onClick={() => navigate('/admin/reviews')}
              style={{ cursor: 'pointer' }}
              title="Click to view Returns & Reviews"
            >
              <div className="superadmin-stat-icon returns"><FiRotateCcw /></div>
              <div><h3>{dashboard.totalReturns}</h3><p>Total Returns</p></div>
            </div>
            <div 
              className="superadmin-stat-card clickable-superadmin-card"
              onClick={() => navigate('/admin/analytics')}
              style={{ cursor: 'pointer' }}
              title="Click to view Revenue Analytics"
            >
              <div className="superadmin-stat-icon revenue"><FiDollarSign /></div>
              <div><h3>₹{dashboard.totalRevenue.toLocaleString()}</h3><p>Revenue (paid orders)</p></div>
            </div>
            <div 
              className="superadmin-stat-card clickable-superadmin-card"
              onClick={() => navigate('/admin/reviews')}
              style={{ cursor: 'pointer' }}
              title="Click to view Pending Reviews"
            >
              <div className="superadmin-stat-icon pending"><FiClock /></div>
              <div><h3>{dashboard.pendingReturnsCount}</h3><p>Returns Awaiting Review</p></div>
            </div>
          </div>

          <div className="superadmin-breakdown-row">
            <div className="superadmin-breakdown-card">
              <h3 className="superadmin-breakdown-title">Orders by Status</h3>
              <div className="superadmin-breakdown-list">
                {dashboard.ordersByStatus.length === 0 && <p className="superadmin-empty-note">No orders yet</p>}
                {dashboard.ordersByStatus.map((item) => (
                  <div key={item._id} className="superadmin-breakdown-item">
                    <span className={`superadmin-status-dot status-${item._id}`}></span>
                    <span className="superadmin-breakdown-label">{statusLabel(item._id)}</span>
                    <span className="superadmin-breakdown-count">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="superadmin-breakdown-card">
              <h3 className="superadmin-breakdown-title">Returns by Status</h3>
              <div className="superadmin-breakdown-list">
                {dashboard.returnsByStatus.length === 0 && <p className="superadmin-empty-note">No returns yet</p>}
                {dashboard.returnsByStatus.map((item) => (
                  <div key={item._id} className="superadmin-breakdown-item">
                    <span className={`superadmin-status-dot status-${item._id}`}></span>
                    <span className="superadmin-breakdown-label">{statusLabel(item._id)}</span>
                    <span className="superadmin-breakdown-count">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {dashboard.lowStockProducts.length > 0 && (
            <div className="superadmin-lowstock-banner">
              <FiAlertTriangle />
              <span>
                {dashboard.lowStockProducts.length} product{dashboard.lowStockProducts.length > 1 ? 's' : ''} running low on stock:{' '}
                {dashboard.lowStockProducts.slice(0, 5).map((p) => p.name).join(', ')}
                {dashboard.lowStockProducts.length > 5 ? ', ...' : ''}
              </span>
            </div>
          )}
        </>
      )}

      {activeTab === 'Users' && (
        <div className="superadmin-users-section">
          <div className="superadmin-users-header">
            <h2 className="section-title">Customers &amp; Sellers</h2>
            <div className="superadmin-role-filter">
              {['All', 'user', 'seller'].map((r) => (
                <button
                  key={r}
                  className={`superadmin-filter-btn ${roleFilter === r ? 'active' : ''}`}
                  onClick={() => setRoleFilter(r)}
                >
                  {r === 'All' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {usersLoading ? (
            <div className="superadmin-loading" style={{ minHeight: '200px' }}><div className="spinner"></div></div>
          ) : (
            <>
              <div className="superadmin-users-table-wrapper">
                <table className="superadmin-users-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u._id}>
                        <td>{u.fullName || u.userName}</td>
                        <td>{u.email}</td>
                        <td><span className={`superadmin-role-badge role-${u.role}`}>{u.role}</span></td>
                        <td>
                          <span className={`superadmin-active-badge ${u.isActive ? 'active' : 'inactive'}`}>
                            {u.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`superadmin-action-btn ${u.isActive ? 'deactivate' : 'activate'}`}
                            disabled={actioningId === u._id}
                            onClick={() => handleToggleCustomerActive(u._id, u.fullName || u.userName, u.isActive)}
                          >
                            {u.isActive ? <FiUserX /> : <FiUserCheck />}
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="superadmin-pagination">
                <button disabled={pagination.page <= 1} onClick={() => loadUsers(pagination.page - 1)}>Previous</button>
                <span>Page {pagination.page} of {pagination.totalPages} · {pagination.total} total users</span>
                <button disabled={pagination.page >= pagination.totalPages} onClick={() => loadUsers(pagination.page + 1)}>Next</button>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'Staff' && (
        <div className="superadmin-users-section">
          <h2 className="section-title">Staff Accounts</h2>
          <p className="superadmin-empty-note" style={{ marginBottom: '1rem' }}>
            New staff can only be created via an approved Access Request — see that tab. Superadmin
            already has every permission implicitly and can't be edited here.
          </p>

          {staffLoading ? (
            <div className="superadmin-loading" style={{ minHeight: '200px' }}><div className="spinner"></div></div>
          ) : (
            <div className="superadmin-users-table-wrapper">
              <table className="superadmin-users-table">
                <thead>
                  <tr><th>Employee ID</th><th>Name</th><th>Email</th><th>Role</th><th>Permissions</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s._id}>
                      <td>{s.employeeId}</td>
                      <td>{s.fullName}</td>
                      <td>{s.companyEmail}</td>
                      <td><span className={`superadmin-role-badge role-${s.role}`}>{s.role}</span></td>
                      <td style={{ minWidth: '260px' }}>
                        {s.role === 'superadmin' ? (
                          <span className="superadmin-protected-note">All permissions</span>
                        ) : editingPermsFor === s._id ? (
                          <div className="superadmin-perm-editor">
                            {ALL_PERMISSIONS.map((perm) => (
                              <label key={perm} className="superadmin-perm-checkbox">
                                <input
                                  type="checkbox"
                                  checked={draftPermissions.includes(perm)}
                                  onChange={() => togglePermission(perm)}
                                />
                                {perm}
                              </label>
                            ))}
                            <div className="superadmin-row-actions" style={{ marginTop: '0.5rem' }}>
                              <button
                                className="superadmin-action-btn activate"
                                disabled={actioningId === s._id}
                                onClick={() => savePermissions(s._id)}
                              >
                                <FiCheck /> Save
                              </button>
                              <button className="superadmin-action-btn deactivate" onClick={() => setEditingPermsFor(null)}>
                                <FiX /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ marginBottom: '0.4rem', fontSize: '0.85rem', color: '#4a5568' }}>
                              {s.permissions?.length > 0 ? s.permissions.join(', ') : 'No permissions granted'}
                            </div>
                            <button className="superadmin-action-btn promote" onClick={() => startEditingPermissions(s)}>
                              Edit
                            </button>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`superadmin-active-badge ${s.isActive ? 'active' : 'inactive'}`}>
                          {s.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td>
                        {s._id === admin?._id ? (
                          <span className="superadmin-protected-note">This is you</span>
                        ) : (
                          <button
                            className={`superadmin-action-btn ${s.isActive ? 'deactivate' : 'activate'}`}
                            disabled={actioningId === s._id}
                            onClick={() => handleToggleStaffActive(s._id, s.fullName, s.isActive)}
                          >
                            {s.isActive ? <FiUserX /> : <FiUserCheck />}
                            {s.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Access Requests' && (
        <div className="superadmin-users-section">
          <div className="superadmin-users-header">
            <h2 className="section-title">Access Requests</h2>
            <div className="superadmin-role-filter">
              {['pending', 'approved', 'rejected', 'all'].map((s) => (
                <button
                  key={s}
                  className={`superadmin-filter-btn ${requestsFilter === s ? 'active' : ''}`}
                  onClick={() => setRequestsFilter(s)}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <button className="superadmin-action-btn promote" onClick={() => setShowNewRequestForm((v) => !v)}>
              {showNewRequestForm ? 'Cancel' : '+ New Request'}
            </button>
          </div>

          {showNewRequestForm && (
            <form className="superadmin-new-request-form" onSubmit={handleCreateRequest}>
              <select
                value={newRequest.type}
                onChange={(e) => setNewRequest((p) => ({ ...p, type: e.target.value }))}
              >
                <option value="create_staff">Create new staff account</option>
              </select>
              <input
                type="text"
                placeholder="Full name"
                value={newRequest.targetFullName}
                onChange={(e) => setNewRequest((p) => ({ ...p, targetFullName: e.target.value }))}
                required
              />
              <input
                type="email"
                placeholder="Company email"
                value={newRequest.targetEmail}
                onChange={(e) => setNewRequest((p) => ({ ...p, targetEmail: e.target.value }))}
                required
              />
              <select
                value={newRequest.requestedRole}
                onChange={(e) => setNewRequest((p) => ({ ...p, requestedRole: e.target.value }))}
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin (requires 2 approvals)</option>
              </select>
              <textarea
                placeholder="Reason for this request"
                value={newRequest.reason}
                onChange={(e) => setNewRequest((p) => ({ ...p, reason: e.target.value }))}
                required
              />
              <button type="submit" className="superadmin-action-btn activate" disabled={submittingRequest}>
                {submittingRequest ? 'Submitting…' : 'Submit Request'}
              </button>
            </form>
          )}

          {requestsLoading ? (
            <div className="superadmin-loading" style={{ minHeight: '200px' }}><div className="spinner"></div></div>
          ) : accessRequests.length === 0 ? (
            <p className="superadmin-empty-note">No {requestsFilter !== 'all' ? requestsFilter : ''} requests</p>
          ) : (
            <div className="superadmin-users-table-wrapper">
              <table className="superadmin-users-table">
                <thead>
                  <tr><th>Target</th><th>Role</th><th>Reason</th><th>Requested By</th><th>Approvals</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {accessRequests.map((r) => (
                    <tr key={r._id}>
                      <td>{r.targetFullName} <br /><span style={{ fontSize: '0.8rem', color: '#718096' }}>{r.targetEmail}</span></td>
                      <td><span className={`superadmin-role-badge role-${r.requestedRole}`}>{r.requestedRole}</span></td>
                      <td style={{ maxWidth: '220px' }}>{r.reason}</td>
                      <td>{r.requestedBy?.fullName || '—'}</td>
                      <td>{r.approvals?.filter((a) => a.decision === 'approved').length || 0} / {r.requiredApprovals}</td>
                      <td><span className={`superadmin-active-badge ${r.status === 'approved' ? 'active' : r.status === 'rejected' ? 'inactive' : ''}`}>{statusLabel(r.status)}</span></td>
                      <td>
                        {r.status === 'pending' && r.requestedBy?._id !== admin?._id ? (
                          <div className="superadmin-row-actions">
                            <button
                              className="superadmin-action-btn activate"
                              disabled={reviewingId === r._id}
                              onClick={() => handleReviewRequest(r._id, 'approved')}
                            >
                              <FiCheck /> Approve
                            </button>
                            <button
                              className="superadmin-action-btn deactivate"
                              disabled={reviewingId === r._id}
                              onClick={() => handleReviewRequest(r._id, 'rejected')}
                            >
                              <FiX /> Reject
                            </button>
                          </div>
                        ) : r.status === 'pending' ? (
                          <span className="superadmin-protected-note">Your own request</span>
                        ) : (
                          <span className="superadmin-empty-note">{formatDate(r.resolvedAt)}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Audit Log' && (
        <div className="superadmin-users-section">
          <h2 className="section-title">Audit Log</h2>
          {auditLoading ? (
            <div className="superadmin-loading" style={{ minHeight: '200px' }}><div className="spinner"></div></div>
          ) : (
            <>
              <div className="superadmin-users-table-wrapper">
                <table className="superadmin-users-table">
                  <thead>
                    <tr><th>When</th><th>Actor</th><th>Action</th><th>Target</th><th>IP</th></tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log._id}>
                        <td>{formatDate(log.createdAt)}</td>
                        <td>{log.actorEmail}</td>
                        <td><code>{log.action}</code></td>
                        <td>{log.targetType || '—'}</td>
                        <td>{log.ipAddress || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="superadmin-pagination">
                <button disabled={auditPagination.page <= 1} onClick={() => loadAuditLogs(auditPagination.page - 1)}>Previous</button>
                <span>Page {auditPagination.page} of {auditPagination.totalPages} · {auditPagination.total} total entries</span>
                <button disabled={auditPagination.page >= auditPagination.totalPages} onClick={() => loadAuditLogs(auditPagination.page + 1)}>Next</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
