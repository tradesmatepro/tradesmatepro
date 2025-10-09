import React, { useEffect } from 'react';
import { useUser } from '../contexts/UserContext';

const Logout = () => {
  const { logout } = useUser();

  useEffect(() => {
    // Force logout when this component mounts
    logout();
  }, [logout]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Logging out...</h1>
        <p className="text-gray-600">You have been logged out successfully.</p>
      </div>
    </div>
  );
};

export default Logout;
