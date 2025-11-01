import React, { useState, useEffect, useRef } from 'react';
import { BellIcon, XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useUser } from '../contexts/UserContext';
import notificationsService from '../services/NotificationsService';
import { useNavigate } from 'react-router-dom';
import { isAdmin } from '../utils/roleUtils';
import { getSupabaseClient } from '../utils/supabaseClient';


const POLL_MS = 60000; // 60s

const NotificationCenter = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterMode, setFilterMode] = useState('all'); // all | unread | 24h | 7d
  const pollRef = useRef(null);

  const load = async () => {
    if (!user?.company_id) return;
    try {
      const data = await notificationsService.getNotifications(user.company_id, user?.id, { limit: 20 });
      setNotifications(data.map(n => ({
        ...n,
        read: !!n.is_read,
        timestamp: n.created_at
      })));
      const count = await notificationsService.getUnreadCount(user.company_id, user?.id);
      setUnreadCount(count);
    } catch (e) {
      console.warn('Notifications load failed', e);
    }
  };

  const openNotification = async (n) => {
    try {
      // Mark as read optimistically
      if (!n.is_read && !n.read) {
        await notificationsService.markAsRead(n.id);
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true, is_read: true } : x));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch {}

    // Use action_url if available (new standard)
    if (n.action_url) {
      navigate(n.action_url);
      return;
    }

    // Route based on business category and metadata in data JSON
    const d = n.data || {};
    const category = String(d.category || '').toUpperCase();
    const relatedId = d.related_id || n.related_id || d.work_order_id || d.invoice_id || d.customer_id || d.id || null;

    // Heuristic: detect quote approval notifications without explicit category
    const titleLower = (n.title || '').toLowerCase();
    const messageLower = (n.message || '').toLowerCase();
    const looksLikeQuoteApproval = (titleLower.includes('quote') || messageLower.includes('quote')) && (titleLower.includes('approved') || messageLower.includes('approved')) && (d.work_order_id || relatedId);

    // QUOTE APPROVED -> go schedule the job
    if (category === 'WORK_ORDER' || category === 'JOB' || looksLikeQuoteApproval) {
      const jobId = d.work_order_id || relatedId;
      if (jobId) {
        navigate(`/jobs?edit=${jobId}&schedule=new`);
        return;
      }
    }

    // QUOTE-related
    if (category === 'QUOTE') {
      if (relatedId) {
        navigate(`/quotes?open=${relatedId}`);
      } else if (d.work_order_id) {
        navigate(`/quotes?open=${d.work_order_id}`);
      } else {
        navigate('/quotes');
      }
      return;
    }

    // MESSAGE-related
    if (category === 'MESSAGE') {
      // For now, take user to Messages hub (deep-linking can be added later)
      navigate('/messages');
      return;
    }

    // INVENTORY
    if (category === 'INVENTORY') {
      navigate(relatedId ? `/operations/inventory?id=${relatedId}` : '/operations/inventory');
      return;
    }

    // PTO / Time Off
    if (category === 'PTO') {
      navigate(isAdmin(user) ? '/admin/time-off' : '/my-time-off');
      return;
    }

    // SCHEDULE / Calendar
    if (category === 'SCHEDULE') {
      if (d.start_time) {
        const date = new Date(d.start_time).toISOString().slice(0, 10);
        navigate(`/calendar?date=${date}`);
      } else {
        navigate('/calendar');
      }
      return;
    }

    // Default fallbacks
    if (relatedId && (titleLower.includes('invoice') || category === 'INVOICE' || category === 'INVOICE_OVERDUE')) {
      navigate('/invoices');
      return;
    }

    // If nothing matched, go to the notifications page
    navigate('/notifications');
  };

  useEffect(() => {
    load();
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(load, POLL_MS);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [user?.company_id]);

  // Realtime: instant bell updates when new notifications arrive
  useEffect(() => {
    if (!user?.company_id) return;
    const supabase = getSupabaseClient();

    const channel = supabase
      .channel(`notifications_${user?.id || 'company'}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `company_id=eq.${user.company_id}`
        },
        (payload) => {
          try {
            const n = payload.new || {};
            // Only count unread/pending items for this user or broadcast (null user)
            const isForUser = !n.user_id || n.user_id === user.id;
            const isPending = (n.status || 'pending') === 'pending';
            if (!isForUser || !isPending) return;

            setUnreadCount((prev) => prev + 1);
            setNotifications((prev) => [
              { ...n, read: false, is_read: false, timestamp: n.created_at },
              ...prev
            ].slice(0, 50));
          } catch (e) {
            // no-op
          }
        }
      )
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [user?.company_id, user?.id]);

  const markAsRead = async (notificationId) => {
    try {
      await notificationsService.markAsRead(notificationId);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) { console.warn('markAsRead failed', e); }
  };

  const markAllAsRead = async () => {
    try {
      // Mark all company notifications as read (broadcast + user-specific)
      await notificationsService.markAllAsRead(user.company_id, null);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) { console.warn('markAllAsRead failed', e); }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationsService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const n = notifications.find(x => x.id === notificationId);
      if (n && !n.read) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) { console.warn('deleteNotification failed', e); }
  };

  const getNotificationIcon = (type, severity) => {
    const base = "h-8 w-8 rounded-full p-1.5 flex items-center justify-center";
    const sev = (severity || 'INFO').toUpperCase();
    const sevClass = sev === 'ERROR' ? 'bg-rose-100 text-rose-600' : sev === 'WARNING' ? 'bg-amber-100 text-amber-600' : sev === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600';
    const wrap = (icon) => <div className={`${base} ${sevClass}`}>{icon}</div>;
    if (type === 'INVENTORY') return wrap(<InformationCircleIcon className="h-5 w-5" />);
    if (type === 'PTO') return wrap(<CalendarDaysIcon className="h-5 w-5" />);
    if (type === 'INVOICE') return wrap(<InformationCircleIcon className="h-5 w-5" />);
    if (type === 'QUOTE') return wrap(<InformationCircleIcon className="h-5 w-5" />);
    if (sev === 'ERROR') return wrap(<XMarkIcon className="h-5 w-5" />);
    if (sev === 'WARNING') return wrap(<ExclamationTriangleIcon className="h-5 w-5" />);
    if (sev === 'SUCCESS') return wrap(<CheckCircleIcon className="h-5 w-5" />);
    return wrap(<InformationCircleIcon className="h-5 w-5" />);
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
        aria-label="Open notifications"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 mr-2">
                {[
                  { label: 'All', value: 'all' },
                  { label: 'Unread', value: 'unread' },
                  { label: '24h', value: '24h' },
                  { label: '7d', value: '7d' }
                ].map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFilterMode(f.value)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                      filterMode === f.value
                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                        : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {(
              (() => {
                const now = new Date();
                const filtered = notifications.filter(n => {
                  if (filterMode === 'unread') return !n.read;
                  if (filterMode === '24h') return (now - new Date(n.timestamp)) <= 24*60*60*1000;
                  if (filterMode === '7d') return (now - new Date(n.timestamp)) <= 7*24*60*60*1000;
                  return true;
                });
                return filtered;
              })()
            ).length > 0 ? (
              (
                (() => {
                  const now = new Date();
                  return notifications.filter(n => {
                    if (filterMode === 'unread') return !n.read;
                    if (filterMode === '24h') return (now - new Date(n.timestamp)) <= 24*60*60*1000;
                    if (filterMode === '7d') return (now - new Date(n.timestamp)) <= 7*24*60*60*1000;
                    return true;
                  });
                })()
              ).map((n) => (
                <button
                  key={n.id}
                  onClick={() => { setIsOpen(false); openNotification(n); }}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 ${!n.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(n.type, n.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                          <p className="text-xs text-gray-500 mt-2">{formatTimestamp(n.timestamp)}</p>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }} className="text-gray-400 hover:text-gray-600 ml-2">
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                      {!n.read && (
                        <button type="button" onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }} className="text-xs text-primary-600 hover:text-primary-800 mt-2">
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>No notifications yet</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 text-center">
            <button
              onClick={() => { setIsOpen(false); navigate('/notifications'); }}
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
