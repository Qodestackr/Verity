'use client'

import React from 'react'
import { Provider as UrqlProvider } from "urql"
import { gqlclient } from "@/lib/graphql"
import { ThemeProvider } from "@/components/common/theme-provider"
import { PostHogProvider } from '@/providers/posthog-provider'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from "@/components/ui/sonner"

export function ClientProviders({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <UrqlProvider value={gqlclient}>
            {/* <PostHogProvider> */}
            <NuqsAdapter>
                <ThemeProvider attribute="class" defaultTheme="dark">
                    {children}
                    <Toaster richColors closeButton />
                </ThemeProvider>
            </NuqsAdapter>
            {/* </PostHogProvider> */}
        </UrqlProvider>
    )
}