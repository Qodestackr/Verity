
import prisma from "@/lib/prisma"

async function seedSubscriptionPlans() {
    console.log("🌱 Seeding subscription plans...")

    const retailerStandard = await prisma.subscriptionPlan.upsert({
        where: {
            name_businessType_tier: {
                name: "Standard",
                businessType: "RETAILER",
                tier: "STANDARD",
            },
        },
        update: {},
        create: {
            name: "Standard",
            description: "Essential tools for growing retailers",
            price: 0,
            currency: "KES",
            interval: "MONTH",
            intervalCount: 1,
            trialPeriodDays: 90,
            businessType: "RETAILER",
            tier: "STANDARD",
            isActive: true,
            features: [
                "Place orders to wholesalers",
                "Inventory tracking & auto reorders",
                "Order history",
                "Micro-Marketing Tools",
                "Only 90 day POS Trial",
                "Email, SMS, Push notifications",
                "Basic budgeting, books & sales reports",
            ],
        },
    })

    const retailerPremium = await prisma.subscriptionPlan.upsert({
        where: {
            name_businessType_tier: {
                name: "Premium",
                businessType: "RETAILER",
                tier: "PREMIUM",
            },
        },
        update: {},
        create: {
            name: "Premium",
            description: "Advanced tools for established retailers",
            price: 400,
            currency: "KES",
            interval: "MONTH",
            intervalCount: 1,
            trialPeriodDays: 30,
            businessType: "RETAILER",
            tier: "PREMIUM",
            isActive: true,
            features: [
                "Everything in Standard",
                "Full Cloud POS system",
                "Smart order scheduling",
                "Real-time order tracking",
                "Advanced sales + marketing analytics",
                "SMS notifications",
                "Books of account",
            ],
        },
    })

    const wholesalerStandard = await prisma.subscriptionPlan.upsert({
        where: {
            name_businessType_tier: {
                name: "Standard",
                businessType: "WHOLESALER",
                tier: "STANDARD",
            },
        },
        update: {},
        create: {
            name: "Standard",
            description: "Essential tools for growing wholesalers",
            price: 4500,
            currency: "KES",
            interval: "MONTH",
            intervalCount: 1,
            trialPeriodDays: 30,
            businessType: "WHOLESALER",
            tier: "STANDARD",
            isActive: true,
            features: [
                "Receive retailer orders",
                "Retailer portal",
                "Unlimited products",
                "Warehouse & Inventory management",
                "Basic logistics tools",
                "Sales analytics",
                "Stock alerts",
            ],
        },
    })

    const wholesalerPremium = await prisma.subscriptionPlan.upsert({
        where: {
            name_businessType_tier: {
                name: "Premium",
                businessType: "WHOLESALER",
                tier: "PREMIUM",
            },
        },
        update: {},
        create: {
            name: "Premium",
            description: "Advanced tools for established wholesalers",
            price: 6500,
            currency: "KES",
            interval: "MONTH",
            intervalCount: 1,
            trialPeriodDays: 30,
            businessType: "WHOLESALER",
            tier: "PREMIUM",
            isActive: true,
            features: [
                "Everything in Standard",
                "Advanced logistics",
                "Comprehensive analytics",
                "Promotion management",
                "Multiple user accounts",
                "Books of account",
                "Priority support",
                "API access",
            ],
        },
    })

    const distributorStandard = await prisma.subscriptionPlan.upsert({
        where: {
            name_businessType_tier: {
                name: "Standard",
                businessType: "DISTRIBUTOR",
                tier: "STANDARD",
            },
        },
        update: {},
        create: {
            name: "Standard",
            description: "Essential tools for growing distributors",
            price: 15000,
            currency: "KES",
            interval: "MONTH",
            intervalCount: 1,
            trialPeriodDays: 30,
            businessType: "DISTRIBUTOR",
            tier: "STANDARD",
            isActive: true,
            features: [
                "Orders & wholesaler management",
                "Unlimited products",
                "Multi-warehouse inventory",
                "Basic fleet management",
                "Sales analytics",
                "Stock alerts",
            ],
        },
    })

    const distributorPremium = await prisma.subscriptionPlan.upsert({
        where: {
            name_businessType_tier: {
                name: "Premium",
                businessType: "DISTRIBUTOR",
                tier: "PREMIUM",
            },
        },
        update: {},
        create: {
            name: "Premium",
            description: "Advanced tools for established distributors",
            price: 30000,
            currency: "KES",
            interval: "MONTH",
            intervalCount: 1,
            trialPeriodDays: 30,
            businessType: "DISTRIBUTOR",
            tier: "PREMIUM",
            isActive: true,
            features: [
                "Everything in Standard",
                "Advanced fleet management",
                "Route optimization",
                "Market insights",
                "Financial analytics",
                "Quality control tools",
                "Multiple user accounts",
                "Books of account",
                "Priority support",
                "API access",
            ],
        },
    })

    console.log("✅ Subscription plans seeded successfully!")
    console.log({
        retailerStandard: retailerStandard.id,
        retailerPremium: retailerPremium.id,
        wholesalerStandard: wholesalerStandard.id,
        wholesalerPremium: wholesalerPremium.id,
        distributorStandard: distributorStandard.id,
        distributorPremium: distributorPremium.id,
    })
}

seedSubscriptionPlans().catch((e) => {
    console.error("❌ Error seeding subscription plans:", e)
    process.exit(1)
}).finally(async () => {
    await prisma.$disconnect()
})
