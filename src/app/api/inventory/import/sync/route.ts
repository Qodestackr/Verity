import { NextResponse, type NextRequest } from "next/server";
import {
  syncProductsToChannel,
  getChannelMappings,
} from "@/lib/product-sync-automation";
import { useCurrency } from "@/hooks/useCurrency";
import { redis } from "@/lib/redis";
import { APP_BASE_API_URL } from "@/config/urls";

// This endpoint handles the onboarding process for new vendors
export async function POST(request: NextRequest) {
  try {
    // const { vendorId, channelId } = await request.json();

    // if (!vendorId || !channelId) {
    //   return NextResponse.json(
    //     { error: "vendorId and channelId are required" },
    //     { status: 400 }
    //   );
    // }

    const vendorId = "century-consults";
    const channelId = "Q2hhbm5lbDo2"; //"Q2hhbm5lbDoz";

    // Check if this vendor has already been onboarded
    const onboardingKey = `vendor:${vendorId}:onboarded`;
    const isOnboarded = await redis.get(onboardingKey);

    if (isOnboarded) {
      return NextResponse.json({
        success: true,
        message: "Vendor already onboarded",
        status: "completed",
      });
    }

    // Set onboarding status to in-progress
    const statusKey = `vendor:${vendorId}:onboarding-status`;
    await redis.set(
      statusKey,
      JSON.stringify({
        status: "in-progress",
        progress: 0,
        startedAt: new Date().toISOString(),
      })
    );

    // Get mappings for this channel
    const { productTypeMapping, attributeMapping } = await getChannelMappings(
      channelId
    );

    // Start the sync process in the background
    syncProductsToChannel({
      channelId,
      concurrency: 5,
      productTypeMapping,
      attributeMapping,
      onProgress: async (current, total) => {
        const progress = Math.round((current / total) * 100);
        await redis.set(
          statusKey,
          JSON.stringify({
            status: "in-progress",
            progress,
            current,
            total,
            updatedAt: new Date().toISOString(),
          })
        );
      },
    })
      .then(async (result) => {
        // Update status on completion
        await redis.set(
          statusKey,
          JSON.stringify({
            status: "completed",
            progress: 100,
            successCount: result.successCount,
            failedCount: result.failedCount,
            completedAt: new Date().toISOString(),
          })
        );

        // Mark vendor as onboarded
        await redis.set(onboardingKey, "true");

        // Store failed products for later retry if needed
        if (result.failedCount > 0) {
          const failedKey = `vendor:${vendorId}:failed-products`;
          await redis.set(failedKey, JSON.stringify(result.failedProducts));
        }
      })
      .catch(async (error) => {
        // Update status on error
        await redis.set(
          statusKey,
          JSON.stringify({
            status: "failed",
            error: error.message,
            failedAt: new Date().toISOString(),
          })
        );
      });

    // Return immediately with status URL
    return NextResponse.json({
      success: true,
      message: "Onboarding process started",
      statusUrl: `${APP_BASE_API_URL}/vendor-onboarding/status?vendorId=${vendorId}`,
    });
  } catch (error) {
    console.error("Vendor onboarding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Endpoint to check onboarding status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const vendorId = searchParams.get("vendorId");

  if (!vendorId) {
    return NextResponse.json(
      { error: "vendorId parameter is required" },
      { status: 400 }
    );
  }

  const statusKey = `vendor:${vendorId}:onboarding-status`;
  const statusJson = await redis.get(statusKey);

  if (!statusJson) {
    return NextResponse.json(
      { error: "Onboarding status not found" },
      { status: 404 }
    );
  }

  const status = JSON.parse(statusJson);
  return NextResponse.json(status);
}
