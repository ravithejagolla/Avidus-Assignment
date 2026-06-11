import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  Plus, 
  CheckCircle, 
  Circle, 
  Trash2, 
  Briefcase, 
  ShieldAlert, 
  ClipboardCheck, 
  Clock, 
  ListTodo 
} from 'lucide-react';

const Dashboard = () => {
  const { user, token, logout, API_URL } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Load tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [token]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setTasks(data.data);
      } else {
        setError(data.error || 'Failed to fetch tasks');
      }
    } catch (err) {
      setError('Could not connect to database server');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, description })
      });
      const data = await res.json();
      if (data.success) {
        setTasks([data.data, ...tasks]);
        setTitle('');
        setDescription('');
        setSuccess('Task created successfully');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to create task');
      }
    } catch (err) {
      setError('Could not connect to database server');
    }
  };

  const handleToggleStatus = async (taskId, currentStatus) => {
    setError('');
    const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';

    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setTasks(tasks.map(t => t._id === taskId ? data.data : t));
      } else {
        setError(data.error || 'Failed to update task status');
      }
    } catch (err) {
      setError('Could not connect to database server');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setError('');

    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setTasks(tasks.filter(t => t._id !== taskId));
        setSuccess('Task deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to delete task');
      }
    } catch (err) {
      setError('Could not connect to database server');
    }
  };

  const pendingTasksCount = tasks.filter(t => t.status === 'Pending').length;
  const completedTasksCount = tasks.filter(t => t.status === 'Completed').length;

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Header */}
      <header className="glass-panel dashboard-header">
        <div className="header-brand">
          <Briefcase size={28} style={{ color: 'var(--color-primary)' }} />
          <h2 className="gradient-text" style={{ fontSize: '1.75rem' }}>Avidus Workspace</h2>
        </div>
        
        <div className="header-actions">
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{user?.name}</div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px', justifyContent: 'flex-end' }}>
              <span className={`badge ${user?.role === 'Admin' ? 'badge-admin' : 'badge-user'}`}>
                {user?.role}
              </span>
            </div>
          </div>

          {user?.role === 'Admin' && (
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate('/admin')}
              style={{ display: 'flex', gap: '6px', fontSize: '0.875rem', padding: '8px 16px' }}
            >
              <ShieldAlert size={16} style={{ color: 'var(--color-primary)' }} />
              Admin Panel
            </button>
          )}

          <button 
            className="btn btn-danger" 
            onClick={logout}
            style={{ display: 'flex', gap: '6px', fontSize: '0.875rem', padding: '8px 16px' }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }} className="animate-fade-in">
        
        {/* Status Indicators */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--color-primary)' }}>
              <ListTodo size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Tasks</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', fontFamily: 'var(--font-display)', marginTop: '4px' }}>{tasks.length}</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-pending)' }}>
              <Clock size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Pending</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', fontFamily: 'var(--font-display)', marginTop: '4px' }}>{pendingTasksCount}</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-completed)' }}>
              <ClipboardCheck size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Completed</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', fontFamily: 'var(--font-display)', marginTop: '4px' }}>{completedTasksCount}</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger">
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <ClipboardCheck size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          
          {/* Create Task Form */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} style={{ color: 'var(--color-primary)' }} />
              Create New Task
            </h3>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Update user status endpoint"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Task Description</label>
                <textarea
                  className="form-input"
                  placeholder="Provide additional details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Plus size={18} />
                Create Task
              </button>
            </form>
          </div>

          {/* Task List */}
          <div className="glass-panel" style={{ padding: '28px', minHeight: '380px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', color: 'var(--text-main)' }}>
              My Tasks
            </h3>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--text-muted)' }}>
                Loading tasks...
              </div>
            ) : tasks.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--text-muted)' }}>
                <ListTodo size={48} style={{ strokeWidth: '1.2', marginBottom: '12px', color: 'var(--text-dark)' }} />
                <div>No tasks found. Create one to get started!</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {tasks.map((task) => (
                  <div 
                    key={task._id} 
                    className="glass-panel glass-panel-hover" 
                    style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, paddingRight: '16px' }}>
                      <button 
                        onClick={() => handleToggleStatus(task._id, task.status)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', color: task.status === 'Completed' ? 'var(--color-completed)' : 'var(--text-dark)', marginTop: '2px', display: 'flex' }}
                      >
                        {task.status === 'Completed' ? (
                          <CheckCircle size={20} />
                        ) : (
                          <Circle size={20} />
                        )}
                      </button>
                      <div>
                        <div style={{ 
                          fontWeight: '600', 
                          fontSize: '1rem',
                          textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                          color: task.status === 'Completed' ? 'var(--text-muted)' : 'var(--text-main)'
                        }}>
                          {task.title}
                        </div>
                        {task.description && (
                          <p style={{ 
                            fontSize: '0.875rem', 
                            color: 'var(--text-dark)', 
                            marginTop: '4px',
                            lineHeight: '1.4',
                            textDecoration: task.status === 'Completed' ? 'line-through' : 'none'
                          }}>
                            {task.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <span className={`badge ${task.status === 'Completed' ? 'badge-completed' : 'badge-pending'}`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleDeleteTask(task._id)}
                      style={{ padding: '8px', borderRadius: '6px' }}
                      title="Delete Task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
