
import prisma from "@/lib/prisma";
import { paymentService } from "./payment-service";
import { format } from "date-fns";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

/**
 * Service for managing invoices
 */
export const invoiceService = {
  /**
   * Create a new invoice for a subscription
   */
  async createInvoice(subscriptionId: string) {
    // Get subscription with plan
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        plan: true,
        organization: true,
      },
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

    // Calc tax (16% VAT for Kenya)
    const taxRate = 0.16;
    const subtotal = subscription.plan.price;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        organizationId: subscription.organizationId,
        subscriptionId,
        number: invoiceNumber,
        status: "OPEN",
        currency: subscription.plan.currency,
        amount: total,
        tax: taxAmount,
        amountDue: total,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
        description: `${subscription.plan.name} - ${format(
          new Date(),
          "MMMM yyyy"
        )}`,
      },
    });

    // If subscription has a payment method, attempt to charge it immediately
    if (subscription.paymentMethodId) {
      try {
        await this.payInvoice(invoice.id, subscription.paymentMethodId);
      } catch (error) {
        console.error(
          `Failed to automatically charge invoice ${invoice.id}:`,
          error
        );

        // Update subscription status if payment fails
        if (subscription.status === "ACTIVE") {
          await prisma.subscription.update({
            where: { id: subscriptionId },
            data: {
              status: "PAST_DUE",
              failedPayments: {
                increment: 1,
              },
            },
          });
        }
      }
    }

    return invoice;
  },

  /**
   * Pay an invoice
   */
  async payInvoice(invoiceId: string, paymentMethodId: string) {
    // Get invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (invoice.status === "PAID") {
      throw new Error("Invoice is already paid");
    }

    // Process payment
    const payment = await paymentService.processPayment(
      invoice.amountDue,
      invoice.currency,
      paymentMethodId,
      `Invoice ${invoice.number} - ${invoice.subscription.plan.name}`
    );

    // Update invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "PAID",
        amountPaid: invoice.amountDue,
        amountDue: 0,
        paidAt: new Date(),
        receiptUrl: payment.receiptUrl,
        paymentIntentId: payment.providerPaymentId,
      },
    });

    // Update payment with invoice ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        invoiceId,
      },
    });

    // Update subscription
    await prisma.subscription.update({
      where: { id: invoice.subscriptionId },
      data: {
        status: "ACTIVE",
        lastPaymentDate: new Date(),
        failedPayments: 0,
      },
    });

    return {
      invoice: updatedInvoice,
      payment,
    };
  },

  /**
   * Generate a unique invoice number
   */
  async generateInvoiceNumber() {
    const date = format(new Date(), "yyyyMMdd");

    // Get count of invoices created today
    const count = await prisma.invoice.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    // Format: INV-YYYYMMDD-XXXX (where XXXX is a sequential number)
    return `INV-${date}-${(count + 1).toString().padStart(4, "0")}`;
  },

  /**
   * Generate PDF for an invoice
   */
  async generateInvoicePdf(invoice: any, billingContact: any) {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Add a page
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size

    // Get fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Set up drawing
    const { width, height } = page.getSize();
    const margin = 50;

    // Draw company logo/header
    page.drawText("Verity", {
      x: margin,
      y: height - margin,
      size: 24,
      font: helveticaBold,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Draw invoice title
    page.drawText("INVOICE", {
      x: width - margin - 100,
      y: height - margin,
      size: 24,
      font: helveticaBold,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Draw invoice details
    page.drawText(`Invoice Number: ${invoice.number}`, {
      x: width - margin - 200,
      y: height - margin - 30,
      size: 10,
      font: helveticaFont,
    });

    page.drawText(
      `Date: ${format(new Date(invoice.createdAt), "MMMM dd, yyyy")}`,
      {
        x: width - margin - 200,
        y: height - margin - 45,
        size: 10,
        font: helveticaFont,
      }
    );

    page.drawText(
      `Due Date: ${format(new Date(invoice.dueDate), "MMMM dd, yyyy")}`,
      {
        x: width - margin - 200,
        y: height - margin - 60,
        size: 10,
        font: helveticaFont,
      }
    );

    // Draw status
    const statusText = invoice.status === "PAID" ? "PAID" : "UNPAID";
    const statusColor =
      invoice.status === "PAID" ? rgb(0, 0.5, 0) : rgb(0.8, 0, 0);

    page.drawText(statusText, {
      x: width - margin - 200,
      y: height - margin - 80,
      size: 14,
      font: helveticaBold,
      color: statusColor,
    });

    // Draw billing info
    page.drawText("Billed To:", {
      x: margin,
      y: height - margin - 60,
      size: 12,
      font: helveticaBold,
    });

    const billingName = billingContact?.name || invoice.organization.name;
    const billingAddress =
      billingContact?.address || invoice.organization.address || "";
    const billingCity = billingContact?.city || invoice.organization.city || "";
    const billingCountry = billingContact?.country || "Kenya";

    page.drawText(billingName, {
      x: margin,
      y: height - margin - 80,
      size: 10,
      font: helveticaFont,
    });

    page.drawText(billingAddress, {
      x: margin,
      y: height - margin - 95,
      size: 10,
      font: helveticaFont,
    });

    page.drawText(`${billingCity}, ${billingCountry}`, {
      x: margin,
      y: height - margin - 110,
      size: 10,
      font: helveticaFont,
    });

    // Draw line items header
    const tableTop = height - margin - 150;
    const col1 = margin;
    const col2 = margin + 300;
    const col3 = margin + 400;

    page.drawText("Description", {
      x: col1,
      y: tableTop,
      size: 10,
      font: helveticaBold,
    });

    page.drawText("Quantity", {
      x: col2,
      y: tableTop,
      size: 10,
      font: helveticaBold,
    });

    page.drawText("Amount", {
      x: col3,
      y: tableTop,
      size: 10,
      font: helveticaBold,
    });

    // Draw horizontal line
    page.drawLine({
      start: { x: margin, y: tableTop - 10 },
      end: { x: width - margin, y: tableTop - 10 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    // Draw line item
    const itemY = tableTop - 30;

    page.drawText(invoice.description, {
      x: col1,
      y: itemY,
      size: 10,
      font: helveticaFont,
    });

    page.drawText("1", {
      x: col2,
      y: itemY,
      size: 10,
      font: helveticaFont,
    });

    const subtotal = invoice.amount - invoice.tax;

    page.drawText(`${invoice.currency} ${subtotal.toFixed(2)}`, {
      x: col3,
      y: itemY,
      size: 10,
      font: helveticaFont,
    });

    // Draw horizontal line
    page.drawLine({
      start: { x: margin, y: itemY - 10 },
      end: { x: width - margin, y: itemY - 10 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    // Draw totals
    const totalsY = itemY - 40;

    page.drawText("Subtotal:", {
      x: col2,
      y: totalsY,
      size: 10,
      font: helveticaFont,
    });

    page.drawText(`${invoice.currency} ${subtotal.toFixed(2)}`, {
      x: col3,
      y: totalsY,
      size: 10,
      font: helveticaFont,
    });

    page.drawText("VAT (16%):", {
      x: col2,
      y: totalsY - 15,
      size: 10,
      font: helveticaFont,
    });

    page.drawText(`${invoice.currency} ${invoice.tax.toFixed(2)}`, {
      x: col3,
      y: totalsY - 15,
      size: 10,
      font: helveticaFont,
    });

    page.drawText("Total:", {
      x: col2,
      y: totalsY - 35,
      size: 12,
      font: helveticaBold,
    });

    page.drawText(`${invoice.currency} ${invoice.amount.toFixed(2)}`, {
      x: col3,
      y: totalsY - 35,
      size: 12,
      font: helveticaBold,
    });

    // Draw payment info
    if (invoice.status === "PAID") {
      page.drawText("Payment Information", {
        x: margin,
        y: totalsY - 70,
        size: 12,
        font: helveticaBold,
      });

      page.drawText(
        `Paid on: ${format(new Date(invoice.paidAt), "MMMM dd, yyyy")}`,
        {
          x: margin,
          y: totalsY - 90,
          size: 10,
          font: helveticaFont,
        }
      );

      if (invoice.payments && invoice.payments.length > 0) {
        const payment = invoice.payments[0];
        page.drawText(`Payment Method: ${payment.paymentMethodType}`, {
          x: margin,
          y: totalsY - 105,
          size: 10,
          font: helveticaFont,
        });

        page.drawText(`Transaction ID: ${payment.providerPaymentId || "N/A"}`, {
          x: margin,
          y: totalsY - 120,
          size: 10,
          font: helveticaFont,
        });
      }
    } else {
      page.drawText("Payment Instructions", {
        x: margin,
        y: totalsY - 70,
        size: 12,
        font: helveticaBold,
      });

      page.drawText(
        "Please pay this invoice by the due date using one of our accepted payment methods.",
        {
          x: margin,
          y: totalsY - 90,
          size: 10,
          font: helveticaFont,
        }
      );
    }

    // Draw footer
    page.drawText("Thank you for your business!", {
      x: width / 2 - 70,
      y: margin + 30,
      size: 12,
      font: helveticaFont,
    });

    page.drawText(
      "For questions about this invoice, please contact online@alcorabooks.com",
      {
        x: width / 2 - 150,
        y: margin + 15,
        size: 10,
        font: helveticaFont,
      }
    );

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();

    return Buffer.from(pdfBytes);
  },
};
