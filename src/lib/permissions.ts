import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

export const allPermissions = {
  // Inventory permissions
  viewInventory: "view_inventory",
  editInventory: "edit_inventory",
  addInventory: "add_inventory",
  deleteInventory: "delete_inventory",

  // Orders permissions
  viewOrders: "view_orders",
  createOrders: "create_orders",
  fulfillOrders: "fulfill_orders",
  cancelOrders: "cancel_orders",

  // Pricing permissions
  viewPricing: "view_pricing",
  setPricing: "set_pricing",

  // Analytics permissions
  basicAnalytics: "basic_analytics",
  advancedAnalytics: "advanced_analytics",

  // Financial permissions
  viewFinancials: "view_financials",
  manageFinancials: "manage_financials",

  // User/team management
  manageUsers: "manage_users",
  manageTeam: "manage_team",

  // Environment permissions
  manageProduction: "manage_production",
  manageSandbox: "manage_sandbox",

  // Add any other permissions your system might need
};

// Used for Better Auth's internal permission system
export const betterAuthPermissions = {
  organization: ["view", "update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
};

const statement = {
  ...defaultStatements,
  // ...betterAuthPermissions,
  inventory: ["view", "edit", "add", "delete"],
  orders: ["create", "view", "fulfill", "cancel"],
  pricing: ["view", "set"],
  analytics: ["basic", "advanced"],
  // Map to Better Auth's expected format
  //  inventory: ["view", "edit", "add", "delete"],
  //  orders: ["view", "create", "fulfill", "cancel"],
  //  pricing: ["view", "set"],
  //  analytics: ["basic", "advanced"],
  //  financials: ["view", "manage"],
  //  users: ["manage"],
  //  team: ["manage"],
  //  environments: ["production", "sandbox"]
} as const;

export const ac = createAccessControl(statement);

// Create role definitions for each user type
export const wholesaler = ac.newRole({
  inventory: ["view", "edit", "add", "delete"],
  orders: ["view", "fulfill"],
  pricing: ["set", "view"],
  analytics: ["advanced"],
});

export const retailer = ac.newRole({
  inventory: ["view"],
  orders: ["create", "view", "cancel"],
  pricing: ["view"],
  analytics: ["basic"],
});

export const distributor = ac.newRole({
  inventory: ["view", "edit"],
  orders: ["create", "view", "fulfill", "cancel"],
  pricing: ["view"],
  analytics: ["advanced"],
});

// Keep the admin role with all permissions
export const admin = ac.newRole({
  ...adminAc.statements,
  inventory: ["view", "edit", "add", "delete"],
  orders: ["create", "view", "fulfill", "cancel"],
  pricing: ["set", "view"],
  analytics: ["basic", "advanced"],
});
