import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../utils/supabaseClient';
import {
  UserGroupIcon,
  PlusIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const TeamSetupStep = ({ onComplete, onValidationChange }) => {
  const { user } = useUser();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [newMember, setNewMember] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'technician'
  });

  const roles = [
    { value: 'admin', label: 'Admin', description: 'Full system access' },
    { value: 'manager', label: 'Manager', description: 'Manage jobs and team' },
    { value: 'dispatcher', label: 'Dispatcher', description: 'Schedule and dispatch jobs' },
    { value: 'technician', label: 'Technician', description: 'Complete field work' },
    { value: 'sales_rep', label: 'Sales Rep', description: 'Create quotes and manage customers' }
  ];

  // Load existing team members
  useEffect(() => {
    loadTeamMembers();
  }, [user?.company_id]);

  const loadTeamMembers = async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          role,
          status,
          created_at,
          profiles (
            first_name,
            last_name,
            phone,
            avatar_url
          )
        `)
        .eq('company_id', user.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);

    } catch (error) {
      console.error('Error loading team members:', error);
    } finally {
      setLoading(false);
    }
  };

  // Validate team setup
  const validateTeam = () => {
    const warnings = [];
    
    if (teamMembers.length === 1) {
      warnings.push('Consider adding team members to help manage workload');
    }

    const hasManager = teamMembers.some(member => 
      ['owner', 'admin', 'manager'].includes(member.role)
    );
    
    if (!hasManager && teamMembers.length > 1) {
      warnings.push('Consider adding a manager to help coordinate work');
    }

    onValidationChange?.({
      valid: true, // Team setup is always optional
      errors: [],
      warnings
    });

    return true;
  };

  // Validate on team changes
  useEffect(() => {
    if (!loading) {
      validateTeam();
    }
  }, [teamMembers, loading]);

  // Invite team member
  const inviteTeamMember = async () => {
    if (!newMember.first_name.trim() || !newMember.email.trim() || !user?.company_id) return;

    try {
      setInviting(true);

      // For beta: Create user record directly (in production, this would send an invitation)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newMember.email,
        password: 'TempPassword123!', // In production, user would set their own password
        options: {
          data: {
            first_name: newMember.first_name,
            last_name: newMember.last_name,
            company_id: user.company_id,
            role: newMember.role
          }
        }
      });

      if (authError) {
        // If user already exists, just create the user record
        if (authError.message.includes('already registered')) {
          console.log('User already exists, creating user record...');
        } else {
          throw authError;
        }
      }

      // Create user record
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          company_id: user.company_id,
          role: newMember.role,
          status: 'invited',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (userError) throw userError;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userData.id,
          first_name: newMember.first_name,
          last_name: newMember.last_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      // Reload team members
      await loadTeamMembers();

      // Reset form
      setNewMember({
        first_name: '',
        last_name: '',
        email: '',
        role: 'technician'
      });

    } catch (error) {
      console.error('Error inviting team member:', error);
      alert('Failed to invite team member. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  const handleComplete = () => {
    if (validateTeam()) {
      onComplete?.({ teamMembers });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading team members...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <UserGroupIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Setup</h2>
        <p className="text-gray-600">
          Add your team members so you can assign work and track progress. You can always add more later.
        </p>
      </div>

      {/* Current Team Members */}
      {teamMembers.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Team</h3>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {member.profiles?.first_name} {member.profiles?.last_name}
                      {member.id === user.id && <span className="text-sm text-gray-500 ml-2">(You)</span>}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {member.role.replace('_', ' ')} • {member.status}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(member.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite New Team Member */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Invite Team Member</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={newMember.first_name}
              onChange={(e) => setNewMember(prev => ({ ...prev, first_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="John"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={newMember.last_name}
              onChange={(e) => setNewMember(prev => ({ ...prev, last_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Smith"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <EnvelopeIcon className="w-4 h-4 inline mr-1" />
              Email Address *
            </label>
            <input
              type="email"
              value={newMember.email}
              onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={newMember.role}
              onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label} - {role.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={inviteTeamMember}
            disabled={!newMember.first_name.trim() || !newMember.email.trim() || inviting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {inviting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Inviting...
              </>
            ) : (
              <>
                <PlusIcon className="w-4 h-4" />
                Invite Team Member
              </>
            )}
          </button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Beta Note:</strong> Team members will be created with a temporary password. 
            In production, they would receive an email invitation to set their own password.
          </p>
        </div>
      </div>

      {/* Skip Option */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Working Solo?</h3>
        <p className="text-gray-600 mb-4">
          No problem! You can add team members later as your business grows. 
          For now, you'll handle all the work orders yourself.
        </p>
      </div>

      {/* Continue Button */}
      <div className="text-center">
        <button
          onClick={handleComplete}
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700"
        >
          <CheckCircleIcon className="w-5 h-5" />
          Continue with {teamMembers.length} Team Member{teamMembers.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
};

export default TeamSetupStep;
