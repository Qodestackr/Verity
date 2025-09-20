-- CreateEnum
CREATE TYPE "AIInsightType" AS ENUM ('ORDER_SUGGESTION', 'CUSTOMER_BEHAVIOR', 'SALES_OPPORTUNITY', 'INVENTORY_ALERT', 'CREDIT_RISK', 'TERRITORY_TREND', 'PRODUCT_DEMAND', 'COMPETITOR_ACTIVITY', 'SEASONAL_PATTERN', 'PRICE_OPTIMIZATION');

-- CreateEnum
CREATE TYPE "ImpactLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'IMMEDIATE');

-- CreateEnum
CREATE TYPE "InsightStatus" AS ENUM ('ACTIVE', 'DISMISSED', 'EXPIRED', 'ACTED_UPON');

-- CreateEnum
CREATE TYPE "InsightSource" AS ENUM ('AI_ANALYSIS', 'WHATSAPP_CONVERSATION', 'SALES_PATTERN', 'INVENTORY_DATA', 'CUSTOMER_BEHAVIOR', 'MARKET_TREND');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('SEND_CAMPAIGN', 'CREATE_EVENT', 'ADJUST_PRICING', 'NOTIFY_STAFF', 'UPDATE_INVENTORY', 'SCHEDULE_DELIVERY');

-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('DEAD_HOUR_DETECTED', 'EVENT_APPROACHING', 'LOW_STOCK', 'WEATHER_CHANGE', 'COMPETITOR_ACTIVITY', 'CUSTOMER_BEHAVIOR', 'MANUAL');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('DAY', 'WEEK', 'MONTH', 'YEAR');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'STANDARD', 'PREMIUM', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('CARD', 'BANK_ACCOUNT', 'BANK_TRANSFER', 'MPESA', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('COOP_BANK', 'MPESA', 'STRIPE', 'PAYSTACK', 'OTHER');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'OPEN', 'PAID', 'VOID', 'UNCOLLECTIBLE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'UNPAID', 'CANCELED', 'TRIALING', 'INCOMPLETE', 'INCOMPLETE_EXPIRED');

-- CreateEnum
CREATE TYPE "InventoryImportMethod" AS ENUM ('MANUAL', 'CSV', 'API');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('LIQUOR_LICENSE', 'BUSINESS_REGISTRATION', 'TAX_CERTIFICATE', 'IDENTITY_DOCUMENT', 'PROOF_OF_ADDRESS', 'OTHER');

-- CreateEnum
CREATE TYPE "FinancialAccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "CostCenterType" AS ENUM ('DEPOT', 'ROUTE', 'VEHICLE', 'DRIVER');

-- CreateEnum
CREATE TYPE "CostType" AS ENUM ('FUEL', 'DRIVER_TIME', 'VEHICLE_DEPRECIATION', 'DEPOT_RENT', 'STORAGE', 'BREAKAGE', 'INSURANCE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "AllocationMethod" AS ENUM ('DIRECT', 'PROPORTIONAL', 'ACTIVITY_BASED');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('LOW_MARGIN', 'HIGH_COST', 'ROUTE_INEFFICIENCY', 'CREDIT_RISK', 'STAGNANT_INVENTORY');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "CreditTransactionType" AS ENUM ('CHARGE', 'PAYMENT', 'ADJUSTMENT', 'INTEREST', 'FEE', 'REFUND');

-- CreateEnum
CREATE TYPE "CreditStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'OVERDUE', 'WRITTEN_OFF');

-- CreateEnum
CREATE TYPE "PointsTransactionType" AS ENUM ('EARNED', 'REDEEMED', 'BONUS');

-- CreateEnum
CREATE TYPE "OnAccountBillStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ShopCategory" AS ENUM ('LIQUOR_STORE', 'NIGHT_CLUB', 'BAR', 'RESTAURANT', 'HOTEL', 'SUPERMARKET', 'KFC', 'OTHER');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('PERSONAL', 'VAN', 'TRUCK', 'MOTORBIKE');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'AT_DESTINATION', 'DELIVERED', 'CONFIRMED', 'FAILED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "DeliveryPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('AVAILABLE', 'ON_DELIVERY', 'ON_BREAK', 'OFFLINE');

-- CreateEnum
CREATE TYPE "DeliveryIssueType" AS ENUM ('STOCK_SHORTAGE', 'VEHICLE_BREAKDOWN', 'CUSTOMER_UNAVAILABLE', 'WRONG_ADDRESS', 'PAYMENT_ISSUE', 'OTHER');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "RouteStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('DRAFT', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StockAuditStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AuditSource" AS ENUM ('POS', 'RECEIVE', 'ONBOARDING', 'MANUAL', 'WEBHOOK', 'ADJUSTMENT', 'TRANSFER', 'RETURN', 'LOSS');

-- CreateEnum
CREATE TYPE "TargetPlatform" AS ENUM ('ios', 'android', 'web');

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('RETAILER', 'WHOLESALER', 'DISTRIBUTOR', 'BRAND_OWNER', 'OTHER');

-- CreateEnum
CREATE TYPE "CustomerTier" AS ENUM ('ALL', 'SILVER', 'GOLD', 'PLATINUM', 'DISTRIBUTORS', 'WHOLESALERS', 'RETAILERS', 'VIP');

-- CreateEnum
CREATE TYPE "PricingRuleStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SCHEDULED', 'PAUSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('MUGITHI_NIGHT', 'RHUMBA_EVENING', 'KARAOKE_NIGHT', 'LIVE_BAND', 'DJ_NIGHT', 'SPORTS_VIEWING', 'HAPPY_HOUR', 'CULTURAL_EVENT', 'PRIVATE_PARTY', 'CORPORATE_EVENT');

-- CreateEnum
CREATE TYPE "OfferType" AS ENUM ('BUY_X_GET_FREE_ITEM', 'PERCENTAGE_DISCOUNT', 'FIXED_DISCOUNT', 'BUNDLE_DEAL', 'LOYALTY_POINTS', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'FREE_DELIVERY', 'BULK_DISCOUNT');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('EVENT_PROMOTION', 'DEAD_HOUR_BOOST', 'LOYALTY_NUDGE', 'RESTOCK_ALERT', 'FLASH_SALE', 'SEASONAL_PUSH', 'PRODUCT_LAUNCH', 'REACTIVATION', 'UPSELL');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('WHATSAPP', 'FACEBOOK', 'INSTAGRAM', 'SMS');

-- CreateEnum
CREATE TYPE "RelationshipStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'BLOCKED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('GENERAL', 'SUPPLIER_BUYER', 'DISTRIBUTOR_RETAILER', 'PRODUCER_DISTRIBUTOR', 'COMPETITOR', 'PARTNER');

-- CreateEnum
CREATE TYPE "PermissionType" AS ENUM ('VIEW_PRODUCTS', 'VIEW_PRICES', 'VIEW_INVENTORY', 'PLACE_ORDERS', 'VIEW_ANALYTICS', 'VIEW_PROMOTIONS', 'VIEW_CONTACTS');

-- CreateEnum
CREATE TYPE "PermissionScope" AS ENUM ('ALL', 'SELECTED', 'NONE');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('CONNECTION_REQUEST', 'CONNECTION_ACCEPTED', 'CONNECTION_REJECTED', 'ORDER_PLACED', 'MEETING_SCHEDULED', 'NOTE_ADDED', 'PERMISSION_CHANGED', 'MESSAGE_SENT');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SaleorOrderStatus" AS ENUM ('DRAFT', 'UNCONFIRMED', 'UNFULFILLED', 'PARTIALLY_FULFILLED', 'FULFILLED', 'CANCELED');

-- CreateEnum
CREATE TYPE "SaleorFulfillmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REFUNDED', 'RETURNED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin', 'distributor', 'wholesaler', 'retailer', 'driver', 'brand_owner');

-- CreateEnum
CREATE TYPE "POSPaymentMethod" AS ENUM ('CASH', 'CREDIT', 'MPESA', 'OTHER_MOBILE_MONEY', 'CARD', 'BANK', 'SPLIT_PAYMENT');

-- CreateEnum
CREATE TYPE "SalesTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'VIP');

-- CreateEnum
CREATE TYPE "ShiftStatus" AS ENUM ('ACTIVE', 'PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ShiftPaymentMethod" AS ENUM ('CASH', 'MPESA', 'CARD', 'CREDIT', 'BANK_TRANSFER', 'OTHER');

-- CreateEnum
CREATE TYPE "OutletType" AS ENUM ('RETAIL_SHOP', 'SUPERMARKET', 'RESTAURANT', 'BAR_CLUB', 'HOTEL', 'WHOLESALE_DEPOT');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "POSTransactionStatus" AS ENUM ('COMPLETED', 'PENDING', 'REFUNDED', 'CANCELED');

-- CreateEnum
CREATE TYPE "TerritoryRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "OpportunityType" AS ENUM ('NEW_CUSTOMER', 'UPSELL_EXISTING', 'CROSS_SELL', 'WIN_BACK_CUSTOMER', 'SEASONAL_PUSH', 'COMPETITOR_WEAKNESS', 'MARKET_EXPANSION', 'PRODUCT_LAUNCH');

-- CreateEnum
CREATE TYPE "EffortLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('IDENTIFIED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "VisitPurpose" AS ENUM ('ROUTINE_CHECK', 'ORDER_COLLECTION', 'PAYMENT_COLLECTION', 'PRODUCT_DEMO', 'RELATIONSHIP_BUILDING', 'COMPLAINT_RESOLUTION', 'MARKET_RESEARCH');

-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('TOP_UP', 'PURCHASE', 'REFUND', 'CASHBACK', 'PENALTY', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REVERSED');

-- CreateEnum
CREATE TYPE "WalletPaymentMethod" AS ENUM ('MPESA', 'AIRTEL_MONEY', 'CARD', 'BANK_TRANSFER', 'CASH_DEPOSIT', 'ADMIN_CREDIT');

-- CreateEnum
CREATE TYPE "WalletPromotionType" AS ENUM ('TOP_UP_BONUS', 'CASHBACK', 'FIRST_TIME', 'LOYALTY_REWARD');

-- CreateEnum
CREATE TYPE "WhatsAppMessageType" AS ENUM ('TEXT', 'IMAGE', 'DOCUMENT', 'AUDIO', 'VIDEO', 'LOCATION', 'CONTACT', 'STICKER');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "ConversationalOrderStatus" AS ENUM ('DRAFT', 'PENDING_CONFIRMATION', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "AIInsight" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "AIInsightType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "impact" "ImpactLevel" NOT NULL DEFAULT 'MEDIUM',
    "urgency" "UrgencyLevel" NOT NULL DEFAULT 'NORMAL',
    "status" "InsightStatus" NOT NULL DEFAULT 'ACTIVE',
    "territory" TEXT,
    "customerId" TEXT,
    "productSku" TEXT,
    "revenuePotential" DOUBLE PRECISION,
    "actionable" BOOLEAN NOT NULL DEFAULT true,
    "actionTaken" BOOLEAN NOT NULL DEFAULT false,
    "actionTakenAt" TIMESTAMP(3),
    "actionTakenBy" TEXT,
    "dismissedAt" TIMESTAMP(3),
    "dismissedBy" TEXT,
    "source" "InsightSource" NOT NULL DEFAULT 'AI_ANALYSIS',
    "sourceMessageId" TEXT,
    "metadata" JSONB,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIModelMetrics" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "modelType" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "accuracyScore" DOUBLE PRECISION NOT NULL,
    "trainingDataSize" INTEGER NOT NULL,
    "lastTrainedAt" TIMESTAMP(3) NOT NULL,
    "predictionsMade" INTEGER NOT NULL DEFAULT 0,
    "correctPredictions" INTEGER NOT NULL DEFAULT 0,
    "falsePositives" INTEGER NOT NULL DEFAULT 0,
    "falseNegatives" INTEGER NOT NULL DEFAULT 0,
    "averageConfidence" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIModelMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationRule" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "triggerType" "TriggerType" NOT NULL,
    "conditions" JSONB NOT NULL,
    "actionType" "ActionType" NOT NULL,
    "actionConfig" JSONB NOT NULL,
    "executeAt" TEXT,
    "cooldownMinutes" INTEGER NOT NULL DEFAULT 60,
    "timesTriggered" INTEGER NOT NULL DEFAULT 0,
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeadHourPattern" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "hourStart" INTEGER NOT NULL,
    "hourEnd" INTEGER NOT NULL,
    "severity" DOUBLE PRECISION NOT NULL,
    "bestAction" "ActionType" NOT NULL,
    "avgLift" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeadHourPattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIConfiguration" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "openaiApiKey" TEXT,
    "openaiModel" TEXT NOT NULL DEFAULT 'gpt-4',
    "maxTokens" INTEGER NOT NULL DEFAULT 1000,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "insightGeneration" BOOLEAN NOT NULL DEFAULT true,
    "autoResponses" BOOLEAN NOT NULL DEFAULT false,
    "sentimentAnalysis" BOOLEAN NOT NULL DEFAULT true,
    "languageDetection" BOOLEAN NOT NULL DEFAULT true,
    "customPrompts" JSONB,
    "responseTemplates" JSONB,
    "confidenceThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "learningEnabled" BOOLEAN NOT NULL DEFAULT true,
    "dataRetentionDays" INTEGER NOT NULL DEFAULT 365,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RealTimeMetrics" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "metricKey" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "previousValue" DOUBLE PRECISION,
    "changePercent" DOUBLE PRECISION,
    "territory" TEXT,
    "productSku" TEXT,
    "customerId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RealTimeMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventStream" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "eventData" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventStream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsSnapshot" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "snapshotType" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookConfiguration" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT[],
    "secret" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggered" TIMESTAMP(3),
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "retryPolicy" JSONB,
    "headers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessDocument" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "expiryDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequiredDocument" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "businessTypes" "BusinessType"[],
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequiredDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "trialEndDate" TIMESTAMP(3),
    "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "paymentMethodId" TEXT,
    "lastPaymentDate" TIMESTAMP(3),
    "nextBillingDate" TIMESTAMP(3) NOT NULL,
    "failedPayments" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "interval" "BillingInterval" NOT NULL DEFAULT 'MONTH',
    "intervalCount" INTEGER NOT NULL DEFAULT 1,
    "trialPeriodDays" INTEGER,
    "features" JSONB,
    "businessType" "BusinessType",
    "tier" "PlanTier" NOT NULL DEFAULT 'STANDARD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethodDetails" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "PaymentMethodType" NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'COOP_BANK',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "lastFour" TEXT,
    "expiryMonth" INTEGER,
    "expiryYear" INTEGER,
    "cardBrand" TEXT,
    "accountName" TEXT,
    "accountNumber" TEXT,
    "bankCode" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethodDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "amount" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amountDue" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "description" TEXT,
    "receiptUrl" TEXT,
    "paymentIntentId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethodType" "PaymentMethodType" NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "providerPaymentId" TEXT,
    "providerFee" DOUBLE PRECISION,
    "metadata" JSONB,
    "failureReason" TEXT,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingContact" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "country" TEXT DEFAULT 'Kenya',
    "taxId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingPreference" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "businessType" "BusinessType",
    "importMethod" "InventoryImportMethod" DEFAULT 'API',
    "subscriptionPlan" "PlanTier",
    "paymentMethod" "PaymentProvider",
    "teamEmails" TEXT,
    "warehouseName" TEXT,
    "warehouseLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentIntent" (
    "id" TEXT NOT NULL,
    "merchantRequestId" TEXT NOT NULL,
    "checkoutRequestId" TEXT,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "phoneNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FiscalPeriod" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "closedAt" TIMESTAMP(3),
    "closedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FiscalPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialAccount" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accountNumber" TEXT,
    "accountType" "FinancialAccountType" NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialEntry" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "fiscalPeriodId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "entryType" "EntryType" NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetAllocation" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetForecast" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "generatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "forecastMonths" INTEGER NOT NULL,
    "historyMonths" INTEGER NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "avgExpenseGrowth" DOUBLE PRECISION NOT NULL,
    "avgRevenueGrowth" DOUBLE PRECISION NOT NULL,
    "avgProfitMargin" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,

    CONSTRAINT "BudgetForecast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForecastCategory" (
    "id" TEXT NOT NULL,
    "forecastId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ForecastCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForecastInsight" (
    "id" TEXT NOT NULL,
    "forecastId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "action" TEXT NOT NULL,

    CONSTRAINT "ForecastInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetScenario" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isBaseline" BOOLEAN NOT NULL DEFAULT false,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScenarioAllocation" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "changePercent" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "ScenarioAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScenarioAssumption" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "changeType" TEXT NOT NULL,
    "changeValue" DOUBLE PRECISION NOT NULL,
    "appliedTo" TEXT,

    CONSTRAINT "ScenarioAssumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScenarioImpact" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "baselineValue" DOUBLE PRECISION NOT NULL,
    "scenarioValue" DOUBLE PRECISION NOT NULL,
    "changePercent" DOUBLE PRECISION NOT NULL,
    "impact" TEXT NOT NULL,

    CONSTRAINT "ScenarioImpact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostCenter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CostCenterType" NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixedCost" (
    "id" TEXT NOT NULL,
    "costCenterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "monthlyAmount" DECIMAL(10,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FixedCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariableCost" (
    "id" TEXT NOT NULL,
    "costCenterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "costPerUnit" DECIMAL(10,4) NOT NULL,
    "unitType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VariableCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleorOrderLine" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "variantName" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SaleorOrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostAllocation" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "orderLineId" TEXT,
    "costCenterId" TEXT NOT NULL,
    "costType" "CostType" NOT NULL,
    "amount" DECIMAL(10,4) NOT NULL,
    "units" DECIMAL(10,4),
    "costPerUnit" DECIMAL(10,4),
    "allocationMethod" "AllocationMethod" NOT NULL,
    "allocationBasis" TEXT,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL,

    CONSTRAINT "CostAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitEconomics" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "revenue" DECIMAL(10,2) NOT NULL,
    "discounts" DECIMAL(10,2) NOT NULL,
    "netRevenue" DECIMAL(10,2) NOT NULL,
    "cogs" DECIMAL(10,2) NOT NULL,
    "fuelCost" DECIMAL(10,2) NOT NULL,
    "driverCost" DECIMAL(10,2) NOT NULL,
    "vehicleCost" DECIMAL(10,2) NOT NULL,
    "depotCost" DECIMAL(10,2) NOT NULL,
    "breakageCost" DECIMAL(10,2) NOT NULL,
    "otherCosts" DECIMAL(10,2) NOT NULL,
    "totalCost" DECIMAL(10,2) NOT NULL,
    "grossMargin" DECIMAL(10,2) NOT NULL,
    "marginPercentage" DECIMAL(5,2) NOT NULL,
    "costPerBottle" DECIMAL(10,4),
    "marginPerBottle" DECIMAL(10,4),
    "costPerKm" DECIMAL(10,4),
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitEconomics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarginAlert" (
    "id" TEXT NOT NULL,
    "alertType" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "orderId" TEXT,
    "costCenterId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "threshold" DECIMAL(10,2),
    "actualValue" DECIMAL(10,2),
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarginAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "deliveryAddress" JSONB,
    "favoriteProducts" JSONB,
    "orderHistory" JSONB,
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastVisitDate" TIMESTAMP(3),
    "visits" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerTierHistory" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "previousTier" "CustomerTier",
    "newTier" "CustomerTier" NOT NULL,
    "reason" TEXT,
    "triggeredBy" TEXT,
    "requirements" JSONB,
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerTierHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerCredit" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "creditLimit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditAvailable" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentTerms" INTEGER NOT NULL DEFAULT 30,
    "riskScore" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "lastAssessment" TIMESTAMP(3),
    "autoApproval" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "blockedReason" TEXT,
    "blockedAt" TIMESTAMP(3),
    "overdueAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "daysPastDue" INTEGER NOT NULL DEFAULT 0,
    "paymentHistory" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "customerCreditId" TEXT NOT NULL,
    "type" "CreditTransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "orderId" TEXT,
    "paymentId" TEXT,
    "balanceBefore" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3),
    "paidDate" TIMESTAMP(3),
    "status" "CreditStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyPoints" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "pointsRedeemed" INTEGER NOT NULL DEFAULT 0,
    "currentBalance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "LoyaltyPoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointsTransaction" (
    "id" TEXT NOT NULL,
    "loyaltyPointsId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "PointsTransactionType" NOT NULL DEFAULT 'EARNED',
    "sourceOrderId" TEXT,
    "redeemedFrom" TEXT DEFAULT 'POS',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointsTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnAccountBill" (
    "id" TEXT NOT NULL,
    "saleorOrderId" TEXT NOT NULL,
    "saleorOrderNumber" TEXT NOT NULL,
    "customerId" TEXT,
    "organizationId" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "OnAccountBillStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerNote" TEXT,
    "lines" JSONB,

    CONSTRAINT "OnAccountBill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessProfile" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "shopName" TEXT NOT NULL DEFAULT '',
    "shopDescription" TEXT,
    "shopCategory" "ShopCategory" NOT NULL,
    "deliveryAreas" JSONB NOT NULL,
    "deliveryHours" JSONB NOT NULL,
    "minimumOrderValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isOnlineShop" BOOLEAN NOT NULL DEFAULT false,
    "shopUrl" TEXT,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "isOpen" BOOLEAN NOT NULL,
    "isFeatured" BOOLEAN,
    "isNew" BOOLEAN,
    "promoText" TEXT,
    "monthlyOrders" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreReview" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "professionalism" INTEGER,
    "appearance" INTEGER,
    "userId" TEXT,
    "storeId" TEXT,

    CONSTRAINT "StoreReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "licenseNumber" TEXT,
    "licenseExpiry" TIMESTAMP(3),
    "vehicleType" "VehicleType" NOT NULL DEFAULT 'MOTORBIKE',
    "vehicleDetails" JSONB,
    "status" "DriverStatus" NOT NULL DEFAULT 'OFFLINE',
    "currentLocation" JSONB,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "totalDeliveries" INTEGER NOT NULL DEFAULT 0,
    "successfulDeliveries" INTEGER NOT NULL DEFAULT 0,
    "failedDeliveries" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverCheckIn" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "status" "DriverStatus" NOT NULL DEFAULT 'OFFLINE',
    "location" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriverCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryZone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "polygon" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "deliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minOrder" DOUBLE PRECISION,
    "maxDistance" DOUBLE PRECISION,

    CONSTRAINT "DeliveryZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeoLocation" (
    "id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "geohash" VARCHAR(12) NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Kenya',
    "plusCode" TEXT,

    CONSTRAINT "GeoLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "orderId" TEXT,
    "driverId" TEXT,
    "routeId" TEXT,
    "campaignId" TEXT,
    "saleorOrderId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "customerAddress" TEXT,
    "customerPhone" TEXT,
    "customerName" TEXT,
    "signatureUrl" TEXT,
    "photoUrl" TEXT,
    "receivedBy" TEXT,
    "deliveryNotes" TEXT,
    "proofOfDelivery" JSONB,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "DeliveryPriority" NOT NULL DEFAULT 'MEDIUM',
    "estimatedTime" INTEGER,
    "actualTime" INTEGER,
    "distance" DOUBLE PRECISION,
    "pickupLocationId" TEXT,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryStatusHistory" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "fromStatus" "DeliveryStatus",
    "toStatus" "DeliveryStatus" NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "location" JSONB,

    CONSTRAINT "DeliveryStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryChecklistItem" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "completedBy" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryIssue" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "issueType" "DeliveryIssueType" NOT NULL,
    "description" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "status" "IssueStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryRoute" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "zoneId" TEXT,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "RouteStatus" NOT NULL DEFAULT 'PLANNED',
    "stops" JSONB NOT NULL,
    "optimizationScore" DOUBLE PRECISION,
    "totalDistance" DOUBLE PRECISION,
    "estimatedDuration" INTEGER,
    "actualDuration" INTEGER,
    "optimizedPath" JSONB,
    "deliverySuccess" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgDeliveryTime" DOUBLE PRECISION,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseCategory" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "taxId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "vendorId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "receiptUrl" TEXT,
    "paymentMethod" "POSPaymentMethod" NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "reimbursable" BOOLEAN NOT NULL DEFAULT false,
    "reimbursedTo" TEXT,
    "taxDeductible" BOOLEAN NOT NULL DEFAULT false,
    "taxAmount" DOUBLE PRECISION,
    "recurringExpense" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "purchaseId" TEXT,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "purchaseNumber" TEXT NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'DRAFT',
    "orderDate" TIMESTAMP(3) NOT NULL,
    "expectedDelivery" TIMESTAMP(3),
    "deliveredDate" TIMESTAMP(3),
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentDueDate" TIMESTAMP(3),
    "paymentMethod" "POSPaymentMethod",
    "paymentReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseItem" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "received" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "saleorWarehouseId" TEXT,
    "name" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "address" TEXT,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT DEFAULT 'Kenya',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "saleorProductId" TEXT,
    "saleorVariantId" TEXT,
    "sku" TEXT,
    "barcode" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "minStockLevel" INTEGER NOT NULL DEFAULT 0,
    "maxStockLevel" INTEGER,
    "costPrice" DOUBLE PRECISION,
    "sellingPrice" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastStockCheck" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockAuditLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sku" TEXT NOT NULL,
    "productName" TEXT,
    "variantName" TEXT,
    "previousStock" INTEGER NOT NULL,
    "quantityChange" INTEGER NOT NULL,
    "currentStock" INTEGER NOT NULL,
    "unitCost" DECIMAL(10,2) NOT NULL,
    "totalCost" DECIMAL(10,2) NOT NULL,
    "source" "AuditSource" NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "supplierId" TEXT,
    "locationId" TEXT,
    "status" "StockAuditStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "batchId" TEXT,
    "previousPrice" DECIMAL(10,2),
    "priceChange" DECIMAL(10,2),
    "currentPrice" DECIMAL(10,2),
    "previousCostPrice" DECIMAL(10,2),
    "costPriceChange" DECIMAL(10,2),
    "currentCostPrice" DECIMAL(10,2),
    "saleorVariantId" TEXT,
    "saleorProductId" TEXT,
    "saleorChannelId" TEXT,

    CONSTRAINT "StockAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockAuditBatch" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "AuditSource" NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "status" "StockAuditStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "supplierId" TEXT,
    "receiptNumber" TEXT,
    "deliveryDate" TIMESTAMP(3),
    "paymentStatus" "PaymentStatus",
    "paymentMethod" "POSPaymentMethod",
    "orderNumber" TEXT,
    "sourceLocationId" TEXT,
    "targetLocationId" TEXT,

    CONSTRAINT "StockAuditBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedisCacheEntry" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "variantName" TEXT,
    "imageUrl" TEXT,
    "category" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ttl" INTEGER,

    CONSTRAINT "RedisCacheEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FCMToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" "TargetPlatform" NOT NULL DEFAULT 'web',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "FCMToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "businessType" "BusinessType" NOT NULL DEFAULT 'RETAILER',
    "licenseNumber" TEXT,
    "taxId" TEXT,
    "phoneNumber" TEXT,
    "enableSMS" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB DEFAULT '{}',
    "city" TEXT,
    "address" TEXT,
    "subscriptionPlanId" TEXT,
    "paymentMethod" "PaymentMethodType" NOT NULL DEFAULT 'MPESA',
    "metadata" JSONB DEFAULT '{}',
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "salesTier" "SalesTier" NOT NULL DEFAULT 'BRONZE',
    "creditLimit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentTerms" INTEGER NOT NULL DEFAULT 0,
    "lastOrderDate" TIMESTAMP(3),
    "totalLifetimeValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "primaryLocationId" TEXT,
    "deliveryZoneId" TEXT,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingRule" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "productId" TEXT NOT NULL,
    "productName" TEXT,
    "customerTier" "CustomerTier" NOT NULL DEFAULT 'ALL',
    "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
    "basePrice" DOUBLE PRECISION NOT NULL,
    "status" "PricingRuleStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "saleorChannelId" TEXT,
    "saleorPromotionId" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingTier" (
    "id" TEXT NOT NULL,
    "pricingRuleId" TEXT NOT NULL,
    "minQuantity" INTEGER NOT NULL,
    "maxQuantity" INTEGER,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingRuleUsage" (
    "id" TEXT NOT NULL,
    "pricingRuleId" TEXT NOT NULL,
    "customerId" TEXT,
    "orderId" TEXT,
    "quantity" INTEGER NOT NULL,
    "originalPrice" DOUBLE PRECISION NOT NULL,
    "discountAmount" DOUBLE PRECISION NOT NULL,
    "finalPrice" DOUBLE PRECISION NOT NULL,
    "savings" DOUBLE PRECISION NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PricingRuleUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "locationId" TEXT,
    "radius" DOUBLE PRECISION,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "autoPromote" BOOLEAN NOT NULL DEFAULT true,
    "promoStartTime" INTEGER NOT NULL DEFAULT 180,
    "offerType" "OfferType",
    "offerValue" DOUBLE PRECISION,
    "requiredEmoji" TEXT,
    "freeItem" TEXT,
    "minQuantity" INTEGER,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "eventId" TEXT,
    "name" TEXT NOT NULL,
    "type" "CampaignType" NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "triggerRules" JSONB,
    "isAIGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiConfidence" DOUBLE PRECISION,
    "triggerType" "TriggerType",
    "targetSegment" JSONB,
    "minOrderValue" DOUBLE PRECISION,
    "targetTiers" "SalesTier"[],
    "locationId" TEXT,
    "targetRadius" DOUBLE PRECISION,
    "targetZoneId" TEXT,
    "targetLocationId" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "autoSendAt" TIMESTAMP(3),
    "message" TEXT NOT NULL,
    "platforms" "Platform"[],
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "offerType" "OfferType" NOT NULL,
    "discountValue" DOUBLE PRECISION,
    "discountPercent" DOUBLE PRECISION,
    "sent" INTEGER NOT NULL DEFAULT 0,
    "delivered" INTEGER NOT NULL DEFAULT 0,
    "opened" INTEGER NOT NULL DEFAULT 0,
    "replied" INTEGER NOT NULL DEFAULT 0,
    "converted" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignProduct" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "CampaignProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignResponse" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "message" TEXT NOT NULL,
    "quantity" INTEGER,
    "isConverted" BOOLEAN NOT NULL DEFAULT false,
    "orderValue" DOUBLE PRECISION,
    "respondedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoucherRedemption" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "orderId" TEXT,
    "amountApplied" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoucherRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountType" "DiscountType" NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "minimumPurchase" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessRelationship" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "status" "RelationshipStatus" NOT NULL DEFAULT 'PENDING',
    "type" "RelationshipType" NOT NULL DEFAULT 'GENERAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastInteractionAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "BusinessRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelationshipPermission" (
    "id" TEXT NOT NULL,
    "relationshipId" TEXT NOT NULL,
    "permissionType" "PermissionType" NOT NULL,
    "isGranted" BOOLEAN NOT NULL DEFAULT false,
    "scope" "PermissionScope" NOT NULL DEFAULT 'ALL',
    "scopeIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RelationshipPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelationshipInteraction" (
    "id" TEXT NOT NULL,
    "relationshipId" TEXT NOT NULL,
    "type" "InteractionType" NOT NULL,
    "initiatedById" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RelationshipInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectionRequest" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "recipientName" TEXT,
    "recipientBusinessName" TEXT,
    "message" TEXT,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConnectionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisibilitySettings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "isDiscoverable" BOOLEAN NOT NULL DEFAULT true,
    "showContactInfo" BOOLEAN NOT NULL DEFAULT true,
    "showProducts" BOOLEAN NOT NULL DEFAULT true,
    "showPricing" BOOLEAN NOT NULL DEFAULT false,
    "defaultNewConnectionPermissions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisibilitySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVisibility" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "visibleToIds" TEXT[],
    "hiddenFromIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVisibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceVisibility" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "customPricing" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceVisibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleorChannel" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "saleorChannelId" TEXT,
    "slug" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL DEFAULT 'KES',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "defaultWarehouseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleorChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuickBooksIntegration" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "realmId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuickBooksIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleorSync" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "saleorId" TEXT NOT NULL,
    "alcoraId" TEXT NOT NULL,
    "lastSyncAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncStatus" TEXT NOT NULL DEFAULT 'synced',

    CONSTRAINT "SaleorSync_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleorOrder" (
    "id" TEXT NOT NULL,
    "saleorOrderId" TEXT NOT NULL,
    "saleorChannelId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "saleorStatus" "SaleorOrderStatus" NOT NULL DEFAULT 'UNCONFIRMED',
    "saleorFulfillmentStatus" "SaleorFulfillmentStatus",
    "orderNumber" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "shippingAddress" JSONB,
    "buyerOrgId" TEXT,
    "sellerOrgId" TEXT,
    "orderType" TEXT,
    "depot" TEXT,
    "route" TEXT,
    "driverName" TEXT,
    "deliveryDate" TIMESTAMP(3),
    "saleorCreatedAt" TIMESTAMP(3) NOT NULL,
    "saleorUpdatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleorOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,
    "banExpires" INTEGER,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "twoFactorBackupCodes" TEXT,
    "phoneNumber" TEXT,
    "phoneNumberVerified" BOOLEAN NOT NULL DEFAULT false,
    "enableSMS" BOOLEAN NOT NULL DEFAULT true,
    "username" TEXT NOT NULL DEFAULT 'DEFAULT',
    "displayUsername" TEXT NOT NULL DEFAULT 'USER',
    "settings" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "impersonatedBy" TEXT,
    "activeOrganizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuthApplication" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "redirectURLs" TEXT NOT NULL,
    "metadata" TEXT,
    "type" TEXT NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OAuthApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuthAccessToken" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "previousRefreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "refreshTokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "clientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scopes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OAuthAccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuthConsent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "scopes" TEXT NOT NULL,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OAuthConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegulatoryCheck" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "lastLicenseCheck" TIMESTAMP(3) NOT NULL,
    "nextRenewalDate" TIMESTAMP(3) NOT NULL,
    "kraPinStatus" BOOLEAN NOT NULL DEFAULT false,
    "complianceScore" INTEGER NOT NULL,

    CONSTRAINT "RegulatoryCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BartenderShift" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "bartenderId" TEXT NOT NULL,
    "tillId" TEXT,
    "shiftNumber" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "status" "ShiftStatus" NOT NULL DEFAULT 'ACTIVE',
    "openingCashBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "openingMpesaBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "openingTotalBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "closingCashBalance" DOUBLE PRECISION,
    "closingMpesaBalance" DOUBLE PRECISION,
    "closingTotalBalance" DOUBLE PRECISION,
    "totalSales" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cashSales" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mpesaSales" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cardSales" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditSales" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expectedCashInHand" DOUBLE PRECISION,
    "actualCashInHand" DOUBLE PRECISION,
    "cashVariance" DOUBLE PRECISION,
    "varianceReason" TEXT,
    "mpesaTransactionRefs" JSONB,
    "mpesaReconciledAmount" DOUBLE PRECISION,
    "mpesaVariance" DOUBLE PRECISION,
    "openingNotes" TEXT,
    "closingNotes" TEXT,
    "issues" JSONB,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BartenderShift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftTransaction" (
    "id" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "transactionId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "POSPaymentMethod" NOT NULL,
    "transactionRef" TEXT,
    "customerName" TEXT,
    "items" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verificationNotes" TEXT,

    CONSTRAINT "ShiftTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftExpense" (
    "id" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "receipt" TEXT,
    "approvedBy" TEXT,
    "notes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShiftExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftSummary" (
    "id" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "totalTransactions" INTEGER NOT NULL,
    "averageTransactionValue" DOUBLE PRECISION NOT NULL,
    "peakHour" INTEGER,
    "topSellingItems" JSONB NOT NULL,
    "salesPerHour" DOUBLE PRECISION NOT NULL,
    "customerCount" INTEGER,
    "averageItemsPerSale" DOUBLE PRECISION NOT NULL,
    "alerts" JSONB,
    "insights" JSONB,
    "summaryEmailSent" BOOLEAN NOT NULL DEFAULT false,
    "summaryWhatsAppSent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShiftSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outlet" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "outletType" "OutletType" NOT NULL DEFAULT 'RETAIL_SHOP',
    "locationId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastVisitDate" TIMESTAMP(3),
    "nextVisitDate" TIMESTAMP(3),
    "avgFootfall" INTEGER NOT NULL DEFAULT 0,
    "peakHours" JSONB,
    "competitorCount" INTEGER NOT NULL DEFAULT 0,
    "avgMonthlyVolume" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Outlet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION,
    "stockQuantity" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "wholesalePrice" DOUBLE PRECISION NOT NULL,
    "retailPrice" DOUBLE PRECISION NOT NULL,
    "distributorPrice" DOUBLE PRECISION,
    "popularityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "seasonalityData" JSONB,
    "demandByRegion" JSONB,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "customerId" TEXT,
    "orderNumber" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shippingAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalAmount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "POSPaymentMethod" NOT NULL DEFAULT 'MPESA',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "saleorOrderId" TEXT,
    "posTransactionId" TEXT,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fulfillmentStatus" TEXT NOT NULL DEFAULT 'unfulfilled',
    "fulfillmentDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "outletId" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "POSProduct" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "saleorProductId" TEXT NOT NULL,
    "costPrice" DOUBLE PRECISION NOT NULL,
    "lowStockAlert" INTEGER NOT NULL DEFAULT 5,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "barcode" TEXT,
    "salesRank" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "POSProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "POSTill" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "tillNumber" TEXT NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT false,
    "openingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "closingBalance" DOUBLE PRECISION,
    "openedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "POSTill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "POSTransaction" (
    "id" TEXT NOT NULL,
    "tillId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "saleorOrderId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "POSPaymentMethod" NOT NULL,
    "customerId" TEXT,
    "isForPickup" BOOLEAN NOT NULL DEFAULT false,
    "receiptNumber" TEXT NOT NULL,
    "status" "POSTransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "POSTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "POSDailyReport" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "tillId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "totalSales" DOUBLE PRECISION NOT NULL,
    "totalTransactions" INTEGER NOT NULL,
    "paymentBreakdown" JSONB NOT NULL,
    "productSales" JSONB NOT NULL,
    "reportData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "POSDailyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "POSDevice" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "lastLocation" JSONB,
    "offlineMode" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "POSDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesTerritory" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "salesRepId" TEXT,
    "salesRepName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "boundaries" JSONB,
    "centerPoint" JSONB,
    "customerCount" INTEGER NOT NULL DEFAULT 0,
    "activeCustomers" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlyRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageOrderValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3),
    "performanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riskLevel" "TerritoryRiskLevel" NOT NULL DEFAULT 'LOW',
    "competitorCount" INTEGER NOT NULL DEFAULT 0,
    "marketPenetration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "growthRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesTerritory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TerritoryCustomer" (
    "id" TEXT NOT NULL,
    "territoryId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastOrderAt" TIMESTAMP(3),
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riskScore" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TerritoryCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TerritoryAnalytics" (
    "id" TEXT NOT NULL,
    "territoryId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "customerCount" INTEGER NOT NULL DEFAULT 0,
    "newCustomers" INTEGER NOT NULL DEFAULT 0,
    "averageOrderValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "topProductSku" TEXT,
    "topProductRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "competitorActivity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weatherImpact" DOUBLE PRECISION,
    "eventImpact" DOUBLE PRECISION,
    "marketSentiment" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TerritoryAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TerritoryOpportunity" (
    "id" TEXT NOT NULL,
    "territoryId" TEXT NOT NULL,
    "type" "OpportunityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "revenuePotential" DOUBLE PRECISION NOT NULL,
    "effort" "EffortLevel" NOT NULL DEFAULT 'MEDIUM',
    "timeframe" TEXT,
    "status" "OpportunityStatus" NOT NULL DEFAULT 'IDENTIFIED',
    "assignedTo" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "actualRevenue" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TerritoryOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TerritoryHeatmap" (
    "id" TEXT NOT NULL,
    "territoryId" TEXT NOT NULL,
    "gridX" INTEGER NOT NULL,
    "gridY" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "intensity" DOUBLE PRECISION NOT NULL,
    "metricType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TerritoryHeatmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesRepPerformance" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "territory" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "messagesReceived" INTEGER NOT NULL DEFAULT 0,
    "messagesSent" INTEGER NOT NULL DEFAULT 0,
    "conversationsStarted" INTEGER NOT NULL DEFAULT 0,
    "conversationsCompleted" INTEGER NOT NULL DEFAULT 0,
    "ordersCreated" INTEGER NOT NULL DEFAULT 0,
    "ordersConfirmed" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aiInsightsUsed" INTEGER NOT NULL DEFAULT 0,
    "aiInsightsGenerated" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageResponseTime" INTEGER,
    "customerSatisfaction" DOUBLE PRECISION,
    "rank" INTEGER,
    "performanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesRepPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesVisit" (
    "id" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "salesPersonId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "purpose" "VisitPurpose" NOT NULL,
    "orderPlaced" BOOLEAN NOT NULL DEFAULT false,
    "orderValue" DOUBLE PRECISION,
    "nextVisitDate" TIMESTAMP(3),
    "competitorInfo" JSONB,
    "marketInsights" TEXT,
    "customerFeedback" TEXT,

    CONSTRAINT "SalesVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pendingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lockedBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dailyLimit" DOUBLE PRECISION NOT NULL DEFAULT 10000,
    "monthlyLimit" DOUBLE PRECISION NOT NULL DEFAULT 50000,
    "dailySpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlySpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastResetDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "blockedReason" TEXT,
    "blockedAt" TIMESTAMP(3),
    "pin" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" "WalletTransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balanceBefore" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "orderId" TEXT,
    "topUpId" TEXT,
    "refundId" TEXT,
    "referenceId" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "failureReason" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTopUp" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "WalletPaymentMethod" NOT NULL,
    "paymentReference" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "failureReason" TEXT,
    "processedAt" TIMESTAMP(3),
    "externalId" TEXT,
    "providerResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletTopUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletPromotion" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "WalletPromotionType" NOT NULL,
    "minTopUpAmount" DOUBLE PRECISION,
    "maxCashback" DOUBLE PRECISION,
    "cashbackRate" DOUBLE PRECISION,
    "fixedAmount" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "customerTiers" "CustomerTier"[],
    "minOrderValue" DOUBLE PRECISION,
    "productIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletPromotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppIntegration" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "phoneNumberId" TEXT NOT NULL,
    "businessAccountId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "webhookToken" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "messageQuotaUsed" INTEGER NOT NULL DEFAULT 0,
    "messageQuotaLimit" INTEGER NOT NULL DEFAULT 1000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppMessage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "whatsappMessageId" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" "WhatsAppMessageType" NOT NULL DEFAULT 'TEXT',
    "status" "MessageStatus" NOT NULL DEFAULT 'SENT',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    "isFromCustomer" BOOLEAN NOT NULL DEFAULT true,
    "conversationId" TEXT,
    "replyToMessageId" TEXT,
    "aiProcessed" BOOLEAN NOT NULL DEFAULT false,
    "aiConfidence" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contactId" TEXT,

    CONSTRAINT "WhatsAppMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppContact" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "name" TEXT,
    "profilePicture" TEXT,
    "lastSeen" TIMESTAMP(3),
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "customerId" TEXT,
    "salesRepId" TEXT,
    "territory" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditLimit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riskScore" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "preferredLanguage" TEXT DEFAULT 'en',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationalOrder" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "whatsappMessageId" TEXT,
    "contactId" TEXT,
    "customerId" TEXT,
    "orderNumber" TEXT NOT NULL,
    "status" "ConversationalOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "paymentMethod" "POSPaymentMethod",
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "deliveryAddress" TEXT,
    "deliveryNotes" TEXT,
    "conversationData" JSONB,
    "aiSuggestions" JSONB,
    "confirmedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationalOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationalOrderItem" (
    "id" TEXT NOT NULL,
    "conversationalOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "sku" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aiSuggested" BOOLEAN NOT NULL DEFAULT false,
    "customerRequested" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationalOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MemberToPermission" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MemberToPermission_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CampaignToOutlet" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CampaignToOutlet_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProductTransactions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductTransactions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "AIInsight_organizationId_idx" ON "AIInsight"("organizationId");

-- CreateIndex
CREATE INDEX "AIInsight_type_idx" ON "AIInsight"("type");

-- CreateIndex
CREATE INDEX "AIInsight_status_idx" ON "AIInsight"("status");

-- CreateIndex
CREATE INDEX "AIInsight_urgency_idx" ON "AIInsight"("urgency");

-- CreateIndex
CREATE INDEX "AIInsight_territory_idx" ON "AIInsight"("territory");

-- CreateIndex
CREATE INDEX "AIInsight_createdAt_idx" ON "AIInsight"("createdAt");

-- CreateIndex
CREATE INDEX "AIModelMetrics_organizationId_idx" ON "AIModelMetrics"("organizationId");

-- CreateIndex
CREATE INDEX "AIModelMetrics_modelType_idx" ON "AIModelMetrics"("modelType");

-- CreateIndex
CREATE UNIQUE INDEX "AIModelMetrics_organizationId_modelType_version_key" ON "AIModelMetrics"("organizationId", "modelType", "version");

-- CreateIndex
CREATE INDEX "AutomationRule_organizationId_isActive_idx" ON "AutomationRule"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "AutomationRule_triggerType_idx" ON "AutomationRule"("triggerType");

-- CreateIndex
CREATE INDEX "DeadHourPattern_organizationId_idx" ON "DeadHourPattern"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "DeadHourPattern_organizationId_dayOfWeek_hourStart_key" ON "DeadHourPattern"("organizationId", "dayOfWeek", "hourStart");

-- CreateIndex
CREATE UNIQUE INDEX "AIConfiguration_organizationId_key" ON "AIConfiguration"("organizationId");

-- CreateIndex
CREATE INDEX "RealTimeMetrics_organizationId_idx" ON "RealTimeMetrics"("organizationId");

-- CreateIndex
CREATE INDEX "RealTimeMetrics_metricType_idx" ON "RealTimeMetrics"("metricType");

-- CreateIndex
CREATE INDEX "RealTimeMetrics_territory_idx" ON "RealTimeMetrics"("territory");

-- CreateIndex
CREATE INDEX "RealTimeMetrics_timestamp_idx" ON "RealTimeMetrics"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "RealTimeMetrics_organizationId_metricKey_timestamp_key" ON "RealTimeMetrics"("organizationId", "metricKey", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "EventStream_eventId_key" ON "EventStream"("eventId");

-- CreateIndex
CREATE INDEX "EventStream_organizationId_idx" ON "EventStream"("organizationId");

-- CreateIndex
CREATE INDEX "EventStream_eventType_idx" ON "EventStream"("eventType");

-- CreateIndex
CREATE INDEX "EventStream_aggregateId_idx" ON "EventStream"("aggregateId");

-- CreateIndex
CREATE INDEX "EventStream_timestamp_idx" ON "EventStream"("timestamp");

-- CreateIndex
CREATE INDEX "EventStream_processed_idx" ON "EventStream"("processed");

-- CreateIndex
CREATE INDEX "AnalyticsSnapshot_organizationId_idx" ON "AnalyticsSnapshot"("organizationId");

-- CreateIndex
CREATE INDEX "AnalyticsSnapshot_snapshotType_idx" ON "AnalyticsSnapshot"("snapshotType");

-- CreateIndex
CREATE INDEX "AnalyticsSnapshot_snapshotDate_idx" ON "AnalyticsSnapshot"("snapshotDate");

-- CreateIndex
CREATE INDEX "AnalyticsSnapshot_isLatest_idx" ON "AnalyticsSnapshot"("isLatest");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsSnapshot_organizationId_snapshotType_snapshotDate_key" ON "AnalyticsSnapshot"("organizationId", "snapshotType", "snapshotDate");

-- CreateIndex
CREATE INDEX "WebhookConfiguration_organizationId_idx" ON "WebhookConfiguration"("organizationId");

-- CreateIndex
CREATE INDEX "WebhookConfiguration_isActive_idx" ON "WebhookConfiguration"("isActive");

-- CreateIndex
CREATE INDEX "BusinessDocument_organizationId_idx" ON "BusinessDocument"("organizationId");

-- CreateIndex
CREATE INDEX "BusinessDocument_type_idx" ON "BusinessDocument"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_organizationId_key" ON "Subscription"("organizationId");

-- CreateIndex
CREATE INDEX "Subscription_organizationId_idx" ON "Subscription"("organizationId");

-- CreateIndex
CREATE INDEX "Subscription_planId_idx" ON "Subscription"("planId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_nextBillingDate_idx" ON "Subscription"("nextBillingDate");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_businessType_idx" ON "SubscriptionPlan"("businessType");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_tier_idx" ON "SubscriptionPlan"("tier");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_isActive_idx" ON "SubscriptionPlan"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_name_businessType_tier_key" ON "SubscriptionPlan"("name", "businessType", "tier");

-- CreateIndex
CREATE INDEX "PaymentMethodDetails_organizationId_idx" ON "PaymentMethodDetails"("organizationId");

-- CreateIndex
CREATE INDEX "PaymentMethodDetails_type_idx" ON "PaymentMethodDetails"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_number_key" ON "Invoice"("number");

-- CreateIndex
CREATE INDEX "Invoice_organizationId_idx" ON "Invoice"("organizationId");

-- CreateIndex
CREATE INDEX "Invoice_subscriptionId_idx" ON "Invoice"("subscriptionId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_dueDate_idx" ON "Invoice"("dueDate");

-- CreateIndex
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_providerPaymentId_idx" ON "Payment"("providerPaymentId");

-- CreateIndex
CREATE INDEX "Payment_provider_status_idx" ON "Payment"("provider", "status");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BillingContact_organizationId_key" ON "BillingContact"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingPreference_organizationId_key" ON "OnboardingPreference"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentIntent_merchantRequestId_key" ON "PaymentIntent"("merchantRequestId");

-- CreateIndex
CREATE INDEX "PaymentIntent_merchantRequestId_idx" ON "PaymentIntent"("merchantRequestId");

-- CreateIndex
CREATE INDEX "PaymentIntent_organizationId_idx" ON "PaymentIntent"("organizationId");

-- CreateIndex
CREATE INDEX "PaymentIntent_status_idx" ON "PaymentIntent"("status");

-- CreateIndex
CREATE INDEX "PaymentIntent_expiresAt_idx" ON "PaymentIntent"("expiresAt");

-- CreateIndex
CREATE INDEX "PaymentIntent_purpose_idx" ON "PaymentIntent"("purpose");

-- CreateIndex
CREATE INDEX "FiscalPeriod_organizationId_idx" ON "FiscalPeriod"("organizationId");

-- CreateIndex
CREATE INDEX "FiscalPeriod_startDate_endDate_idx" ON "FiscalPeriod"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "FiscalPeriod_organizationId_name_key" ON "FiscalPeriod"("organizationId", "name");

-- CreateIndex
CREATE INDEX "FinancialAccount_organizationId_idx" ON "FinancialAccount"("organizationId");

-- CreateIndex
CREATE INDEX "FinancialAccount_accountType_idx" ON "FinancialAccount"("accountType");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialAccount_organizationId_name_key" ON "FinancialAccount"("organizationId", "name");

-- CreateIndex
CREATE INDEX "FinancialEntry_organizationId_idx" ON "FinancialEntry"("organizationId");

-- CreateIndex
CREATE INDEX "FinancialEntry_accountId_idx" ON "FinancialEntry"("accountId");

-- CreateIndex
CREATE INDEX "FinancialEntry_fiscalPeriodId_idx" ON "FinancialEntry"("fiscalPeriodId");

-- CreateIndex
CREATE INDEX "FinancialEntry_transactionDate_idx" ON "FinancialEntry"("transactionDate");

-- CreateIndex
CREATE INDEX "FinancialEntry_entryType_idx" ON "FinancialEntry"("entryType");

-- CreateIndex
CREATE INDEX "Budget_organizationId_idx" ON "Budget"("organizationId");

-- CreateIndex
CREATE INDEX "Budget_startDate_endDate_idx" ON "Budget"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "BudgetAllocation_budgetId_idx" ON "BudgetAllocation"("budgetId");

-- CreateIndex
CREATE INDEX "BudgetAllocation_categoryId_idx" ON "BudgetAllocation"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "UnitEconomics_orderId_key" ON "UnitEconomics"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_key" ON "Customer"("userId");

-- CreateIndex
CREATE INDEX "Customer_organizationId_idx" ON "Customer"("organizationId");

-- CreateIndex
CREATE INDEX "CustomerTierHistory_customerId_idx" ON "CustomerTierHistory"("customerId");

-- CreateIndex
CREATE INDEX "CustomerTierHistory_effectiveDate_idx" ON "CustomerTierHistory"("effectiveDate");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerCredit_customerId_key" ON "CustomerCredit"("customerId");

-- CreateIndex
CREATE INDEX "CustomerCredit_customerId_idx" ON "CustomerCredit"("customerId");

-- CreateIndex
CREATE INDEX "CustomerCredit_riskScore_idx" ON "CustomerCredit"("riskScore");

-- CreateIndex
CREATE INDEX "CustomerCredit_daysPastDue_idx" ON "CustomerCredit"("daysPastDue");

-- CreateIndex
CREATE INDEX "CreditTransaction_customerCreditId_idx" ON "CreditTransaction"("customerCreditId");

-- CreateIndex
CREATE INDEX "CreditTransaction_type_idx" ON "CreditTransaction"("type");

-- CreateIndex
CREATE INDEX "CreditTransaction_status_idx" ON "CreditTransaction"("status");

-- CreateIndex
CREATE INDEX "CreditTransaction_dueDate_idx" ON "CreditTransaction"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyPoints_customerId_key" ON "LoyaltyPoints"("customerId");

-- CreateIndex
CREATE INDEX "LoyaltyPoints_customerId_idx" ON "LoyaltyPoints"("customerId");

-- CreateIndex
CREATE INDEX "PointsTransaction_createdAt_idx" ON "PointsTransaction"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OnAccountBill_saleorOrderId_key" ON "OnAccountBill"("saleorOrderId");

-- CreateIndex
CREATE INDEX "OnAccountBill_organizationId_idx" ON "OnAccountBill"("organizationId");

-- CreateIndex
CREATE INDEX "OnAccountBill_customerId_idx" ON "OnAccountBill"("customerId");

-- CreateIndex
CREATE INDEX "OnAccountBill_status_idx" ON "OnAccountBill"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessProfile_organizationId_key" ON "BusinessProfile"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_userId_key" ON "Driver"("userId");

-- CreateIndex
CREATE INDEX "Driver_organizationId_idx" ON "Driver"("organizationId");

-- CreateIndex
CREATE INDEX "Driver_status_idx" ON "Driver"("status");

-- CreateIndex
CREATE INDEX "Driver_phone_idx" ON "Driver"("phone");

-- CreateIndex
CREATE INDEX "DriverCheckIn_driverId_idx" ON "DriverCheckIn"("driverId");

-- CreateIndex
CREATE INDEX "DriverCheckIn_createdAt_idx" ON "DriverCheckIn"("createdAt");

-- CreateIndex
CREATE INDEX "DeliveryZone_isActive_priority_idx" ON "DeliveryZone"("isActive", "priority");

-- CreateIndex
CREATE INDEX "GeoLocation_geohash_idx" ON "GeoLocation"("geohash");

-- CreateIndex
CREATE INDEX "GeoLocation_latitude_longitude_idx" ON "GeoLocation"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "GeoLocation_city_region_idx" ON "GeoLocation"("city", "region");

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_saleorOrderId_key" ON "Delivery"("saleorOrderId");

-- CreateIndex
CREATE INDEX "Delivery_organizationId_status_idx" ON "Delivery"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Delivery_driverId_idx" ON "Delivery"("driverId");

-- CreateIndex
CREATE INDEX "Delivery_orderId_idx" ON "Delivery"("orderId");

-- CreateIndex
CREATE INDEX "Delivery_status_idx" ON "Delivery"("status");

-- CreateIndex
CREATE INDEX "Delivery_scheduledFor_idx" ON "Delivery"("scheduledFor");

-- CreateIndex
CREATE INDEX "Delivery_pickupLocationId_idx" ON "Delivery"("pickupLocationId");

-- CreateIndex
CREATE INDEX "DeliveryStatusHistory_deliveryId_idx" ON "DeliveryStatusHistory"("deliveryId");

-- CreateIndex
CREATE INDEX "DeliveryStatusHistory_changedAt_idx" ON "DeliveryStatusHistory"("changedAt");

-- CreateIndex
CREATE INDEX "DeliveryChecklistItem_deliveryId_idx" ON "DeliveryChecklistItem"("deliveryId");

-- CreateIndex
CREATE INDEX "DeliveryIssue_deliveryId_idx" ON "DeliveryIssue"("deliveryId");

-- CreateIndex
CREATE INDEX "DeliveryIssue_status_idx" ON "DeliveryIssue"("status");

-- CreateIndex
CREATE INDEX "DeliveryRoute_organizationId_date_idx" ON "DeliveryRoute"("organizationId", "date");

-- CreateIndex
CREATE INDEX "DeliveryRoute_driverId_status_idx" ON "DeliveryRoute"("driverId", "status");

-- CreateIndex
CREATE INDEX "ExpenseCategory_organizationId_idx" ON "ExpenseCategory"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategory_organizationId_name_key" ON "ExpenseCategory"("organizationId", "name");

-- CreateIndex
CREATE INDEX "Vendor_organizationId_idx" ON "Vendor"("organizationId");

-- CreateIndex
CREATE INDEX "Vendor_name_idx" ON "Vendor"("name");

-- CreateIndex
CREATE INDEX "Expense_organizationId_idx" ON "Expense"("organizationId");

-- CreateIndex
CREATE INDEX "Expense_categoryId_idx" ON "Expense"("categoryId");

-- CreateIndex
CREATE INDEX "Expense_vendorId_idx" ON "Expense"("vendorId");

-- CreateIndex
CREATE INDEX "Expense_expenseDate_idx" ON "Expense"("expenseDate");

-- CreateIndex
CREATE INDEX "Expense_approvalStatus_idx" ON "Expense"("approvalStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_purchaseNumber_key" ON "Purchase"("purchaseNumber");

-- CreateIndex
CREATE INDEX "Purchase_organizationId_idx" ON "Purchase"("organizationId");

-- CreateIndex
CREATE INDEX "Purchase_vendorId_idx" ON "Purchase"("vendorId");

-- CreateIndex
CREATE INDEX "Purchase_status_idx" ON "Purchase"("status");

-- CreateIndex
CREATE INDEX "Purchase_orderDate_idx" ON "Purchase"("orderDate");

-- CreateIndex
CREATE INDEX "PurchaseItem_purchaseId_idx" ON "PurchaseItem"("purchaseId");

-- CreateIndex
CREATE INDEX "PurchaseItem_productId_idx" ON "PurchaseItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_saleorWarehouseId_key" ON "Warehouse"("saleorWarehouseId");

-- CreateIndex
CREATE INDEX "Warehouse_organizationId_idx" ON "Warehouse"("organizationId");

-- CreateIndex
CREATE INDEX "Warehouse_saleorWarehouseId_idx" ON "Warehouse"("saleorWarehouseId");

-- CreateIndex
CREATE INDEX "InventoryItem_warehouseId_idx" ON "InventoryItem"("warehouseId");

-- CreateIndex
CREATE INDEX "InventoryItem_productId_idx" ON "InventoryItem"("productId");

-- CreateIndex
CREATE INDEX "InventoryItem_saleorProductId_idx" ON "InventoryItem"("saleorProductId");

-- CreateIndex
CREATE INDEX "InventoryItem_sku_idx" ON "InventoryItem"("sku");

-- CreateIndex
CREATE INDEX "InventoryItem_barcode_idx" ON "InventoryItem"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_warehouseId_productId_key" ON "InventoryItem"("warehouseId", "productId");

-- CreateIndex
CREATE INDEX "StockAuditLog_sku_idx" ON "StockAuditLog"("sku");

-- CreateIndex
CREATE INDEX "StockAuditLog_timestamp_idx" ON "StockAuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "StockAuditLog_source_idx" ON "StockAuditLog"("source");

-- CreateIndex
CREATE INDEX "StockAuditLog_reference_idx" ON "StockAuditLog"("reference");

-- CreateIndex
CREATE INDEX "StockAuditLog_userId_idx" ON "StockAuditLog"("userId");

-- CreateIndex
CREATE INDEX "StockAuditLog_warehouseId_idx" ON "StockAuditLog"("warehouseId");

-- CreateIndex
CREATE INDEX "StockAuditLog_saleorVariantId_idx" ON "StockAuditLog"("saleorVariantId");

-- CreateIndex
CREATE INDEX "StockAuditBatch_timestamp_idx" ON "StockAuditBatch"("timestamp");

-- CreateIndex
CREATE INDEX "StockAuditBatch_source_idx" ON "StockAuditBatch"("source");

-- CreateIndex
CREATE INDEX "StockAuditBatch_reference_idx" ON "StockAuditBatch"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "RedisCacheEntry_sku_key" ON "RedisCacheEntry"("sku");

-- CreateIndex
CREATE INDEX "RedisCacheEntry_sku_idx" ON "RedisCacheEntry"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Location_code_key" ON "Location"("code");

-- CreateIndex
CREATE UNIQUE INDEX "FCMToken_token_key" ON "FCMToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_businessType_salesTier_idx" ON "Organization"("businessType", "salesTier");

-- CreateIndex
CREATE INDEX "Organization_primaryLocationId_idx" ON "Organization"("primaryLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_organizationId_key" ON "Permission"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_userId_organizationId_key" ON "Member"("userId", "organizationId");

-- CreateIndex
CREATE INDEX "PricingRule_organizationId_idx" ON "PricingRule"("organizationId");

-- CreateIndex
CREATE INDEX "PricingRule_productId_idx" ON "PricingRule"("productId");

-- CreateIndex
CREATE INDEX "PricingRule_customerTier_idx" ON "PricingRule"("customerTier");

-- CreateIndex
CREATE INDEX "PricingRule_status_idx" ON "PricingRule"("status");

-- CreateIndex
CREATE INDEX "PricingRule_startDate_endDate_idx" ON "PricingRule"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "PricingTier_pricingRuleId_idx" ON "PricingTier"("pricingRuleId");

-- CreateIndex
CREATE INDEX "PricingTier_minQuantity_idx" ON "PricingTier"("minQuantity");

-- CreateIndex
CREATE INDEX "PricingRuleUsage_pricingRuleId_idx" ON "PricingRuleUsage"("pricingRuleId");

-- CreateIndex
CREATE INDEX "PricingRuleUsage_customerId_idx" ON "PricingRuleUsage"("customerId");

-- CreateIndex
CREATE INDEX "PricingRuleUsage_usedAt_idx" ON "PricingRuleUsage"("usedAt");

-- CreateIndex
CREATE INDEX "Event_organizationId_scheduledFor_idx" ON "Event"("organizationId", "scheduledFor");

-- CreateIndex
CREATE INDEX "Event_type_scheduledFor_idx" ON "Event"("type", "scheduledFor");

-- CreateIndex
CREATE INDEX "Campaign_organizationId_status_idx" ON "Campaign"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Campaign_scheduledFor_idx" ON "Campaign"("scheduledFor");

-- CreateIndex
CREATE INDEX "Campaign_triggerType_idx" ON "Campaign"("triggerType");

-- CreateIndex
CREATE INDEX "Campaign_startDate_endDate_idx" ON "Campaign"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "Campaign_targetZoneId_idx" ON "Campaign"("targetZoneId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignProduct_campaignId_productId_key" ON "CampaignProduct"("campaignId", "productId");

-- CreateIndex
CREATE INDEX "CampaignResponse_campaignId_idx" ON "CampaignResponse"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignResponse_customerId_idx" ON "CampaignResponse"("customerId");

-- CreateIndex
CREATE INDEX "CampaignResponse_isConverted_idx" ON "CampaignResponse"("isConverted");

-- CreateIndex
CREATE INDEX "VoucherRedemption_voucherId_idx" ON "VoucherRedemption"("voucherId");

-- CreateIndex
CREATE INDEX "VoucherRedemption_customerId_idx" ON "VoucherRedemption"("customerId");

-- CreateIndex
CREATE INDEX "VoucherRedemption_orderId_idx" ON "VoucherRedemption"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_code_key" ON "Voucher"("code");

-- CreateIndex
CREATE INDEX "Voucher_organizationId_idx" ON "Voucher"("organizationId");

-- CreateIndex
CREATE INDEX "Voucher_code_idx" ON "Voucher"("code");

-- CreateIndex
CREATE INDEX "Voucher_startDate_endDate_idx" ON "Voucher"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "BusinessRelationship_requesterId_idx" ON "BusinessRelationship"("requesterId");

-- CreateIndex
CREATE INDEX "BusinessRelationship_targetId_idx" ON "BusinessRelationship"("targetId");

-- CreateIndex
CREATE INDEX "BusinessRelationship_status_idx" ON "BusinessRelationship"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessRelationship_requesterId_targetId_key" ON "BusinessRelationship"("requesterId", "targetId");

-- CreateIndex
CREATE INDEX "RelationshipPermission_relationshipId_idx" ON "RelationshipPermission"("relationshipId");

-- CreateIndex
CREATE UNIQUE INDEX "RelationshipPermission_relationshipId_permissionType_key" ON "RelationshipPermission"("relationshipId", "permissionType");

-- CreateIndex
CREATE INDEX "RelationshipInteraction_relationshipId_idx" ON "RelationshipInteraction"("relationshipId");

-- CreateIndex
CREATE INDEX "RelationshipInteraction_createdAt_idx" ON "RelationshipInteraction"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectionRequest_token_key" ON "ConnectionRequest"("token");

-- CreateIndex
CREATE INDEX "ConnectionRequest_senderId_idx" ON "ConnectionRequest"("senderId");

-- CreateIndex
CREATE INDEX "ConnectionRequest_recipientEmail_idx" ON "ConnectionRequest"("recipientEmail");

-- CreateIndex
CREATE INDEX "ConnectionRequest_status_idx" ON "ConnectionRequest"("status");

-- CreateIndex
CREATE INDEX "ConnectionRequest_token_idx" ON "ConnectionRequest"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VisibilitySettings_organizationId_key" ON "VisibilitySettings"("organizationId");

-- CreateIndex
CREATE INDEX "ProductVisibility_organizationId_idx" ON "ProductVisibility"("organizationId");

-- CreateIndex
CREATE INDEX "ProductVisibility_productId_idx" ON "ProductVisibility"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVisibility_organizationId_productId_key" ON "ProductVisibility"("organizationId", "productId");

-- CreateIndex
CREATE INDEX "PriceVisibility_organizationId_idx" ON "PriceVisibility"("organizationId");

-- CreateIndex
CREATE INDEX "PriceVisibility_productId_idx" ON "PriceVisibility"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "PriceVisibility_organizationId_productId_key" ON "PriceVisibility"("organizationId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "SaleorChannel_saleorChannelId_key" ON "SaleorChannel"("saleorChannelId");

-- CreateIndex
CREATE INDEX "SaleorChannel_organizationId_idx" ON "SaleorChannel"("organizationId");

-- CreateIndex
CREATE INDEX "SaleorChannel_saleorChannelId_idx" ON "SaleorChannel"("saleorChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "QuickBooksIntegration_organizationId_key" ON "QuickBooksIntegration"("organizationId");

-- CreateIndex
CREATE INDEX "SaleorSync_entityType_syncStatus_idx" ON "SaleorSync"("entityType", "syncStatus");

-- CreateIndex
CREATE UNIQUE INDEX "SaleorSync_entityType_saleorId_key" ON "SaleorSync"("entityType", "saleorId");

-- CreateIndex
CREATE UNIQUE INDEX "SaleorOrder_saleorOrderId_key" ON "SaleorOrder"("saleorOrderId");

-- CreateIndex
CREATE INDEX "SaleorOrder_saleorOrderId_idx" ON "SaleorOrder"("saleorOrderId");

-- CreateIndex
CREATE INDEX "SaleorOrder_organizationId_idx" ON "SaleorOrder"("organizationId");

-- CreateIndex
CREATE INDEX "SaleorOrder_saleorStatus_idx" ON "SaleorOrder"("saleorStatus");

-- CreateIndex
CREATE INDEX "SaleorOrder_buyerOrgId_sellerOrgId_idx" ON "SaleorOrder"("buyerOrgId", "sellerOrgId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthApplication_clientId_key" ON "OAuthApplication"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthAccessToken_accessToken_key" ON "OAuthAccessToken"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthAccessToken_refreshToken_key" ON "OAuthAccessToken"("refreshToken");

-- CreateIndex
CREATE INDEX "ActivityLog_organizationId_action_idx" ON "ActivityLog"("organizationId", "action");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_action_idx" ON "ActivityLog"("userId", "action");

-- CreateIndex
CREATE INDEX "BartenderShift_organizationId_status_idx" ON "BartenderShift"("organizationId", "status");

-- CreateIndex
CREATE INDEX "BartenderShift_bartenderId_startTime_idx" ON "BartenderShift"("bartenderId", "startTime");

-- CreateIndex
CREATE INDEX "BartenderShift_status_startTime_idx" ON "BartenderShift"("status", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "BartenderShift_organizationId_shiftNumber_key" ON "BartenderShift"("organizationId", "shiftNumber");

-- CreateIndex
CREATE INDEX "ShiftTransaction_shiftId_timestamp_idx" ON "ShiftTransaction"("shiftId", "timestamp");

-- CreateIndex
CREATE INDEX "ShiftTransaction_paymentMethod_idx" ON "ShiftTransaction"("paymentMethod");

-- CreateIndex
CREATE INDEX "ShiftTransaction_transactionRef_idx" ON "ShiftTransaction"("transactionRef");

-- CreateIndex
CREATE INDEX "ShiftExpense_shiftId_idx" ON "ShiftExpense"("shiftId");

-- CreateIndex
CREATE INDEX "ShiftExpense_categoryId_idx" ON "ShiftExpense"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ShiftSummary_shiftId_key" ON "ShiftSummary"("shiftId");

-- CreateIndex
CREATE INDEX "ShiftSummary_organizationId_createdAt_idx" ON "ShiftSummary"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "Outlet_organizationId_idx" ON "Outlet"("organizationId");

-- CreateIndex
CREATE INDEX "Outlet_locationId_idx" ON "Outlet"("locationId");

-- CreateIndex
CREATE INDEX "Product_sku_idx" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_organizationId_idx" ON "Order"("organizationId");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE INDEX "Order_orderDate_idx" ON "Order"("orderDate");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_paymentStatus_idx" ON "Order"("paymentStatus");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "POSProduct_organizationId_idx" ON "POSProduct"("organizationId");

-- CreateIndex
CREATE INDEX "POSProduct_saleorProductId_idx" ON "POSProduct"("saleorProductId");

-- CreateIndex
CREATE INDEX "POSProduct_barcode_idx" ON "POSProduct"("barcode");

-- CreateIndex
CREATE INDEX "POSTill_organizationId_isOpen_idx" ON "POSTill"("organizationId", "isOpen");

-- CreateIndex
CREATE UNIQUE INDEX "POSTill_organizationId_tillNumber_key" ON "POSTill"("organizationId", "tillNumber");

-- CreateIndex
CREATE UNIQUE INDEX "POSTransaction_receiptNumber_key" ON "POSTransaction"("receiptNumber");

-- CreateIndex
CREATE INDEX "POSTransaction_organizationId_idx" ON "POSTransaction"("organizationId");

-- CreateIndex
CREATE INDEX "POSTransaction_tillId_idx" ON "POSTransaction"("tillId");

-- CreateIndex
CREATE INDEX "POSTransaction_customerId_idx" ON "POSTransaction"("customerId");

-- CreateIndex
CREATE INDEX "POSTransaction_createdAt_idx" ON "POSTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "POSDailyReport_organizationId_date_idx" ON "POSDailyReport"("organizationId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "POSDailyReport_organizationId_date_tillId_key" ON "POSDailyReport"("organizationId", "date", "tillId");

-- CreateIndex
CREATE INDEX "SalesTerritory_organizationId_idx" ON "SalesTerritory"("organizationId");

-- CreateIndex
CREATE INDEX "SalesTerritory_salesRepId_idx" ON "SalesTerritory"("salesRepId");

-- CreateIndex
CREATE INDEX "SalesTerritory_performanceScore_idx" ON "SalesTerritory"("performanceScore");

-- CreateIndex
CREATE UNIQUE INDEX "SalesTerritory_organizationId_code_key" ON "SalesTerritory"("organizationId", "code");

-- CreateIndex
CREATE INDEX "TerritoryCustomer_territoryId_idx" ON "TerritoryCustomer"("territoryId");

-- CreateIndex
CREATE INDEX "TerritoryCustomer_customerId_idx" ON "TerritoryCustomer"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "TerritoryCustomer_territoryId_customerId_key" ON "TerritoryCustomer"("territoryId", "customerId");

-- CreateIndex
CREATE INDEX "TerritoryAnalytics_territoryId_idx" ON "TerritoryAnalytics"("territoryId");

-- CreateIndex
CREATE INDEX "TerritoryAnalytics_date_idx" ON "TerritoryAnalytics"("date");

-- CreateIndex
CREATE INDEX "TerritoryAnalytics_revenue_idx" ON "TerritoryAnalytics"("revenue");

-- CreateIndex
CREATE UNIQUE INDEX "TerritoryAnalytics_territoryId_date_key" ON "TerritoryAnalytics"("territoryId", "date");

-- CreateIndex
CREATE INDEX "TerritoryOpportunity_territoryId_idx" ON "TerritoryOpportunity"("territoryId");

-- CreateIndex
CREATE INDEX "TerritoryOpportunity_type_idx" ON "TerritoryOpportunity"("type");

-- CreateIndex
CREATE INDEX "TerritoryOpportunity_status_idx" ON "TerritoryOpportunity"("status");

-- CreateIndex
CREATE INDEX "TerritoryOpportunity_confidence_idx" ON "TerritoryOpportunity"("confidence");

-- CreateIndex
CREATE INDEX "TerritoryHeatmap_territoryId_idx" ON "TerritoryHeatmap"("territoryId");

-- CreateIndex
CREATE INDEX "TerritoryHeatmap_metricType_idx" ON "TerritoryHeatmap"("metricType");

-- CreateIndex
CREATE UNIQUE INDEX "TerritoryHeatmap_territoryId_gridX_gridY_metricType_key" ON "TerritoryHeatmap"("territoryId", "gridX", "gridY", "metricType");

-- CreateIndex
CREATE INDEX "SalesRepPerformance_organizationId_idx" ON "SalesRepPerformance"("organizationId");

-- CreateIndex
CREATE INDEX "SalesRepPerformance_userId_idx" ON "SalesRepPerformance"("userId");

-- CreateIndex
CREATE INDEX "SalesRepPerformance_date_idx" ON "SalesRepPerformance"("date");

-- CreateIndex
CREATE INDEX "SalesRepPerformance_performanceScore_idx" ON "SalesRepPerformance"("performanceScore");

-- CreateIndex
CREATE UNIQUE INDEX "SalesRepPerformance_organizationId_userId_date_key" ON "SalesRepPerformance"("organizationId", "userId", "date");

-- CreateIndex
CREATE INDEX "SalesVisit_outletId_visitDate_idx" ON "SalesVisit"("outletId", "visitDate");

-- CreateIndex
CREATE INDEX "SalesVisit_salesPersonId_visitDate_idx" ON "SalesVisit"("salesPersonId", "visitDate");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_customerId_key" ON "Wallet"("customerId");

-- CreateIndex
CREATE INDEX "Wallet_customerId_idx" ON "Wallet"("customerId");

-- CreateIndex
CREATE INDEX "Wallet_isActive_isBlocked_idx" ON "Wallet"("isActive", "isBlocked");

-- CreateIndex
CREATE INDEX "WalletTransaction_walletId_idx" ON "WalletTransaction"("walletId");

-- CreateIndex
CREATE INDEX "WalletTransaction_type_idx" ON "WalletTransaction"("type");

-- CreateIndex
CREATE INDEX "WalletTransaction_status_idx" ON "WalletTransaction"("status");

-- CreateIndex
CREATE INDEX "WalletTransaction_createdAt_idx" ON "WalletTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "WalletTransaction_orderId_idx" ON "WalletTransaction"("orderId");

-- CreateIndex
CREATE INDEX "WalletTopUp_walletId_idx" ON "WalletTopUp"("walletId");

-- CreateIndex
CREATE INDEX "WalletTopUp_status_idx" ON "WalletTopUp"("status");

-- CreateIndex
CREATE INDEX "WalletTopUp_paymentMethod_idx" ON "WalletTopUp"("paymentMethod");

-- CreateIndex
CREATE INDEX "WalletTopUp_createdAt_idx" ON "WalletTopUp"("createdAt");

-- CreateIndex
CREATE INDEX "WalletPromotion_organizationId_idx" ON "WalletPromotion"("organizationId");

-- CreateIndex
CREATE INDEX "WalletPromotion_isActive_idx" ON "WalletPromotion"("isActive");

-- CreateIndex
CREATE INDEX "WalletPromotion_startDate_endDate_idx" ON "WalletPromotion"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppIntegration_organizationId_key" ON "WhatsAppIntegration"("organizationId");

-- CreateIndex
CREATE INDEX "WhatsAppIntegration_organizationId_idx" ON "WhatsAppIntegration"("organizationId");

-- CreateIndex
CREATE INDEX "WhatsAppIntegration_phoneNumberId_idx" ON "WhatsAppIntegration"("phoneNumberId");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppMessage_whatsappMessageId_key" ON "WhatsAppMessage"("whatsappMessageId");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_organizationId_idx" ON "WhatsAppMessage"("organizationId");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_integrationId_idx" ON "WhatsAppMessage"("integrationId");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_from_idx" ON "WhatsAppMessage"("from");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_to_idx" ON "WhatsAppMessage"("to");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_conversationId_idx" ON "WhatsAppMessage"("conversationId");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_timestamp_idx" ON "WhatsAppMessage"("timestamp");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_aiProcessed_idx" ON "WhatsAppMessage"("aiProcessed");

-- CreateIndex
CREATE INDEX "WhatsAppContact_organizationId_idx" ON "WhatsAppContact"("organizationId");

-- CreateIndex
CREATE INDEX "WhatsAppContact_phoneNumber_idx" ON "WhatsAppContact"("phoneNumber");

-- CreateIndex
CREATE INDEX "WhatsAppContact_salesRepId_idx" ON "WhatsAppContact"("salesRepId");

-- CreateIndex
CREATE INDEX "WhatsAppContact_territory_idx" ON "WhatsAppContact"("territory");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppContact_organizationId_phoneNumber_key" ON "WhatsAppContact"("organizationId", "phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationalOrder_orderNumber_key" ON "ConversationalOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "ConversationalOrder_organizationId_idx" ON "ConversationalOrder"("organizationId");

-- CreateIndex
CREATE INDEX "ConversationalOrder_contactId_idx" ON "ConversationalOrder"("contactId");

-- CreateIndex
CREATE INDEX "ConversationalOrder_status_idx" ON "ConversationalOrder"("status");

-- CreateIndex
CREATE INDEX "ConversationalOrder_createdAt_idx" ON "ConversationalOrder"("createdAt");

-- CreateIndex
CREATE INDEX "ConversationalOrderItem_conversationalOrderId_idx" ON "ConversationalOrderItem"("conversationalOrderId");

-- CreateIndex
CREATE INDEX "ConversationalOrderItem_productId_idx" ON "ConversationalOrderItem"("productId");

-- CreateIndex
CREATE INDEX "_MemberToPermission_B_index" ON "_MemberToPermission"("B");

-- CreateIndex
CREATE INDEX "_CampaignToOutlet_B_index" ON "_CampaignToOutlet"("B");

-- CreateIndex
CREATE INDEX "_ProductTransactions_B_index" ON "_ProductTransactions"("B");

-- AddForeignKey
ALTER TABLE "AIInsight" ADD CONSTRAINT "AIInsight_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInsight" ADD CONSTRAINT "AIInsight_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInsight" ADD CONSTRAINT "AIInsight_sourceMessageId_fkey" FOREIGN KEY ("sourceMessageId") REFERENCES "WhatsAppMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIModelMetrics" ADD CONSTRAINT "AIModelMetrics_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIConfiguration" ADD CONSTRAINT "AIConfiguration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealTimeMetrics" ADD CONSTRAINT "RealTimeMetrics_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventStream" ADD CONSTRAINT "EventStream_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsSnapshot" ADD CONSTRAINT "AnalyticsSnapshot_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookConfiguration" ADD CONSTRAINT "WebhookConfiguration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessDocument" ADD CONSTRAINT "BusinessDocument_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethodDetails"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethodDetails" ADD CONSTRAINT "PaymentMethodDetails_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingContact" ADD CONSTRAINT "BillingContact_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingPreference" ADD CONSTRAINT "OnboardingPreference_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalPeriod" ADD CONSTRAINT "FiscalPeriod_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialAccount" ADD CONSTRAINT "FinancialAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialEntry" ADD CONSTRAINT "FinancialEntry_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialEntry" ADD CONSTRAINT "FinancialEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "FinancialAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialEntry" ADD CONSTRAINT "FinancialEntry_fiscalPeriodId_fkey" FOREIGN KEY ("fiscalPeriodId") REFERENCES "FiscalPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetAllocation" ADD CONSTRAINT "BudgetAllocation_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetAllocation" ADD CONSTRAINT "BudgetAllocation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetForecast" ADD CONSTRAINT "BudgetForecast_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForecastCategory" ADD CONSTRAINT "ForecastCategory_forecastId_fkey" FOREIGN KEY ("forecastId") REFERENCES "BudgetForecast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForecastCategory" ADD CONSTRAINT "ForecastCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForecastInsight" ADD CONSTRAINT "ForecastInsight_forecastId_fkey" FOREIGN KEY ("forecastId") REFERENCES "BudgetForecast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetScenario" ADD CONSTRAINT "BudgetScenario_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetScenario" ADD CONSTRAINT "BudgetScenario_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioAllocation" ADD CONSTRAINT "ScenarioAllocation_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "BudgetScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioAllocation" ADD CONSTRAINT "ScenarioAllocation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioAssumption" ADD CONSTRAINT "ScenarioAssumption_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "BudgetScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioImpact" ADD CONSTRAINT "ScenarioImpact_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "BudgetScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostCenter" ADD CONSTRAINT "CostCenter_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CostCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedCost" ADD CONSTRAINT "FixedCost_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "CostCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariableCost" ADD CONSTRAINT "VariableCost_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "CostCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleorOrderLine" ADD CONSTRAINT "SaleorOrderLine_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SaleorOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostAllocation" ADD CONSTRAINT "CostAllocation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SaleorOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostAllocation" ADD CONSTRAINT "CostAllocation_orderLineId_fkey" FOREIGN KEY ("orderLineId") REFERENCES "SaleorOrderLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostAllocation" ADD CONSTRAINT "CostAllocation_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "CostCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitEconomics" ADD CONSTRAINT "UnitEconomics_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SaleorOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarginAlert" ADD CONSTRAINT "MarginAlert_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SaleorOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarginAlert" ADD CONSTRAINT "MarginAlert_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "CostCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerTierHistory" ADD CONSTRAINT "CustomerTierHistory_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCredit" ADD CONSTRAINT "CustomerCredit_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_customerCreditId_fkey" FOREIGN KEY ("customerCreditId") REFERENCES "CustomerCredit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyPoints" ADD CONSTRAINT "LoyaltyPoints_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointsTransaction" ADD CONSTRAINT "PointsTransaction_loyaltyPointsId_fkey" FOREIGN KEY ("loyaltyPointsId") REFERENCES "LoyaltyPoints"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnAccountBill" ADD CONSTRAINT "OnAccountBill_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfile" ADD CONSTRAINT "BusinessProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreReview" ADD CONSTRAINT "StoreReview_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "BusinessProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverCheckIn" ADD CONSTRAINT "DriverCheckIn_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_pickupLocationId_fkey" FOREIGN KEY ("pickupLocationId") REFERENCES "GeoLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_saleorOrderId_fkey" FOREIGN KEY ("saleorOrderId") REFERENCES "SaleorOrder"("saleorOrderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "DeliveryRoute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryStatusHistory" ADD CONSTRAINT "DeliveryStatusHistory_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChecklistItem" ADD CONSTRAINT "DeliveryChecklistItem_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryIssue" ADD CONSTRAINT "DeliveryIssue_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryRoute" ADD CONSTRAINT "DeliveryRoute_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryRoute" ADD CONSTRAINT "DeliveryRoute_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryRoute" ADD CONSTRAINT "DeliveryRoute_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "DeliveryZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseCategory" ADD CONSTRAINT "ExpenseCategory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAuditLog" ADD CONSTRAINT "StockAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAuditLog" ADD CONSTRAINT "StockAuditLog_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAuditLog" ADD CONSTRAINT "StockAuditLog_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAuditLog" ADD CONSTRAINT "StockAuditLog_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAuditLog" ADD CONSTRAINT "StockAuditLog_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "StockAuditBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAuditBatch" ADD CONSTRAINT "StockAuditBatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAuditBatch" ADD CONSTRAINT "StockAuditBatch_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAuditBatch" ADD CONSTRAINT "StockAuditBatch_sourceLocationId_fkey" FOREIGN KEY ("sourceLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAuditBatch" ADD CONSTRAINT "StockAuditBatch_targetLocationId_fkey" FOREIGN KEY ("targetLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FCMToken" ADD CONSTRAINT "FCMToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_primaryLocationId_fkey" FOREIGN KEY ("primaryLocationId") REFERENCES "GeoLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_deliveryZoneId_fkey" FOREIGN KEY ("deliveryZoneId") REFERENCES "DeliveryZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingRule" ADD CONSTRAINT "PricingRule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingTier" ADD CONSTRAINT "PricingTier_pricingRuleId_fkey" FOREIGN KEY ("pricingRuleId") REFERENCES "PricingRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingRuleUsage" ADD CONSTRAINT "PricingRuleUsage_pricingRuleId_fkey" FOREIGN KEY ("pricingRuleId") REFERENCES "PricingRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingRuleUsage" ADD CONSTRAINT "PricingRuleUsage_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "GeoLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "GeoLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_targetZoneId_fkey" FOREIGN KEY ("targetZoneId") REFERENCES "DeliveryZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignProduct" ADD CONSTRAINT "CampaignProduct_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignProduct" ADD CONSTRAINT "CampaignProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignResponse" ADD CONSTRAINT "CampaignResponse_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherRedemption" ADD CONSTRAINT "VoucherRedemption_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherRedemption" ADD CONSTRAINT "VoucherRedemption_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessRelationship" ADD CONSTRAINT "BusinessRelationship_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessRelationship" ADD CONSTRAINT "BusinessRelationship_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelationshipPermission" ADD CONSTRAINT "RelationshipPermission_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "BusinessRelationship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelationshipInteraction" ADD CONSTRAINT "RelationshipInteraction_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "BusinessRelationship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectionRequest" ADD CONSTRAINT "ConnectionRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisibilitySettings" ADD CONSTRAINT "VisibilitySettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVisibility" ADD CONSTRAINT "ProductVisibility_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceVisibility" ADD CONSTRAINT "PriceVisibility_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleorChannel" ADD CONSTRAINT "SaleorChannel_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuickBooksIntegration" ADD CONSTRAINT "QuickBooksIntegration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleorOrder" ADD CONSTRAINT "SaleorOrder_saleorChannelId_fkey" FOREIGN KEY ("saleorChannelId") REFERENCES "SaleorChannel"("saleorChannelId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuthApplication" ADD CONSTRAINT "OAuthApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuthAccessToken" ADD CONSTRAINT "OAuthAccessToken_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "OAuthApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuthAccessToken" ADD CONSTRAINT "OAuthAccessToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuthConsent" ADD CONSTRAINT "OAuthConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuthConsent" ADD CONSTRAINT "OAuthConsent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "OAuthApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BartenderShift" ADD CONSTRAINT "BartenderShift_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BartenderShift" ADD CONSTRAINT "BartenderShift_bartenderId_fkey" FOREIGN KEY ("bartenderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BartenderShift" ADD CONSTRAINT "BartenderShift_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BartenderShift" ADD CONSTRAINT "BartenderShift_tillId_fkey" FOREIGN KEY ("tillId") REFERENCES "POSTill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftTransaction" ADD CONSTRAINT "ShiftTransaction_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "BartenderShift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftExpense" ADD CONSTRAINT "ShiftExpense_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "BartenderShift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftExpense" ADD CONSTRAINT "ShiftExpense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftSummary" ADD CONSTRAINT "ShiftSummary_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "BartenderShift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftSummary" ADD CONSTRAINT "ShiftSummary_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outlet" ADD CONSTRAINT "Outlet_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "GeoLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outlet" ADD CONSTRAINT "Outlet_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "POSProduct" ADD CONSTRAINT "POSProduct_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "POSTill" ADD CONSTRAINT "POSTill_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "POSTransaction" ADD CONSTRAINT "POSTransaction_tillId_fkey" FOREIGN KEY ("tillId") REFERENCES "POSTill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "POSTransaction" ADD CONSTRAINT "POSTransaction_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "POSTransaction" ADD CONSTRAINT "POSTransaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "POSDailyReport" ADD CONSTRAINT "POSDailyReport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesTerritory" ADD CONSTRAINT "SalesTerritory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerritoryCustomer" ADD CONSTRAINT "TerritoryCustomer_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "SalesTerritory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerritoryCustomer" ADD CONSTRAINT "TerritoryCustomer_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerritoryAnalytics" ADD CONSTRAINT "TerritoryAnalytics_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "SalesTerritory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerritoryOpportunity" ADD CONSTRAINT "TerritoryOpportunity_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "SalesTerritory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerritoryHeatmap" ADD CONSTRAINT "TerritoryHeatmap_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "SalesTerritory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesRepPerformance" ADD CONSTRAINT "SalesRepPerformance_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesVisit" ADD CONSTRAINT "SalesVisit_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesVisit" ADD CONSTRAINT "SalesVisit_salesPersonId_fkey" FOREIGN KEY ("salesPersonId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTopUp" ADD CONSTRAINT "WalletTopUp_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletPromotion" ADD CONSTRAINT "WalletPromotion_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppIntegration" ADD CONSTRAINT "WhatsAppIntegration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppMessage" ADD CONSTRAINT "WhatsAppMessage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppMessage" ADD CONSTRAINT "WhatsAppMessage_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "WhatsAppIntegration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppMessage" ADD CONSTRAINT "WhatsAppMessage_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "WhatsAppContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppContact" ADD CONSTRAINT "WhatsAppContact_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "WhatsAppIntegration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppContact" ADD CONSTRAINT "WhatsAppContact_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppContact" ADD CONSTRAINT "WhatsAppContact_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationalOrder" ADD CONSTRAINT "ConversationalOrder_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationalOrder" ADD CONSTRAINT "ConversationalOrder_whatsappMessageId_fkey" FOREIGN KEY ("whatsappMessageId") REFERENCES "WhatsAppMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationalOrder" ADD CONSTRAINT "ConversationalOrder_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "WhatsAppContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationalOrder" ADD CONSTRAINT "ConversationalOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationalOrderItem" ADD CONSTRAINT "ConversationalOrderItem_conversationalOrderId_fkey" FOREIGN KEY ("conversationalOrderId") REFERENCES "ConversationalOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MemberToPermission" ADD CONSTRAINT "_MemberToPermission_A_fkey" FOREIGN KEY ("A") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MemberToPermission" ADD CONSTRAINT "_MemberToPermission_B_fkey" FOREIGN KEY ("B") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampaignToOutlet" ADD CONSTRAINT "_CampaignToOutlet_A_fkey" FOREIGN KEY ("A") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampaignToOutlet" ADD CONSTRAINT "_CampaignToOutlet_B_fkey" FOREIGN KEY ("B") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductTransactions" ADD CONSTRAINT "_ProductTransactions_A_fkey" FOREIGN KEY ("A") REFERENCES "POSProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductTransactions" ADD CONSTRAINT "_ProductTransactions_B_fkey" FOREIGN KEY ("B") REFERENCES "POSTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
