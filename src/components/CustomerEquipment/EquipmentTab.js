import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  WrenchScrewdriverIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../../contexts/UserContext';
import { supaFetch } from '../../utils/supaFetch';
import EquipmentCard from './EquipmentCard';
import EquipmentModal from './EquipmentModal';

/**
 * EquipmentTab Component
 * Main tab for managing customer equipment
 */
const EquipmentTab = ({ customerId }) => {
  const { user } = useUser();
  const [equipment, setEquipment] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (customerId) {
      loadEquipment();
      loadEmployees();
    }
  }, [customerId]);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const response = await supaFetch(
        `customer_equipment?customer_id=eq.${customerId}&select=*,installed_by_employee:employees!customer_equipment_installed_by_fkey(first_name,last_name)&order=created_at.desc`,
        { method: 'GET' },
        user.company_id
      );

      if (response.ok) {
        const data = await response.json();
        // Flatten the installed_by employee data
        const formattedData = data.map(item => ({
          ...item,
          installed_by_name: item.installed_by_employee
            ? `${item.installed_by_employee.first_name} ${item.installed_by_employee.last_name}`
            : null
        }));
        setEquipment(formattedData);
      } else {
        console.error('Failed to load equipment');
      }
    } catch (error) {
      console.error('Error loading equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await supaFetch(
        `employees?select=id,first_name,last_name&company_id=eq.${user.company_id}`,
        { method: 'GET' },
        user.company_id
      );

      if (response.ok) {
        const data = await response.json();
        setEmployees(data || []);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleSave = async (equipmentData) => {
    try {
      const payload = {
        company_id: user.company_id,
        customer_id: customerId,
        equipment_type: equipmentData.equipment_type,
        manufacturer: equipmentData.manufacturer,
        model_number: equipmentData.model_number || null,
        serial_number: equipmentData.serial_number || null,
        install_date: equipmentData.install_date || null,
        installed_by: equipmentData.installed_by || null,
        warranty_start_date: equipmentData.warranty_start_date || null,
        warranty_end_date: equipmentData.warranty_end_date || null,
        warranty_provider: equipmentData.warranty_provider || null,
        location_description: equipmentData.location_description || null,
        status: equipmentData.status || 'active',
        notes: equipmentData.notes || null,
        photos: equipmentData.photos || [],
        documents: equipmentData.documents || []
      };

      let response;
      if (equipmentData.id) {
        // Update existing equipment
        response = await supaFetch(
          `customer_equipment?id=eq.${equipmentData.id}`,
          {
            method: 'PATCH',
            body: payload
          },
          user.company_id
        );
      } else {
        // Create new equipment
        response = await supaFetch(
          'customer_equipment',
          {
            method: 'POST',
            body: payload
          },
          user.company_id
        );
      }

      if (response.ok) {
        await loadEquipment();
        setShowModal(false);
        setSelectedEquipment(null);
      } else {
        throw new Error('Failed to save equipment');
      }
    } catch (error) {
      console.error('Error saving equipment:', error);
      throw error;
    }
  };

  const handleEdit = (equipment) => {
    setSelectedEquipment(equipment);
    setShowModal(true);
  };

  const handleDelete = async (equipment) => {
    // eslint-disable-next-line no-restricted-globals
    if (!window.confirm(`Are you sure you want to delete this ${equipment.equipment_type}?`)) {
      return;
    }

    try {
      const response = await supaFetch(
        `customer_equipment?id=eq.${equipment.id}`,
        { method: 'DELETE' },
        user.company_id
      );

      if (response.ok) {
        await loadEquipment();
      } else {
        alert('Failed to delete equipment');
      }
    } catch (error) {
      console.error('Error deleting equipment:', error);
      alert('Failed to delete equipment');
    }
  };

  const handleViewPhotos = (equipment) => {
    // TODO: Implement photo viewer
    alert('Photo viewer coming soon!');
  };

  const handleAddNew = () => {
    setSelectedEquipment(null);
    setShowModal(true);
  };

  // Filter equipment
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = 
      item.equipment_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: equipment.length,
    active: equipment.filter(e => e.status === 'active').length,
    warrantyActive: equipment.filter(e => {
      if (!e.warranty_end_date) return false;
      return new Date(e.warranty_end_date) > new Date();
    }).length,
    warrantyExpiring: equipment.filter(e => {
      if (!e.warranty_end_date) return false;
      const daysRemaining = Math.ceil((new Date(e.warranty_end_date) - new Date()) / (1000 * 60 * 60 * 24));
      return daysRemaining > 0 && daysRemaining <= 90;
    }).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Customer Equipment</h2>
          <p className="text-sm text-gray-600 mt-1">
            Track installed equipment, serial numbers, and warranties
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Add Equipment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Equipment</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Warranty Active</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.warrantyActive}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Expiring Soon</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.warrantyExpiring}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search equipment, manufacturer, model, or serial number..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="retired">Retired</option>
            <option value="replaced">Replaced</option>
          </select>
        </div>
      </div>

      {/* Equipment List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-2">Loading equipment...</p>
        </div>
      ) : filteredEquipment.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <WrenchScrewdriverIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No equipment found' : 'No equipment yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Add equipment to track installations, serial numbers, and warranties'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={handleAddNew}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add First Equipment
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEquipment.map((item) => (
            <EquipmentCard
              key={item.id}
              equipment={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewPhotos={handleViewPhotos}
            />
          ))}
        </div>
      )}

      {/* Equipment Modal */}
      <EquipmentModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedEquipment(null);
        }}
        onSave={handleSave}
        equipment={selectedEquipment}
        employees={employees}
        customerId={customerId}
      />
    </div>
  );
};

export default EquipmentTab;

