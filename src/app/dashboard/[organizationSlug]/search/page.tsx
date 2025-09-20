import { notFound, redirect } from "next/navigation"
import { useCurrency } from "@/hooks/useCurrency";
import { Pagination as ProductsPagination } from "@/components/products/pagination"
import { ProductList } from "@/components/products/product-list"
import { SearchProductsSortedDocument, ProductOrderField, OrderDirection } from "@/gql/graphql"
import { executeGraphQL } from "@/lib/graphql-client"

export const metadata = {
    title: "Search products",
    description: "Search products in Alcorabooks",
}

export default async function Page({
    searchParams,
    params,
}: {
    searchParams: Record<"query" | "cursor", string | string[] | undefined>
    params: { channel: string }
}) {
    const cursor = typeof searchParams.cursor === "string" ? searchParams.cursor : null
    const searchValue = searchParams.query
    const channel = params.channel || "century-consults"

    if (!searchValue) {
        notFound()
    }

    if (Array.isArray(searchValue)) {
        const firstValidSearchValue = searchValue.find((v) => v.length > 0)
        if (!firstValidSearchValue) {
            notFound()
        }
        redirect(`/search?${new URLSearchParams({ query: firstValidSearchValue }).toString()}`)
    }

    const { products } = await executeGraphQL(SearchProductsSortedDocument, {
        variables: {
            search: searchValue,
            first: 12,
            after: cursor,
            sortBy: ProductOrderField.Rank,
            sortDirection: OrderDirection.Asc,
            channel: channel,
        },
        revalidate: 60,
    });

    if (!products) {
        notFound()
    }

    const newSearchParams = new URLSearchParams({
        query: searchValue,
        ...(products.pageInfo.endCursor && { cursor: products.pageInfo.endCursor }),
    })

    return (
        <section className="mx-auto max-w-7xl p-8 pb-16">
            {JSON.stringify(params)}
            {products.totalCount && products.totalCount > 0 ? (
                <div>
                    <h1 className="pb-8 text-xl font-semibold">Search results for &quot;{searchValue}&quot;:</h1>
                    <ProductList products={products.edges.map((e: { node: any }) => e.node)} />
                    <ProductsPagination
                        pageInfo={{
                            ...products.pageInfo,
                            basePathname: `/search`,
                            urlSearchParams: newSearchParams,
                        }}
                    />
                </div>
            ) : (
                <h1 className="mx-auto pb-8 text-center text-xl font-semibold">Nothing found {":("}</h1>
            )}
        </section>
    )
}
