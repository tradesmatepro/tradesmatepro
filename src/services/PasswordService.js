/**
 * Password Service for TradeMate Pro
 * Handles password expiry, validation, and history
 */

import { supabase } from '../utils/supabaseClient';

class PasswordService {
  /**
   * Check if password has expired
   */
  async isPasswordExpired(userId, companyId) {
    try {
      // Get security settings
      const { data: settings } = await supabase
        .from('settings')
        .select('password_expiry_days')
        .eq('company_id', companyId)
        .single();

      const expiryDays = settings?.password_expiry_days || 0;
      
      // 0 means never expire
      if (expiryDays === 0) return false;

      // Get last password change
      const { data: lastChange } = await supabase
        .from('password_history')
        .select('changed_at')
        .eq('user_id', userId)
        .order('changed_at', { ascending: false })
        .limit(1)
        .single();

      if (!lastChange) {
        // No password history - check user creation date
        const { data: user } = await supabase
          .from('users')
          .select('created_at')
          .eq('id', userId)
          .single();

        if (!user) return false;

        const daysSinceCreation = (Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24);
        return daysSinceCreation > expiryDays;
      }

      const daysSinceChange = (Date.now() - new Date(lastChange.changed_at)) / (1000 * 60 * 60 * 24);
      return daysSinceChange > expiryDays;
    } catch (error) {
      console.error('Error checking password expiry:', error);
      return false;
    }
  }

  /**
   * Get days until password expires
   */
  async getDaysUntilExpiry(userId, companyId) {
    try {
      const { data: settings } = await supabase
        .from('settings')
        .select('password_expiry_days')
        .eq('company_id', companyId)
        .single();

      const expiryDays = settings?.password_expiry_days || 0;
      if (expiryDays === 0) return null; // Never expires

      const { data: lastChange } = await supabase
        .from('password_history')
        .select('changed_at')
        .eq('user_id', userId)
        .order('changed_at', { ascending: false })
        .limit(1)
        .single();

      const changeDate = lastChange 
        ? new Date(lastChange.changed_at)
        : await this.getUserCreationDate(userId);

      const daysSinceChange = (Date.now() - changeDate) / (1000 * 60 * 60 * 24);
      const daysRemaining = expiryDays - daysSinceChange;

      return Math.max(0, Math.floor(daysRemaining));
    } catch (error) {
      console.error('Error calculating days until expiry:', error);
      return null;
    }
  }

  /**
   * Validate password meets requirements
   */
  async validatePassword(password, companyId) {
    try {
      const { data: settings } = await supabase
        .from('settings')
        .select('min_password_length, require_special_chars, require_numbers, require_uppercase')
        .eq('company_id', companyId)
        .single();

      const errors = [];

      // Check length
      const minLength = settings?.min_password_length || 8;
      if (password.length < minLength) {
        errors.push(`Password must be at least ${minLength} characters`);
      }

      // Check uppercase
      if (settings?.require_uppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }

      // Check numbers
      if (settings?.require_numbers && !/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
      }

      // Check special characters
      if (settings?.require_special_chars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('Error validating password:', error);
      return {
        valid: false,
        errors: ['Failed to validate password']
      };
    }
  }

  /**
   * Record password change in history
   */
  async recordPasswordChange(userId, passwordHash, reason = 'user-initiated') {
    try {
      await supabase
        .from('password_history')
        .insert({
          user_id: userId,
          password_hash: passwordHash,
          changed_at: new Date().toISOString(),
          change_reason: reason
        });

      // Log security event
      const { data: user } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', userId)
        .single();

      if (user) {
        await supabase
          .from('security_audit_log')
          .insert({
            user_id: userId,
            company_id: user.company_id,
            event_type: 'password_changed',
            event_description: `Password changed: ${reason}`,
            severity: 'info',
            created_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error recording password change:', error);
    }
  }

  /**
   * Check if password was used before (prevent reuse)
   */
  async isPasswordReused(userId, passwordHash, historyCount = 5) {
    try {
      const { data: history } = await supabase
        .from('password_history')
        .select('password_hash')
        .eq('user_id', userId)
        .order('changed_at', { ascending: false })
        .limit(historyCount);

      if (!history || history.length === 0) return false;

      return history.some(record => record.password_hash === passwordHash);
    } catch (error) {
      console.error('Error checking password reuse:', error);
      return false;
    }
  }

  /**
   * Send password expiry notification
   */
  async sendExpiryNotification(userId, daysRemaining) {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', userId)
        .single();

      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('email, first_name')
        .eq('user_id', userId)
        .single();

      if (!profile) return;

      // TODO: Integrate with email service
      console.log(`Password expiry notification: ${profile.email} - ${daysRemaining} days remaining`);

      // Log notification
      await supabase
        .from('security_audit_log')
        .insert({
          user_id: userId,
          company_id: user.company_id,
          event_type: 'password_expiry_notification',
          event_description: `Password expiry notification sent: ${daysRemaining} days remaining`,
          severity: 'info',
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error sending expiry notification:', error);
    }
  }

  /**
   * Get user creation date
   */
  async getUserCreationDate(userId) {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('created_at')
        .eq('id', userId)
        .single();

      return user ? new Date(user.created_at) : new Date();
    } catch (error) {
      console.error('Error getting user creation date:', error);
      return new Date();
    }
  }

  /**
   * Generate password strength score
   */
  calculatePasswordStrength(password) {
    let score = 0;
    const feedback = [];

    // Length
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    else feedback.push('Use at least 12 characters for better security');

    // Character variety
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Add uppercase letters');
    
    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Add numbers');
    
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('Add special characters');

    // Common patterns (reduce score)
    if (/^[0-9]+$/.test(password)) {
      score -= 2;
      feedback.push('Avoid using only numbers');
    }
    if (/^[a-zA-Z]+$/.test(password)) {
      score -= 1;
      feedback.push('Mix letters with numbers and symbols');
    }
    if (/(.)\1{2,}/.test(password)) {
      score -= 1;
      feedback.push('Avoid repeating characters');
    }

    // Common words
    const commonWords = ['password', 'admin', 'user', '1234', 'qwerty'];
    if (commonWords.some(word => password.toLowerCase().includes(word))) {
      score -= 2;
      feedback.push('Avoid common words');
    }

    const strength = Math.max(0, Math.min(5, score));
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];

    return {
      score: strength,
      label: labels[strength],
      feedback
    };
  }
}

export default new PasswordService();

