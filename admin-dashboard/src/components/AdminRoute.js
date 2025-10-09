import React from 'react';

const AdminRoute = ({ children }) => {
  // No authentication required - this is YOUR admin tool
  return children;
};

export default AdminRoute;
