# Alcorabooks Pricing Strategy

## Executive Summary

After analyzing multiple pricing models for Alcorabooks, we've determined that a tiered, segment-based approach provides the optimal balance between affordability for retailers, value-based pricing for larger market participants, and sustainable margins for the business. This document outlines our pricing strategy, rationale, financial projections, and infrastructure considerations to ensure the platform can scale reliably while maintaining profitability.

## Pricing Structure

Our final pricing model is:

| Segment      | Monthly Price (KES) | What's Included                                   |
| ------------ | ------------------- | ------------------------------------------------- |
| Retailers    | 400                 | POS System + Books + Free Order Placement         |
| Wholesalers  | 2,000               | Order Management + Books                          |
| Distributors | 8,000               | Order Management + Books + Analytics              |
| Brand Owners | 40,000              | Order Management + Books + Analytics + API Access |

_Order placement is free for retailers to drive adoption and create network effects. The POS system is the primary revenue driver for retailers, while other segments pay for order management capabilities and additional features._

## Pricing Options Considered

### Option A: Experimentation-Based Pricing

**Description**: Start with a small group of retailers (20), adjust pricing dynamically until we find the optimal point that sustains infrastructure while maximizing adoption.

**Why Rejected**:

- Creates unpredictable revenue streams
- Risks customer frustration with changing prices
- Doesn't account for different value perception across market segments
- Delays scaling while experiments run

### Option B: Location-Based Tiered Pricing

**Description**: Charge retailers KES 400 base price plus KES 200 for each additional retail location.

**Why Partially Adopted**:

- Simple to understand and implement
- Scales naturally with business size
- Reflects increased value for multi-location businesses

We incorporated this approach for retailers with multiple locations, but needed a more comprehensive strategy for different market segments.

### Option C: Volume-Based Pricing

**Description**: Charge based on transaction volume or number of POS terminals.

**Why Rejected**:

- Creates unpredictable costs for customers
- May discourage platform usage during peak periods
- Complex to track and bill
- Could incentivize customers to bypass the platform for large orders

### Option D: Flat-Fee Subscription with Segment-Based Tiers

**Description**: Charge different fixed rates based on the customer's position in the supply chain.

**Why Adopted**:

- Predictable revenue and costs for both customers and Alcorabooks
- Recognizes the differing value proposition for each segment
- Simple to understand and communicate
- Aligns pricing with value received

## Break-Even Analysis

Our financial modeling indicates that Alcorabooks would need approximately 992 total customers to cover all monthly operational costs, including:

- Infrastructure costs (VPS, AWS RDS, Cloudflare R2, etc.)
- Development team
- Operations and support
- Marketing expenses
- Other overhead

This break-even point is achievable even in our Conservative adoption scenario (1,000 retailers, 30 wholesalers, 10 distributors, 3 brand owners), which would generate monthly revenue of KES 690,000 against monthly costs of approximately KES 611,089.

## Projected Financial Performance

### Conservative Scenario (Year 1)

- **Customers**: 1,000 retailers, 30 wholesalers, 10 distributors, 3 brand owners
- **Monthly Revenue**: KES 690,000
- **Monthly Costs**: KES 611,089
- **Monthly Profit**: KES 78,911
- **Annual Profit**: KES 946,932
- **Profit Margin**: 11.4%

### Moderate Scenario (Year 2)

- **Customers**: 2,000 retailers, 60 wholesalers, 15 distributors, 5 brand owners
- **Monthly Revenue**: KES 1,300,000
- **Monthly Costs**: KES 611,089 + 10% growth = KES 672,198
- **Monthly Profit**: KES 627,802
- **Annual Profit**: KES 7,533,624
- **Profit Margin**: 48.3%

### Target Scenario (Year 3)

- **Customers**: 4,000 retailers, 120 wholesalers, 25 distributors, 10 brand owners
- **Monthly Revenue**: KES 2,560,000
- **Monthly Costs**: KES 611,089 + 20% growth = KES 733,307
- **Monthly Profit**: KES 1,826,693
- **Annual Profit**: KES 21,920,316
- **Profit Margin**: 71.4%

## Actual Infrastructure Scaling Journey

The liquor market in Kenya operates with intense activity during evenings and weekends, creating significant demand spikes. System failures during these periods would erode trust and require manual reconciliation, directly impacting customer satisfaction and retention. Our infrastructure scaling approach follows our actual growth trajectory:

### Phase 1: Launch (0-5 retailers)

- **Infrastructure**:
  - Vercel free tier for frontend
  - Basic Hostinger VPS (4 vCPU, 16GB RAM) for Saleor and Meilisearch
  - AWS RDS free tier for database
- **Monthly Cost**: KES 1,300 (USD 9.99)
- **Monthly Revenue**: KES 2,000 (5 retailers × KES 400)
- **Profit**: KES 700
- **Performance**: Sufficient for initial users with minimal load
- **ROI**: VPS paid for itself with just 5 retailers

### Phase 2: Early Growth (50+ retailers)

- **Infrastructure**:
  - Upgraded to Vercel Pro (KES 2,600/month)
  - Upgraded Hostinger VPS (8 vCPU, 32GB RAM, 400GB NVMe)
  - AWS RDS free tier still active
- **Monthly Cost**: KES 5,200 (VPS + Vercel Pro)
- **Monthly Revenue**: KES 20,000 (50 retailers × KES 400)
- **Profit**: KES 14,800
- **Performance**: Handled evening and weekend peaks with 50+ concurrent users
- **ROI**: Infrastructure costs represented only 26% of revenue

### Phase 3: Expansion (100+ retailers + distributors)

- **Infrastructure**:
  - Transitioned to AWS architecture:
    - EC2 for application servers
    - RDS beyond free tier with read replicas
    - ElastiCache for session management
    - S3 and CloudFront for static assets
  - Maintained Vercel Pro for frontend
- **Monthly Cost**: KES 30,000
- **Monthly Revenue**: KES 65,000 (100 retailers + 2 distributors + 5 wholesalers)
- **Profit**: KES 35,000
- **Performance**: Robust handling of peak loads with auto-scaling
- **ROI**: Infrastructure costs represented 46% of revenue initially, but dropped as customer base grew

### Phase 4: Scale (1,000+ retailers)

- **Infrastructure**:
  - Full AWS ecosystem:
    - EKS clusters with auto-scaling
    - Aurora database clusters
    - Comprehensive monitoring and alerting
    - Multi-region redundancy
  - Accounting module fully operational
- **Monthly Cost**: KES 80,000
- **Monthly Revenue**: KES 690,000 (Conservative scenario)
- **Profit**: KES 610,000
- **Performance**: Enterprise-grade reliability with 99.9% uptime
- **ROI**: Infrastructure costs representing only 11.6% of revenue

This real-world scaling journey demonstrates that at each growth stage, the infrastructure costs were covered by revenue while maintaining healthy margins. Even as we scaled to enterprise-grade infrastructure, the revenue from our pricing model ensured profitability throughout the journey.

### Infrastructure Cost as Percentage of Revenue

- **Phase 1 (5 retailers)**: 65% → Basic but functional
- **Phase 2 (50 retailers)**: 26% → Improved performance
- **Phase 3 (100+ retailers)**: 46% → Enterprise infrastructure, initial investment
- **Phase 4 (1,000+ retailers)**: 11.6% → Full-scale operation with high reliability

This scaling approach ensures that as customer adoption grows, our infrastructure capacity grows ahead of demand, particularly to handle the evening and weekend peaks characteristic of the liquor industry.

## Accounting Module Implementation

The accounting module is now fully integrated into our platform and is included in the base price for all customer segments. We've successfully built and deployed this module ahead of schedule:

### Development Journey

1. **Months 1-2**: Conducted integrations with Odoo, ERPNext, and QuickBooks to understand best practices and user requirements
2. **Months 3-4**: Built the core Alcorabooks accounting engine using Cloudflare's ecosystem:
   - **Hono**: Framework for serverless API endpoints
   - **Trigger.dev**: For handling longer-running financial calculations
   - **Durable Objects**: For maintaining consistency in financial records
3. **Month 5**: Deployed the production-ready accounting module with:
   - Invoicing and customer management
   - Basic financial reporting
   - Revenue tracking

### Current Functionality

The accounting module now provides essential functionality for all users:

- **Quotes/Estimates**: Pre-invoice documents allowing customers to approve pricing
- **Invoicing**: Comprehensive invoice generation and management
- **Customer Management**: Customer profiles with transaction history
- **Basic Financial Reporting**: Revenue reports with filtering capabilities

### Planned Enhancements

Based on user feedback, we're prioritizing these high-ROI features for future releases:

1. **Expense Tracking**: Track business costs with categorization
2. **General Ledger**: Core double-entry accounting functionality
3. **Accounts Payable**: Managing supplier relationships
4. **Bank Reconciliation**: Tools to match accounting records with bank statements

The accounting module has been a significant value driver for customer adoption and retention, particularly for retailers who previously lacked access to affordable bookkeeping tools tailored to their business.

## Go-to-Market Strategy

Our pricing strategy supports a bottom-up adoption approach:

1. **Retailer Focus**: Begin with affordable POS system for retailers (KES 400/month)
2. **Network Building**: Use the retailer network to attract wholesalers
3. **Upmarket Expansion**: Demonstrate value to distributors and brand owners

The invite system for wholesalers and distributors ensures we maintain the relationship value between supply chain levels while digitizing the process.

## Conclusion

Our tiered, segment-based pricing model provides:

1. **Affordability for retailers**: At KES 400/month, retailers need to sell just 2 mugs of beer daily to cover the cost
2. **Value-based pricing for larger players**: Higher tiers reflect the increased value and volume for these segments
3. **Sustainable margins**: 70%+ profit margins at scale enable future innovations
4. **Clear upgrade paths**: Optional modules and multi-location pricing provide natural growth
5. **Infrastructure reliability**: Scaling plan ensures capacity for peak demands

This pricing strategy positions Alcorabooks for sustainable growth while providing clear value to all participants in Kenya's liquor distribution ecosystem. With break-even achievable at just 992 customers, the business model provides a solid foundation for future expansion into healthcare and insurance initiatives.
