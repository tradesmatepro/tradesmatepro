import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bars3Icon, PlusIcon, MagnifyingGlassIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useUser } from '../../contexts/UserContext';
import { getTierConfig } from '../../utils/planUtils';
import NotificationCenter from '../NotificationCenter';

const Topbar = ({ onHamburger }) => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [openNew, setOpenNew] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Route based on current section
    const path = location.pathname;
    if (path.startsWith('/customers')) {
      navigate(`/customers?q=${encodeURIComponent(query)}`);
    } else if (path.startsWith('/quotes')) {
      navigate(`/quotes?q=${encodeURIComponent(query)}`);
    } else if (path.startsWith('/jobs')) {
      navigate(`/jobs?q=${encodeURIComponent(query)}`);
    } else {
      // Default to quotes as a productive landing for search
      navigate(`/quotes?q=${encodeURIComponent(query)}`);
    }
  };

  const goNew = (type) => {
    setOpenNew(false);
    if (type === 'quote') navigate('/quotes?new=quote');
    if (type === 'customer') navigate('/customers?new=customer');
    // Jobs are created automatically from accepted quotes - no manual creation
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  return (
    <div className="hidden lg:block bg-white shadow-sm border-b border-gray-200 px-6">
      <div className="h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 lg:hidden"
            onClick={onHamburger}
            aria-label="Open sidebar"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search customers, quotes, jobs..."
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-80"
              />
            </div>
            <button type="submit" className="btn-secondary">Search</button>
          </form>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <NotificationCenter />

          {/* Plan Badge */}
          {user?.tier && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTierConfig(user.tier).badge_color}`}>
              {getTierConfig(user.tier).name}
            </span>
          )}

          <div className="relative">
            <button
              onClick={() => setOpenNew((v) => !v)}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              New
            </button>
            {openNew && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                <button onClick={() => goNew('quote')} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm">New Quote</button>
                <button onClick={() => goNew('customer')} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm">New Customer</button>
                <div className="px-3 py-1 text-xs text-gray-500 border-t border-gray-100 mt-1">
                  Jobs created from accepted quotes
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.full_name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </button>

            {/* User dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setUserMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <UserCircleIcon className="h-4 w-4 mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;

