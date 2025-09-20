import { useCurrency } from "@/hooks/useCurrency";
import prisma from "@/lib/prisma";
import { coopBankService } from "./coop-bank-service";

/**
 * Service for managing payment methods and processing payments
 */
export const paymentService = {
  /**
   * Add a card payment method
   */
  async addCardPaymentMethod(
    organizationId: string,
    provider: string,
    isDefault = false,
    details: any
  ) {
    const { cardNumber, expiryMonth, expiryYear, cardholderName, cvv } =
      details;

    // Validate card details
    if (!cardNumber || !expiryMonth || !expiryYear) {
      throw new Error("Invalid card details");
    }

    // Mask card number for storage
    const lastFour = cardNumber.slice(-4);
    const maskedCardNumber = `**** **** **** ${lastFour}`;

    // If setting as default, unset other default payment methods
    if (isDefault) {
      await prisma.paymentMethodDetails.updateMany({
        where: {
          organizationId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Create payment method in database
    const paymentMethod = await prisma.paymentMethodDetails.create({
      data: {
        organizationId,
        type: "CARD",
        provider: provider as any,
        isDefault,
        lastFour,
        expiryMonth: Number.parseInt(expiryMonth),
        expiryYear: Number.parseInt(expiryYear),
        cardBrand: this.detectCardBrand(cardNumber),
        metadata: {
          cardholderName,
        },
      },
    });

    // If using Co-op Bank, register card with their API
    if (provider === "COOP_BANK") {
      try {
        // This would be an actual API call to Co-op Bank in production
        const tokenizedCard = await coopBankService.tokenizeCard({
          cardNumber,
          expiryMonth,
          expiryYear,
          cvv,
          cardholderName,
        });

        // Store token in metadata
        await prisma.paymentMethodDetails.update({
          where: { id: paymentMethod.id },
          data: {
            metadata: {
              ...(paymentMethod.metadata as any),
              coopBankToken: tokenizedCard.token,
            },
          },
        });
      } catch (error) {
        // If tokenization fails, delete the payment method
        await prisma.paymentMethodDetails.delete({
          where: { id: paymentMethod.id },
        });
        throw new Error(
          `Failed to register card with payment provider: ${error.message}`
        );
      }
    }

    return paymentMethod;
  },

  /**
   * Add a bank account payment method
   */
  async addBankAccountPaymentMethod(
    organizationId: string,
    provider: string,
    isDefault = false,
    details: any
  ) {
    const { accountName, accountNumber, bankCode, branchCode } = details;

    // Validate bank account details
    if (!accountName || !accountNumber || !bankCode) {
      throw new Error("Invalid bank account details");
    }

    // Mask account number for storage
    const lastFour = accountNumber.slice(-4);
    const maskedAccountNumber = `****${lastFour}`;

    // If setting as default, unset other default payment methods
    if (isDefault) {
      await prisma.paymentMethodDetails.updateMany({
        where: {
          organizationId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Create payment method in database
    const paymentMethod = await prisma.paymentMethodDetails.create({
      data: {
        organizationId,
        type: "BANK_ACCOUNT",
        provider: provider as any,
        isDefault,
        accountName,
        accountNumber: maskedAccountNumber,
        bankCode,
        metadata: {
          branchCode,
        },
      },
    });

    // If using Co-op Bank, register bank account with their API
    if (provider === "COOP_BANK") {
      try {
        // This would be an actual API call to Co-op Bank in production
        const tokenizedAccount = await coopBankService.tokenizeBankAccount({
          accountName,
          accountNumber,
          bankCode,
          branchCode,
        });

        // Store token in metadata
        await prisma.paymentMethodDetails.update({
          where: { id: paymentMethod.id },
          data: {
            metadata: {
              ...(paymentMethod.metadata as any),
              coopBankToken: tokenizedAccount.token,
            },
          },
        });
      } catch (error) {
        // If tokenization fails, delete the payment method
        await prisma.paymentMethodDetails.delete({
          where: { id: paymentMethod.id },
        });
        throw new Error(
          `Failed to register bank account with payment provider: ${error.message}`
        );
      }
    }

    return paymentMethod;
  },

  /**
   * Add an M-Pesa payment method
   */
  async addMpesaPaymentMethod(
    organizationId: string,
    isDefault = false,
    details: any
  ) {
    const { phoneNumber, name } = details;

    // Validate phone number
    if (!phoneNumber) {
      throw new Error("Phone number is required");
    }

    // Format phone number (ensure it starts with 254)
    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    // If setting as default, unset other default payment methods
    if (isDefault) {
      await prisma.paymentMethodDetails.updateMany({
        where: {
          organizationId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Create payment method in database
    const paymentMethod = await prisma.paymentMethodDetails.create({
      data: {
        organizationId,
        type: "MPESA",
        provider: "MPESA",
        isDefault,
        phoneNumber: formattedPhone,
        metadata: {
          name,
        },
      },
    });

    return paymentMethod;
  },

  /**
   * Process a payment
   */
  async processPayment(
    amount: number,
    currency: string,
    paymentMethodId: string,
    description: string
  ) {
    // Get payment method
    const paymentMethod = await prisma.paymentMethodDetails.findUnique({
      where: { id: paymentMethodId },
    });

    if (!paymentMethod) {
      throw new Error("Payment method not found");
    }

    // Create payment record with pending status
    const payment = await prisma.payment.create({
      data: {
        invoiceId: "", // This will be updated after creation
        amount,
        currency,
        status: "PENDING",
        paymentMethodType: paymentMethod.type,
        provider: paymentMethod.provider,
        metadata: {
          description,
        },
      },
    });

    try {
      // Process payment based on payment method type
      let paymentResult;

      switch (paymentMethod.type) {
        case "CARD":
          paymentResult = await this.processCardPayment(
            paymentMethod,
            amount,
            currency,
            description,
            payment.id
          );
          break;
        case "BANK_ACCOUNT":
          paymentResult = await this.processBankPayment(
            paymentMethod,
            amount,
            currency,
            description,
            payment.id
          );
          break;
        case "MPESA":
          paymentResult = await this.processMpesaPayment(
            paymentMethod,
            amount,
            currency,
            description,
            payment.id
          );
          break;
        default:
          throw new Error(
            `Unsupported payment method type: ${paymentMethod.type}`
          );
      }

      // Update payment with result
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCEEDED",
          providerPaymentId: paymentResult.transactionId,
          providerFee: paymentResult.fee,
          receiptUrl: paymentResult.receiptUrl,
        },
      });

      return updatedPayment;
    } catch (error) {
      // Update payment with failure
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          failureReason: error.message,
        },
      });

      throw error;
    }
  },

  /**
   * Process card payment
   */
  async processCardPayment(
    paymentMethod: any,
    amount: number,
    currency: string,
    description: string,
    paymentId: string
  ) {
    // This would be an actual API call to the payment provider in production
    if (paymentMethod.provider === "COOP_BANK") {
      return await coopBankService.processCardPayment({
        token: paymentMethod.metadata?.coopBankToken,
        amount,
        currency,
        description,
        referenceId: paymentId,
      });
    }

    throw new Error(`Unsupported payment provider: ${paymentMethod.provider}`);
  },

  /**
   * Process bank payment
   */
  async processBankPayment(
    paymentMethod: any,
    amount: number,
    currency: string,
    description: string,
    paymentId: string
  ) {
    // This would be an actual API call to the payment provider in production
    if (paymentMethod.provider === "COOP_BANK") {
      return await coopBankService.processBankPayment({
        token: paymentMethod.metadata?.coopBankToken,
        amount,
        currency,
        description,
        referenceId: paymentId,
      });
    }

    throw new Error(`Unsupported payment provider: ${paymentMethod.provider}`);
  },

  /**
   * Process M-Pesa payment
   */
  async processMpesaPayment(
    paymentMethod: any,
    amount: number,
    currency: string,
    description: string,
    paymentId: string
  ) {
    // This would be an actual API call to M-Pesa in production
    return await coopBankService.processMpesaPayment({
      phoneNumber: paymentMethod.phoneNumber,
      amount,
      currency,
      description,
      referenceId: paymentId,
    });
  },

  /**
   * Format phone number to ensure it starts with 254
   */
  formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, "");

    // If it starts with 0, replace with 254
    if (cleaned.startsWith("0")) {
      cleaned = `254${cleaned.substring(1)}`;
    }

    // If it doesn't start with 254, add it
    if (!cleaned.startsWith("254")) {
      cleaned = `254${cleaned}`;
    }

    return cleaned;
  },

  /**
   * Detect card brand based on card number
   */
  detectCardBrand(cardNumber: string): string {
    // Remove spaces and non-digit characters
    const cleaned = cardNumber.replace(/\D/g, "");

    // Check card type based on prefix
    if (/^4/.test(cleaned)) {
      return "Visa";
    } else if (/^5[1-5]/.test(cleaned)) {
      return "Mastercard";
    } else if (/^3[47]/.test(cleaned)) {
      return "American Express";
    } else if (/^6(?:011|5)/.test(cleaned)) {
      return "Discover";
    } else {
      return "Unknown";
    }
  },
};
