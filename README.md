# Alcorabooks: Technical Architecture & Implementation Plan

## Summary

Alcorabooks is a B2B SaaS platform addressing the liquor distribution chain in Kenya, connecting brand owners, distributors, wholesalers, and retailers. This document outlines our technical approach, architecture decisions, and implementation strategy for delivering a functional MVP within a 2-month timeframe.

**Core Value Proposition:** Alcorabooks solves the relationship management problem in the liquor distribution chain while providing essential inventory and order management capabilities.

## Technical Architecture

The Alcorabooks platform leverages a hybrid architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     Alcorabooks Platform                    │
│                                                             │
│  ┌─────────────┐         ┌───────────────────────────────┐  │
│  │             │         │                               │  │
│  │  Custom     │         │         Saleor                │  │
│  │  Auth &     │◄───────►│      Commerce Engine          │  │
│  │ Relship     │         │                               │  │
│  │    Layer    │         │                               │  │
│  │             │         │                               │  │
│  └─────────────┘         └───────────────────────────────┘  │
│         ▲                             ▲                     │
└─────────┼─────────────────────────────┼─────────────────────┘
          │                             │
          ▼                             ▼
┌─────────────────────┐      ┌───────────────────────┐
│                     │      │                       │
│   Role-specific     │      │      GraphQL API      │
│   UI Components     │      │        (urql)         │
│   (ShadCN/UI)       │      │                       │
└─────────────────────┘      └───────────────────────┘
```

### 1. Commerce Engine: Saleor

Saleor provides 60% of our core commerce functionality out-of-the-box:

- **Product & Inventory Management**

  - Complete product catalog with attributes
  - Multi-warehouse inventory tracking
  - Stock allocation across locations

- **Order Processing**

  - Order lifecycle management
  - Split fulfillments (crucial for distribution)
  - Draft orders and quotes

- **Multi-Channel Architecture**

  - Maps to our distribution tiers
  - Channel-specific pricing, stock, and visibility
  - Controls access to products by channel

- **B2B Features**
  - Organization accounts
  - Custom pricing rules
  - Volume pricing
  - Quote generation

### 2. Custom Authentication & Relationship Layer

This is our critical innovation layer that adapts Saleor for the distribution chain:

- **Multi-tenant Authentication (OIDC)**

  - Role-based access control
  - Business unit management
  - JWT token-based identity
  - Maps users to appropriate Saleor channels

- **Relationship Management**
  - Connection marketplace ("waiting room")
  - Partner invitation system
  - Business relationship mapping
  - Permission controls

### 3. Role-specific UI Components

Modern, mobile-friendly interfaces customized for each participant:

- **Retailer Dashboard**

  - Smart ordering
  - Inventory management
  - Data analytics

- **Wholesaler Dashboard**

  - Retailer management
  - Distributor ordering
  - Logistics coordination

- **Distributor Dashboard**
  - Wholesaler management
  - Multi-warehouse controls
  - Market insights

## Feature Prioritization (MoSCoW)

_`MoSCoW is a prioritization technique that stands for Must have, Should have, Could have, and Won't have(for now)`_. CUT THE FAT.

### Must Have

1. Multi-tenant authentication system (OIDC)
2. Relationship management and connection marketplace - Import and connect suppliers/customers (the "invite system")
3. Order placement and tracking - Core functionality that drives business value
4. Inventory visibility across the chain - Essential for all user roles
5. Role-specific interfaces for all three tiers - Different experiences for retailers, wholesalers, and distributors

### Should Have

1. CSV customer/partner import - Practical onboarding tool for existing businesses
2. Simple analytics dashboard
3. Notification system for critical events (orders, inventory)
4. Demo features for unconnected users - Solution for retailers without connections

### Could Have

1. M-Pesa payment integration - Valuable but can be implemented later
2. Scheduled orders - Useful after essential Must & Should have
3. Basic promotions engine - Adds value but requires careful implementation
4. Multi-warehouse support

### Won't Have (in Phase 1)

1. Full Accounting/bookkeeping integration - Better as a phase 2 feature
2. Advanced analytics and reporting
3. Route optimization/logistics planning/fleet management - Too complex for initial version
4. AI-powered features - Interesting but not essential
5. B2C functionality - Future consideration only

The core value proposition comes from solving the relationship/connection problem in the supply chain while providing essential inventory and order management. This approach balances immediate usefulness with realistic development constraints.

## Implementation Timeline (8 Weeks)

### Weeks 1-2: Foundation

- Set up Next.js frontend with ShadCN
- Configure Saleor instance
- Implement authentication layer (OIDC)
- Design database schema for relationship management

### Weeks 3-4: Core Features

- Create role-specific dashboards
- Implement connection marketplace
- Set up product and inventory management
- Build basic order flow

### Weeks 5-6: UI/UX Development

- Develop mobile-responsive interfaces
- Implement notifications system
- Create "waiting room" experience
- Build CSV import functionality

### Weeks 7-8: Integration & Testing

- Connect all components
- Implement GraphQL data fetching
- User testing and bug fixes
- Launch preparations

## Technical Constraints & Considerations

### Why We're Using Saleor

1. **Time-to-market**: Provides 60-70% of core functionality out-of-the-box
2. **API-first approach**: Enables full customization where needed
3. **Multi-channel architecture**: Naturally maps to our distribution tiers
4. **Extensibility**: Webhook system allows for custom business logic

### OIDC Authentication

We're implementing OIDC (OpenID Connect) for authentication because:

1. It's designed for multi-tenant SaaS architectures
2. Separates authentication concerns from commerce logic
3. Provides enterprise-grade security
4. Makes Alcorabooks compatible with corporate SSO systems

### Technical Debt & Future Considerations

1. **Accounting Integration**: Phase 2 priority

   - Initially handled outside the system
   - QuickBooks integration planned for future

2. **Performance Optimization**:

   - Initial focus is on functionality, not scale
   - Will need optimization as user base grows

3. **Mobile App Potential**:
   - API-first approach enables future native apps
   - Currently focusing on responsive web

## Conclusion

This approach balances immediate business needs with technical constraints to deliver a functional MVP within 2 months. By leveraging Saleor's commerce engine for commodity functionality and focusing our custom development on relationship management and role-specific UIs, we can create a platform that delivers immediate value while establishing a foundation for future expansion.

The MVP will solve the critical chicken-and-egg problem of connecting supply chain participants while providing essential commerce capabilities. Future phases will build on this foundation to add deeper features and integrations.

---

**Note:** This document outlines our technical strategy based on current understanding and is subject to refinement as implementation progresses. The 2-month timeline is aggressive but achievable with the outlined scope limitations.

<!-- 1. AUTHENTICATION
2. SUBSCRIPTION + PAYMENTS
3. SETUP POSTGRES (NEON) + MAYBE
- [LEARN NUQS]
- ...
<!--
MIGRATE DB TO DRIZZLE ORM:
https://github.com/TheOrcDev/nextjs-better-auth-starter/blob/main/db/schema.ts
[YT: https://youtu.be/D2f_gN1uZbc?list=TLPQMTIwMzIwMjUv-KDnXW9XHQ]
....STORE ONBOARDING PROGRESS IN DB FOR THEM TO CONTINUE LATER....
-->
