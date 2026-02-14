const moduleDefinitions = {
  // ---- ERP Modules ----
  inventory: {
    id: 'inventory',
    name: 'Inventory Management',
    icon: 'package',
    category: 'erp',
    description: 'Track products, stock levels, warehouses, and inventory movements.',
    defaultEntities: [
      {
        name: 'Product',
        fields: [
          { name: 'name', type: 'String', required: true },
          { name: 'sku', type: 'String', required: true, unique: true },
          { name: 'description', type: 'String' },
          { name: 'price', type: 'Number', required: true },
          { name: 'costPrice', type: 'Number' },
          { name: 'quantity', type: 'Number', required: true, defaultValue: 0 },
          { name: 'reorderLevel', type: 'Number', defaultValue: 10 },
          { name: 'category', type: 'String' },
          { name: 'unit', type: 'String', defaultValue: 'pcs' },
          { name: 'status', type: 'Enum', enumValues: ['active', 'discontinued', 'draft'] }
        ]
      },
      {
        name: 'Warehouse',
        fields: [
          { name: 'name', type: 'String', required: true },
          { name: 'code', type: 'String', required: true, unique: true },
          { name: 'location', type: 'String' },
          { name: 'capacity', type: 'Number' },
          { name: 'manager', type: 'String' },
          { name: 'isActive', type: 'Boolean', defaultValue: true }
        ]
      },
      {
        name: 'StockMovement',
        fields: [
          { name: 'product', type: 'ObjectId', ref: 'Product', required: true },
          { name: 'warehouse', type: 'ObjectId', ref: 'Warehouse', required: true },
          { name: 'type', type: 'Enum', enumValues: ['in', 'out', 'transfer', 'adjustment'], required: true },
          { name: 'quantity', type: 'Number', required: true },
          { name: 'reason', type: 'String' },
          { name: 'performedBy', type: 'String' },
          { name: 'date', type: 'Date' }
        ]
      }
    ]
  },

  sales: {
    id: 'sales',
    name: 'Sales & Orders',
    icon: 'shopping-cart',
    category: 'erp',
    description: 'Manage customers, sales orders, invoices, and payments.',
    defaultEntities: [
      {
        name: 'Customer',
        fields: [
          { name: 'name', type: 'String', required: true },
          { name: 'email', type: 'String', required: true, unique: true },
          { name: 'phone', type: 'String' },
          { name: 'company', type: 'String' },
          { name: 'address', type: 'String' },
          { name: 'city', type: 'String' },
          { name: 'country', type: 'String' },
          { name: 'creditLimit', type: 'Number', defaultValue: 0 },
          { name: 'status', type: 'Enum', enumValues: ['active', 'inactive', 'blocked'] }
        ]
      },
      {
        name: 'SalesOrder',
        fields: [
          { name: 'orderNumber', type: 'String', required: true, unique: true },
          { name: 'customer', type: 'ObjectId', ref: 'Customer', required: true },
          { name: 'orderDate', type: 'Date', required: true },
          { name: 'deliveryDate', type: 'Date' },
          { name: 'totalAmount', type: 'Number', required: true },
          { name: 'tax', type: 'Number', defaultValue: 0 },
          { name: 'discount', type: 'Number', defaultValue: 0 },
          { name: 'status', type: 'Enum', enumValues: ['draft', 'confirmed', 'shipped', 'delivered', 'cancelled'] },
          { name: 'notes', type: 'String' }
        ]
      },
      {
        name: 'OrderItem',
        fields: [
          { name: 'order', type: 'ObjectId', ref: 'SalesOrder', required: true },
          { name: 'product', type: 'ObjectId', ref: 'Product', required: true },
          { name: 'quantity', type: 'Number', required: true },
          { name: 'unitPrice', type: 'Number', required: true },
          { name: 'subtotal', type: 'Number', required: true }
        ]
      },
      {
        name: 'Invoice',
        fields: [
          { name: 'invoiceNumber', type: 'String', required: true, unique: true },
          { name: 'order', type: 'ObjectId', ref: 'SalesOrder', required: true },
          { name: 'customer', type: 'ObjectId', ref: 'Customer', required: true },
          { name: 'amount', type: 'Number', required: true },
          { name: 'dueDate', type: 'Date', required: true },
          { name: 'paidDate', type: 'Date' },
          { name: 'status', type: 'Enum', enumValues: ['pending', 'paid', 'overdue', 'cancelled'] }
        ]
      }
    ]
  },

  purchasing: {
    id: 'purchasing',
    name: 'Purchasing',
    icon: 'receipt',
    category: 'erp',
    description: 'Manage purchase orders, vendor relations, and procurement workflows.',
    defaultEntities: [
      {
        name: 'Vendor',
        fields: [
          { name: 'name', type: 'String', required: true },
          { name: 'email', type: 'String', required: true },
          { name: 'phone', type: 'String' },
          { name: 'address', type: 'String' },
          { name: 'paymentTerms', type: 'String' },
          { name: 'rating', type: 'Number', defaultValue: 0 },
          { name: 'status', type: 'Enum', enumValues: ['active', 'inactive', 'blacklisted'] }
        ]
      },
      {
        name: 'PurchaseOrder',
        fields: [
          { name: 'poNumber', type: 'String', required: true, unique: true },
          { name: 'vendor', type: 'ObjectId', ref: 'Vendor', required: true },
          { name: 'orderDate', type: 'Date', required: true },
          { name: 'expectedDelivery', type: 'Date' },
          { name: 'totalAmount', type: 'Number', required: true },
          { name: 'status', type: 'Enum', enumValues: ['draft', 'sent', 'acknowledged', 'received', 'cancelled'] },
          { name: 'notes', type: 'String' }
        ]
      },
      {
        name: 'PurchaseItem',
        fields: [
          { name: 'purchaseOrder', type: 'ObjectId', ref: 'PurchaseOrder', required: true },
          { name: 'product', type: 'ObjectId', ref: 'Product', required: true },
          { name: 'quantity', type: 'Number', required: true },
          { name: 'unitCost', type: 'Number', required: true },
          { name: 'receivedQuantity', type: 'Number', defaultValue: 0 }
        ]
      }
    ]
  },

  hr: {
    id: 'hr',
    name: 'Human Resources',
    icon: 'users',
    category: 'erp',
    description: 'Employee management, attendance tracking, and payroll processing.',
    defaultEntities: [
      {
        name: 'Employee',
        fields: [
          { name: 'employeeId', type: 'String', required: true, unique: true },
          { name: 'firstName', type: 'String', required: true },
          { name: 'lastName', type: 'String', required: true },
          { name: 'email', type: 'String', required: true, unique: true },
          { name: 'phone', type: 'String' },
          { name: 'department', type: 'String' },
          { name: 'position', type: 'String' },
          { name: 'hireDate', type: 'Date', required: true },
          { name: 'salary', type: 'Number' },
          { name: 'status', type: 'Enum', enumValues: ['active', 'on-leave', 'terminated'] }
        ]
      },
      {
        name: 'Attendance',
        fields: [
          { name: 'employee', type: 'ObjectId', ref: 'Employee', required: true },
          { name: 'date', type: 'Date', required: true },
          { name: 'checkIn', type: 'String' },
          { name: 'checkOut', type: 'String' },
          { name: 'hoursWorked', type: 'Number' },
          { name: 'status', type: 'Enum', enumValues: ['present', 'absent', 'late', 'half-day'] }
        ]
      },
      {
        name: 'LeaveRequest',
        fields: [
          { name: 'employee', type: 'ObjectId', ref: 'Employee', required: true },
          { name: 'leaveType', type: 'Enum', enumValues: ['annual', 'sick', 'personal', 'unpaid'], required: true },
          { name: 'startDate', type: 'Date', required: true },
          { name: 'endDate', type: 'Date', required: true },
          { name: 'reason', type: 'String' },
          { name: 'status', type: 'Enum', enumValues: ['pending', 'approved', 'rejected'] }
        ]
      }
    ]
  },

  accounting: {
    id: 'accounting',
    name: 'Accounting & Finance',
    icon: 'calculator',
    category: 'erp',
    description: 'General ledger, accounts payable/receivable, and financial reporting.',
    defaultEntities: [
      {
        name: 'Account',
        fields: [
          { name: 'accountCode', type: 'String', required: true, unique: true },
          { name: 'name', type: 'String', required: true },
          { name: 'type', type: 'Enum', enumValues: ['asset', 'liability', 'equity', 'revenue', 'expense'], required: true },
          { name: 'balance', type: 'Number', defaultValue: 0 },
          { name: 'currency', type: 'String', defaultValue: 'USD' },
          { name: 'isActive', type: 'Boolean', defaultValue: true }
        ]
      },
      {
        name: 'JournalEntry',
        fields: [
          { name: 'entryNumber', type: 'String', required: true, unique: true },
          { name: 'date', type: 'Date', required: true },
          { name: 'description', type: 'String', required: true },
          { name: 'debitAccount', type: 'ObjectId', ref: 'Account', required: true },
          { name: 'creditAccount', type: 'ObjectId', ref: 'Account', required: true },
          { name: 'amount', type: 'Number', required: true },
          { name: 'status', type: 'Enum', enumValues: ['draft', 'posted', 'void'] }
        ]
      },
      {
        name: 'Payment',
        fields: [
          { name: 'paymentNumber', type: 'String', required: true, unique: true },
          { name: 'type', type: 'Enum', enumValues: ['incoming', 'outgoing'], required: true },
          { name: 'amount', type: 'Number', required: true },
          { name: 'method', type: 'Enum', enumValues: ['cash', 'bank-transfer', 'check', 'credit-card'] },
          { name: 'date', type: 'Date', required: true },
          { name: 'reference', type: 'String' },
          { name: 'status', type: 'Enum', enumValues: ['pending', 'completed', 'failed'] }
        ]
      }
    ]
  },

  // ---- Logistics Modules ----
  shipping: {
    id: 'shipping',
    name: 'Shipping & Delivery',
    icon: 'truck',
    category: 'logistics',
    description: 'Manage shipments, deliveries, tracking, and carrier integration.',
    defaultEntities: [
      {
        name: 'Shipment',
        fields: [
          { name: 'trackingNumber', type: 'String', required: true, unique: true },
          { name: 'origin', type: 'String', required: true },
          { name: 'destination', type: 'String', required: true },
          { name: 'carrier', type: 'String' },
          { name: 'weight', type: 'Number' },
          { name: 'dimensions', type: 'String' },
          { name: 'shippingDate', type: 'Date' },
          { name: 'estimatedDelivery', type: 'Date' },
          { name: 'actualDelivery', type: 'Date' },
          { name: 'cost', type: 'Number' },
          { name: 'status', type: 'Enum', enumValues: ['preparing', 'in-transit', 'delivered', 'returned', 'lost'] }
        ]
      },
      {
        name: 'DeliveryRoute',
        fields: [
          { name: 'routeCode', type: 'String', required: true, unique: true },
          { name: 'name', type: 'String', required: true },
          { name: 'startPoint', type: 'String', required: true },
          { name: 'endPoint', type: 'String', required: true },
          { name: 'distance', type: 'Number' },
          { name: 'estimatedTime', type: 'Number' },
          { name: 'isActive', type: 'Boolean', defaultValue: true }
        ]
      },
      {
        name: 'DeliveryLog',
        fields: [
          { name: 'shipment', type: 'ObjectId', ref: 'Shipment', required: true },
          { name: 'location', type: 'String', required: true },
          { name: 'timestamp', type: 'Date', required: true },
          { name: 'event', type: 'String', required: true },
          { name: 'notes', type: 'String' }
        ]
      }
    ]
  },

  fleet: {
    id: 'fleet',
    name: 'Fleet Management',
    icon: 'car',
    category: 'logistics',
    description: 'Vehicle tracking, maintenance scheduling, and driver management.',
    defaultEntities: [
      {
        name: 'Vehicle',
        fields: [
          { name: 'plateNumber', type: 'String', required: true, unique: true },
          { name: 'make', type: 'String', required: true },
          { name: 'model', type: 'String', required: true },
          { name: 'year', type: 'Number' },
          { name: 'type', type: 'Enum', enumValues: ['truck', 'van', 'car', 'motorcycle'], required: true },
          { name: 'capacity', type: 'Number' },
          { name: 'fuelType', type: 'Enum', enumValues: ['diesel', 'petrol', 'electric', 'hybrid'] },
          { name: 'mileage', type: 'Number', defaultValue: 0 },
          { name: 'status', type: 'Enum', enumValues: ['available', 'in-use', 'maintenance', 'retired'] }
        ]
      },
      {
        name: 'Driver',
        fields: [
          { name: 'name', type: 'String', required: true },
          { name: 'licenseNumber', type: 'String', required: true, unique: true },
          { name: 'phone', type: 'String', required: true },
          { name: 'licenseExpiry', type: 'Date' },
          { name: 'status', type: 'Enum', enumValues: ['active', 'on-leave', 'suspended'] }
        ]
      },
      {
        name: 'MaintenanceRecord',
        fields: [
          { name: 'vehicle', type: 'ObjectId', ref: 'Vehicle', required: true },
          { name: 'type', type: 'Enum', enumValues: ['routine', 'repair', 'inspection'], required: true },
          { name: 'description', type: 'String', required: true },
          { name: 'cost', type: 'Number' },
          { name: 'date', type: 'Date', required: true },
          { name: 'nextDueDate', type: 'Date' },
          { name: 'mileageAtService', type: 'Number' }
        ]
      }
    ]
  },

  routing: {
    id: 'routing',
    name: 'Route Optimization',
    icon: 'map-pin',
    category: 'logistics',
    description: 'Plan optimal delivery routes, manage stops, and track progress.',
    defaultEntities: [
      {
        name: 'Route',
        fields: [
          { name: 'name', type: 'String', required: true },
          { name: 'date', type: 'Date', required: true },
          { name: 'driver', type: 'String' },
          { name: 'vehicle', type: 'String' },
          { name: 'totalDistance', type: 'Number' },
          { name: 'totalStops', type: 'Number' },
          { name: 'estimatedDuration', type: 'Number' },
          { name: 'status', type: 'Enum', enumValues: ['planned', 'in-progress', 'completed', 'cancelled'] }
        ]
      },
      {
        name: 'Stop',
        fields: [
          { name: 'route', type: 'ObjectId', ref: 'Route', required: true },
          { name: 'address', type: 'String', required: true },
          { name: 'sequence', type: 'Number', required: true },
          { name: 'arrivalTime', type: 'Date' },
          { name: 'departureTime', type: 'Date' },
          { name: 'notes', type: 'String' },
          { name: 'status', type: 'Enum', enumValues: ['pending', 'arrived', 'completed', 'skipped'] }
        ]
      }
    ]
  },

  // ---- Supply Chain Modules ----
  procurement: {
    id: 'procurement',
    name: 'Procurement',
    icon: 'clipboard-list',
    category: 'supply_chain',
    description: 'Requisition management, bid evaluation, and contract handling.',
    defaultEntities: [
      {
        name: 'Requisition',
        fields: [
          { name: 'requisitionNumber', type: 'String', required: true, unique: true },
          { name: 'requestedBy', type: 'String', required: true },
          { name: 'department', type: 'String' },
          { name: 'description', type: 'String', required: true },
          { name: 'estimatedBudget', type: 'Number' },
          { name: 'priority', type: 'Enum', enumValues: ['low', 'medium', 'high', 'critical'], required: true },
          { name: 'requiredDate', type: 'Date' },
          { name: 'status', type: 'Enum', enumValues: ['draft', 'submitted', 'approved', 'rejected', 'fulfilled'] }
        ]
      },
      {
        name: 'Contract',
        fields: [
          { name: 'contractNumber', type: 'String', required: true, unique: true },
          { name: 'vendor', type: 'String', required: true },
          { name: 'startDate', type: 'Date', required: true },
          { name: 'endDate', type: 'Date', required: true },
          { name: 'value', type: 'Number', required: true },
          { name: 'terms', type: 'String' },
          { name: 'status', type: 'Enum', enumValues: ['draft', 'active', 'expired', 'terminated'] }
        ]
      }
    ]
  },

  suppliers: {
    id: 'suppliers',
    name: 'Supplier Management',
    icon: 'handshake',
    category: 'supply_chain',
    description: 'Supplier onboarding, performance tracking, and relationship management.',
    defaultEntities: [
      {
        name: 'Supplier',
        fields: [
          { name: 'name', type: 'String', required: true },
          { name: 'code', type: 'String', required: true, unique: true },
          { name: 'email', type: 'String', required: true },
          { name: 'phone', type: 'String' },
          { name: 'address', type: 'String' },
          { name: 'country', type: 'String' },
          { name: 'category', type: 'String' },
          { name: 'rating', type: 'Number', defaultValue: 0 },
          { name: 'leadTime', type: 'Number' },
          { name: 'status', type: 'Enum', enumValues: ['pending', 'approved', 'suspended', 'blacklisted'] }
        ]
      },
      {
        name: 'SupplierEvaluation',
        fields: [
          { name: 'supplier', type: 'ObjectId', ref: 'Supplier', required: true },
          { name: 'evaluationDate', type: 'Date', required: true },
          { name: 'qualityScore', type: 'Number', required: true },
          { name: 'deliveryScore', type: 'Number', required: true },
          { name: 'priceScore', type: 'Number', required: true },
          { name: 'overallScore', type: 'Number', required: true },
          { name: 'comments', type: 'String' }
        ]
      }
    ]
  },

  demand: {
    id: 'demand',
    name: 'Demand Planning',
    icon: 'trending-up',
    category: 'supply_chain',
    description: 'Demand forecasting, inventory planning, and replenishment management.',
    defaultEntities: [
      {
        name: 'Forecast',
        fields: [
          { name: 'product', type: 'String', required: true },
          { name: 'period', type: 'String', required: true },
          { name: 'forecastQuantity', type: 'Number', required: true },
          { name: 'actualQuantity', type: 'Number' },
          { name: 'accuracy', type: 'Number' },
          { name: 'method', type: 'Enum', enumValues: ['historical', 'trend', 'seasonal', 'ai-predicted'] },
          { name: 'confidence', type: 'Number' }
        ]
      },
      {
        name: 'ReplenishmentOrder',
        fields: [
          { name: 'orderNumber', type: 'String', required: true, unique: true },
          { name: 'product', type: 'String', required: true },
          { name: 'quantity', type: 'Number', required: true },
          { name: 'triggerType', type: 'Enum', enumValues: ['reorder-point', 'forecast', 'manual'], required: true },
          { name: 'supplier', type: 'String' },
          { name: 'expectedDate', type: 'Date' },
          { name: 'status', type: 'Enum', enumValues: ['pending', 'ordered', 'received', 'cancelled'] }
        ]
      }
    ]
  },

  warehouse: {
    id: 'warehouse',
    name: 'Warehouse Operations',
    icon: 'warehouse',
    category: 'supply_chain',
    description: 'Warehouse management, pick/pack/ship, and bin location tracking.',
    defaultEntities: [
      {
        name: 'WarehouseZone',
        fields: [
          { name: 'name', type: 'String', required: true },
          { name: 'code', type: 'String', required: true, unique: true },
          { name: 'type', type: 'Enum', enumValues: ['receiving', 'storage', 'picking', 'shipping'], required: true },
          { name: 'capacity', type: 'Number' },
          { name: 'currentOccupancy', type: 'Number', defaultValue: 0 }
        ]
      },
      {
        name: 'BinLocation',
        fields: [
          { name: 'code', type: 'String', required: true, unique: true },
          { name: 'zone', type: 'ObjectId', ref: 'WarehouseZone', required: true },
          { name: 'aisle', type: 'String' },
          { name: 'rack', type: 'String' },
          { name: 'shelf', type: 'String' },
          { name: 'product', type: 'String' },
          { name: 'quantity', type: 'Number', defaultValue: 0 }
        ]
      },
      {
        name: 'PickOrder',
        fields: [
          { name: 'orderNumber', type: 'String', required: true, unique: true },
          { name: 'items', type: 'Array' },
          { name: 'assignedTo', type: 'String' },
          { name: 'priority', type: 'Enum', enumValues: ['normal', 'urgent', 'express'] },
          { name: 'startedAt', type: 'Date' },
          { name: 'completedAt', type: 'Date' },
          { name: 'status', type: 'Enum', enumValues: ['pending', 'in-progress', 'completed', 'cancelled'] }
        ]
      }
    ]
  }
};

const MODULE_CATEGORIES = {
  erp: {
    name: 'Enterprise Resource Planning',
    modules: ['inventory', 'sales', 'purchasing', 'hr', 'accounting']
  },
  logistics: {
    name: 'Logistics & Distribution',
    modules: ['shipping', 'fleet', 'routing']
  },
  supply_chain: {
    name: 'Supply Chain Management',
    modules: ['procurement', 'suppliers', 'demand', 'warehouse']
  }
};

module.exports = { moduleDefinitions, MODULE_CATEGORIES };
