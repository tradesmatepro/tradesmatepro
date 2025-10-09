import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from '../utils/env';
import inventoryAlertsService from './InventoryAlertsService';

class InventoryService {
  constructor() {
    this.baseHeaders = {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json'
    };

    // Track view availability to avoid repeated failed attempts
    this.viewAvailability = {
      inventory_stock_status_named_v: null, // null = unknown, true = available, false = not available
      inventory_item_summary: null,
      lastChecked: null
    };
  }

  // Check if required database views exist
  async checkViewAvailability(companyId) {
    const now = Date.now();
    // Only check once per session or every 5 minutes
    if (this.viewAvailability.lastChecked && (now - this.viewAvailability.lastChecked) < 300000) {
      return this.viewAvailability;
    }

    try {
      // Test inventory_stock_status_named_v
      const stockStatusResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/inventory_stock_status_named_v?company_id=eq.${companyId}&limit=1`,
        { headers: this.baseHeaders }
      );
      this.viewAvailability.inventory_stock_status_named_v = stockStatusResponse.ok;

      // Test inventory_item_summary
      const summaryResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/inventory_item_summary?company_id=eq.${companyId}&limit=1`,
        { headers: this.baseHeaders }
      );
      this.viewAvailability.inventory_item_summary = summaryResponse.ok;

      this.viewAvailability.lastChecked = now;

      console.log('📊 Inventory view availability check:', this.viewAvailability);

      return this.viewAvailability;
    } catch (error) {
      console.warn('Could not check view availability:', error);
      return this.viewAvailability;
    }
  }

  // Get diagnostic information about inventory system health
  async getDiagnosticInfo(companyId) {
    const viewStatus = await this.checkViewAvailability(companyId);

    try {
      // Count basic tables
      const itemsResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/inventory_items?company_id=eq.${companyId}&select=id&limit=1`,
        { headers: this.baseHeaders }
      );
      const hasItems = itemsResponse.ok;

      const stockResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/inventory_stock?company_id=eq.${companyId}&select=id&limit=1`,
        { headers: this.baseHeaders }
      );
      const hasStock = stockResponse.ok;

      const locationsResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/inventory_locations?company_id=eq.${companyId}&select=id&limit=1`,
        { headers: this.baseHeaders }
      );
      const hasLocations = locationsResponse.ok;

      return {
        views: viewStatus,
        tables: {
          inventory_items: hasItems,
          inventory_stock: hasStock,
          inventory_locations: hasLocations
        },
        recommendations: this.getRecommendations(viewStatus, { hasItems, hasStock, hasLocations })
      };
    } catch (error) {
      console.error('Error getting diagnostic info:', error);
      return {
        views: viewStatus,
        tables: { error: error.message },
        recommendations: ['Unable to perform full diagnostic check']
      };
    }
  }

  // Get recommendations based on system status
  getRecommendations(viewStatus, tableStatus) {
    const recommendations = [];

    if (viewStatus.inventory_stock_status_named_v === false) {
      recommendations.push('Create inventory_stock_status_named_v view for optimal performance');
    }

    if (viewStatus.inventory_item_summary === false) {
      recommendations.push('Create inventory_item_summary view for better dashboard performance');
    }

    if (!tableStatus.hasItems) {
      recommendations.push('No inventory items found - add some items to get started');
    }

    if (!tableStatus.hasLocations) {
      recommendations.push('No inventory locations found - create locations to track stock by location');
    }

    if (recommendations.length === 0) {
      recommendations.push('Inventory system is fully optimized!');
    }

    return recommendations;
  }

  // ===== INVENTORY SUMMARY =====
  async getInventorySummary(companyId, filters = {}) {
    try {
      // Check view availability first
      const viewStatus = await this.checkViewAvailability(companyId);

      // If we know the view is not available, skip the attempt
      if (viewStatus.inventory_item_summary === false) {
        console.log('📊 Using fallback calculation (inventory_item_summary view not available)');
        return await this.getInventorySummaryFallback(companyId, filters);
      }

      // Try to use the summary view first
      let url = `${SUPABASE_URL}/rest/v1/inventory_item_summary?company_id=eq.${companyId}&order=item_name.asc`;

      // Apply filters
      if (filters.search) {
        url += `&or=(item_name.ilike.*${filters.search}*,sku.ilike.*${filters.search}*)`;
      }

      if (filters.category) {
        url += `&category=eq.${filters.category}`;
      }

      // inventory_item_summary may not have stock_status; filter client-side if missing
      // Keep server-side filters only if the view exposes stock_status
      if (filters.stockFilter === 'out') {
        url += `&total_available=eq.0`;
      } else if (filters.stockFilter === 'low') {
        // Low-stock heuristic: total_available <= reorder_point and > 0
        // We cannot express this fully in a single REST filter; fetch then filter client-side
      }

      const response = await fetch(url, {
        headers: this.baseHeaders
      });

      if (response.ok) {
        // Mark view as available for future calls
        this.viewAvailability.inventory_item_summary = true;
        return await response.json();
      } else {
        // Mark view as not available and use fallback
        this.viewAvailability.inventory_item_summary = false;
        console.log('📊 inventory_item_summary view not available, using fallback calculation');
        return await this.getInventorySummaryFallback(companyId, filters);
      }
    } catch (error) {
      console.warn('Error fetching inventory summary, using fallback:', error);
      return await this.getInventorySummaryFallback(companyId, filters);
    }
  }

  // Fallback method to calculate inventory summary manually
  async getInventorySummaryFallback(companyId, filters = {}) {
    try {
      // Get all inventory items
      const items = await this.getItems(companyId, filters);

      // Get stock data
      const stockData = await this.getStock(companyId);

      // Calculate reserved quantities (from allocations)
      const reservedData = await this.getReservedQuantities(companyId);

      // Aggregate stock by item
      const result = items.map(item => {
        const itemStocks = stockData.filter(s => s.item_id === item.id);

        let totalOnHand = 0;
        let totalReserved = 0;

        itemStocks.forEach(stock => {
          const onHand = stock.quantity || 0;
          const reserved = reservedData[`${item.id}-${stock.location_id}`] || 0;

          totalOnHand += onHand;
          totalReserved += reserved;
        });

        const totalAvailable = Math.max(0, totalOnHand - totalReserved);
        const reorderPoint = item.reorder_point || 5;

        let stockStatus = 'IN_STOCK';
        if (totalAvailable === 0) {
          stockStatus = 'OUT_OF_STOCK';
        } else if (totalAvailable <= reorderPoint) {
          stockStatus = 'LOW_STOCK';
        }

        return {
          item_id: item.id,
          item_name: item.name,
          sku: item.sku,
          description: item.description,
          category: item.category,
          unit_of_measure: item.unit_of_measure,
          cost: item.cost,
          sell_price: item.sell_price,
          reorder_point: item.reorder_point,
          company_id: companyId,
          total_on_hand: totalOnHand,
          total_reserved: totalReserved,
          total_available: totalAvailable,
          stock_status: stockStatus,
          updated_at: item.updated_at
        };
      });

      // Apply stock filters
      let filteredResult = result;
      if (filters.stockFilter === 'out') {
        filteredResult = result.filter(item => item.stock_status === 'OUT_OF_STOCK');
      } else if (filters.stockFilter === 'low') {
        filteredResult = result.filter(item => item.stock_status === 'LOW_STOCK');
      }

      return filteredResult;
    } catch (error) {
      console.error('Error in fallback inventory summary calculation:', error);
      throw error;
    }
  }

  // Get item details with location breakdown
  async getItemLocationDetails(companyId, itemId) {
    try {
      // Check view availability first
      const viewStatus = await this.checkViewAvailability(companyId);

      // If we know the view is not available, skip the attempt
      if (viewStatus.inventory_stock_status_named_v === false) {
        console.log('📍 Using fallback calculation for item location details (view not available)');
        return await this.getItemLocationDetailsFallback(companyId, itemId);
      }

      // Try to use the stock status view
      let url = `${SUPABASE_URL}/rest/v1/inventory_stock_status_named_v?company_id=eq.${companyId}&item_id=eq.${itemId}&select=*`;

      const response = await fetch(url, {
        headers: this.baseHeaders
      });

      if (response.ok) {
        // Mark view as available for future calls
        this.viewAvailability.inventory_stock_status_named_v = true;
        return await response.json();
      } else {
        // Mark view as not available and use fallback
        this.viewAvailability.inventory_stock_status_named_v = false;
        console.log('📍 inventory_stock_status_named_v view not available, using fallback calculation');
        return await this.getItemLocationDetailsFallback(companyId, itemId);
      }
    } catch (error) {
      console.warn('Error fetching item location details, using fallback:', error);
      return await this.getItemLocationDetailsFallback(companyId, itemId);
    }
  }

  // Fallback for item location details
  async getItemLocationDetailsFallback(companyId, itemId) {
    try {
      // Get item details
      const itemResponse = await fetch(`${SUPABASE_URL}/rest/v1/inventory_items?company_id=eq.${companyId}&id=eq.${itemId}`, {
        headers: this.baseHeaders
      });

      if (!itemResponse.ok) {
        console.error('Failed to fetch item details:', itemResponse.status);
        return [];
      }

      const items = await itemResponse.json();
      const item = items[0];

      if (!item) return [];

      // Get stock data for this item
      const stockResponse = await fetch(`${SUPABASE_URL}/rest/v1/inventory_stock?company_id=eq.${companyId}&item_id=eq.${itemId}&select=*,inventory_locations(name,type)`, {
        headers: this.baseHeaders
      });

      if (!stockResponse.ok) {
        console.error('Failed to fetch stock data:', stockResponse.status);
        return [];
      }

      const stockData = await stockResponse.json();

      if (!Array.isArray(stockData)) {
        console.error('Stock data is not an array:', stockData);
        return [];
      }

      // Get reserved quantities
      const reservedData = await this.getReservedQuantities(companyId);

      // Combine data
      return stockData.map(stock => {
        const reserved = reservedData[`${itemId}-${stock.location_id}`] || 0;
        const onHand = stock.quantity || 0;
        const available = Math.max(0, onHand - reserved);

        return {
          item_id: itemId,
          location_id: stock.location_id,
          company_id: companyId,
          on_hand: onHand,
          reserved: reserved,
          available: available,
          inventory_items: item,
          inventory_locations: stock.inventory_locations
        };
      });
    } catch (error) {
      console.error('Error in fallback item location details:', error);
      throw error;
    }
  }

  // ===== ITEMS WITH STOCK STATUS (Legacy) =====
  async getItemsWithStockStatus(companyId, filters = {}) {
    try {
      // Check view availability first
      const viewStatus = await this.checkViewAvailability(companyId);

      // If we know the view is not available, skip the attempt
      if (viewStatus.inventory_stock_status_named_v === false) {
        console.log('📦 Using fallback calculation for items with stock status (view not available)');
        return await this.getItemsWithCalculatedStock(companyId, filters);
      }

      // First try the stock status view
      let url = `${SUPABASE_URL}/rest/v1/inventory_stock_status_named_v?company_id=eq.${companyId}&select=*&order=item_name.asc`;

      // Apply filters
      if (filters.search) {
        url += `&or=(item_name.ilike.*${filters.search}*,sku.ilike.*${filters.search}*)`;
      }

      if (filters.category) {
        url += `&category=eq.${filters.category}`;
      }

      if (filters.stockFilter === 'out') {
        url += `&available=eq.0`;
      }

      const response = await fetch(url, {
        headers: this.baseHeaders
      });

      if (response.ok) {
        // Mark view as available for future calls
        this.viewAvailability.inventory_stock_status_named_v = true;

        let data = await response.json();

        // Client-side filtering for low stock
        if (filters.stockFilter === 'low') {
          data = data.filter(item => {
            const reorderPoint = item.reorder_point || 5;
            return item.available > 0 && item.available <= reorderPoint;
          });
        }

        return data;
      } else {
        // Mark view as not available and use fallback
        this.viewAvailability.inventory_stock_status_named_v = false;
        console.log('📦 inventory_stock_status_named_v view not available, using fallback calculation');
        return await this.getItemsWithCalculatedStock(companyId, filters);
      }
    } catch (error) {
      console.warn('Error fetching items with stock status, using fallback:', error);
      return await this.getItemsWithCalculatedStock(companyId, filters);
    }
  }

  // Fallback method to calculate stock status manually
  async getItemsWithCalculatedStock(companyId, filters = {}) {
    try {
      // Get all inventory items
      const items = await this.getItems(companyId, filters);

      // Get stock data
      const stockData = await this.getStock(companyId);

      // Calculate reserved quantities (from allocations)
      const reservedData = await this.getReservedQuantities(companyId);

      // Combine data
      const result = [];

      for (const item of items) {
        const itemStock = stockData.filter(s => s.item_id === item.id);

        for (const stock of itemStock) {
          const reserved = reservedData[`${item.id}-${stock.location_id}`] || 0;
          const onHand = stock.quantity || 0;
          const available = Math.max(0, onHand - reserved);

          result.push({
            item_id: item.id,
            location_id: stock.location_id,
            company_id: companyId,
            on_hand: onHand,
            reserved: reserved,
            available: available,
            item_name: item.name,
            inventory_items: item,
            inventory_locations: stock.inventory_locations
          });
        }
      }

      // Apply stock filters
      let filteredResult = result;
      if (filters.stockFilter === 'out') {
        filteredResult = result.filter(item => item.available === 0);
      } else if (filters.stockFilter === 'low') {
        filteredResult = result.filter(item => {
          const reorderPoint = item.inventory_items?.reorder_point || 5;
          return item.available > 0 && item.available <= reorderPoint;
        });
      }

      return filteredResult;
    } catch (error) {
      console.error('Error in fallback stock calculation:', error);
      throw error;
    }
  }

  // Get reserved quantities from allocations
  async getReservedQuantities(companyId) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/inventory_movements?company_id=eq.${companyId}&movement_type=eq.ALLOCATION&select=item_id,location_id,quantity`;

      const response = await fetch(url, {
        headers: this.baseHeaders
      });

      if (!response.ok) {
        return {}; // Return empty if allocations table doesn't exist
      }

      const allocations = await response.json();
      const reserved = {};

      allocations.forEach(allocation => {
        const key = `${allocation.item_id}-${allocation.location_id}`;
        reserved[key] = (reserved[key] || 0) + (allocation.quantity || 0);
      });

      return reserved;
    } catch (error) {
      console.warn('Could not fetch reserved quantities:', error);
      return {};
    }
  }

  // ===== ITEMS =====
  async getItems(companyId, filters = {}) {
    try {
      let url = `${SUPABASE_URL}/rest/v1/inventory_items?company_id=eq.${companyId}&select=*&order=name.asc`;
      
      // Apply filters
      if (filters.search) {
        url += `&or=(name.ilike.*${filters.search}*,sku.ilike.*${filters.search}*,category.ilike.*${filters.search}*)`;
      }
      if (filters.category) {
        url += `&category=eq.${filters.category}`;
      }

      const response = await fetch(url, {
        headers: this.baseHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      throw error;
    }
  }

  async createItem(companyId, itemData) {
    try {
      // Create the item first
      const response = await fetch(`${SUPABASE_URL}/rest/v1/inventory_items`, {
        method: 'POST',
        headers: {
          ...this.baseHeaders,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          ...itemData,
          company_id: companyId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create item: ${response.statusText}`);
      }

      const text = await response.text();
      const createdItem = text ? JSON.parse(text) : null;

      if (!createdItem || !createdItem[0]) {
        throw new Error('Failed to get created item data');
      }

      const newItem = createdItem[0];

      // Create initial stock records for all locations with 0 quantity
      try {
        const locations = await this.getLocations(companyId);

        for (const location of locations) {
          await fetch(`${SUPABASE_URL}/rest/v1/inventory_stock`, {
            method: 'POST',
            headers: this.baseHeaders,
            body: JSON.stringify({
              company_id: companyId,
              item_id: newItem.id,
              location_id: location.id,
              quantity: 0
            })
          });
        }

        console.log(`Created initial stock records for item ${newItem.name} in ${locations.length} locations`);
      } catch (stockError) {
        console.warn('Failed to create initial stock records:', stockError);
        // Don't fail the entire operation if stock creation fails
      }

      return newItem;
    } catch (error) {
      console.error('Error creating inventory item:', error);
      throw error;
    }
  }

  async updateItem(itemId, itemData) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/inventory_items?id=eq.${itemId}`, {
        method: 'PATCH',
        headers: {
          ...this.baseHeaders,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(itemData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update item: ${response.statusText}`);
      }

      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  }

  async deleteItem(companyId, itemId) {
    try {
      // Check for dependencies before deleting
      const dependencies = await this.checkItemDependencies(companyId, itemId);

      if (dependencies.hasStock || dependencies.hasMovements || dependencies.hasWorkOrderItems) {
        let message = 'Cannot delete item because it has:';
        if (dependencies.hasStock) message += '\n• Stock records';
        if (dependencies.hasMovements) message += '\n• Movement history';
        if (dependencies.hasWorkOrderItems) message += '\n• Work order references';
        message += '\n\nPlease remove these dependencies first or contact support.';
        throw new Error(message);
      }

      const response = await fetch(`${SUPABASE_URL}/rest/v1/inventory_items?company_id=eq.${companyId}&id=eq.${itemId}`, {
        method: 'DELETE',
        headers: this.baseHeaders
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete failed:', response.status, errorText);
        throw new Error(`Failed to delete item: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  }

  // Helper method to check for dependencies
  async checkItemDependencies(companyId, itemId) {
    try {
      // Check inventory_stock
      const stockResponse = await fetch(`${SUPABASE_URL}/rest/v1/inventory_stock?company_id=eq.${companyId}&item_id=eq.${itemId}&select=id`, {
        headers: this.baseHeaders
      });
      const stockData = stockResponse.ok ? await stockResponse.json() : [];

      // Check inventory_movements
      const movementsResponse = await fetch(`${SUPABASE_URL}/rest/v1/inventory_movements?company_id=eq.${companyId}&item_id=eq.${itemId}&select=id&limit=1`, {
        headers: this.baseHeaders
      });
      const movementsData = movementsResponse.ok ? await movementsResponse.json() : [];

      // Check work_order_items
      const workOrderItemsResponse = await fetch(`${SUPABASE_URL}/rest/v1/work_order_items?inventory_item_id=eq.${itemId}&select=id&limit=1`, {
        headers: this.baseHeaders
      });
      const workOrderItemsData = workOrderItemsResponse.ok ? await workOrderItemsResponse.json() : [];

      return {
        hasStock: stockData.length > 0,
        hasMovements: movementsData.length > 0,
        hasWorkOrderItems: workOrderItemsData.length > 0
      };
    } catch (error) {
      console.error('Error checking dependencies:', error);
      // If we can't check dependencies, allow the delete attempt
      return { hasStock: false, hasMovements: false, hasWorkOrderItems: false };
    }
  }

  // Force delete item with all dependencies (for cleanup/testing)
  async forceDeleteItem(companyId, itemId) {
    try {
      console.log(`Force deleting item ${itemId} and all dependencies...`);

      // Delete in reverse dependency order

      // 1. Delete inventory movements
      const movementsResponse = await fetch(`${SUPABASE_URL}/rest/v1/inventory_movements?company_id=eq.${companyId}&item_id=eq.${itemId}`, {
        method: 'DELETE',
        headers: this.baseHeaders
      });
      if (movementsResponse.ok) {
        console.log('Deleted inventory movements');
      }

      // 2. Delete inventory stock
      const stockResponse = await fetch(`${SUPABASE_URL}/rest/v1/inventory_stock?company_id=eq.${companyId}&item_id=eq.${itemId}`, {
        method: 'DELETE',
        headers: this.baseHeaders
      });
      if (stockResponse.ok) {
        console.log('Deleted inventory stock');
      }

      // 3. Delete work order item references (if any)
      const workOrderItemsResponse = await fetch(`${SUPABASE_URL}/rest/v1/work_order_items?inventory_item_id=eq.${itemId}`, {
        method: 'DELETE',
        headers: this.baseHeaders
      });
      if (workOrderItemsResponse.ok) {
        console.log('Deleted work order item references');
      }

      // 4. Finally delete the item itself
      const itemResponse = await fetch(`${SUPABASE_URL}/rest/v1/inventory_items?company_id=eq.${companyId}&id=eq.${itemId}`, {
        method: 'DELETE',
        headers: this.baseHeaders
      });

      if (!itemResponse.ok) {
        const errorText = await itemResponse.text();
        throw new Error(`Failed to delete item: ${itemResponse.status} ${itemResponse.statusText} - ${errorText}`);
      }

      console.log('Successfully force deleted item and all dependencies');
      return true;
    } catch (error) {
      console.error('Error force deleting inventory item:', error);
      throw error;
    }
  }

  // ===== LOCATIONS =====
  async getLocations(companyId) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/inventory_locations?company_id=eq.${companyId}&select=*&order=is_default.desc,name.asc`,
        { headers: this.baseHeaders }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch locations: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching inventory locations:', error);
      throw error;
    }
  }

  async createLocation(companyId, locationData) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/inventory_locations`, {
        method: 'POST',
        headers: {
          ...this.baseHeaders,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          ...locationData,
          company_id: companyId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create location: ${response.statusText}`);
      }

      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error('Error creating inventory location:', error);
      throw error;
    }
  }

  async updateLocation(locationId, locationData) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/inventory_locations?id=eq.${locationId}`, {
        method: 'PATCH',
        headers: {
          ...this.baseHeaders,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(locationData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update location: ${response.statusText}`);
      }

      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error('Error updating inventory location:', error);
      throw error;
    }
  }

  async deleteLocation(locationId) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/inventory_locations?id=eq.${locationId}`, {
        method: 'DELETE',
        headers: this.baseHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to delete location: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting inventory location:', error);
      throw error;
    }
  }

  // ===== STOCK =====
  async getStock(companyId, filters = {}) {
    try {
      let url = `${SUPABASE_URL}/rest/v1/inventory_stock?company_id=eq.${companyId}&select=*,inventory_items(name,sku,unit_of_measure),inventory_locations(name)&order=updated_at.desc`;
      
      if (filters.itemId) {
        url += `&item_id=eq.${filters.itemId}`;
      }
      if (filters.locationId) {
        url += `&location_id=eq.${filters.locationId}`;
      }

      const response = await fetch(url, {
        headers: this.baseHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stock: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching inventory stock:', error);
      throw error;
    }
  }

  // ===== MOVEMENTS =====
  async getMovements(companyId, filters = {}) {
    try {
      let url = `${SUPABASE_URL}/rest/v1/inventory_movements?company_id=eq.${companyId}&select=*,inventory_items(name,sku),inventory_locations(name)&order=created_at.desc`;
      
      if (filters.itemId) {
        url += `&item_id=eq.${filters.itemId}`;
      }
      if (filters.locationId) {
        url += `&location_id=eq.${filters.locationId}`;
      }
      if (filters.movementType) {
        url += `&movement_type=eq.${filters.movementType}`;
      }
      if (filters.startDate) {
        url += `&created_at=gte.${filters.startDate}`;
      }
      if (filters.endDate) {
        url += `&created_at=lte.${filters.endDate}`;
      }

      const response = await fetch(url, {
        headers: this.baseHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch movements: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching inventory movements:', error);
      throw error;
    }
  }

  async createMovement(companyId, movementData, userId = null) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/inventory_movements`, {
        method: 'POST',
        headers: {
          ...this.baseHeaders,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          ...movementData,
          company_id: companyId
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Movement creation failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          data: movementData
        });
        throw new Error(`Failed to create movement: ${response.statusText} - ${errorText}`);
      }

      const text = await response.text();
      const result = text ? JSON.parse(text) : null;

      // After creating movement, check for inventory alerts
      if (userId) {
        try {
          await inventoryAlertsService.checkAndCreateAlerts(companyId, userId);
        } catch (alertError) {
          console.error('Error checking inventory alerts after movement:', alertError);
          // Don't fail the movement creation if alert checking fails
        }
      }

      return result;
    } catch (error) {
      console.error('Error creating inventory movement:', error);
      throw error;
    }
  }

  // ===== UTILITY METHODS =====
  async getCategories(companyId) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/inventory_items?company_id=eq.${companyId}&select=category&category=not.is.null`,
        { headers: this.baseHeaders }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const items = await response.json();
      const categories = [...new Set(items.map(item => item.category).filter(Boolean))];
      return categories.sort();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
}

export default new InventoryService();
