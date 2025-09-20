"use client";
import type React from "react"
import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function WrapperWithQuery(props: {
    children: React.ReactNode
}) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 100_0, // 1 minute
                        retry: (failureCount, error: any) => {
                            // Don't retry on 4xx errors
                            if (error?.status >= 400 && error?.status < 500) {
                                return false
                            }
                            return failureCount < 3
                        },
                    },
                },
            }),
    )
    return (
        <QueryClientProvider client={queryClient}>
            {props.children}
        </QueryClientProvider>
    );
}