import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../utils/supabaseClient';
import { XMarkIcon, MagnifyingGlassIcon, TagIcon, PlusIcon } from '@heroicons/react/24/outline';

const TagSelector = ({ 
  selectedTags = [], 
  onTagsChange, 
  placeholder = "Search for services like plumbing, web design, fishing charter...",
  className = ""
}) => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [popularTags, setPopularTags] = useState([]);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadPopularTags();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      searchTags(searchTerm);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const loadPopularTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true })
        .limit(20);

      if (error) {
        console.error('Error loading popular tags:', error);
        return;
      }

      setPopularTags(data || []);
    } catch (error) {
      console.error('Error loading popular tags:', error);
    }
  };

  const searchTags = async (term) => {
    try {
      setIsSearching(true);
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .ilike('name', `%${term}%`)
        .order('name', { ascending: true })
        .limit(20);

      if (error) {
        console.error('Error searching tags:', error);
        setSearchResults([]);
        return;
      }

      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching tags:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addTag = (tag) => {
    if (!selectedTags.find(t => t.id === tag.id)) {
      const newTags = [...selectedTags, tag];
      onTagsChange(newTags);
    }
    setSearchTerm('');
    setShowDropdown(false);
    // Don't auto-focus after selection - let user click to reopen dropdown
  };

  const removeTag = (tagId) => {
    const newTags = selectedTags.filter(t => t.id !== tagId);
    onTagsChange(newTags);
  };

  const createCustomTag = async (tagName) => {
    try {
      const normalizedName = tagName.toLowerCase().trim();

      // Try to get existing tag first
      const { data: existingTag, error: fetchError } = await supabase
        .from('tags')
        .select('*')
        .eq('name', normalizedName)
        .single();

      if (existingTag) {
        addTag(existingTag);
        return;
      }

      // Create new tag if it doesn't exist
      const { data: newTag, error: createError } = await supabase
        .from('tags')
        .insert([{
          name: normalizedName,
          category: 'CUSTOM'
        }])
        .select()
        .single();

      if (createError) {
        // If it's a duplicate key error, try to fetch again
        if (createError.code === '23505') {
          const { data: tag, error: refetchError } = await supabase
            .from('tags')
            .select('*')
            .eq('name', normalizedName)
            .single();

          if (!refetchError && tag) {
            addTag(tag);
          }
          return;
        }
        console.error('Error creating custom tag:', createError);
        return;
      }

      if (newTag) {
        addTag(newTag);
      }
    } catch (error) {
      console.error('Error creating custom tag:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault();
      
      // Check if exact match exists in search results
      const exactMatch = searchResults.find(tag => 
        tag.name.toLowerCase() === searchTerm.toLowerCase().trim()
      );
      
      if (exactMatch) {
        addTag(exactMatch);
      } else {
        // Create custom tag
        createCustomTag(searchTerm);
      }
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'TRADES': 'bg-blue-100 text-blue-800',
      'HOME_SERVICES': 'bg-green-100 text-green-800',
      'PROFESSIONAL_SERVICES': 'bg-purple-100 text-purple-800',
      'CREATIVE': 'bg-pink-100 text-pink-800',
      'SPECIALIZED': 'bg-yellow-100 text-yellow-800',
      'TECHNOLOGY': 'bg-indigo-100 text-indigo-800',
      'CUSTOM': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.CUSTOM;
  };

  const displayTags = searchTerm.trim().length >= 2 ? searchResults : popularTags;
  const filteredTags = displayTags.filter(tag => 
    !selectedTags.find(selected => selected.id === tag.id)
  );

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(tag.category)}`}
            >
              <TagIcon className="h-3 w-3 mr-1" />
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-black hover:bg-opacity-10"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            placeholder={placeholder}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
            </div>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
            {filteredTags.length === 0 && searchTerm.trim().length >= 2 && !isSearching && (
              <div className="px-4 py-2 text-sm text-gray-500 flex items-center">
                <PlusIcon className="h-4 w-4 mr-2 text-primary-500" />
                Press Enter to create "{searchTerm}"
              </div>
            )}
            
            {filteredTags.length === 0 && searchTerm.trim().length < 2 && (
              <div className="px-4 py-2 text-sm text-gray-500">
                Type at least 2 characters to search...
              </div>
            )}

            {filteredTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => addTag(tag)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TagIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="font-medium">{tag.name}</span>
                  </div>
                  {tag.category && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(tag.category)}`}>
                      {tag.category.replace('_', ' ').toLowerCase()}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        Search for services like "plumbing", "web design", "fishing charter", etc. 
        {searchTerm.trim().length >= 2 && filteredTags.length === 0 && (
          <span className="text-primary-600"> Press Enter to create a custom tag.</span>
        )}
      </p>
    </div>
  );
};

export default TagSelector;
