"use server";

import { useCurrency } from "@/hooks/useCurrency";
import prisma from "@/lib/prisma";
import type { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type BasicUserInfo = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  organization: {
    name: string;
    businessType: string;
    logo: string | null;
    onboardingComplete: boolean;
    description: string | null;
  };
};

export type UserWithDocuments = {
  id: string;
  name: string;
  email: string;
  role: string;
  documents: {
    id: string;
    name: string;
    status: string;
  }[];
  organization: {
    onboardingComplete: boolean;
  };
};

export type UserWithOrganization = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  organization: {
    name: string;
    businessType: string;
    onboardingComplete: boolean;
  };
};

/**
 * Get all users that need approval - directly from User model
 */
export async function getUsersForApproval(page = 1, limit = 20) {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ["retailer", "wholesaler", "distributor"] },
        banned: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        image: true,
        phoneNumber: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Count total for pagination
    const total = await prisma.user.count({
      where: {
        role: "user",
        banned: false,
      },
    });

    return {
      users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  } catch (error) {
    console.error("Error fetching users for approval:", error);
    throw new Error("Failed to fetch users");
  }
}

/**
 * Get users by role
 */
export async function getUsersByRole(
  role: UserRole | "ALL",
  page = 1,
  limit = 20,
  searchQuery?: string
) {
  try {
    // Build the where clause based on role
    const where: any = {
      banned: false,
    };

    if (role !== "ALL") {
      where.role = role;
    }

    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { email: { contains: searchQuery, mode: "insensitive" } },
        {
          organization: {
            name: { contains: searchQuery, mode: "insensitive" },
          },
        },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        image: true,
        phoneNumber: true,
        // organization: {
        //   select: {
        //     name: true,
        //     businessType: true,
        //     onboardingComplete: true,
        //   },
        // },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.user.count({ where });

    return {
      users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };
  } catch (error) {
    console.error("Error fetching users by role:", error);
    throw new Error("Failed to fetch users");
  }
}

/**
 * Get user details
 */
export async function getUserDetails(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        image: true,
        phoneNumber: true,
        emailVerified: true,
      },
    });

    return user; // as UserWithDocuments;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw new Error("Failed to fetch user details");
  }
}

/**
 * Get basic user details
 */
export async function getBasicUserDetails(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return user as BasicUserInfo;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw new Error("Failed to fetch user details");
  }
}

/**
 * Approve a user by setting their role
 */
export async function approveUser(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        // organization: {
        //   select: {
        //     businessType: true,
        //   },
        // },
      },
    });

    if (!user /**!user.organization */) {
      throw new Error("User or organization not found");
    }

    let role: UserRole = "user";

    // switch (user.businessType) {
    //   case "RETAILER":
    //     role = "retailer";
    //     break;
    //   case "WHOLESALER":
    //     role = "wholesaler";
    //     break;
    //   case "DISTRIBUTOR":
    //     role = "distributor";
    //     break;
    //   case "BRAND_OWNER":
    //     role = "admin";
    //     break;
    //   default:
    //     role = "user";
    // }

    // Update the user's role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: "APPROVE_USER",
        resourceType: "USER",
        resourceId: userId,
        metadata: { newRole: role },
      },
    });

    revalidatePath("/admin/users");
    return updatedUser;
  } catch (error) {
    console.error("Error approving user:", error);
    throw new Error("Failed to approve user");
  }
}

/**
 * Reject a user
 */
export async function rejectUser(userId: string, reason: string) {
  try {
    // Update the user to banned status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        banned: true,
        banReason: reason,
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: "REJECT_USER",
        resourceType: "USER",
        resourceId: userId,
        metadata: { reason },
      },
    });

    revalidatePath("/admin/users");
    return updatedUser;
  } catch (error) {
    console.error("Error rejecting user:", error);
    throw new Error("Failed to reject user");
  }
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, role: UserRole) {
  try {
    // Update the user's role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: "UPDATE_USER_ROLE",
        resourceType: "USER",
        resourceId: userId,
        metadata: { newRole: role },
      },
    });

    revalidatePath("/admin/users");
    return updatedUser;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw new Error("Failed to update user role");
  }
}

/**
 * Update document status
 */
export async function updateDocumentStatus(
  documentId: string,
  status: "pending" | "verified" | "rejected"
) {
  try {
    // Update the document's status
    const updatedDocument = await prisma.businessDocument.update({
      where: { id: documentId },
      data: {
        status: status.toUpperCase() as "PENDING" | "VERIFIED" | "REJECTED",
      },
    });

    revalidatePath("/admin/users");
    return updatedDocument;
  } catch (error) {
    console.error("Error updating document status:", error);
    throw new Error("Failed to update document status");
  }
}
