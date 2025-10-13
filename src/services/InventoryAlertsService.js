import { getSupabaseClient } from '../utils/supabaseClient';

class InventoryAlertsService {
  constructor() {
    this.supabase = getSupabaseClient();
  }

  // Get inventory alerts (low stock and out of stock items)
  async getInventoryAlerts(companyId) {
    try {
      // ✅ SECURE: Use Supabase client with RLS protection
      const { data: stockData, error } = await this.supabase
        .from('inventory_stock')
        .select('*, inventory_items(*), inventory_locations(*)')
        .eq('company_id', companyId);

      if (error) {
        console.warn(`Inventory alerts temporarily unavailable: ${error.message}`);
        return { outOfStock: [], lowStock: [], inStock: [] };
      }

      if (!stockData) {
        return { outOfStock: [], lowStock: [], inStock: [] };
      }
      
      // Process stock data to identify alerts
      const alerts = {
        outOfStock: [],
        lowStock: [],
        inStock: []
      };

      stockData.forEach(stock => {
        const item = stock.inventory_items;
        const location = stock.inventory_locations;
        
        if (!item) return;

        const alertItem = {
          ...stock,
          item_name: item.name,
          item_sku: item.sku,
          location_name: location?.name || 'Unknown Location',
          reorder_point: item.reorder_point || 0,
          unit_of_measure: item.unit_of_measure || 'each'
        };

        if (stock.quantity <= 0) {
          alerts.outOfStock.push(alertItem);
        } else if (stock.quantity <= (item.reorder_point || 0)) {
          alerts.lowStock.push(alertItem);
        } else {
          alerts.inStock.push(alertItem);
        }
      });

      return alerts;
    } catch (error) {
      console.error('Error fetching inventory alerts:', error);
      return { outOfStock: [], lowStock: [], inStock: [] }; // Return empty structure instead of throwing
    }
  }

  // Get summary counts for dashboard
  async getAlertsSummary(companyId) {
    try {
      const alerts = await this.getInventoryAlerts(companyId);
      
      return {
        outOfStockCount: alerts.outOfStock.length,
        lowStockCount: alerts.lowStock.length,
        totalAlertsCount: alerts.outOfStock.length + alerts.lowStock.length,
        inStockCount: alerts.inStock.length
      };
    } catch (error) {
      console.error('Error fetching alerts summary:', error);
      return {
        outOfStockCount: 0,
        lowStockCount: 0,
        totalAlertsCount: 0,
        inStockCount: 0
      };
    }
  }

  // Create notification for inventory alert
  async createInventoryNotification(companyId, userId, itemId, itemName, currentQuantity, reorderPoint, isOutOfStock = false) {
    try {
      const severity = isOutOfStock ? 'CRITICAL' : 'WARNING';
      const title = isOutOfStock ? 'Out of Stock Alert' : 'Low Stock Alert';
      const message = isOutOfStock 
        ? `${itemName} is out of stock (0 remaining)`
        : `${itemName} stock dropped to ${currentQuantity} (below threshold of ${reorderPoint})`;

      const notificationData = {
        company_id: companyId,
        user_id: userId,
        type: 'INVENTORY_ALERT',
        message: `${title}: ${message}`,
        status: 'pending'
      };

      // ✅ SECURE: Use Supabase client with RLS protection
      const { data, error } = await this.supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create notification: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating inventory notification:', error);
      throw error;
    }
  }

  // Check for new alerts and create notifications (prevent spam)
  async checkAndCreateAlerts(companyId, userId) {
    try {
      const alerts = await this.getInventoryAlerts(companyId);
      const alertItems = [...alerts.outOfStock, ...alerts.lowStock];
      
      // Get existing notifications for these items to prevent spam
      const itemIds = alertItems.map(item => item.item_id);
      if (itemIds.length === 0) return;

      // ✅ SECURE: Use Supabase client with RLS protection
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: existingNotifications, error } = await this.supabase
        .from('notifications')
        .select('*')
        .eq('company_id', companyId)
        .eq('type', 'INVENTORY')
        .in('related_id', itemIds)
        .gte('created_at', yesterday);

      if (error) {
        console.error('Error fetching existing notifications:', error);
        return;
      }
      const notifiedItemIds = new Set((existingNotifications || []).map(n => n.related_id));

      // Create notifications for items that haven't been notified in the last 24 hours
      const newNotifications = [];
      
      for (const alertItem of alertItems) {
        if (!notifiedItemIds.has(alertItem.item_id)) {
          const isOutOfStock = alertItem.quantity <= 0;
          
          try {
            await this.createInventoryNotification(
              companyId,
              userId,
              alertItem.item_id,
              alertItem.item_name,
              alertItem.quantity,
              alertItem.reorder_point,
              isOutOfStock
            );
            newNotifications.push(alertItem);
          } catch (error) {
            console.error(`Failed to create notification for item ${alertItem.item_name}:`, error);
          }
        }
      }

      return {
        alertsChecked: alertItems.length,
        notificationsCreated: newNotifications.length,
        newNotifications
      };
    } catch (error) {
      console.error('Error checking and creating alerts:', error);
      throw error;
    }
  }

  // Get stock status for a specific item
  getStockStatus(quantity, reorderPoint) {
    if (quantity <= 0) {
      return {
        status: 'out',
        label: 'Out of Stock',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        badgeColor: 'bg-red-500'
      };
    } else if (quantity <= reorderPoint) {
      return {
        status: 'low',
        label: 'Low Stock',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        badgeColor: 'bg-yellow-500'
      };
    } else {
      return {
        status: 'good',
        label: 'In Stock',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        badgeColor: 'bg-green-500'
      };
    }
  }
}

export default new InventoryAlertsService();
