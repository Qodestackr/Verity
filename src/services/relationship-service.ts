import prisma from "@/lib/prisma";

/**
 * Service for handling business relationship logic
 */
export class RelationshipService {
  /**
   * Check if an organization has permission to view another organization's products
   */
  static async canViewProducts(
    viewerId: string,
    ownerId: string
  ): Promise<boolean> {
    // If same organization, always allow
    if (viewerId === ownerId) return true;

    // Check relationship and permissions
    const relationship = await prisma.businessRelationship.findFirst({
      where: {
        OR: [
          { requesterId: ownerId, targetId: viewerId },
          { requesterId: viewerId, targetId: ownerId },
        ],
        status: "ACTIVE",
      },
      include: {
        permissions: {
          where: {
            permissionType: "VIEW_PRODUCTS",
          },
        },
      },
    });

    // If no active relationship exists, check if products are public
    if (!relationship) {
      const settings = await prisma.visibilitySettings.findUnique({
        where: { organizationId: ownerId },
      });
      return settings?.showProducts ?? false;
    }

    // Check if permission exists and is granted
    const permission = relationship.permissions.find(
      (p) => p.permissionType === "VIEW_PRODUCTS"
    );
    if (!permission) return false;

    return permission.isGranted;
  }

  /**
   * Check if an organization has permission to view another organization's prices
   */
  static async canViewPrices(
    viewerId: string,
    ownerId: string
  ): Promise<boolean> {
    // If same organization, always allow
    if (viewerId === ownerId) return true;

    // Check relationship and permissions
    const relationship = await prisma.businessRelationship.findFirst({
      where: {
        OR: [
          { requesterId: ownerId, targetId: viewerId },
          { requesterId: viewerId, targetId: ownerId },
        ],
        status: "ACTIVE",
      },
      include: {
        permissions: {
          where: {
            permissionType: "VIEW_PRICES",
          },
        },
      },
    });

    // If no active relationship exists, check if prices are public
    if (!relationship) {
      const settings = await prisma.visibilitySettings.findUnique({
        where: { organizationId: ownerId },
      });
      return settings?.showPricing ?? false;
    }

    // Check if permission exists and is granted
    const permission = relationship.permissions.find(
      (p) => p.permissionType === "VIEW_PRICES"
    );
    if (!permission) return false;

    return permission.isGranted;
  }

  /**
   * Get custom pricing for a product if available
   */
  static async getCustomPricing(
    viewerId: string,
    ownerId: string,
    productId: string
  ): Promise<any | null> {
    // If same organization, no custom pricing
    if (viewerId === ownerId) return null;

    // Check if custom pricing exists
    const priceVisibility = await prisma.priceVisibility.findUnique({
      where: {
        organizationId_productId: {
          organizationId: ownerId,
          productId,
        },
      },
    });

    if (!priceVisibility) return null;

    // Check if there's custom pricing for this viewer
    const customPricing = priceVisibility.customPricing as Record<string, any>;
    return customPricing?.[viewerId] || null;
  }

  /**
   * Check if a product is visible to an organization
   */
  static async isProductVisible(
    viewerId: string,
    ownerId: string,
    productId: string
  ): Promise<boolean> {
    // If same organization, always visible
    if (viewerId === ownerId) return true;

    // First check if viewer can view products at all
    const canViewProducts = await this.canViewProducts(viewerId, ownerId);
    if (!canViewProducts) return false;

    // Check product-specific visibility
    const productVisibility = await prisma.productVisibility.findUnique({
      where: {
        organizationId_productId: {
          organizationId: ownerId,
          productId,
        },
      },
    });

    // If no specific settings, product is visible
    if (!productVisibility) return true;

    // Check if product is public
    if (productVisibility.isPublic) {
      // Check if explicitly hidden from this viewer
      return !productVisibility.hiddenFromIds.includes(viewerId);
    } else {
      // Check if explicitly visible to this viewer
      return productVisibility.visibleToIds.includes(viewerId);
    }
  }

  /**
   * Get relationship status between two organizations
   */
  static async getRelationshipStatus(
    org1Id: string,
    org2Id: string
  ): Promise<string | null> {
    const relationship = await prisma.businessRelationship.findFirst({
      where: {
        OR: [
          { requesterId: org1Id, targetId: org2Id },
          { requesterId: org2Id, targetId: org1Id },
        ],
      },
      select: {
        status: true,
      },
    });

    return relationship?.status || null;
  }
}
