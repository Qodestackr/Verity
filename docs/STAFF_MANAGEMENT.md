# Staff Management Documentation

This document outlines the role hierarchy and permission structure for our liquor distribution SaaS platform, covering the four main organizational types: Retailers, Wholesalers, Distributors, and Brand Owners.

## 🛍️ Retailer Roles

Retailers typically include bottle shops, kiosks, supermarkets, and bar counters.

### POS Cashier / Counter Staff

- **Core Functions**: Front-line sales processing
- **Permissions**:
  - Scan and sell products
  - Search products and check stock levels
  - Process customer transactions
- **Restrictions**:
  - Cannot edit prices
  - Cannot create new products
  - POS-only access

### Inventory Clerk

- **Core Functions**: Stock management
- **Permissions**:
  - Update stock levels (receiving, wastage recording)
  - View inventory reports
  - Conduct stocktakes
- **Restrictions**:
  - Cannot place or approve purchase orders
  - No pricing authority

### Procurement Officer

- **Core Functions**: Order management
- **Permissions**:
  - Search product catalog
  - Place purchase orders
  - View delivery status
- **Restrictions**:
  - Cannot modify POS settings
  - No pricing authority

### Store Manager

- **Core Functions**: Store operations management
- **Permissions**:
  - Full access to POS
  - View sales reports
  - Create and manage staff accounts
  - Approve purchase orders
  - Limited pricing authority

### Business Owner

- **Core Functions**: Multi-store business management
- **Permissions**:
  - Admin rights for the entire retailer account
  - Access all stores under their profile
  - Manage users, pricing, orders, and invoices
  - Full reporting access
  - System configuration rights

## 🧃 Wholesaler Roles

Wholesalers handle bulk orders and typically manage their own logistics operations.

### Sales Rep / Field Rep

- **Core Functions**: Client relationship and order generation
- **Permissions**:
  - View product catalog
  - Create orders for retailers
  - View order status and stock availability
- **Restrictions**:
  - Cannot change pricing
  - Cannot view profit margins

### Warehouse Staff

- **Core Functions**: Order fulfillment
- **Permissions**:
  - Fulfill orders
  - Mark items as picked and packed
  - Update stock locations
- **Restrictions**:
  - No POS access
  - No pricing authority

### Driver / Rider

- **Core Functions**: Last-mile delivery
- **Permissions**:
  - View assigned deliveries
  - Update delivery status
  - Capture proof of delivery (photos, signatures, notes)
- **Restrictions**:
  - Mobile-only interface
  - Limited system access

### Logistics Supervisor

- **Core Functions**: Delivery management
- **Permissions**:
  - Assign deliveries to drivers
  - Track fleet performance
  - View delivery analytics
  - Manage routing and scheduling

### Account Manager

- **Core Functions**: Client relationship management
- **Permissions**:
  - Manage specific retail clients
  - View client order history
  - Suggest promotions
  - Monitor customer health metrics
  - Limited discount authority

### Wholesaler Admin

- **Core Functions**: Overall wholesaler operations
- **Permissions**:
  - All-access rights for the wholesaler organization
  - Pricing control
  - Promotion management
  - Stock import/export
  - User management
  - System configuration

## 🚚 Distributor Roles

Distributors are typically larger organizations with multiple warehouses and defined territories.

### Territory Manager

- **Core Functions**: Regional performance management
- **Permissions**:
  - View performance metrics per region
  - Assign sales targets
  - Track retailer activity
  - Approve regional promotions

### Pricing Analyst

- **Core Functions**: Price optimization
- **Permissions**:
  - Set regional pricing
  - Approve discount campaigns
  - Monitor competitive pricing
  - Generate pricing reports

### Compliance Officer

- **Core Functions**: Regulatory adherence
- **Permissions**:
  - View and manage licenses
  - KRA (tax authority) integration management
  - Manage verification documents
  - Audit transaction compliance

### Distributor Admin

- **Core Functions**: Enterprise distribution management
- **Permissions**:
  - Manage teams and warehouses
  - Control stock movement between locations
  - Access full reporting suite
  - Handle compliance and tax filings
  - Add or remove organizations from network

## 🏷️ Brand Owner Roles

Brand owners focus on marketing, compliance, and protecting brand reputation.

### Brand Rep / Marketing Rep

- **Core Functions**: Brand promotion
- **Permissions**:
  - View product performance
  - Suggest promotions
  - Access marketing materials
- **Restrictions**:
  - Cannot edit prices
  - Cannot modify stock

### Brand Manager

- **Core Functions**: Product portfolio management
- **Permissions**:
  - Manage product listings
  - View regional trends
  - Access competitor data (if enabled)
  - Approve marketing campaigns

### Trade Marketer

- **Core Functions**: Point-of-sale optimization
- **Permissions**:
  - Plan product pushes
  - Monitor POS visibility
  - Create and roll out product training kits
  - Track merchandising compliance

### Head of Partnerships

- **Core Functions**: Distribution network optimization
- **Permissions**:
  - Manage distributor relationships
  - Evaluate sales pipelines
  - Monitor brand performance across channels
  - Strategic planning access

## 🚦 Permission System Architecture

Our platform implements a Role-Based Access Control (RBAC) system with:

### Permission Granularity

- **Action-based permissions**:
  - `can_view_[resource]`
  - `can_create_[resource]`
  - `can_edit_[resource]`
  - `can_delete_[resource]`
  - `can_approve_[resource]`

### Contextual Scoping

- **Organization scoping**: Permissions limited to specific business entity
- **Location scoping**: Permissions limited to specific locations/warehouses
- **Product scoping**: Permissions limited to specific brands/categories

### Implementation Features

- Role templates with default permission sets
- Ability to assign multiple roles per user
- Permission overrides for exceptional cases
- Hierarchical inheritance of permissions
- Audit logs tracking all user actions
- Two-factor authentication for admin accounts and sensitive operations

### Access Control Best Practices

- Principle of least privilege
- Regular permission audits
- Time-bound access for temporary roles
- Session timeouts for inactive users
- Notification system for sensitive permission changes

---

**Note**: This document serves as a baseline for role configuration. Individual businesses may require customization based on their specific operational needs and organizational structure.
