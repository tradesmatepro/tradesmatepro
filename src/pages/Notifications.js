import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/Common/PageHeader';
import { useIntegrations } from '../contexts/IntegrationsContext';
import { useUser } from '../contexts/UserContext';
import notificationsService from '../services/NotificationsService';
import notificationIntegrationService from '../services/NotificationIntegrationService';
import {
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  TrashIcon,
  ClockIcon,
  UserIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const Notifications = () => {
  const { user } = useUser();
  const { isSmsEnabled } = useIntegrations();

  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, byType: {}, bySeverity: {} });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, type-specific
  const [timeframe, setTimeframe] = useState('24h'); // 24h, 7d, 30d

  const loadNotifications = useCallback(async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);
      const filters = {};

      if (filter === 'unread') {
        filters.unreadOnly = true;
      } else if (filter !== 'all') {
        filters.type = filter;
      }

      // Apply timeframe filter to list as well
      const hours = timeframe === '24h' ? 24 : timeframe === '7d' ? 24 * 7 : 24 * 30;
      filters.since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      const data = await notificationsService.getNotifications(user.company_id, user.id, filters);
      setNotifications(data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.company_id, user?.id, filter, timeframe]);

  const loadStats = useCallback(async () => {
    if (!user?.company_id) return;

    try {
      const statsData = await notificationIntegrationService.getNotificationStats(user.company_id, timeframe);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load notification stats:', error);
    }
  }, [user?.company_id, timeframe]);

  useEffect(() => {
    loadNotifications();
    loadStats();
  }, [loadNotifications, loadStats]);

  const markAsRead = async (notificationId) => {
    try {
      await notificationsService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
      );
      setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationsService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setStats(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      await Promise.all(unreadNotifications.map(n => notificationsService.markAsRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
      setStats(prev => ({ ...prev, unread: 0 }));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      case 'WARNING': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'INFO': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      INVENTORY: '📦',
      WORK_ORDER: '🔧',
      JOB: '👷',
      TIMESHEET: '⏰',
      EXPENSE: '💰',
      PURCHASE_ORDER: '📋',
      PAYMENT: '💳',
      CUSTOMER: '👤',
      EMPLOYEE: '👥',
      SYSTEM: '⚙️',
      SCHEDULE: '📅',
      INVOICE: '📄',
      QUOTE: '📝',
      PTO: '🏖️'
    };
    return icons[type] || '📢';
  };

  if (!isSmsEnabled()) {
    return (
      <div className="p-6">
        <PageHeader
          title="Notifications"
          subtitle="Manage SMS and email notifications to customers"
        />
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-yellow-900">SMS Integration Required</h3>
              <p className="text-yellow-800 mt-2">
                This page requires SMS integration to be enabled. Enable it in Settings to access notification management features.
              </p>
              <button
                onClick={() => window.location.href = '/settings?tab=toggles&highlight=sms'}
                className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
              >
                Enable SMS Integration
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Notifications"
        subtitle="Review alerts and manage notification preferences"
      />

      {/* Enhanced Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Total Notifications</h3>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <BellIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Unread</h3>
              <p className="text-3xl font-bold">{stats.unread}</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Critical Alerts</h3>
              <p className="text-3xl font-bold">{stats.bySeverity?.CRITICAL || 0}</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">System Alerts</h3>
              <p className="text-3xl font-bold">{stats.byType?.SYSTEM || 0}</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <CogIcon className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="INVENTORY">Inventory</option>
                <option value="WORK_ORDER">Work Orders</option>
                <option value="JOB">Jobs</option>
                <option value="TIMESHEET">Timesheets</option>
                <option value="EXPENSE">Expenses</option>
                <option value="PAYMENT">Payments</option>
                <option value="SYSTEM">System</option>
              </select>

              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              {stats.unread > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  Mark All Read
                </button>
              )}
              <button
                onClick={loadNotifications}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <ClockIcon className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500">You're all caught up! No new notifications to show.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-2xl">{getTypeIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(notification.severity)}`}>
                          {notification.severity}
                        </span>
                        {!notification.is_read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {new Date(notification.created_at).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <UserIcon className="w-3 h-3" />
                          {notification.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete notification"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
