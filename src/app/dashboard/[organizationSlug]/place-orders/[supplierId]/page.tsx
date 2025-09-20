import { useCurrency } from "@/hooks/useCurrency";
import { getOrganizationIdFromSlug } from "@/utils/organization"
import DistributorOrderingPage from "@/components/orders/distributor-ordering-page"
import { auth } from "@/lib/auth"
import { getStandardHeaders } from "@/utils/headers"
import { headers } from "next/headers"
import { APP_BASE_API_URL } from "@/config/urls"

/**
 * Server component for the distributor ordering page
 * Fetches necessary data and passes it to the client component
 */
export default async function DistributorOrdering({
    params,
}: {
    params: { organizationSlug: string; supplierId: string }
}) {
    const standardHeaders = await getStandardHeaders()
    const { organizationSlug, supplierId } = params

    const session = await auth.api.getSession({
        headers: standardHeaders,
    })

    if (!session) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <h2 className="text-xl font-medium mb-2">Authentication Required</h2>
                    <p className="text-muted-foreground mb-4">Please sign in to access this page</p>
                </div>
            </div>
        )
    }

    try {
        const organizationId = await getOrganizationIdFromSlug(organizationSlug)

        const hdrs = await headers()
        const cookieHeader = hdrs.get("cookie") ?? ""
        const authHeader = hdrs.get("authorization") ?? ""

        // Fetch supplier organization data directly
        const supplierResponse = await fetch(
            `${APP_BASE_API_URL}/organizations/${supplierId}`,
            {
                headers: {
                    Authorization: authHeader,
                    Cookie: cookieHeader,
                },
                cache: "no-store",
            },
        )

        let supplierData = null
        if (supplierResponse.ok) {
            supplierData = await supplierResponse.json()
            console.log("Supplier data fetched on server:", supplierData)
        } else {
            console.error("Failed to fetch supplier data:", supplierResponse.statusText)
        }

        // Fetch relationship data for the supplier
        const relationshipResponse = await fetch(
            `${APP_BASE_API_URL}/relationships?organizationId=${organizationId}&status=ACTIVE`,
            {
                headers: {
                    Authorization: authHeader,
                    Cookie: cookieHeader,
                },
                cache: "no-store",
            },
        )

        let relationships = []
        if (relationshipResponse.ok) {
            relationships = await relationshipResponse.json()
        } else {
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

            if (pendingResponse.ok) {
                relationships = await pendingResponse.json()
            }
        }

        // Find the specific relationship for this supplier
        const supplierRelationship = relationships.find((rel: any) => rel.partnerId === supplierId)

        // Pass initial data to the client component
        return (
            <DistributorOrderingPage
                initialData={{
                    partnerId: supplierId,
                    organizationId,
                    supplierData,
                    relationship: supplierRelationship || null,
                }}
            />
        )
    } catch (error) {
        console.error("Error loading distributor ordering page:", error)

        // Show error state
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <h2 className="text-xl font-medium mb-2">Error Loading Page</h2>
                    <p className="text-muted-foreground mb-4">There was a problem loading this page. Please try again later.</p>
                </div>
            </div>
        )
    }
}
