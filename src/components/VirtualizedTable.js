import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';

// Virtualized table component for large datasets
const VirtualizedTable = ({
  data = [],
  columns = [],
  height = 400,
  rowHeight = 50,
  headerHeight = 40,
  loading = false,
  onRowClick = null,
  className = '',
  emptyMessage = 'No data available'
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const listRef = useRef(null);

  // Sort data based on current sort configuration
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Handle column sorting
  const handleSort = (columnKey) => {
    setSortConfig(prevConfig => ({
      key: columnKey,
      direction: prevConfig.key === columnKey && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Reset scroll position when data changes
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(0);
    }
  }, [data]);

  // Row renderer for react-window
  const Row = ({ index, style }) => {
    const item = sortedData[index];
    if (!item) return null;

    return (
      <div
        style={style}
        className={`flex items-center border-b border-gray-200 hover:bg-gray-50 ${
          onRowClick ? 'cursor-pointer' : ''
        }`}
        onClick={() => onRowClick?.(item, index)}
      >
        {columns.map((column, colIndex) => {
          const value = column.accessor ? item[column.accessor] : '';
          const displayValue = column.render ? column.render(value, item, index) : value;

          return (
            <div
              key={colIndex}
              className={`px-4 py-2 text-sm ${column.className || ''}`}
              style={{ 
                width: column.width || `${100 / columns.length}%`,
                minWidth: column.minWidth || 'auto',
                maxWidth: column.maxWidth || 'none'
              }}
            >
              {displayValue}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`border border-gray-200 rounded-lg ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`border border-gray-200 rounded-lg ${className}`}>
        <div className="flex items-center justify-center h-64 text-gray-500">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div 
        className="flex bg-gray-50 border-b border-gray-200 font-medium text-sm text-gray-700"
        style={{ height: headerHeight }}
      >
        {columns.map((column, index) => (
          <div
            key={index}
            className={`px-4 py-2 flex items-center ${
              column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
            } ${column.headerClassName || ''}`}
            style={{ 
              width: column.width || `${100 / columns.length}%`,
              minWidth: column.minWidth || 'auto',
              maxWidth: column.maxWidth || 'none'
            }}
            onClick={() => column.sortable !== false && column.accessor && handleSort(column.accessor)}
          >
            <span>{column.header}</span>
            {column.sortable !== false && column.accessor && sortConfig.key === column.accessor && (
              <span className="ml-1">
                {sortConfig.direction === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Virtualized Body */}
      <List
        ref={listRef}
        height={height}
        itemCount={sortedData.length}
        itemSize={rowHeight}
        itemData={sortedData}
      >
        {Row}
      </List>

      {/* Footer with row count */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        Showing {sortedData.length} rows
      </div>
    </div>
  );
};

// Hook for managing large datasets with pagination and search
export const useVirtualizedData = (
  fetchFunction,
  dependencies = [],
  options = {}
) => {
  const {
    pageSize = 100,
    searchFields = [],
    initialSort = null
  } = options;

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Load initial data
  useEffect(() => {
    loadData();
  }, dependencies);

  // Filter data when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });

    setFilteredData(filtered);
  }, [data, searchTerm, searchFields]);

  const loadData = async (page = 0, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchFunction({
        offset: page * pageSize,
        limit: pageSize,
        sort: initialSort
      });

      const newData = result.data || [];
      
      if (append) {
        setData(prev => [...prev, ...newData]);
      } else {
        setData(newData);
        setCurrentPage(0);
      }

      setHasMore(newData.length === pageSize);
    } catch (err) {
      setError(err);
      console.error('Error loading virtualized data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadData(nextPage, true);
    }
  };

  const refresh = () => {
    loadData(0, false);
  };

  return {
    data: filteredData,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    hasMore,
    loadMore,
    refresh,
    totalCount: data.length,
    filteredCount: filteredData.length
  };
};

export default VirtualizedTable;
