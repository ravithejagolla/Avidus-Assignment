import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Layers,
  Activity,
  Trash2,
  UserX,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  ClipboardCheck,
  Clock,
  Home,
  LogOut,
  ChevronRight,
  Database,
  UserCheck,
  Plus,
  Menu,
  X
} from 'lucide-react';

import TaskAnalytics from '../components/TaskAnalytics';

const AdminDashboard = () => {
  const { user, token, logout, API_URL } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, users, tasks, logs
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // State for sub-sections
  const [analytics, setAnalytics] = useState({ totalUsers: 0, totalTasks: 0, completedTasks: 0, pendingTasks: 0 });
  const [usersList, setUsersList] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  const [logsList, setLogsList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Searches/Filters
  const [userSearch, setUserSearch] = useState('');
  const [taskSearch, setTaskSearch] = useState('');
  const [logFilter, setLogFilter] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, [activeTab, token]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'analytics') {
        const [resAnalytics, resTasks] = await Promise.all([
          fetch(`${API_URL}/admin/analytics`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/tasks?all=true`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const dataAnalytics = await resAnalytics.json();
        const dataTasks = await resTasks.json();

        if (dataAnalytics.success && dataTasks.success) {
          setAnalytics(dataAnalytics.data);
          setTasksList(dataTasks.data);
        } else {
          setError('Failed to load system analytics');
        }
      } else if (activeTab === 'users') {
        const res = await fetch(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setUsersList(data.data);
        else setError(data.error || 'Failed to load users');
      } else if (activeTab === 'tasks') {
        // Admin GET /tasks gets all tasks
        const res = await fetch(`${API_URL}/tasks?all=true`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setTasksList(data.data);
        else setError(data.error || 'Failed to load tasks');
      } else if (activeTab === 'logs') {
        const res = await fetch(`${API_URL}/admin/logs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setLogsList(data.data);
        else setError(data.error || 'Failed to load activity logs');
      }
    } catch (err) {
      setError('Could not connect to database server');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(usersList.map(u => u._id === userId ? data.data : u));
        setSuccess(`User status updated to ${newStatus}`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to update user status');
      }
    } catch (err) {
      setError('Could not connect to database server');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Deleting this user will also delete all their tasks. Are you sure?')) return;
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(usersList.filter(u => u._id !== userId));
        setSuccess('User and their tasks deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('Could not connect to database server');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTasksList(tasksList.filter(t => t._id !== taskId));
        setSuccess('Task deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to delete task');
      }
    } catch (err) {
      setError('Could not connect to database server');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter computations (excluding current admin's own information)
  const filteredUsers = usersList.filter(u =>
    u._id !== user?.id &&
    (u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const filteredTasks = tasksList.filter(t =>
    t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
    (t.user?.name && t.user.name.toLowerCase().includes(taskSearch.toLowerCase()))
  );

  const filteredLogs = logsList.filter(log => {
    if (logFilter === 'ALL') return true;
    return log.action === logFilter;
  });

  return (
    <div className="admin-layout">
      {/* Mobile Top Bar */}
      <div className="mobile-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database size={24} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: '700' }} className="gradient-text">Avidus Admin</span>
        </div>
        <button
          className="sidebar-toggle-btn"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar Backdrop Overlay */}
      <div
        className={`sidebar-overlay ${mobileSidebarOpen ? 'open' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
      />

      {/* Sidebar Navigation */}
      <aside className={`glass-panel admin-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Database size={28} style={{ color: 'var(--color-primary)' }} />
            <div>
              <h2 className="gradient-text" style={{ fontSize: '1.5rem' }}>Avidus</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', tracking: '0.05em', marginTop: '2px' }}>Admin Console</p>
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button
            className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 16px' }}
            onClick={() => {
              setActiveTab('analytics');
              setMobileSidebarOpen(false);
            }}
          >
            <Layers size={18} />
            Overview
          </button>

          <button
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 16px' }}
            onClick={() => {
              setActiveTab('users');
              setMobileSidebarOpen(false);
            }}
          >
            <Users size={18} />
            User Management
          </button>

          <button
            className={`btn ${activeTab === 'tasks' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 16px' }}
            onClick={() => {
              setActiveTab('tasks');
              setMobileSidebarOpen(false);
            }}
          >
            <ClipboardCheck size={18} />
            Task Monitoring
          </button>

          <button
            className={`btn ${activeTab === 'logs' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 16px' }}
            onClick={() => {
              setActiveTab('logs');
              setMobileSidebarOpen(false);
            }}
          >
            <Activity size={18} />
            Activity Logs
          </button>
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
          <button
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 16px' }}
            onClick={() => navigate('/dashboard')}
          >
            <Home size={18} />
            Workspace
          </button>

          <button
            className="btn btn-danger"
            style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 16px' }}
            onClick={logout}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="admin-main">

        {/* Top Header */}
        <div className="admin-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span>Console</span>
              <ChevronRight size={14} />
              <span style={{ color: 'var(--text-main)', textTransform: 'capitalize', fontWeight: '500' }}>{activeTab}</span>
            </div>
            <h1 style={{ fontSize: '2rem', marginTop: '8px', fontFamily: 'var(--font-display)', fontWeight: '700' }}>
              {activeTab === 'analytics' && 'System Analytics'}
              {activeTab === 'users' && 'User Directory'}
              {activeTab === 'tasks' && 'Global Task Inspector'}
              {activeTab === 'logs' && 'Security Audit Logs'}
            </h1>
          </div>

          <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-admin">Administrator</span>
            <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user?.name}</div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger animate-fade-in">
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success animate-fade-in">
            <ClipboardCheck size={18} />
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: 'var(--text-muted)' }}>
            Fetching database statistics...
          </div>
        ) : (
          <div className="animate-fade-in">

            {/* TAB: ANALYTICS OVERVIEW */}
            {activeTab === 'analytics' && (
              <TaskAnalytics tasks={tasksList} isAdmin={true} totalUsers={analytics.totalUsers} />
            )}

            {/* TAB: USER MANAGEMENT */}
            {activeTab === 'users' && (
              <div className="glass-panel users-table-container" style={{ padding: '24px', overflowX: 'auto' }}>
                <div className="admin-search-bar">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{ maxWidth: '360px' }}
                  />
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Showing {filteredUsers.length} of {usersList.length} users
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <th style={{ padding: '12px 16px' }}>NAME</th>
                      <th style={{ padding: '12px 16px' }}>EMAIL</th>
                      <th style={{ padding: '12px 16px' }}>ROLE</th>
                      <th style={{ padding: '12px 16px' }}>STATUS</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No users found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr
                          key={u._id}
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                          className="glass-panel-hover"
                        >
                          <td data-label="NAME" style={{ padding: '16px', fontWeight: '600' }}>{u.name}</td>
                          <td data-label="EMAIL" style={{ padding: '16px', color: 'var(--text-muted)' }}>{u.email}</td>
                          <td data-label="ROLE" style={{ padding: '16px' }}>
                            <span className={`badge ${u.role === 'Admin' ? 'badge-admin' : 'badge-user'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td data-label="STATUS" style={{ padding: '16px' }}>
                            <span className={`badge ${u.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                              {u.status}
                            </span>
                          </td>
                          <td data-label="ACTIONS" style={{ padding: '16px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleToggleUserStatus(u._id, u.status)}
                              disabled={actionLoading || u._id === user?.id}
                              style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', gap: '4px' }}
                              title="Toggle User Active/Inactive"
                            >
                              {u.status === 'Active' ? (
                                <>
                                  <ToggleRight size={16} style={{ color: 'var(--color-completed)' }} />
                                  Active
                                </>
                              ) : (
                                <>
                                  <ToggleLeft size={16} style={{ color: 'var(--color-inactive)' }} />
                                  Inactive
                                </>
                              )}
                            </button>

                            {u.role !== 'Admin' && (
                              <button
                                className="btn btn-danger"
                                onClick={() => handleDeleteUser(u._id)}
                                disabled={actionLoading}
                                style={{ padding: '8px' }}
                                title="Delete User"
                              >
                                <UserX size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: TASK MONITORING */}
            {activeTab === 'tasks' && (
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div className="admin-search-bar">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search tasks by title or creator..."
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    style={{ maxWidth: '360px' }}
                  />
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Showing {filteredTasks.length} of {tasksList.length} tasks
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filteredTasks.length === 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--text-muted)' }}>
                      No tasks found.
                    </div>
                  ) : (
                    filteredTasks.map((t) => (
                      <div
                        key={t._id}
                        className="glass-panel"
                        style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, paddingRight: '16px' }}>
                          <div style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--text-main)' }}>{t.title}</div>
                          {t.description && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t.description}</p>}

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                            <span className={`badge ${t.status === 'Completed' ? 'badge-completed' : 'badge-pending'}`}>
                              {t.status}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>Created by:</span>
                            <span className="badge badge-user" style={{ fontSize: '0.7rem' }}>
                              {t.user?.name || 'Unknown User'}
                            </span>
                          </div>
                        </div>

                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteTask(t._id)}
                          disabled={actionLoading}
                          style={{ padding: '8px', borderRadius: '6px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB: ACTIVITY LOGS */}
            {activeTab === 'logs' && (
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div className="admin-search-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>Filter Action:</span>
                    <select
                      className="form-select"
                      value={logFilter}
                      onChange={(e) => setLogFilter(e.target.value)}
                      style={{ padding: '8px 16px', width: '180px' }}
                    >
                      <option value="ALL">All Activities</option>
                      <option value="LOGIN">Logins</option>
                      <option value="TASK_CREATE">Task Creations</option>
                      <option value="TASK_UPDATE">Task Updates</option>
                      <option value="TASK_DELETE">Task Deletions</option>
                    </select>
                  </div>

                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Showing {filteredLogs.length} of {logsList.length} logs
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '600px', overflowY: 'auto', paddingRight: '4px' }}>
                  {filteredLogs.length === 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--text-muted)' }}>
                      No activity logs recorded.
                    </div>
                  ) : (
                    filteredLogs.map((log) => (
                      <div
                        key={log._id}
                        className="log-item"
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                          <div style={{
                            padding: '10px',
                            borderRadius: '10px',
                            background:
                              log.action === 'LOGIN' ? 'rgba(59, 130, 246, 0.1)' :
                                log.action === 'TASK_CREATE' ? 'rgba(16, 185, 129, 0.1)' :
                                  log.action === 'TASK_UPDATE' ? 'rgba(245, 158, 11, 0.1)' :
                                    'rgba(239, 68, 68, 0.1)',
                            color:
                              log.action === 'LOGIN' ? 'var(--color-secondary)' :
                                log.action === 'TASK_CREATE' ? 'var(--color-completed)' :
                                  log.action === 'TASK_UPDATE' ? 'var(--color-pending)' :
                                    'var(--color-inactive)',
                            display: 'flex'
                          }}>
                            {log.action === 'LOGIN' && <UserCheck size={18} />}
                            {log.action === 'TASK_CREATE' && <Plus size={18} />}
                            {log.action === 'TASK_UPDATE' && <Layers size={18} />}
                            {log.action === 'TASK_DELETE' && <Trash2 size={18} />}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-main)' }}>
                              {log.details}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-dark)' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Triggered by:</span>
                              <span>{log.user?.name || 'System'} ({log.user?.role || 'N/A'})</span>
                            </div>
                          </div>
                        </div>

                        <div className="log-item-time" style={{ color: 'var(--text-dark)', whiteSpace: 'nowrap', textAlign: 'right' }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        )}

      </main>

    </div>
  );
};

export default AdminDashboard;
