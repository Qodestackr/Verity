# Alcorabooks Business Units Documentation

## What Are Business Units?

Business Unites replace the traditioonal concept of "Organizations" to better match how Kenyan liqour distributors actually operate. Each Business Unit represents a distinct operational channel with its own
inventory, pricing, and team members.

### Examples of Common Types of Business Units:

- **Wholesale Distribution Unit** - For B2B sales to retailers
- **Retail Operations Unit** - For direct consumer sales (A large wholesaler could need both if they went granular separation of who sells for retail vs wholesale)
- **Regional Distribution Unit** - For geographic-specific Ops
- **Brand Portfolio Unit** - For separate product categories
- **Special Accounts Unit** - For key clients and VIPs or temporal promotion line

## Technical Implementation

BU(Business Unites) are implemented at a granular auth level, which means:

- All data is automatically segregated by Business Unit via a channel
- Permissions are Business Unit-specific
- Every API call includes Business Unit + channel context
- Reports can be unit-specific or cross-unit

```typescript
// Backend implementation (already in place)
allowUserToCreateOrganization: async (user) => {
  const subscription = await getSubscription(user.id);
  return (
    subscription.plan === "pro" &&
    user.role in ["retailer", "distributor", "wholesaler"] &&
    subscription.status === "active"
  );
};
```

## Plan Limitations

- **Standard Plan**: Maximum 5 BUs
- **Professional Plan**: Additional units available

When users attempt to exceed their limit, they'll be prompted to upgrade their plan.

## Why This Matters For Distributors

1. **Separate Pricing Models**

   - Wholesale units maintain distributor pricing
   - Retail units have consumer pricing
   - Special accounts get custom pricing

2. **Inventory Segregation**

   - Track stock separately for each channel
   - Prevent inventory mix-ups between operations
   - Different minimum stock levels per unit

3. **Financial Clarity**

   - See which distribution channels are most profitable
   - Track costs separately by operational unit
   - Understand performance by distribution model

4. **Team Management**
   - Assign staff to specific business areas
   - Managers can control access to their units
   - Sales teams focus on specific market segments

## Analytics Strategy

Our unique approach gives small players (1-3 Business Units) access to premium cross-unit analytics by default, while larger operations need to upgrade for advanced insights:

### For Small Players (1-3 Units):

- Complete cross-unit performance visibility
- Premium analytics dashboard
- No upgrade required

### For Larger Operations (4+ Units):

- Basic cross-unit metrics
- Detailed analytics requires upgrade
- Advanced forecasting with Premium plan

This creates a competitive advantage for smaller distributors while incentivizing larger operations to upgrade.

## Real-World Applications

- **Wine Agencies** create separate units for premium wines, everyday wines, and spirits
- **EABL** separates beer distribution from spirits
- **Wholesalers** separate their retailer-facing business from direct consumer sales
- **Regional distributors** create units for each territory they serve

## How It Works In Practice

When a user logs in:

1. They see their available Business Units
2. They can switch between units instantly
3. All data (orders, inventory, customers) is filtered by the active unit
4. Owners can see cross-unit analytics

## Benefits Summary

- **Real-world business structure** - No need to adapt to our software
- **Financial segregation** - Clear profit/loss by distribution channel
- **Operational clarity** - Team members see only what they need
- **Streamlined management** - Owners oversee all units from one account

---

_Note:BUs are already implemented in the authentication system and will automatically apply to all features as they're rolled out._
