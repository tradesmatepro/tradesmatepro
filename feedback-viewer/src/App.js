import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

// Initialize Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

function App() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, today, week, month
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [stats, setStats] = useState({ total: 0, today: 0, week: 0, unread: 0 });

  useEffect(() => {
    loadFeedback();
    // Set up real-time subscription
    const subscription = supabase
      .channel('beta_feedback_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'beta_feedback' },
        (payload) => {
          console.log('New feedback received!', payload);
          loadFeedback(); // Reload when new feedback arrives
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      
      // Load all feedback ordered by newest first
      const { data, error } = await supabase
        .from('beta_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFeedback(data || []);
      
      // Calculate stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const todayCount = data.filter(f => new Date(f.created_at) >= today).length;
      const weekCount = data.filter(f => new Date(f.created_at) >= weekAgo).length;

      setStats({
        total: data.length,
        today: todayCount,
        week: weekCount,
        unread: data.length // All are "unread" for now
      });

    } catch (error) {
      console.error('Error loading feedback:', error);
      alert('Failed to load feedback: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredFeedback = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (filter) {
      case 'today':
        return feedback.filter(f => new Date(f.created_at) >= today);
      case 'week':
        return feedback.filter(f => new Date(f.created_at) >= weekAgo);
      case 'month':
        return feedback.filter(f => new Date(f.created_at) >= monthAgo);
      default:
        return feedback;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const deleteFeedback = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    
    try {
      const { error } = await supabase
        .from('beta_feedback')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSelectedFeedback(null);
      loadFeedback();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Failed to delete: ' + error.message);
    }
  };

  const filteredFeedback = getFilteredFeedback();

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div>
            <h1 className="title">💬 Beta Feedback Viewer</h1>
            <p className="subtitle">TradeMate Pro - App Owner Dashboard</p>
          </div>
          <button onClick={loadFeedback} className="refresh-btn" disabled={loading}>
            {loading ? '⏳ Loading...' : '🔄 Refresh'}
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Feedback</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.today}</div>
          <div className="stat-label">Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.week}</div>
          <div className="stat-label">This Week</div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-value">{stats.unread}</div>
          <div className="stat-label">Unread</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({feedback.length})
        </button>
        <button 
          className={`tab ${filter === 'today' ? 'active' : ''}`}
          onClick={() => setFilter('today')}
        >
          Today ({stats.today})
        </button>
        <button 
          className={`tab ${filter === 'week' ? 'active' : ''}`}
          onClick={() => setFilter('week')}
        >
          This Week ({stats.week})
        </button>
        <button 
          className={`tab ${filter === 'month' ? 'active' : ''}`}
          onClick={() => setFilter('month')}
        >
          This Month
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Feedback List */}
        <div className="feedback-list">
          {loading ? (
            <div className="loading">Loading feedback...</div>
          ) : filteredFeedback.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No feedback yet</h3>
              <p>Feedback from beta testers will appear here</p>
            </div>
          ) : (
            filteredFeedback.map((item) => (
              <div
                key={item.id}
                className={`feedback-item ${selectedFeedback?.id === item.id ? 'selected' : ''}`}
                onClick={() => setSelectedFeedback(item)}
              >
                <div className="feedback-header">
                  <span className="feedback-page">{item.page_path || 'Unknown Page'}</span>
                  <span className="feedback-time">{formatDate(item.created_at)}</span>
                </div>
                <div className="feedback-preview">
                  {item.message.substring(0, 100)}
                  {item.message.length > 100 ? '...' : ''}
                </div>
                {item.company_id && (
                  <div className="feedback-meta">
                    Company ID: {item.company_id.substring(0, 8)}...
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Feedback Detail */}
        <div className="feedback-detail">
          {selectedFeedback ? (
            <>
              <div className="detail-header">
                <h2>Feedback Details</h2>
                <button 
                  onClick={() => deleteFeedback(selectedFeedback.id)}
                  className="delete-btn"
                >
                  🗑️ Delete
                </button>
              </div>

              <div className="detail-content">
                <div className="detail-section">
                  <label>Page</label>
                  <div className="detail-value">{selectedFeedback.page_path || 'N/A'}</div>
                </div>

                <div className="detail-section">
                  <label>Submitted</label>
                  <div className="detail-value">
                    {new Date(selectedFeedback.created_at).toLocaleString('en-US', {
                      dateStyle: 'full',
                      timeStyle: 'short'
                    })}
                  </div>
                </div>

                <div className="detail-section">
                  <label>Message</label>
                  <div className="detail-message">{selectedFeedback.message}</div>
                </div>

                {selectedFeedback.company_id && (
                  <div className="detail-section">
                    <label>Company ID</label>
                    <div className="detail-value mono">{selectedFeedback.company_id}</div>
                  </div>
                )}

                {selectedFeedback.user_id && (
                  <div className="detail-section">
                    <label>User ID</label>
                    <div className="detail-value mono">{selectedFeedback.user_id}</div>
                  </div>
                )}

                {selectedFeedback.user_agent && (
                  <div className="detail-section">
                    <label>Browser</label>
                    <div className="detail-value small">{selectedFeedback.user_agent}</div>
                  </div>
                )}

                {selectedFeedback.metadata && (
                  <div className="detail-section">
                    <label>Metadata</label>
                    <pre className="detail-json">
                      {JSON.stringify(selectedFeedback.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="detail-empty">
              <div className="detail-empty-icon">👈</div>
              <h3>Select feedback to view details</h3>
              <p>Click on any feedback item from the list</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

