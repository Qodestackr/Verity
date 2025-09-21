
import ConnectionHub from "@/components/core/partnership/connection-hub"
import { getOrganizationIdFromSlug } from "@/utils/organization"

import { auth } from "@/lib/auth"
import { headers } from "next/headers";

export default async function WaitingRoomPage({ params }: { params: { organizationSlug: string } }) {
    const { organizationSlug } = await params;

    const organization = await auth.api.getFullOrganization({
        headers: await headers(),
        query: {
            organizationSlug
        }
    })

    return (
        <div className="max-w-4xl mx-auto px-4 py-3">
            <ConnectionHub organizationId={`${organization?.id}`} />
        </div>
    )
}
