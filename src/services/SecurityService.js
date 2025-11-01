/**
 * Security Service for TradeMate Pro
 * Handles session management, login tracking, device tracking, and password enforcement
 */

import { supabase } from '../utils/supabaseClient';

class SecurityService {
  constructor() {
    this.sessionCheckInterval = null;
    this.activityListeners = [];
  }

  // =========================================
  // SESSION MANAGEMENT
  // =========================================

  /**
   * Initialize session tracking for current user
   */
  async initializeSession(userId, companyId) {
    try {
      const sessionToken = this.generateSessionToken();
      const deviceFingerprint = await this.getDeviceFingerprint();
      const ipAddress = await this.getClientIP();
      const userAgent = navigator.userAgent;

      // Get session timeout from settings
      const settings = await this.getSecuritySettings(companyId);
      const timeoutMinutes = settings?.session_timeout_minutes || 480;
      const expiresAt = new Date(Date.now() + timeoutMinutes * 60 * 1000);

      // Create session record
      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          company_id: companyId,
          session_token: sessionToken,
          device_fingerprint: deviceFingerprint,
          ip_address: ipAddress,
          user_agent: userAgent,
          last_activity: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create session:', error);
        return null;
      }

      // Store session token in localStorage
      localStorage.setItem('session_token', sessionToken);
      localStorage.setItem('session_id', data.id);

      // Start session monitoring
      this.startSessionMonitoring(companyId);

      // Track device
      if (settings?.device_tracking_enabled) {
        await this.trackDevice(userId, companyId, deviceFingerprint);
      }

      // Log security event
      await this.logSecurityEvent(userId, companyId, 'session_started', 'User session initialized', 'info');

      return data;
    } catch (error) {
      console.error('Error initializing session:', error);
      return null;
    }
  }

  /**
   * Update session activity timestamp
   */
  async updateSessionActivity() {
    try {
      const sessionToken = localStorage.getItem('session_token');
      if (!sessionToken) return;

      const { error } = await supabase
        .from('user_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('session_token', sessionToken)
        .eq('is_active', true);

      if (error) {
        console.error('Failed to update session activity:', error);
      }
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }

  /**
   * Check if session is still valid
   */
  async checkSessionValidity(companyId) {
    try {
      const sessionToken = localStorage.getItem('session_token');
      if (!sessionToken) return false;

      const { data, error } = await supabase
        .from('user_sessions')
        .select('*, expires_at, last_activity')
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .single();

      if (error || !data) return false;

      // Check if session expired
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      if (now > expiresAt) {
        await this.endSession(sessionToken, 'expired');
        return false;
      }

      // Check inactivity timeout
      const settings = await this.getSecuritySettings(companyId);
      if (settings?.auto_logout_enabled) {
        const timeoutMinutes = settings.session_timeout_minutes || 480;
        const lastActivity = new Date(data.last_activity);
        const inactiveMinutes = (now - lastActivity) / (1000 * 60);

        if (inactiveMinutes > timeoutMinutes) {
          await this.endSession(sessionToken, 'timeout');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking session validity:', error);
      return false;
    }
  }

  /**
   * End user session
   */
  async endSession(sessionToken, reason = 'logout') {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('session_token', sessionToken);

      if (error) {
        console.error('Failed to end session:', error);
      }

      // Clear local storage
      localStorage.removeItem('session_token');
      localStorage.removeItem('session_id');

      // Stop monitoring
      this.stopSessionMonitoring();

      // Log event
      const { data: session } = await supabase
        .from('user_sessions')
        .select('user_id, company_id')
        .eq('session_token', sessionToken)
        .single();

      if (session) {
        await this.logSecurityEvent(
          session.user_id, 
          session.company_id, 
          'session_ended', 
          `Session ended: ${reason}`, 
          'info'
        );
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  /**
   * Start session monitoring (check every minute)
   */
  startSessionMonitoring(companyId) {
    // Clear existing interval
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    // Check session validity every minute
    this.sessionCheckInterval = setInterval(async () => {
      const isValid = await this.checkSessionValidity(companyId);
      if (!isValid) {
        // Session expired - trigger logout
        window.dispatchEvent(new CustomEvent('session-expired'));
      }
    }, 60000); // 1 minute

    // Track user activity
    this.setupActivityTracking();
  }

  /**
   * Stop session monitoring
   */
  stopSessionMonitoring() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
    this.removeActivityTracking();
  }

  /**
   * Setup activity tracking (mouse, keyboard, scroll)
   */
  setupActivityTracking() {
    const activityHandler = () => {
      this.updateSessionActivity();
    };

    // Throttle activity updates to once per minute
    const throttledHandler = this.throttle(activityHandler, 60000);

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, throttledHandler);
      this.activityListeners.push({ event, handler: throttledHandler });
    });
  }

  /**
   * Remove activity tracking
   */
  removeActivityTracking() {
    this.activityListeners.forEach(({ event, handler }) => {
      window.removeEventListener(event, handler);
    });
    this.activityListeners = [];
  }

  // =========================================
  // LOGIN ATTEMPT TRACKING
  // =========================================

  /**
   * Record login attempt
   */
  async recordLoginAttempt(email, userId, success, failureReason = null) {
    try {
      const ipAddress = await this.getClientIP();
      const userAgent = navigator.userAgent;

      const { error } = await supabase
        .from('login_attempts')
        .insert({
          email,
          user_id: userId,
          ip_address: ipAddress,
          user_agent: userAgent,
          success,
          failure_reason: failureReason,
          attempted_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to record login attempt:', error);
      }

      // Check if account should be locked
      if (!success) {
        await this.checkAndLockAccount(email, userId);
      }
    } catch (error) {
      console.error('Error recording login attempt:', error);
    }
  }

  /**
   * Check if account should be locked after failed attempts
   */
  async checkAndLockAccount(email, userId) {
    try {
      // Get user's company settings
      const { data: user } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', userId)
        .single();

      if (!user) return;

      const settings = await this.getSecuritySettings(user.company_id);
      const maxAttempts = settings?.max_login_attempts || 5;
      const lockoutMinutes = settings?.lockout_duration_minutes || 30;

      // Count recent failed attempts (last 15 minutes)
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      const { data: attempts, error } = await supabase
        .from('login_attempts')
        .select('id')
        .eq('email', email)
        .eq('success', false)
        .gte('attempted_at', fifteenMinutesAgo.toISOString());

      if (error) {
        console.error('Failed to count login attempts:', error);
        return;
      }

      if (attempts && attempts.length >= maxAttempts) {
        // Lock the account
        const unlockAt = new Date(Date.now() + lockoutMinutes * 60 * 1000);
        
        await supabase
          .from('account_lockouts')
          .insert({
            user_id: userId,
            email,
            locked_at: new Date().toISOString(),
            unlock_at: unlockAt.toISOString(),
            reason: `${attempts.length} failed login attempts`,
            failed_attempts: attempts.length,
            is_active: true
          });

        // Log security event
        await this.logSecurityEvent(
          userId,
          user.company_id,
          'account_locked',
          `Account locked due to ${attempts.length} failed login attempts`,
          'warning'
        );

        // Send notification if enabled
        if (settings?.failed_login_notifications) {
          await this.sendFailedLoginNotification(email, attempts.length);
        }
      }
    } catch (error) {
      console.error('Error checking account lockout:', error);
    }
  }

  /**
   * Check if account is currently locked
   */
  async isAccountLocked(email) {
    try {
      const { data, error } = await supabase
        .from('account_lockouts')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .gte('unlock_at', new Date().toISOString())
        .order('locked_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Failed to check account lockout:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking account lockout:', error);
      return false;
    }
  }

  // =========================================
  // HELPER METHODS
  // =========================================

  /**
   * Get security settings for company
   */
  async getSecuritySettings(companyId) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('password_expiry_days, session_timeout_minutes, max_login_attempts, lockout_duration_minutes, auto_logout_enabled, device_tracking_enabled, failed_login_notifications')
        .eq('company_id', companyId)
        .single();

      if (error) {
        console.error('Failed to get security settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting security settings:', error);
      return null;
    }
  }

  /**
   * Generate unique session token
   */
  generateSessionToken() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Get device fingerprint
   */
  async getDeviceFingerprint() {
    // Simple fingerprint based on browser characteristics
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
    const canvasData = canvas.toDataURL();

    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvasData.substring(0, 50)
    };

    return btoa(JSON.stringify(fingerprint)).substring(0, 100);
  }

  /**
   * Get client IP address (best effort)
   */
  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return null;
    }
  }

  /**
   * Track device for user
   */
  async trackDevice(userId, companyId, deviceFingerprint) {
    try {
      const deviceInfo = this.getDeviceInfo();

      // Check if device already exists
      const { data: existing } = await supabase
        .from('user_devices')
        .select('id')
        .eq('user_id', userId)
        .eq('device_fingerprint', deviceFingerprint)
        .single();

      if (existing) {
        // Update last used
        await supabase
          .from('user_devices')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        // Create new device record
        const ipAddress = await this.getClientIP();

        await supabase
          .from('user_devices')
          .insert({
            user_id: userId,
            company_id: companyId,
            device_fingerprint: deviceFingerprint,
            device_name: deviceInfo.deviceName,
            device_type: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            ip_address: ipAddress,
            is_trusted: false,
            last_used_at: new Date().toISOString()
          });

        // Log new device
        await this.logSecurityEvent(
          userId,
          companyId,
          'new_device_detected',
          `New device: ${deviceInfo.deviceName}`,
          'warning'
        );
      }
    } catch (error) {
      console.error('Error tracking device:', error);
    }
  }

  /**
   * Get device information from user agent
   */
  getDeviceInfo() {
    const ua = navigator.userAgent;
    let deviceType = 'Desktop';
    let browser = 'Unknown';
    let os = 'Unknown';

    // Detect device type
    if (/mobile/i.test(ua)) deviceType = 'Mobile';
    else if (/tablet/i.test(ua)) deviceType = 'Tablet';

    // Detect browser
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    // Detect OS
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';

    return {
      deviceName: `${browser} on ${os}`,
      deviceType,
      browser,
      os
    };
  }

  /**
   * Log security event
   */
  async logSecurityEvent(userId, companyId, eventType, description, severity = 'info') {
    try {
      const ipAddress = await this.getClientIP();
      const userAgent = navigator.userAgent;

      await supabase
        .from('security_audit_log')
        .insert({
          user_id: userId,
          company_id: companyId,
          event_type: eventType,
          event_description: description,
          ip_address: ipAddress,
          user_agent: userAgent,
          severity,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  /**
   * Send failed login notification
   */
  async sendFailedLoginNotification(email, attemptCount) {
    // TODO: Integrate with notification system
    console.warn(`Failed login notification: ${email} - ${attemptCount} attempts`);
  }

  /**
   * Throttle function calls
   */
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

export default new SecurityService();

