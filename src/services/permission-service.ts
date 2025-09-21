
import { allPermissions } from "@/lib/permissions";
import prisma from "@/lib/prisma";

export async function initializeOrganizationPermissions(
  organizationId: string
) {
  // Create all available permissions for this organization
  const permissionEntries = Object.entries(allPermissions).map(
    ([key, value]) => ({
      name: value,
      description: `Permission to ${key
        .replace(/([A-Z])/g, " $1")
        .toLowerCase()}`,
      organizationId,
    })
  );

  await prisma.permission.createMany({
    data: permissionEntries,
    skipDuplicates: true,
  });

  return await prisma.permission.findMany({
    where: { organizationId },
  });
}

export async function getOrganizationPermissions(organizationId: string) {
  return await prisma.permission.findMany({
    where: { organizationId },
  });
}

export async function getMemberPermissions(memberId: string) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: { permissions: true },
  });

  return member?.permissions || [];
}

export async function setMemberPermissions(
  memberId: string,
  permissionIds: string[]
) {
  // Clear existing permissions and set new ones
  await prisma.member.update({
    where: { id: memberId },
    data: {
      permissions: {
        set: permissionIds.map((id) => ({ id })),
      },
    },
  });

  return await getMemberPermissions(memberId);
}
