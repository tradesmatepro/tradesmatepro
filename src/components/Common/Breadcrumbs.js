import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumbs = ({ items = [] }) => {
  if (!items.length) return null;
  return (
    <nav className="mb-4 text-sm text-gray-500">
      <ol className="flex items-center gap-1 flex-wrap">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-1">
            {idx > 0 && <span className="text-gray-400">/</span>}
            {item.to ? (
              <Link to={item.to} className="hover:text-gray-700">{item.label}</Link>
            ) : (
              <span className="text-gray-700">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;

