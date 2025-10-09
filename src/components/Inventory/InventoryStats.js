import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import inventoryService from '../../services/InventoryService';
import { formatCurrency as fmtCurrency } from '../../utils/formatters';

const InventoryStats = () => {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalValue: 0,
    loading: true
  });

  useEffect(() => {
    if (user?.company_id) {
      loadStats();
    }
  }, [user?.company_id]);

  const loadStats = async () => {
    try {
      // Use the same working approach as the original
      const itemsData = await inventoryService.getItems(user.company_id);
      const stockData = await inventoryService.getStock(user.company_id);

      let totalValue = 0;
      let lowStockCount = 0;
      let outOfStockCount = 0;

      // Calculate stats the same way as the working version
      itemsData.forEach(item => {
        const itemStocks = stockData.filter(s => s.item_id === item.id);
        const totalOnHand = itemStocks.reduce((sum, stock) => sum + (stock.quantity || 0), 0);
        const cost = parseFloat(item.cost) || 0;
        const reorderPoint = item.reorder_point || 5;

        const itemValue = cost * totalOnHand;
        console.log(`Item: ${item.name}, Cost: ${cost}, Quantity: ${totalOnHand}, Value: ${itemValue}`);

        totalValue += itemValue;

        if (totalOnHand === 0) {
          outOfStockCount++;
        } else if (totalOnHand <= reorderPoint) {
          lowStockCount++;
        }
      });

      console.log(`Total calculated value: ${totalValue}`);

      setStats({
        totalItems: itemsData.length,
        lowStockItems: lowStockCount,
        outOfStockItems: outOfStockCount,
        totalValue,
        loading: false
      });
    } catch (error) {
      console.error('Error loading inventory stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const formatCurrency = (amount) => fmtCurrency(amount);

  if (stats.loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Items',
      value: stats.totalItems,
      icon: '📦',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Inventory Value',
      value: formatCurrency(stats.totalValue),
      icon: '💰',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Low Stock',
      value: stats.lowStockItems,
      icon: '⚠️',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'Out of Stock',
      value: stats.outOfStockItems,
      icon: '🚫',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgColor} ${stat.borderColor} border rounded-lg p-4 hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
            <div className="text-3xl">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryStats;
