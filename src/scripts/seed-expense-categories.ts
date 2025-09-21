
import prisma from "@/lib/prisma"

async function seedExpenseCategories() {
  const defaultCategories = [
    { name: "Stock Purchases", description: "Costs of buying inventory for resale" },
    { name: "Employee Wages", description: "Salaries, wages, and related employee costs" },
    { name: "Utilities", description: "Electricity, water, internet, and other utilities" },
    { name: "Transport & Delivery", description: "Logistics, delivery fees, and vehicle expenses" },
    { name: "Rent", description: "Rental payments for premises or warehouses" },
    { name: "Marketing & Advertising", description: "Online ads, print materials, promotions" },
    { name: "Office Supplies", description: "Stationery, printing, and small equipment" },
    { name: "Repairs & Maintenance", description: "Fixing equipment, premises, or software tools" },
    { name: "Insurance", description: "Business, health, or asset insurance premiums" },
    { name: "Licensing & Permits", description: "Regulatory costs, local business fees" },
    { name: "Bank Charges & Interest", description: "Loan interest, overdraft fees, bank charges" },
    { name: "Miscellaneous", description: "Anything not categorized elsewhere" },
  ];

  const organizationIds = await prisma.organization.findMany({
    select: { id: true },
  });

  for (const { id: organizationId } of organizationIds) {
    console.log(`🌱 Seeding for org: ${organizationId}`);
    for (const category of defaultCategories) {
      await prisma.expenseCategory.upsert({
        where: {
          organizationId_name: {
            organizationId,
            name: category.name,
          },
        },
        update: {},
        create: {
          organizationId,
          name: category.name,
          description: category.description,
          isActive: true,
        },
      });
    }
  }

  console.log("✅ Expense categories seeded for all organizations!");
}

seedExpenseCategories()
  .catch((e) => {
    console.error("❌ Error seeding expense categories:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/*
ON ORGANIZATION CREATION:
async function createOrganization(data) {
  const org = await prisma.organization.create({
    data,
  });

  // Immediately seed default expense categories for this org
  await seedDefaultCategoriesForOrg(org.id);

  return org;
}

async function seedDefaultCategoriesForOrg(organizationId: string) {
  const categories = [...]; // same array from earlier

  for (const cat of categories) {
    await prisma.expenseCategory.upsert({
      where: {
        organizationId_name: {
          organizationId,
          name: cat.name,
        },
      },
      update: {},
      create: {
        organizationId,
        name: cat.name,
        description: cat.description,
        isActive: true,
      },
    });
  }
}

*/