# Inventory Management Module

## Overview
Complete inventory management system for TradeMate Pro with CRUD operations for items, locations, stock tracking, and movement history.

## Features

### 📦 Items Management
- **CRUD Operations**: Create, read, update, delete inventory items
- **Item Details**: SKU, name, description, category, unit of measure
- **Pricing**: Cost and sell price tracking
- **Reorder Points**: Low stock alerts
- **Search & Filter**: By name, SKU, or category

### 📍 Locations Management
- **Multiple Locations**: Warehouses, trucks, job sites
- **Location Details**: Name, address, default location flag
- **Visual Cards**: Clean card-based interface

### 📊 Stock Overview
- **Real-time Stock Levels**: Current quantities per item/location
- **Stock Status**: Out of stock, low stock, in stock indicators
- **Filtering**: By item or location
- **Summary Cards**: Total items, low stock alerts, out of stock counts

### 📋 Movement History
- **Movement Types**: Purchase, Usage, Transfer, Return, Adjustment
- **Detailed Tracking**: Item, location, quantity, unit cost, notes
- **Filtering**: By date range, item, location, movement type
- **Audit Trail**: Complete history of all inventory changes

## Database Schema

### Tables Used
- `inventory_items` - Item master data
- `inventory_locations` - Storage locations
- `inventory_stock` - Current stock levels (auto-updated)
- `inventory_movements` - Transaction history

### Key Features
- **Multi-tenant**: All queries filtered by company_id
- **Referential Integrity**: Foreign keys to items and locations
- **Audit Trail**: Created/updated timestamps
- **Data Validation**: Required fields and type checking

## Components

### Core Components
- `Inventory.js` - Main page with tab navigation
- `ItemsTab.js` - Items CRUD interface
- `LocationsTab.js` - Locations management
- `StockTab.js` - Stock level overview
- `MovementsTab.js` - Movement history and recording

### Modal Components
- `ItemModal.js` - Add/edit items
- `LocationModal.js` - Add/edit locations
- `MovementModal.js` - Record new movements

### Service Layer
- `InventoryService.js` - API calls and business logic

## Usage

### Navigation
Access via sidebar: **Operations → Inventory**

### Permissions
Requires `INVENTORY` module permission in user permissions.

### Workflow
1. **Setup Locations** - Create warehouses, trucks, etc.
2. **Add Items** - Create inventory items with details
3. **Record Movements** - Track purchases, usage, transfers
4. **Monitor Stock** - Check levels and reorder alerts

## Business Value

### For Trade Businesses
- **Accurate Job Costing** - Track material costs per job
- **Prevent Stockouts** - Reorder alerts for critical items
- **Reduce Waste** - Monitor usage patterns
- **Improve Margins** - Better cost visibility

### Competitive Advantage
- **Complete Solution** - Matches ServiceTitan, Jobber features
- **Multi-location** - Trucks, warehouses, job sites
- **Audit Trail** - Full movement history
- **Integration Ready** - Links to work orders and jobs

## Future Enhancements
- Barcode scanning
- Purchase order generation
- Vendor management
- Automated reordering
- Mobile app integration
- Advanced reporting
