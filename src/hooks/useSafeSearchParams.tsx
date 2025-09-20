'use client';

import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'

/**
 * useSafeSearchParams - A Next.js-specific hook that prevents Client-Side Rendering (CSR) bailout
 * when accessing URL search parameters.
 * 
 * @description
 * NEXT.JS SPECIFIC: This is for Next.js App Router, NOT React Router.
 * 
 * Problem: In Next.js 13+, direct calls to useSearchParams() will cause the entire page
 * to opt out of Server-Side Rendering (SSR), resulting in a CSR bailout with the error:
 * "useSearchParams() should be wrapped in a suspense boundary"
 * 
 * This hook solves the problem by:
 * 1. Isolating the useSearchParams() call inside a Suspense boundary
 * 2. Providing a clean API to access URL parameters without direct hook calls
 * 3. Maintaining SSR capabilities for your page
 * 
 * @example
 * // Basic usage
 * import { useSafeSearchParams } from '@/lib/hooks/useSafeSearchParams';
 * 
 * export default function ProductPage() {
 *   const { get, params, ParamsProvider } = useSafeSearchParams();
 *   
 *   // Access a specific parameter
 *   const productId = get('id');
 *   
 *   return (
 *     <div>
 *       <ParamsProvider />
 *       <h1>Product ID: {productId}</h1>
 *     </div>
 *   );
 * }
 * 
 * @example
 * // Using with filtering and state
 * import { useSafeSearchParams } from '@/lib/hooks/useSafeSearchParams';
 * 
 * export default function FilterableList() {
 *   const { params, ParamsProvider } = useSafeSearchParams();
 *   const [items, setItems] = useState([]);
 *   
 *   useEffect(() => {
 *     // React to URL parameter changes
 *     fetchData({ category: params.category, sort: params.sort });
 *   }, [params]);
 *   
 *   return (
 *     <>
 *       <ParamsProvider />
 *       <div>
 *         <h2>Category: {params.category || 'All'}</h2>
 *         // List items 
 *      </div>
 *      </>
 * );
 * }
 **/
export function useSafeSearchParams() {
    const [params, setParams] = useState<Record<string, string>>({})

    return {
        // Get a specific search parameter
        get: (key: string) => params[key] || null,

        // Access all search parameters as an object
        params,

        // Component that MUST be rendered in your component
        ParamsProvider: () => (
            <Suspense fallback={null}>
                <SearchParamsExtractor onParams={setParams} />
            </Suspense>
        )
    }
}

/**
 * Internal component that safely extracts search parameters
 * This is isolated to prevent the parent component from bailing out to CSR
 */
function SearchParamsExtractor({ onParams }: { onParams: (params: Record<string, string>) => void }) {
    // This is the only place where useSearchParams is directly called
    const searchParams = useSearchParams()

    // Convert URLSearchParams to a regular object for easier consumption
    const paramsObject = Object.fromEntries(searchParams.entries())

    // Send parameters back to the parent component
    useEffect(() => {
        onParams(paramsObject)
    }, [searchParams, onParams])

    return null
}