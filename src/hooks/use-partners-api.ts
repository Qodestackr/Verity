import { useCurrency } from "@/hooks/useCurrency";
import { client } from "@/lib/auth-client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface Organization {
    id: string
    name: string
    businessType: string
    city?: string
    description?: string
    logo?: string
    visibilitySettings?: {
        showContactInfo: boolean
        showProducts: boolean
    }
}

interface Relationship {
    id: string
    partnerId: string
    partnerName: string
    partnerLogo?: string
    partnerBusinessType: string
    partnerLocation?: string
    status: "PENDING" | "ACTIVE" | "REJECTED" | "BLOCKED" | "ARCHIVED"
    type: string
    direction: "incoming" | "outgoing"
    permissions: Array<{
        id: string
        permissionType: string
        isGranted: boolean
        scope: string
    }>
    createdAt: string
    updatedAt: string
    notes?: string
}

interface CreateRelationshipData {
    organizationId: string
    targetId: string
    type: string
    permissions: Array<{
        permissionType: string
        isGranted: boolean
        scope: string
    }>
    notes?: string
}

const getCurrentOrgId = () => {
    const { data: activeOrganization, isPending, isRefetching } = client.useActiveOrganization()
    if (isPending) { }

    return `${activeOrganization?.id}`
}

// API functions
const discoverOrganizations = async (params: {
    organizationId: string
    businessType?: string
    search?: string
    city?: string
    limit?: number
    offset?: number
}): Promise<{ organizations: Organization[]; pagination: any }> => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value.toString())
    })

    const response = await fetch(`/api/organizations/discover?${searchParams}`)
    if (!response.ok) throw new Error("Failed to fetch organizations")
    return response.json()
}

const getRelationships = async (params: {
    organizationId: string
    status?: string
    type?: string
    direction?: string
}): Promise<Relationship[]> => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value)
    })

    const response = await fetch(`/api/relationships?${searchParams}`)
    if (!response.ok) throw new Error("Failed to fetch relationships")
    return response.json()
}

const createRelationship = async (data: CreateRelationshipData): Promise<any> => {
    const response = await fetch("/api/relationships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to create relationship")
    return response.json()
}

const updateRelationshipStatus = async (params: {
    id: string
    organizationId: string
    status: string
    notes?: string
}): Promise<any> => {
    const response = await fetch(`/api/relationships/${params.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            organizationId: params.organizationId,
            status: params.status,
            notes: params.notes,
        }),
    })
    if (!response.ok) throw new Error("Failed to update relationship")
    return response.json()
}

// Custom hooks
export const useDiscoverOrganizations = (params: {
    businessType?: string
    search?: string
    city?: string
    limit?: number
    offset?: number
}) => {
    const orgId = getCurrentOrgId()

    return useQuery({
        queryKey: ["discover-organizations", orgId, params],
        queryFn: () => discoverOrganizations({ organizationId: orgId, ...params }),
        enabled: !!orgId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export const useRelationships = (params?: {
    status?: string
    type?: string
    direction?: string
}) => {
    const orgId = getCurrentOrgId()

    return useQuery({
        queryKey: ["relationships", orgId, params],
        queryFn: () => getRelationships({ organizationId: orgId, ...params }),
        enabled: !!orgId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

export const useCreateRelationship = () => {
    const queryClient = useQueryClient()
    const orgId = getCurrentOrgId()

    return useMutation({
        mutationFn: createRelationship,
        onSuccess: (data, variables) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ["relationships"] })
            queryClient.invalidateQueries({ queryKey: ["discover-organizations"] })

            toast.success("Connection request sent successfully", {
                description: `Sent connection request to ${variables.targetId}`,
            })
        },
        onError: (error: any) => {
            toast.error("Failed to send connection request", {
                description: error.message || "Please try again later",
            })
        },
    })
}

export const useUpdateRelationshipStatus = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateRelationshipStatus,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["relationships"] })

            const statusText =
                variables.status === "ACTIVE"
                    ? "accepted"
                    : variables.status === "REJECTED"
                        ? "rejected"
                        : variables.status.toLowerCase()

            toast.success(`Connection ${statusText}`, {
                description: `Successfully ${statusText} the connection request`,
            })
        },
        onError: (error: any) => {
            toast.error("Failed to update connection", {
                description: error.message || "Please try again later",
            })
        },
    })
}
