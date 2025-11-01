import { supabase, supabaseAdmin, hasAdminBypass, adminDeleteUser } from '../supabaseClient';

/**
 * User Management Service
 * Handles user deletion and related operations
 */
export class UserService {

  /**
   * Delete a single user and all associated data
   * @param {string} userId - User ID to delete (from users table)
   * @param {string} userEmail - User email (for logging)
   * @returns {object} - Success status and message
   */
  static async deleteUser(userId, userEmail) {
    try {
      console.log('🗑️ Starting user deletion for ID:', userId, 'Email:', userEmail);

      if (!hasAdminBypass || !supabaseAdmin) {
        throw new Error('Admin bypass required - service key not configured');
      }

      // Step 1: Delete auth user (using secure Edge Function)
      try {
        console.log('🔐 Deleting auth user via Edge Function:', userEmail);
        await adminDeleteUser(userId);
        console.log('✅ Auth user deleted:', userEmail);
      } catch (error) {
        console.error('❌ Error deleting auth user:', userEmail, error);
        // Continue with user deletion even if auth deletion fails
      }

      // Step 2: Delete user record from users table
      // This will cascade delete profiles and related data
      // Use supabaseAdmin to bypass RLS
      console.log('🔓 Using admin client to delete user (bypass RLS)');
      const { error: userDeleteError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userId);

      if (userDeleteError) {
        console.error('❌ Error deleting user record:', userDeleteError);
        throw new Error(`Failed to delete user record: ${userDeleteError.message}`);
      }

      console.log('✅ User record deleted (profiles cascade deleted)');

      // Step 3: Delete employee record if exists (cascade should handle, but be explicit)
      try {
        console.log('🔓 Using admin client to delete employee (bypass RLS)');
        const { error: employeeDeleteError } = await supabaseAdmin
          .from('employees')
          .delete()
          .eq('user_id', userId);

        if (!employeeDeleteError) {
          console.log('✅ Employee record deleted (if existed)');
        }
      } catch (e) {
        console.warn('⚠️ Employee deletion skipped (table may not exist):', e.message);
      }

      console.log('✅ User deletion completed successfully');

      return {
        success: true,
        message: `User ${userEmail} deleted successfully`
      };

    } catch (error) {
      console.error('❌ User deletion workflow failed:', error);
      throw error;
    }
  }

  /**
   * Delete multiple users at once
   * @param {array} userIds - Array of user IDs to delete
   * @returns {object} - Success status and message
   */
  static async deleteMultipleUsers(userIds) {
    try {
      console.log('🗑️ Starting batch user deletion for', userIds.length, 'users');

      let successCount = 0;
      let failureCount = 0;
      const failures = [];

      for (const userId of userIds) {
        try {
          await this.deleteUser(userId, `User ${userId}`);
          successCount++;
        } catch (error) {
          console.error('❌ Failed to delete user:', userId, error);
          failureCount++;
          failures.push({ userId, error: error.message });
        }
      }

      console.log(`✅ Batch deletion complete: ${successCount} succeeded, ${failureCount} failed`);

      return {
        success: failureCount === 0,
        message: `Deleted ${successCount} users${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
        successCount,
        failureCount,
        failures
      };

    } catch (error) {
      console.error('❌ Batch user deletion workflow failed:', error);
      throw error;
    }
  }
}

