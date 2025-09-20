"use client"

import { useState } from "react"
import {
    // usePromotionsQuery,
    // usePromotionQuery,
    // usePromotionCreateMutation,
    // usePromotionRuleCreateMutation,
    // usePromotionUpdateMutation,
    // usePromotionRuleUpdateMutation,
    // usePromotionDeleteMutation,
    // usePromotionRuleDeleteMutation,
    ProductListDocument,
} from "@/gql/graphql"
import { useQuery } from "urql"

export function useTieredPricing() {

    const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null)

    // Fetch all promotions
    const [promotionsResult] = usePromotionsQuery({
        variables: {
            first: 100,
        },
    })

    // Fetch single promotion details when selected
    const [promotionResult] = usePromotionQuery({
        variables: {
            id: selectedPromotionId || "",
        },
        pause: !selectedPromotionId,
    })

    // Search products
    const [searchTerm, setSearchTerm] = useState("")

    const [productsResult] = useQuery({
        query: ProductListDocument,
        variables: { channel: "alcoraadmin" }
    })

    // Mutations
    const [, createPromotion] = usePromotionCreateMutation()
    const [, createPromotionRule] = usePromotionRuleCreateMutation()
    const [, updatePromotion] = usePromotionUpdateMutation()
    const [, updatePromotionRule] = usePromotionRuleUpdateMutation()
    const [, deletePromotion] = usePromotionDeleteMutation()
    const [, deletePromotionRule] = usePromotionRuleDeleteMutation()

    // Create a tiered pricing rule
    const createTieredPricingRule = async (
        promotionId: string,
        name: string,
        channelIds: string[],
        tiers: Array<{ min: number; max: number | null; value: number }>,
        productId: string,
        discountType: "PERCENTAGE" | "FIXED",
    ) => {
        // For tiered pricing, we need to create a rule for each tier
        // Each rule will have a different cataloguePredicate based on quantity

        const results = []

        for (const tier of tiers) {
            const result = await createPromotionRule({
                input: {
                    name: `${name} (${tier.min}-${tier.max || "∞"})`,
                    promotion: promotionId,
                    channels: channelIds,
                    rewardValueType: discountType,
                    rewardValue: tier.value.toString(),
                    cataloguePredicate: {
                        productPredicate: {
                            ids: [productId],
                        },
                    },
                },
            })

            results.push(result)
        }

        return results
    }

    // Create a volume discount promotion
    const createVolumeDiscount = async (
        name: string,
        description: string | null,
        startDate: string,
        endDate: string | null,
    ) => {
        const result = await createPromotion({
            input: {
                name,
                description: description
                    ? {
                        blocks: [
                            {
                                type: "paragraph",
                                data: {
                                    text: description,
                                },
                            },
                        ],
                    }
                    : null,
                type: "CATALOGUE",
                startDate,
                endDate,
            },
        })

        if (result.data?.promotionCreate?.promotion) {
            setSelectedPromotionId(result.data.promotionCreate.promotion.id)
            return result.data.promotionCreate.promotion
        }

        return null
    }

    return {
        promotions: promotionsResult.data?.promotions?.edges?.map((edge: { node: any }) => edge?.node) || [],
        selectedPromotion: promotionResult.data?.promotion,
        channels: [],
        searchProducts: (term: string) => setSearchTerm(term),
        products: productsResult.data?.products?.edges?.map((edge) => edge?.node) || [],
        loading: promotionsResult.fetching || promotionResult.fetching,
        error: promotionsResult.error || promotionResult.error,
        selectPromotion: setSelectedPromotionId,
        createVolumeDiscount,
        createTieredPricingRule,
        deletePromotion: (id: string) => deletePromotion({ id }),
        deletePromotionRule: (id: string) => deletePromotionRule({ id }),
    }
}
