export interface Customer {
  id: string
  organizationId: string
  name: string
  phone: string
  email?: string
  address?: string
  city?: string
  customerType: "RETAILER" | "WHOLESALER" | "DISTRIBUTOR" | "INDIVIDUAL"
  creditLimit?: number
  creditUsed: number
  outstandingBalance: number
  paymentTerms: "CASH_ONLY" | "NET_7" | "NET_14" | "NET_30" | "NET_60" | "CUSTOM"
  customPaymentTerms?: string
  isActive: boolean
  lastOrderDate?: string
  totalSpent: number
  visits: number
  favoriteProducts: string[]
  notes?: string
  tags?: string[]
  createdAt: string
  updatedAt: string

  // Loyalty integration
  loyaltyPoints?: LoyaltyPoints

  // Credit status computed fields
  creditStatus: "GOOD" | "WARNING" | "CRITICAL" | "BLOCKED"
  creditUtilization: number // percentage
}

export interface LoyaltyPoints {
  id: string
  customerId: string
  pointsEarned: number
  pointsRedeemed: number
  currentBalance: number
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
  createdAt: string
  updatedAt: string
}

export interface CustomerOrder {
  id: string
  customerId: string
  orderNumber: string
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED" | "REFUNDED"
  totalAmount: number
  discountAmount: number
  taxAmount: number
  finalAmount: number
  paymentMethod: "CASH" | "CREDIT" | "MPESA" | "BANK" | "CARD"
  paymentStatus: "PENDING" | "PAID" | "PARTIALLY_PAID" | "OVERDUE" | "FAILED"
  orderDate: string
  dueDate?: string
  paidDate?: string
  notes?: string
  items: CustomerOrderItem[]
  customer: Customer
}

export interface CustomerOrderItem {
  id: string
  orderId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  discount: number
  notes?: string
}

export interface CustomerStatement {
  customerId: string
  customer: Customer
  periodStart: string
  periodEnd: string
  openingBalance: number
  closingBalance: number
  totalSales: number
  totalPayments: number
  totalCredits: number
  totalDebits: number
  transactions: CustomerTransaction[]
}

export interface CustomerTransaction {
  id: string
  customerId: string
  type: "SALE" | "PAYMENT" | "CREDIT" | "DEBIT" | "ADJUSTMENT"
  amount: number
  description: string
  reference?: string
  orderId?: string
  paymentMethod?: string
  transactionDate: string
  runningBalance: number
}

export interface CustomerPayment {
  id: string
  customerId: string
  amount: number
  paymentMethod: "CASH" | "MPESA" | "BANK" | "CARD" | "OTHER"
  paymentDate: string
  reference?: string
  notes?: string
  allocatedOrders: PaymentAllocation[]
  customer: Customer
}

export interface PaymentAllocation {
  orderId: string
  orderNumber: string
  allocatedAmount: number
  remainingBalance: number
}

export interface CreateCustomerData {
  organizationId: string
  name: string
  phone: string
  email?: string
  address?: string
  city?: string
  customerType: "RETAILER" | "WHOLESALER" | "DISTRIBUTOR" | "INDIVIDUAL"
  creditLimit?: number
  paymentTerms: "CASH_ONLY" | "NET_7" | "NET_14" | "NET_30" | "NET_60" | "CUSTOM"
  customPaymentTerms?: string
  notes?: string
  tags?: string[]
}

export interface CreateCustomerOrderData {
  organizationId: string
  customerId: string
  paymentMethod: "CASH" | "CREDIT" | "MPESA" | "BANK" | "CARD"
  notes?: string
  items: Array<{
    productName: string
    quantity: number
    unitPrice: number
    discount?: number
    notes?: string
  }>
}

export interface CreateCustomerPaymentData {
  organizationId: string
  customerId: string
  amount: number
  paymentMethod: "CASH" | "MPESA" | "BANK" | "CARD" | "OTHER"
  paymentDate: string
  reference?: string
  notes?: string
  allocateToOrders?: Array<{
    orderId: string
    amount: number
  }>
}

export interface CustomerCreditAdjustment {
  customerId: string
  newCreditLimit: number
  reason: string
  notes?: string
}

