import { useCurrency } from "@/hooks/useCurrency";
import { getOrganizationIdFromSlug } from "@/utils/organization"
import { PlaceOrdersClient } from "./page-client"
import { unstable_cache } from "next/cache"
import { headers } from "next/headers"
import { APP_BASE_API_URL } from "@/config/urls";

/**
 * Fetches relationships for an organization
 * @param organizationSlug - The slug of the organization
 * @param authHeader - The authorization header
 * @param cookieHeader - The cookie header
 * @returns The relationships data
 */
const _getRelationships = async (organizationSlug: string, authHeader: string, cookieHeader: string) => {
    const organizationId = await getOrganizationIdFromSlug(organizationSlug)

    const response = await fetch(
        `${APP_BASE_API_URL}/relationships?organizationId=${organizationId}&status=PENDING`,
        {
            headers: {
                Authorization: authHeader,
                Cookie: cookieHeader,
            },
            cache: "no-store",
        },
    )

    if (!response.ok) {
        // If no active relationships, try to get pending ones
        const pendingResponse = await fetch(
            `${APP_BASE_API_URL}/relationships?organizationId=${organizationId}&status=PENDING&type=GENERAL`,
            {
                headers: {
                    Authorization: authHeader,
                    Cookie: cookieHeader,
                },
                cache: "no-store",
            },
        )

        if (!pendingResponse.ok) {
            throw new Error(`Failed to fetch relationships: ${pendingResponse.statusText}`)
        }

        return pendingResponse.json()
    }

    return response.json()
}

/**
 * Cached version of the getRelationships function
 */
const getRelationships = unstable_cache(_getRelationships, ["relationships-list"], { revalidate: 60 })

/**
 * Server component for the place orders page
 * Fetches necessary data and passes it to the client component
 */
export default async function PlaceOrdersPage({
    params,
}: {
    params: { organizationSlug: string }
}) {
    const { organizationSlug } = await params
    const hdrs = await headers()

    const cookieHeader = hdrs.get("cookie") ?? ""
    const authHeader = hdrs.get("authorization") ?? ""

    try {
        const relationships = await getRelationships(organizationSlug, authHeader, cookieHeader)

        return <PlaceOrdersClient organizationSlug={organizationSlug} relationships={relationships} />
    } catch (error) {
        console.error("Error loading place orders page:", error)

        // Show error state but still render the client component
        // which will handle showing the connection hub if needed
        return <PlaceOrdersClient organizationSlug={organizationSlug} relationships={[]} />
    }
}
