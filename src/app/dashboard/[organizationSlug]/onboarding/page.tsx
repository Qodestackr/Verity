"use client"

import { useTransition } from "react"

import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Confetti from "react-confetti"

import { useWindowSize } from "@/hooks/use-window-size"
import { toast } from "sonner"
import {
    ArrowRight,
    Building2,
    CheckCircle,
    ChevronRight,
    CreditCard,
    ImageIcon,
    MapPin,
    Package,
    Store,
    Upload,
    Users,
    Warehouse,
    X,
    Zap,
    ChevronLeft,
    Info,
    Phone,
    Sparkles,
    Clock,
    Smartphone,
    Loader2,
    AlertCircleIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useSession } from "@/lib/auth-client"
import useOnboardingStore from "@/stores/use-onboarding-store"
import { useState, useEffect } from "react"
import SubscriptionPage from "../account-plan/page"
import TrustMini from "../trust-center"
import { useOrganizationSlug } from "@/hooks/use-organization-slug"
import { SubscriptionPlans } from "@/components/subscriptions/subscription-plans"
import { APP_BASE_API_URL } from "@/config/urls"

const STEPS = [
    { id: "welcome", label: "Welcome" },
    { id: "business-details", label: "Business Details" },
    { id: "location", label: "Location" },
    { id: "inventory", label: "Inventory" },
    { id: "payment", label: "Payment" },
    { id: "team", label: "Team" },
    { id: "complete", label: "Complete" },
]

export default function OnboardingPage() {
    const router = useRouter()
    const { width, height } = useWindowSize()
    const { data: session } = useSession()
    const [_, startTransition] = useTransition()

    const organizationSlug = useOrganizationSlug()

    // Get state and actions from the store
    const {
        currentStep,
        progress,
        showConfetti,
        isPending,
        businessType,
        businessName,
        businessDescription,
        logoPreview,
        location,
        address,
        paymentMethod,
        subscriptionPlan,
        teamEmails,
        enableSMS,
        phoneNumber,

        // Actions
        goToNextStep,
        goToPreviousStep,
        setBusinessType,
        setBusinessName,
        setBusinessDescription,
        setLocation,
        setAddress,
        setWarehouseName,
        setImportMethod,
        setPaymentMethod,
        setSubscriptionPlan,
        setTeamEmails,
        setEnableSMS,
        setPhoneNumber,
        handleLogoChange,
        completeOnboarding,
        skipOnboarding,
    } = useOnboardingStore()

    const [isSettingUpProducts, setIsSettingUpProducts] = useState(false)
    const [setupProgress, setSetupProgress] = useState(0)
    const [setupComplete, setSetupComplete] = useState(false)

    const setupProductInventory = async () => {
        setSetupComplete(true)
        // TODO: Hit import endpoint, simple!
        try {
            setIsSettingUpProducts(true)
            setSetupProgress(0)

            const response = await fetch(`${APP_BASE_API_URL}/inventory/import/sync`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    businessName,
                    businessDescription,
                    location,
                    address,
                    phoneNumber,
                    enableSMS,
                }),
            })

            const data = await response.json();
            if (!data.success) throw new Error(data.message);
        } catch (error) {
            console.error("Error setting up product inventory:", error)
            toast.error("Failed to set up product inventory. Please try again.")
            setIsSettingUpProducts(false)
            setSetupProgress(0)
            toast.error("Failed to set up product inventory", {
                description: "Our support team has been notified and will help you complete this step.",
                duration: 5000,
            })
            // Show a retry button or allow continuing
            setTimeout(() => {
                setSetupComplete(true) // Allow user to continue despite error
            }, 2000)
        }
    }

    // Auto-trigger product setup when reaching inventory step
    useEffect(() => {
        if (currentStep === 3 && !isSettingUpProducts && !setupComplete) {
            setupProductInventory()
        }
    }, [currentStep, isSettingUpProducts, setupComplete])

    const handleNext = goToNextStep
    const handlePrevious = goToPreviousStep

    // Handle skip - combines original function with store
    const handleSkip = async () => {
        if (!session?.user?.id) {
            toast.error("Session not found")
            router.push(`/dashboard/${organizationSlug}`)
            return
        }

        // Call our store function for logging
        skipOnboarding(session.user.id)

        toast.info("You can complete your setup anytime from the dashboard", {
            description: "Look for the 'Complete Setup' button in your dashboard",
            duration: 5000,
        })

        router.push(`/dashboard/${organizationSlug}`)
    }

    const handleComplete = async () => {
        await completeOnboarding("userId")

        const response = await fetch(`${APP_BASE_API_URL}/onboarding`, {
            method: "POST",
            body: JSON.stringify({
                businessName,
                businessDescription,
                location,
                address,
            })
        })

        console.log("Served as Cold...", response, "Onboarded!");
    }

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.2,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut",
            },
        },
    }

    return (
        <div className="max-w-3xl mx-auto bg-gradient-to-b from-background to-background/80 flex flex-col">
            {showConfetti && <Confetti width={width} height={height} recycle={false} />}

            {/* Header with progress */}
            <header className="border-b bg-background/95 backdrop-blur-md sticky top-0 z-10 shadow-sm">
                <div className="max-w-3xl flex h-14 items-center justify-between">
                    <div className="flex items-center gap-1">
                        <Badge variant="outline" className="ml-1 h-4 font-light text-xs hidden md:flex py-0 px-1.5">
                            Setup
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden md:block">
                            <div className="flex items-center gap-1">
                                {STEPS.map((step, index) => (
                                    <div key={step.id} className={`flex items-center ${index > 0 ? "ml-0.5" : ""}`}>
                                        {index > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground mx-0.5" />}
                                        <span
                                            className={`text-xs ${currentStep === index
                                                ? "font-medium text-primary"
                                                : currentStep > index
                                                    ? "text-muted-foreground"
                                                    : "text-muted-foreground/50"
                                                }`}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleSkip} className="text-xs">
                            Skip
                        </Button>
                    </div>
                </div>
                <div className="w-full h-0.5">
                    <Progress value={progress} className="h-0.5 rounded-none" />
                </div>
            </header>

            <main className="flex-1 container py-4 md:py-8">
                <div className="max-w-3xl mx-auto">
                    <AnimatePresence mode="wait">
                        {/* Welcome Step */}
                        {currentStep === 0 && (
                            <motion.div
                                key="welcome"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-6"
                            >
                                <motion.div variants={itemVariants} className="text-center space-y-3">
                                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                                        <Zap className="h-8 w-8 text-emerald-600" />
                                    </div>
                                    <h1 className="text-xl font-normal tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                                        Welcome to Alcora
                                    </h1>
                                    <p className="text-muted-foreground max-w-md mx-auto text-sm">
                                        Complete account setup to streamline your business operations.
                                    </p>
                                </motion.div>

                                <motion.div variants={itemVariants} className="flex flex-wrap gap-3 mt-4 justify-center">
                                    <Card className="p-1 border-primary/20 shadow-sm hover:shadow-md transition-shadow flex-1 min-w-0 max-w-[160px]">
                                        <CardContent className="p-1.5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-6 w-6 text-teal-700" />
                                                    <h3 className="font-normal text-sm text-center">Quick Setup</h3>
                                                </div>
                                                <p className="text-xs text-muted-foreground text-center">Complete in minutes</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="p-1 border-primary/20 shadow-sm hover:shadow-md transition-shadow flex-1 min-w-0 max-w-[160px]">
                                        <CardContent className="p-1.5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Smartphone className="h-6 w-6 text-teal-700" />
                                                    <h3 className="font-normal text-sm text-center">Mobile Friendly</h3>
                                                </div>
                                                <p className="text-xs text-muted-foreground text-center">Manage anywhere</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                <motion.div variants={itemVariants} className="flex items-center justify-center gap-1 mt-2">
                                    <Button variant="outline" onClick={handleSkip} className="text-muted-foreground border-slate-400 font-normal text-sm h-8">
                                        Skip for now
                                    </Button>
                                    <Button
                                        size="default"
                                        onClick={handleNext}
                                        className="cursor-pointer h-8 bg-emerald-700 hover:bg-emerald-800 font-normal text-white shadow-md hover:shadow-lg transition-all">
                                        Start Setup
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </motion.div>
                                <div className="max-w-2xl mx-auto">
                                    <TrustMini />
                                </div>
                            </motion.div>
                        )}
                        {/* Business Details Step */}
                        {currentStep === 1 && (
                            <motion.div
                                key="business-details"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-6"
                            >
                                <motion.div variants={itemVariants} className="space-y-1">
                                    <h2 className="text-xl font-light tracking-tight">Tell us about your business</h2>
                                    <p className="text-muted-foreground text-sm">Add your business details and upload your logo.</p>
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="business-name" className="text-sm">
                                            Business Name
                                        </Label>
                                        <Input
                                            id="business-name"
                                            placeholder="e.g., Premium Distributors Ltd"
                                            value={businessName}
                                            onChange={(e) => setBusinessName(e.target.value)}
                                            className="h-9"
                                        />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="business-description" className="text-sm">
                                            Business Description (Optional)
                                        </Label>
                                        <Textarea
                                            id="business-description"
                                            placeholder="Tell us a bit about your business..."
                                            value={businessDescription}
                                            onChange={(e) => setBusinessDescription(e.target.value)}
                                            rows={2}
                                            className="resize-none text-sm"
                                        />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="logo" className="text-sm">
                                            Business Logo
                                        </Label>
                                        <Card className="border-dashed border-2 p-3">
                                            <div className="flex items-center gap-4">
                                                <div className="h-16 w-16 border rounded-md flex items-center justify-center overflow-hidden bg-muted/50 flex-shrink-0">
                                                    {logoPreview ? (
                                                        <Image
                                                            src={logoPreview || "/placeholder.svg"}
                                                            alt="Logo preview"
                                                            width={64}
                                                            height={64}
                                                            className="object-contain"
                                                        />
                                                    ) : (
                                                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="flex-1 w-full">
                                                    <Input
                                                        id="logo"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleLogoChange}
                                                        className="hidden"
                                                    />
                                                    <div className="grid gap-2">
                                                        <Button asChild variant="outline" className="w-full h-9 text-sm">
                                                            <label htmlFor="logo" className="cursor-pointer flex items-center justify-center gap-2">
                                                                <Upload className="h-3 w-3" />
                                                                {logoPreview ? "Change Logo" : "Upload Logo"}
                                                            </label>
                                                        </Button>
                                                        {logoPreview && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    // setLogo(null)
                                                                    // setLogoPreview(null)
                                                                }}
                                                                className="w-full text-destructive hover:text-destructive text-xs h-7"
                                                            >
                                                                <X className="h-3 w-3 mr-1" />
                                                                Remove
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">Square image, min 200x200px, PNG/JPG</p>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="phone-number" className="text-sm">
                                            Phone Number
                                        </Label>
                                        <div className="flex gap-2">
                                            <div className="w-16">
                                                <Input id="country-code" value="+254" disabled className="h-9 bg-muted/50 text-sm" />
                                            </div>
                                            <div className="flex-1">
                                                <Input
                                                    id="phone-number"
                                                    placeholder="712 345 678"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    className="h-9 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <Switch
                                                id="enable-sms"
                                                checked={enableSMS}
                                                onCheckedChange={setEnableSMS}
                                                className="h-4 w-7 data-[state=checked]:bg-primary"
                                            />
                                            <Label htmlFor="enable-sms" className="text-xs cursor-pointer">
                                                Enable SMS & WhatsApp notifications for orders, sales summary, and inventory alerts
                                            </Label>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants} className="flex justify-between pt-3">
                                    <Button variant="outline" onClick={handlePrevious} className="flex items-center gap-1 text-sm h-9">
                                        <ChevronLeft className="h-4 w-4" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleNext}
                                        disabled={!businessName}
                                        className={`text-sm h-9 ${businessName ? "bg-emerald-700 hover:bg-emerald-900 text-white" : ""}`}
                                    >
                                        Continue
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Location Step */}
                        {currentStep === 2 && (
                            <motion.div
                                key="location"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-4"
                            >
                                <motion.div variants={itemVariants} className="space-y-1">
                                    <h2 className="text-xl font-light tracking-tight">Where are you located?</h2>
                                    <p className="text-muted-foreground text-sm">Add your business location and warehouse details.</p>
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-2">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="location" className="text-sm">
                                            City/Town
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="location"
                                                placeholder="e.g., Nairobi"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="h-9 pl-8 text-sm"
                                            />
                                            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="address" className="text-sm">
                                            Business Address
                                        </Label>
                                        <Textarea
                                            id="address"
                                            placeholder="e.g Ruiru, Kamakis"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            rows={2}
                                            className="resize-none text-sm"
                                        />
                                    </div>

                                    {/* 
                                    // TODO: We will let them configure multi-warehouses later 
                                    <Card className="border-primary/20">
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
                                                    <Warehouse className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-sm">Primary Warehouse</h3>
                                                    <p className="text-xs text-muted-foreground">
                                                        This is where your main inventory will be stored
                                                    </p>
                                                </div>
                                            </div>
                                            <Separator className="my-2" />
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="warehouse" className="text-xs">
                                                    Warehouse Name
                                                </Label>
                                                <Input
                                                    id="warehouse"
                                                    placeholder="e.g., Main Warehouse"
                                                    value={warehouseName}
                                                    onChange={(e) => setWarehouseName(e.target.value)}
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card> */}
                                </motion.div>

                                <motion.div
                                    variants={itemVariants}
                                    className="bg-muted/50 rounded-lg p-1.5 flex gap-2 items-start border border-muted"
                                >
                                    <div className="rounded-full outline-none flex-shrink-0">
                                        <MapPin className="h-6 w-6 text-teal-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-normal text-teal-600 text-sm">Why we need your location</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Your location helps us optimize delivery routes and connect you with nearby businesses.
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants} className="flex justify-between pt-3">
                                    <Button variant="outline" onClick={handlePrevious} className="flex items-center gap-1 text-sm h-9">
                                        <ChevronLeft className="h-4 w-4" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleNext}
                                        disabled={!location}
                                        className={`text-sm h-9 ${location ? "bg-emerald-700 hover:bg-emerald-900 text-white" : ""}`}
                                    >
                                        Continue
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Inventory Step */}
                        {currentStep === 3 && (
                            <motion.div
                                key="inventory"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-6"
                            >
                                <motion.div variants={itemVariants} className="flex flex-col justify-center items-center space-y-1">
                                    <h2 className="text-xl font-normal tracking-tight">Setting Up Your Inventory</h2>
                                    <p className="text-muted-foreground text-sm">
                                        We're automatically importing popular products for your business.
                                    </p>
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-6 py-4">
                                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="relative w-20 h-20">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Package className={`h-8 w-8 text-emerald-800 ${setupComplete ? "" : "animate-pulse"}`} />
                                            </div>
                                            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                                                <circle
                                                    className="text-green-500 stroke-current"
                                                    strokeWidth="4"
                                                    fill="transparent"
                                                    r="40"
                                                    cx="50"
                                                    cy="50"
                                                />
                                                <circle
                                                    className="text-emerald-700 stroke-current"
                                                    strokeWidth="4"
                                                    strokeLinecap="round"
                                                    fill="transparent"
                                                    r="40"
                                                    cx="50"
                                                    cy="50"
                                                    strokeDasharray={`${2 * Math.PI * 40}`}
                                                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - setupProgress / 100)}`}
                                                />
                                            </svg>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-lg font-normal">
                                                {setupComplete ? "Setup complete!" : "Setting up your store..."}
                                            </h3>
                                            <p className="text-sm text-muted-foreground max-w-md">
                                                {setupComplete
                                                    ? "We've added the most popular products to your inventory. Customize quantities and prices later."
                                                    : "We're creating products for you from our catalog of 300+ popular liquor products in Kenya."}
                                            </p>
                                        </div>

                                        {!setupComplete && (
                                            <div className="w-full max-w-md space-y-2">
                                                <Progress value={setupProgress} className="h-2" />
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>Importing products...</span>
                                                    <span>{setupProgress}%</span>
                                                </div>
                                            </div>
                                        )}

                                        {setupComplete && (
                                            <div className="bg-muted/50 rounded-lg p-3 max-w-md text-left">
                                                <h4 className="text-lg font-normal flex items-center gap-1.5">
                                                    <Info className="h-4 w-4 text-emerald-600" />
                                                    What's next?
                                                </h4>
                                                <ul className="mt-2 space-y-1">
                                                    <li className="text-sm flex items-start gap-1.5">
                                                        <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
                                                        <span>
                                                            All products have been added with <strong>KES 1</strong> price and <strong>0</strong>{" "}
                                                            quantity
                                                        </span>
                                                    </li>
                                                    <li className="text-sm flex items-start gap-1.5">
                                                        <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
                                                        <span>Update the prices and quantities to reflect your actual inventory</span>
                                                    </li>
                                                    <li className="text-sm flex items-start gap-1.5">
                                                        <AlertCircleIcon className="h-4 w-4 text-teal-900 mt-0.5" />
                                                        <span className="text-teal-900">Products will become available for sale once you set a real price and quantity(Keep qtty as 0 for products you dont have)</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                                {!setupComplete && (
                                    <motion.div
                                        variants={itemVariants}
                                        className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3 items-start"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: setupProgress > 0 && setupProgress < 100 ? 1 : 0 }}
                                    >
                                        <div className="bg-amber-100 p-1.5 rounded-full flex-shrink-0">
                                            <Info className="h-4 w-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-sm text-amber-800">Setting up your inventory</h3>
                                            <p className="text-xs text-amber-700">This may take a moment. Please don't close this window.</p>
                                        </div>
                                    </motion.div>
                                )}

                                <motion.div variants={itemVariants} className="flex justify-between pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={handlePrevious}
                                        className="flex items-center gap-1 text-xs h-8"
                                        disabled={isSettingUpProducts && !setupComplete}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Back
                                    </Button>
                                    {setupComplete ? (
                                        <Button onClick={handleNext} className="bg-emerald-700 hover:bg-emerald-900 text-white text-xs h-8">
                                            Continue
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button
                                            // disabled={true}
                                            className="bg-primary/70 text-white text-xs h-8">
                                            <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                            Setting up...
                                        </Button>
                                    )}
                                </motion.div>
                            </motion.div>
                        )}

                        <div className="max-w-4xl mx-auto">
                            {currentStep === 4 && (
                                <motion.div
                                    key="payment"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="space-y-6">
                                    <motion.div variants={itemVariants} className="space-y-4 max-w-3xl mx-auto">
                                        <SubscriptionPlans
                                            businessType="RETAILER"
                                            onSubscriptionCreated={() => {
                                                console.log("✅ Subscription created successfully!")

                                            }}
                                        />
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="flex justify-between pt-3">
                                        <Button variant="outline" onClick={handlePrevious} className="flex items-center gap-1 text-sm h-9">
                                            <ChevronLeft className="h-4 w-4" />
                                            Back
                                        </Button>
                                        <Button onClick={handleNext} className="bg-emerald-700 hover:bg-emerald-900 text-white text-sm h-9">
                                            Continue
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </motion.div>
                                </motion.div>
                            )}
                        </div>

                        {/* Team Step */}
                        {currentStep === 5 && (
                            <motion.div
                                key="team"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-6"
                            >
                                <motion.div variants={itemVariants} className="space-y-1">
                                    <h2 className="text-xl font-light tracking-tight">Invite Your Team (Can Skip)</h2>
                                    <p className="text-muted-foreground text-sm">
                                        Add team members to collaborate with you on Alcorabooks.
                                    </p>
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-2">
                                    <Card className="border-primary/20 shadow-sm">
                                        <CardContent className="p-2 space-y-2">
                                            <div className="flex items-start gap-2">
                                                <div className="bg-primary/10 p-3 rounded-full flex-shrink-0">
                                                    <Users className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-normal text-sm">Team Collaboration</h3>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Invite team members to help manage your inventory, orders, and more.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid gap-1.5">
                                                <Label htmlFor="team-emails" className="text-sm font-normal">
                                                    Team Member Emails
                                                </Label>
                                                <Textarea
                                                    id="team-emails"
                                                    placeholder="Enter email addresses, separated by commas..."
                                                    value={teamEmails}
                                                    onChange={(e) => setTeamEmails(e.target.value)}
                                                    rows={3}
                                                    className="resize-none text-sm border-gray-100"
                                                />
                                                <p className="text-xs text-green-700">
                                                    Separate multiple email addresses with a comma e.g newliqour@james.com
                                                    <span className="font-semibold mx-1">,</span> joan@gmail.com.
                                                </p>
                                            </div>

                                            <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                                                <h4 className="text-xs font-medium">Team members will be able to:</h4>
                                                <ul className="space-y-1">
                                                    <li className="text-xs flex items-start gap-1.5">
                                                        <CheckCircle className="h-3 w-3 text-primary mt-0.5" />
                                                        <span>View and manage inventory based on their permissions</span>
                                                    </li>
                                                    <li className="text-xs flex items-start gap-1.5">
                                                        <CheckCircle className="h-3 w-3 text-primary mt-0.5" />
                                                        <span>Process orders and generate invoices</span>
                                                    </li>
                                                    <li className="text-xs flex items-start gap-1.5">
                                                        <CheckCircle className="h-3 w-3 text-primary mt-0.5" />
                                                        <span>Access reports and analytics</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="bg-muted/30 px-4 py-2">
                                            <p className="text-xs text-muted-foreground">
                                                You can set specific permissions for each team member after they join.
                                            </p>
                                        </CardFooter>
                                    </Card>
                                </motion.div>

                                <motion.div variants={itemVariants} className="flex justify-between pt-3">
                                    <Button variant="outline" onClick={handlePrevious} className="flex items-center gap-1 text-sm h-9">
                                        <ChevronLeft className="h-4 w-4" />
                                        Back
                                    </Button>
                                    <Button onClick={handleNext} className="bg-emerald-700 hover:bg-emerald-900 text-white text-sm h-9">
                                        Continue
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Complete Step */}
                        {currentStep === 6 && (
                            <motion.div
                                key="complete"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-6"
                            >
                                <motion.div variants={itemVariants} className="text-center space-y-2">
                                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                                        <CheckCircle className="h-8 w-8 text-emerald-600" />
                                    </div>
                                    <h1 className="text-xl font-normal tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                                        You're All Set!
                                    </h1>
                                    <p className="text-muted-foreground max-w-md mx-auto text-xs">
                                        Your account has been successfully set up.
                                    </p>
                                </motion.div>

                                <motion.div variants={itemVariants} className="bg-muted/30 rounded-lg p-4 border border-muted">
                                    <h3 className="font-normal mb-1 text-md">Setup Summary</h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="space-y-0.5">
                                            <span className="text-xs text-muted-foreground">Business Name</span>
                                            <p className="font-normal">{businessName || "Not specified"}</p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <span className="text-xs text-muted-foreground">Location</span>
                                            <p className="font-normal">{location || "Not specified"}</p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <span className="text-xs text-muted-foreground">Subscription Plan</span>
                                            <p className="font-normal capitalize">{subscriptionPlan || "Free Trial"}</p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <span className="text-xs text-muted-foreground">Payment Method</span>
                                            <p className="font-normal capitalize">{paymentMethod || "Not selected"}</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-2">
                                    <h3 className="font-normal text-md">Next Steps</h3>
                                    <div className="grid grid-cols-3 gap-1">
                                        <Card className="p-1.5 border-primary/20 hover:shadow-md transition-shadow">
                                            <CardContent className="p-1.5">
                                                <div className="flex flex-col items-center text-center gap-2">
                                                    <div className="bg-emerald-100 p-2 rounded-full">
                                                        <Package className="h-5 w-5 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-normal text-sm">Manage Inventory</h3>
                                                        <p className="text-xs text-muted-foreground">Update quantity and prices</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="p-1.5 border-primary/20 hover:shadow-md transition-shadow">
                                            <CardContent className="p-1.5">
                                                <div className="flex flex-col items-center text-center gap-1">
                                                    <div className="bg-emerald-100 p-2 rounded-full">
                                                        <Users className="h-5 w-5 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-normal text-sm">Team Setup</h3>
                                                        <p className="text-xs text-muted-foreground">Configure team access further</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="p-1.5 border-primary/20 hover:shadow-md transition-shadow">
                                            <CardContent className="p-1.5">
                                                <div className="flex flex-col items-center text-center gap-1">
                                                    <div className="bg-emerald-100 p-2 rounded-full">
                                                        <Store className="h-5 w-5 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-normal text-sm">Connect Partners</h3>
                                                        <p className="text-xs text-muted-foreground">Find suppliers for online orders</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants} className="flex flex-col items-center gap-2 pt-1">
                                    <Button
                                        size="default"
                                        onClick={handleComplete}
                                        className="w-full max-w-sm h-8 bg-emerald-700 hover:bg-emerald-800 cursor-pointer text-white shadow-md hover:shadow-lg transition-all text-sm"
                                        disabled={isPending}
                                    >
                                        {isPending ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                Setting up your account...
                                            </>
                                        ) : (
                                            <>
                                                Go to Dashboard
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-xs text-muted-foreground">
                                        Need help?{" "}
                                        <a href="#" className="text-primary hover:underline">
                                            Contact our support team
                                        </a>
                                    </p>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    )
}