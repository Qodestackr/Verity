"use client"

import type React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import {
    ArrowRight,
    BarChart3,
    Building,
    ChevronRight,
    Globe,
    Network,
    Shield,
    Sparkles,
    TrendingUp,
} from "lucide-react"


import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function BrandLandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-5">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="container relative z-10 pt-20 pb-16 md:pt-28 md:pb-24">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900 mb-4">
                                Command Your <span className="text-emerald-700 font-normal">Distribution Network</span>
                            </h1>

                            <p className="text-lg text-gray-600 mb-3 max-w-3xl mx-auto">
                                Verity gives brand owners unprecedented visibility and control over their entire distribution chain,
                                from warehouse to shelf.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button size="lg" className="bg-emerald-700 hover:bg-emerald-800 text-white px-8" asChild>
                                    <Link href="/for-brands/request-access">
                                        Get Enterprise Access
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>

                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                    asChild
                                >
                                    <Link href="/for-brands/demo">Schedule a Demo</Link>
                                </Button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="mt-12 md:mt-16 relative"
                        >
                            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
                                <Image
                                    src="/placeholder.svg?height=600&width=1200"
                                    alt="Verity Brand Command Center Dashboard"
                                    width={1200}
                                    height={600}
                                    className="w-full h-auto"
                                    priority
                                />
                            </div>

                            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                                <div className="bg-emerald-700 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg flex items-center">
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Trusted by leading brands across East Africa
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="py-12 bg-white border-y border-gray-100">
                <div className="container">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-light text-gray-700">Trusted by Industry Leaders</h2>
                    </div>

                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
                        <div className="w-32 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">EABL</div>
                        <div className="w-32 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">DIAGEO</div>
                        <div className="w-32 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">KWAL</div>
                        <div className="w-32 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">KBL</div>
                    </div>
                </div>
            </section>

            <section className="max-w-5xl mx-auto py-4">
                <div>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-light text-gray-900 mb-4">Precision Tools for Brand Dominance</h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Gain unprecedented visibility and control over your entire distribution network with our suite of
                            enterprise-grade tools.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={Network}
                            title="Network Map & Health"
                            description="Visualize your entire distribution network with real-time status indicators for every node in your supply chain."
                            color="emerald"
                        />

                        <FeatureCard
                            icon={BarChart3}
                            title="Precision Analytics"
                            description="Track SKU velocity, detect leakage points, and forecast demand with AI-powered analytics."
                            color="teal"
                        />

                        <FeatureCard
                            icon={TrendingUp}
                            title="Campaign & Promotion Manager"
                            description="Design, deploy and measure promotions across your distribution network with one-click multi-channel push."
                            color="emerald"
                        />

                        <FeatureCard
                            icon={Globe}
                            title="Logistics Oversight"
                            description="End-to-end delivery tracking with ETA predictions, exception alerts, and dynamic rerouting capabilities."
                            color="teal"
                        />

                        <FeatureCard
                            icon={Shield}
                            title="Enterprise-Grade Security"
                            description="SSO integration, role-based access controls, and comprehensive audit logs keep your data secure."
                            color="emerald"
                        />

                        <FeatureCard
                            icon={Building}
                            title="Open API Platform"
                            description="Seamlessly integrate with your existing ERP, BI tools, and other enterprise systems."
                            color="teal"
                        />
                    </div>
                </div>
            </section>
            <section className="py-20 bg-emerald-700 text-white">
                <div className="container">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-light mb-3">Ready to Transform Your Distribution Visibility?</h2>
                        <p className="text-lg text-emerald-100 mb-10 max-w-3xl mx-auto">
                            Join other leading brands who have gained unprecedented control over their distribution networks with
                            Verity.
                        </p>

                        <Button size="lg" className="bg-white text-emerald-700 hover:bg-gray-100 px-8" asChild>
                            <Link href="/for-brands/request-access">
                                Get Enterprise Access
                                <ChevronRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}

function FeatureCard({
    icon: Icon,
    title,
    description,
    color,
}: {
    icon: React.ElementType
    title: string
    description: string
    color: "emerald" | "teal"
}) {
    const bgColor = color === "emerald" ? "bg-emerald-50" : "bg-teal-50"
    const textColor = color === "emerald" ? "text-emerald-700" : "text-teal-700"

    return (
        <Card className="p-2 border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
            <CardContent className="p-2">
                <div className="flex justify-start items-center gap-1.5">
                    <div className={`${bgColor} w-8 h-8 rounded-lg flex items-center justify-center mb-4`}>
                        <Icon className={`h-4 w-4 ${textColor}`} />
                    </div>
                    <h3 className="text-lg font-normal text-gray-900 mb-2">{title}</h3>
                </div>
                <p className="text-gray-600">{description}</p>
            </CardContent>
        </Card>
    )
}
