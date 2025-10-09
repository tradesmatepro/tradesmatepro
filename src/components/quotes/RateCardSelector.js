/**
 * Rate Card Selector Component
 * Industry-standard service selection like ServiceTitan/Jobber
 */

import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { RateCardService } from '../../services/RateCardService';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TagIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const RateCardSelector = ({ onSelectService, selectedServices = [] }) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [rateCards, setRateCards] = useState([]);
  const [groupedRateCards, setGroupedRateCards] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    if (user?.company_id) {
      loadRateCards();
    }
  }, [user?.company_id]);

  const loadRateCards = async () => {
    try {
      setLoading(true);
      const cards = await RateCardService.getRateCards(user.company_id);
      setRateCards(cards);
      
      const grouped = await RateCardService.getRateCardsByCategory(user.company_id);
      setGroupedRateCards(grouped);
    } catch (error) {
      console.error('Error loading rate cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCards = rateCards.filter(card => {
    const matchesSearch = card.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || card.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = RateCardService.getServiceCategories();

  const handleSelectService = (rateCard, quantity = 1) => {
    const service = {
      id: rateCard.id,
      service_name: rateCard.service_name,
      description: rateCard.description,
      category: rateCard.category,
      unit_type: rateCard.unit_type,
      rate: rateCard.rate,
      quantity: quantity,
      total: rateCard.rate * quantity
    };
    
    onSelectService(service);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="ALL">All Categories</option>
          {categories.map(category => {
            const count = rateCards.filter(card => card.category === category.value).length;
            if (count === 0) return null;
            return (
              <option key={category.value} value={category.value}>
                {category.label} ({count})
              </option>
            );
          })}
        </select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {filteredCards.length} service{filteredCards.length !== 1 ? 's' : ''} found
      </div>

      {/* Service Cards */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-8">
          <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'No rate cards have been created yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {filteredCards.map(card => {
            const isSelected = selectedServices.some(s => s.id === card.id);
            
            return (
              <div
                key={card.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => handleSelectService(card)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{card.service_name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <TagIcon className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {categories.find(c => c.value === card.category)?.label}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectService(card);
                    }}
                    className={`p-1 rounded-full ${
                      isSelected 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Description */}
                {card.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {card.description}
                  </p>
                )}

                {/* Pricing */}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-gray-900">
                    {RateCardService.formatRateDisplay(card.rate, card.unit_type)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    {card.unit_type === 'HOUR' && <ClockIcon className="w-3 h-3" />}
                    <span>
                      {RateCardService.getUnitTypes().find(u => u.value === card.unit_type)?.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Add Custom Service */}
      <div className="border-t pt-4">
        <button
          onClick={() => {
            const customService = {
              id: `custom-${Date.now()}`,
              service_name: 'Custom Service',
              description: 'Custom service item',
              category: 'OTHER',
              unit_type: 'FLAT_FEE',
              rate: 0,
              quantity: 1,
              total: 0,
              is_custom: true
            };
            onSelectService(customService);
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
        >
          <PlusIcon className="w-4 h-4" />
          Add Custom Service
        </button>
      </div>
    </div>
  );
};

export default RateCardSelector;
