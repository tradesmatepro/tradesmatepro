import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useIntegrations } from '../../contexts/IntegrationsContext';
import { useUser } from '../../contexts/UserContext';
import { getRoleDisplayName, getRoleBadgeColor } from '../../utils/roleUtils';
import { getPermittedNavigation, hasModuleAccess, MODULES } from '../../utils/simplePermissions';
import { getInitials } from '../../utils/avatarUtils';
import {
  HomeIcon,
  UsersIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  FolderIcon,
  CogIcon,
  XMarkIcon,
  BellIcon,
  CloudArrowUpIcon,
  BoltIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  UserIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose, onMenuClick }) => {
  const location = useLocation();
  const { integrations } = useIntegrations();
  const { user, logout } = useUser();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(new Set(['Work', 'Sales'])); // Default expanded groups

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };



  // Remove all old navigation building - using new grouped navigation only

  // Get the new grouped navigation and handle logout
  const navigation = getPermittedNavigation(user, integrations).map(item => {
    // Handle logout functionality for items and sub-items
    if (item.type === 'group' && item.items) {
      return {
        ...item,
        items: item.items.map(subItem => {
          if (subItem.isLogout) {
            return {
              ...subItem,
              onClick: () => {
                logout();
                onClose();
              }
            };
          }
          return subItem;
        })
      };
    } else if (item.isLogout) {
      return {
        ...item,
        onClick: () => {
          logout();
          onClose();
        }
      };
    }
    return item;
  });

  return (
    <>
      {/* Desktop sidebar - Fixed position */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto lg:bg-gray-900 lg:pb-4">
        <div className="flex h-16 shrink-0 items-center px-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="ml-3 text-xl font-bold text-white">TradeMate Pro</span>
          </div>
        </div>
        <nav className="mt-8">
          <ul className="space-y-2 px-4">
            {navigation.map((item) => {
              if (item.type === 'group') {
                const isExpanded = expandedGroups.has(item.name);
                return (
                  <li key={item.name}>
                    <button
                      onClick={() => toggleGroup(item.name)}
                      className="group flex w-full items-center justify-between rounded-md p-3 text-sm leading-6 font-semibold text-gray-300 hover:text-white hover:bg-gray-800"
                    >
                      <div className="flex items-center gap-x-3">
                        <item.icon className="h-6 w-6 shrink-0" />
                        {item.name}
                      </div>
                      {isExpanded ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </button>
                    {isExpanded && (
                      <ul className="mt-2 space-y-1 pl-6">
                        {item.items.map((subItem) => {
                          const isActive = location.pathname === subItem.href ||
                            (subItem.href === '/dashboard' && location.pathname === '/');

                          return (
                            <li key={subItem.name}>
                              <Link
                                to={subItem.href}
                                className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors ${
                                  isActive
                                    ? 'bg-primary-700 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                              >
                                <subItem.icon className="h-5 w-5 shrink-0" />
                                {subItem.name}
                                {subItem.badge && (
                                  <span className="ml-auto text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                                    {subItem.badge}
                                  </span>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              } else {
                // Single item (Dashboard, Timesheets for employees, etc.)
                const isActive = location.pathname === item.href ||
                  (item.href === '/dashboard' && location.pathname === '/');

                return (
                  <li key={item.name}>
                    {item.isLogout ? (
                      <button
                        onClick={item.onClick}
                        className="group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-colors text-gray-300 hover:text-white hover:bg-gray-800 w-full text-left"
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        {item.name}
                      </button>
                    ) : (
                      <Link
                        to={item.href}
                        className={`group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-colors ${
                          isActive
                            ? 'bg-primary-700 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        {item.name}
                        {item.badge && (
                          <span className="ml-auto text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )}
                  </li>
                );
              }
            })}
          </ul>
        </nav>
      </aside>

      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex h-16 shrink-0 items-center justify-between px-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="ml-3 text-xl font-bold text-white">TradeMate Pro</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex-1">
            <ul className="space-y-2 px-4">
              {navigation.map((item) => {
                if (item.type === 'group') {
                  const isExpanded = expandedGroups.has(item.name);
                  return (
                    <li key={item.name}>
                      <button
                        onClick={() => toggleGroup(item.name)}
                        className="group flex w-full items-center justify-between rounded-md p-3 text-sm leading-6 font-semibold text-gray-300 hover:text-white hover:bg-gray-800"
                      >
                        <div className="flex items-center gap-x-3">
                          <item.icon className="h-6 w-6 shrink-0" />
                          {item.name}
                        </div>
                        {isExpanded ? (
                          <ChevronDownIcon className="h-4 w-4" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4" />
                        )}
                      </button>
                      {isExpanded && (
                        <ul className="mt-2 space-y-1 pl-6">
                          {item.items.map((subItem) => {
                            const isActive = location.pathname === subItem.href ||
                              (subItem.href === '/dashboard' && location.pathname === '/');

                            return (
                              <li key={subItem.name}>
                                <Link
                                  to={subItem.href}
                                  onClick={onClose}
                                  className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors ${
                                    isActive
                                      ? 'bg-primary-700 text-white'
                                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                  }`}
                                >
                                  <subItem.icon className="h-5 w-5 shrink-0" />
                                  {subItem.name}
                                  {subItem.badge && (
                                    <span className="ml-auto text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                                      {subItem.badge}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                } else {
                  // Single item
                  const isActive = location.pathname === item.href ||
                    (item.href === '/dashboard' && location.pathname === '/');

                  return (
                    <li key={item.name}>
                      {item.isLogout ? (
                        <button
                          onClick={item.onClick}
                          className="group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-colors text-gray-300 hover:text-white hover:bg-gray-800 w-full text-left"
                        >
                          <item.icon className="h-6 w-6 shrink-0" />
                          {item.name}
                        </button>
                      ) : (
                        <Link
                          to={item.href}
                          onClick={onClose}
                          className={`group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-colors ${
                            isActive
                              ? 'bg-primary-700 text-white'
                              : 'text-gray-300 hover:text-white hover:bg-gray-800'
                          }`}
                        >
                          <item.icon className="h-6 w-6 shrink-0" />
                          {item.name}
                          {item.badge && (
                            <span className="ml-auto text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      )}
                    </li>
                  );
                }
              })}
            </ul>
          </nav>

          {/* User section at bottom */}
          <div className="mt-auto p-4 border-t border-gray-700">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center w-full p-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
              >
                <div className="h-8 w-8 mr-3 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">
                    {getInitials(user?.full_name)}
                  </span>
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium">{user?.full_name}</div>
                  <div className="text-xs text-gray-400">{user?.email}</div>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(user?.role)}`}>
                      {getRoleDisplayName(user?.role)}
                    </span>
                  </div>
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-full bg-gray-800 rounded-md shadow-lg py-1">
                  <Link
                    to="/profile"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onClose();
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <UserIcon className="h-4 w-4 mr-2" />
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                      onClose();
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
