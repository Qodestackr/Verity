import { FeatureCards } from "./page-client"

export default async function DashboardPage({
    params,
}: {
    params: { organizationSlug: string }
}) {
    // Access the organization slug from route params
    const { organizationSlug } = (await params)

    return <FeatureCards organizationSlug={organizationSlug} />
}
