import { type NextRequest, NextResponse } from "next/server"

import { BaridiService } from "@/services/baridi-service"

// Handle customer response to campaign (webhook from WhatsApp/Facebook)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { campaignId, customerId, platform, message, phoneNumber } = body

        if (!campaignId || !customerId || !platform || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const response = await BaridiService.handleCustomerResponse(campaignId, customerId, platform, message)

        // If customer converted, send confirmation message
        if (response.isConverted) {
            // This would send via WhatsApp Business API
            const confirmationMessage = `Perfect! 🎯 Your order is confirmed. ${response.quantity} Tuskers + FREE item. Delivery in 10 mins or pickup ready!`

            // In production, send actual message:
            // await whatsappAPI.sendMessage(phoneNumber, confirmationMessage);

            console.log(`Would send to ${phoneNumber}: ${confirmationMessage}`)
        }

        return NextResponse.json({
            success: true,
            response,
            converted: response.isConverted,
        })
    } catch (error) {
        console.error("Error handling campaign response:", error)
        return NextResponse.json({ error: "Failed to handle response" }, { status: 500 })
    }
}
