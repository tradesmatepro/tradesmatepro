import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const actions = [
  { id: 'new-quote', label: 'New Quote', path: '/quotes?new=quote' },
  { id: 'new-customer', label: 'New Customer', path: '/customers?new=customer' },
  { id: 'new-job', label: 'New Job', path: '/jobs?new=job' },
  { id: 'goto-dashboard', label: 'Go to Dashboard', path: '/dashboard' },
  { id: 'goto-today', label: "Go to Today's Schedule", path: '/calendar' },
  { id: 'search-customers', label: 'Search Customers', path: '/customers?q=' },
  { id: 'search-quotes', label: 'Search Quotes', path: '/quotes?q=' },
];

const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = actions.filter(a =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;

    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        run(filtered[selectedIndex].path);
      }
    }
  }, [isOpen, filtered, selectedIndex, onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const run = (path) => {
    onClose();
    setQuery('');
    if (path.endsWith('?q=')) {
      // For search actions, append the query
      navigate(path + encodeURIComponent(query));
    } else {
      navigate(path);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-lg">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a command or search term..."
          className="w-full px-4 py-3 border-b border-gray-200 rounded-t-lg focus:outline-none"
        />
        <ul className="max-h-64 overflow-y-auto">
          {filtered.map((action, index) => (
            <li key={action.id}>
              <button
                onClick={() => run(action.path)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                  index === selectedIndex ? 'bg-primary-50 text-primary-700' : ''
                }`}
              >
                {action.label}
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-4 py-3 text-gray-500 text-sm">No matches</li>
          )}
        </ul>
        <div className="px-4 py-2 text-xs text-gray-500 border-t bg-gray-50 rounded-b-lg">
          Use ↑↓ to navigate, Enter to select, Esc to close
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;

