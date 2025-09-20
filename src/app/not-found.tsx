"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Warehouse, AlertCircle } from "lucide-react"
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button"

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
}

const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: {
            duration: 0.6,
            ease: "easeOut",
        },
    },
}

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b bg-background/80 backdrop-blur-sm">
                <div className="container flex h-16 items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <Warehouse className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold">Alcorabooks</span>
                    </Link>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-4">
                <motion.div
                    className="max-w-md w-full mx-auto text-center"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div className="relative mx-auto mb-8" variants={iconVariants}>
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle className="h-12 w-12 text-primary" />
                        </div>
                        <motion.div
                            className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                        >
                            4
                        </motion.div>
                        <motion.div
                            className="absolute -bottom-2 -left-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                        >
                            4
                        </motion.div>
                    </motion.div>

                    <motion.h1 className="text-3xl font-bold tracking-tight mb-2" variants={itemVariants}>
                        Page Not Found
                    </motion.h1>

                    <motion.p className="text-muted-foreground mb-8" variants={itemVariants}>
                        The page you're looking for doesn't exist or has been moved.
                    </motion.p>

                    <motion.div variants={itemVariants}>
                        <Button asChild size="lg" className="gap-2">
                            <Link href="/">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Home
                            </Link>
                        </Button>
                    </motion.div>

                    <motion.div className="mt-12 pt-8 border-t" variants={itemVariants}>
                        <p className="text-sm text-muted-foreground">
                            Need help?{" "}
                            <Link href="/contact" className="text-primary hover:underline">
                                Contact our support team
                            </Link>
                        </p>
                    </motion.div>
                </motion.div>
            </main>

            <footer className="border-t py-6 bg-muted/30">
                <div className="container">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-muted-foreground">© 2025 Alcorabooks. All rights reserved.</p>
                        <div className="flex items-center gap-4">
                            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Terms of Service
                            </Link>
                            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Privacy Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}