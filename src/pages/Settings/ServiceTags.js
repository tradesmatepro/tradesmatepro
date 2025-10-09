// Service Tags Settings Page
import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supaFetch } from '../../utils/supaFetch';
import TagSelector from '../../components/Common/TagSelector';
import {
  TagIcon,
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const ServiceTags = () => {
  const { user } = useUser();
  const [companyTags, setCompanyTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCompanyTags();
  }, []);

  const loadCompanyTags = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user?.company_id) {
        console.error('No company ID available for loading service tags');
        return;
      }

      // Load company's current tags
      const response = await supaFetch(
        `company_tags?select=tags(id,name,category)&company_id=eq.${user.company_id}`,
        { method: 'GET' },
        user.company_id
      );

      if (response.ok) {
        const data = await response.json();
        const tags = data.map(item => item.tags).filter(Boolean);
        setCompanyTags(tags);
      } else {
        throw new Error('Failed to load company tags');
      }
    } catch (error) {
      console.error('Error loading company tags:', error);
      setError('Failed to load company tags. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTagsChange = async (newTags) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Get current tag IDs
      const currentTagIds = new Set(companyTags.map(tag => tag.id));
      const newTagIds = new Set(newTags.map(tag => tag.id));

      // Find tags to add and remove
      const tagsToAdd = newTags.filter(tag => !currentTagIds.has(tag.id));
      const tagsToRemove = companyTags.filter(tag => !newTagIds.has(tag.id));

      // Remove tags
      for (const tag of tagsToRemove) {
        const response = await supaFetch(
          `company_tags?company_id=eq.${user.company_id}&tag_id=eq.${tag.id}`,
          { method: 'DELETE' },
          user.company_id
        );
        if (!response.ok) {
          throw new Error(`Failed to remove tag: ${tag.name}`);
        }
      }

      // Add tags
      for (const tag of tagsToAdd) {
        const response = await supaFetch('company_tags', {
          method: 'POST',
          body: {
            company_id: user.company_id,
            tag_id: tag.id,
            created_at: new Date().toISOString()
          }
        }, user.company_id);
        if (!response.ok) {
          throw new Error(`Failed to add tag: ${tag.name}`);
        }
      }

      // Update local state
      setCompanyTags(newTags);
      setSuccess('Company service tags updated successfully');

    } catch (error) {
      console.error('Error updating company tags:', error);
      setError('Failed to update company tags. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Service Tags</h2>
        <p className="mt-1 text-sm text-gray-600">
          Select which services your company provides. These determine which customer requests you will be notified about.
        </p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tag Management Section */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Company Service Tags</h3>
            <p className="text-sm text-gray-500 mt-1">
              Select the services your company provides. You can search existing tags or create custom ones.
            </p>
          </div>

          <TagSelector
            selectedTags={companyTags}
            onTagsChange={handleTagsChange}
            placeholder="Search for services like plumbing, electrical, web design..."
            className="w-full"
          />

          {saving && (
            <div className="flex items-center text-sm text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Saving changes...
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <TagIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              How Service Tags Work
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Service tags define what types of work your company performs</li>
                <li>Customer service requests will be matched to companies with relevant tags</li>
                <li>You can add existing tags or create custom ones by typing and pressing Enter</li>
                <li>Changes are saved automatically when you modify your tag selection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceTags;
