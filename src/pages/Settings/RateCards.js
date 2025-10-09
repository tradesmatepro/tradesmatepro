/**
 * Rate Cards Management Page - Industry Standard Pricing
 * Like ServiceTitan/Jobber price book management
 */

import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { RateCardService } from '../../services/RateCardService';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  TagIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const RateCards = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [rateCards, setRateCards] = useState([]);
  const [groupedRateCards, setGroupedRateCards] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
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
      
      // Group by category
      const grouped = await RateCardService.getRateCardsByCategory(user.company_id);
      setGroupedRateCards(grouped);
    } catch (error) {
      console.error('Error loading rate cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = () => {
    setEditingCard(null);
    setShowAddModal(true);
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    setShowAddModal(true);
  };

  const handleDeleteCard = async (cardId) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure you want to delete this rate card?')) return;

    try {
      await RateCardService.deleteRateCard(cardId);
      await loadRateCards(); // Refresh
    } catch (error) {
      console.error('Error deleting rate card:', error);
      alert('Failed to delete rate card');
    }
  };

  const filteredCards = selectedCategory === 'ALL' 
    ? rateCards 
    : rateCards.filter(card => card.category === selectedCategory);

  const categories = RateCardService.getServiceCategories();
  const unitTypes = RateCardService.getUnitTypes();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rate Cards</h1>
            <p className="text-gray-600 mt-1">
              Manage your service pricing and rate book
            </p>
          </div>
          <button
            onClick={handleAddCard}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add Rate Card
          </button>
        </div>

        {/* Category Filter */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedCategory === 'ALL'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({rateCards.length})
          </button>
          {categories.map(category => {
            const count = rateCards.filter(card => card.category === category.value).length;
            if (count === 0) return null;
            
            return (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedCategory === category.value
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Rate Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-12">
          <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No rate cards</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first rate card.
          </p>
          <div className="mt-6">
            <button
              onClick={handleAddCard}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Rate Card
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map(card => (
            <div key={card.id} className="bg-white rounded-lg shadow-sm border p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {card.service_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <TagIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {categories.find(c => c.value === card.category)?.label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditCard(card)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {card.description && (
                <p className="text-sm text-gray-600 mb-4">{card.description}</p>
              )}

              {/* Pricing */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {RateCardService.formatRateDisplay(card.rate, card.unit_type)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {unitTypes.find(u => u.value === card.unit_type)?.label}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  {card.active ? (
                    <>
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Active</span>
                    </>
                  ) : (
                    <>
                      <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-yellow-600">Inactive</span>
                    </>
                  )}
                </div>
                {card.is_default && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Default
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <RateCardModal
          card={editingCard}
          onClose={() => setShowAddModal(false)}
          onSave={loadRateCards}
          companyId={user.company_id}
        />
      )}
    </div>
  );
};

// Rate Card Modal Component
const RateCardModal = ({ card, onClose, onSave, companyId }) => {
  const [formData, setFormData] = useState({
    service_name: card?.service_name || '',
    description: card?.description || '',
    category: card?.category || 'OTHER',
    unit_type: card?.unit_type || 'FLAT_FEE',
    rate: card?.rate || '',
    min_quantity: card?.min_quantity || 1,
    max_quantity: card?.max_quantity || '',
    active: card?.active !== false,
    is_default: card?.is_default || false,
    sort_order: card?.sort_order || 0
  });
  const [saving, setSaving] = useState(false);

  const categories = RateCardService.getServiceCategories();
  const unitTypes = RateCardService.getUnitTypes();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (card) {
        await RateCardService.updateRateCard(card.id, formData);
      } else {
        await RateCardService.createRateCard(companyId, formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving rate card:', error);
      alert('Failed to save rate card');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {card ? 'Edit Rate Card' : 'Add Rate Card'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Name *
              </label>
              <input
                type="text"
                value={formData.service_name}
                onChange={(e) => setFormData(prev => ({ ...prev, service_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category and Unit Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Type *
                </label>
                <select
                  value={formData.unit_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {unitTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rate *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, rate: e.target.value }))}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Default for category</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : (card ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RateCards;
