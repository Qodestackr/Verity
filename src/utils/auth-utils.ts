import prisma from "@/lib/prisma";

export const findUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const findOrganizationById = async (organizationId: string) => {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { members: true },
  });

  return org;
};

export const isAdminPresent = async () => {
  const admin = await prisma.member.findFirst({
    where: { role: "owner" },
  });

  return !!admin;
};

// Find admin with user data
export const findAdmin = async () => {
  const admin = await prisma.member.findFirst({
    where: { role: "owner" },
    include: { user: true },
  });

  if (!admin) {
    throw new Error("Admin not found");
  }

  return admin;
};

// Get user by invitation token
export const getUserByToken = async (token: string) => {
  const invitation = await prisma.invitation.findUnique({
    where: { id: token },
    select: {
      id: true,
      email: true,
      status: true,
      expiresAt: true,
      role: true,
      inviterId: true,
    },
  });

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  const userAlreadyExists = await prisma.user.findUnique({
    where: { email: invitation.email ?? "" },
  });

  const { expiresAt, ...rest } = invitation;

  return {
    ...rest,
    isExpired: expiresAt && expiresAt < new Date(),
    userAlreadyExists: !!userAlreadyExists,
  };
};

// Remove user by ID
export const removeUserById = async (userId: string) => {
  const deleted = await prisma.user.delete({
    where: { id: userId },
  });

  return deleted;
};
