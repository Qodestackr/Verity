"use client"

import { useState } from "react"
import {
    Store,
    QrCode,
    Share2,
    Phone,
    ShoppingBag,
    Settings,
    ArrowRight,
    Check,
    Copy,
    Download,
    Smartphone,
    Clock,
    Truck,
    Loader2,
    EyeIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"
import Link from "next/link"
import { nanoid } from "nanoid"
import { useOrganizationSlug } from "@/hooks/use-organization-slug"
import { Separator } from "@/components/ui/separator"

interface ShopConfig {
    isActive: boolean
    shopName: string
    welcomeMessage: string
    phoneNumber: string
    deliveryOptions: {
        pickup: boolean
        delivery: boolean
    }
    operatingHours: string
    bannerImage: string | null
    shopCode: string
}

export function WhatsAppShopSetup() {

    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("setup")
    const [shopConfig, setShopConfig] = useState<ShopConfig>({
        isActive: false,
        shopName: "Century House",
        welcomeMessage: "Welcome to our shop! Browse our products and place your order directly through WhatsApp.",
        phoneNumber: "+254700112233",
        deliveryOptions: {
            pickup: true,
            delivery: true,
        },
        operatingHours: "24/7", // We need dark stores to fulfill orders in odd hrs, borrowed drop shipping?
        bannerImage: null,
        shopCode: nanoid(),
    })

    const [copied, setCopied] = useState(false)
    const [showQRDialog, setShowQRDialog] = useState(false)
    const [isShopCreated, setIsShopCreated] = useState(false)

    const organizationSlug = useOrganizationSlug()

    const handleInputChange = (field: keyof ShopConfig, value: any) => {
        setShopConfig((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleDeliveryOptionChange = (option: "pickup" | "delivery", value: boolean) => {
        setShopConfig((prev) => ({
            ...prev,
            deliveryOptions: {
                ...prev.deliveryOptions,
                [option]: value,
            },
        }))
    }

    const handleSaveConfig = async () => {
        setIsLoading(true)

        // Validate required fields
        if (!shopConfig.shopName || !shopConfig.phoneNumber) {
            toast.error("Missing information", {
                description: "Please fill in all required fields"
            })
            setIsLoading(false)
            return
        }

        // Simulate API call to save configuration
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500))

            // Success
            toast.success("Shop configured successfully", {
                description: "Your WhatsApp shop is now ready to share with customers",
            })

            setIsShopCreated(true)
            setActiveTab("share")
        } catch (error) {
            toast.error("Error saving configuration", {
                description: "Please try again later"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleActivateShop = async (active: boolean) => {
        setIsLoading(true)

        try {
            await new Promise((resolve) => setTimeout(resolve, 800))

            setShopConfig((prev) => ({
                ...prev,
                isActive: active,
            }))

            toast(active ? "Shop activated" : "Shop deactivated", {
                description: active
                    ? "Your WhatsApp shop is now live and accepting orders"
                    : "Your WhatsApp shop is now offline",
            })
        } catch (error) {
            toast.error("Error updating shop status", {
                description: "Please try again later"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        toast("Copied to clipboard", {
            description: "Share this link with your customers"
        })

        setTimeout(() => setCopied(false), 2000)
    }

    const shopUrl = `https://alcorabooks.com/shop/${shopConfig.shopCode}`
    const whatsappMessage = `/connect me to ${shopConfig.shopName}`

    const downloadQRCode = () => {
        const canvas = document.getElementById("shop-qr-code") as HTMLCanvasElement
        if (!canvas) return

        const url = canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.download = `${shopConfig.shopName.replace(/\s+/g, "-").toLowerCase()}-qr-code.png`
        link.href = url
        link.click()
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-normal tracking-tight">WhatsApp Shop</h1>
                    <p className="text-muted-foreground text-sm">Configure your WhatsApp shop to sell directly to customers</p>
                </div>

                {isShopCreated && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground mr-2">Shop Status:</span>
                        <Switch checked={shopConfig.isActive} onCheckedChange={handleActivateShop} disabled={isLoading} />
                        <span className={cn("text-sm font-medium", shopConfig.isActive ? "text-emerald-600" : "text-slate-500")}>
                            {shopConfig.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                )}
            </div>

            <Card className="border-emerald-100 dark:border-emerald-900/30 shadow-md">
                <CardHeader className="bg-gradient-to-r py-2.5 from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/20 border-b border-emerald-100 dark:border-emerald-900/30">
                    <CardTitle className="flex items-center font-light gap-1 text-emerald-800 dark:text-emerald-400">
                        <Smartphone className="h-5 w-5" />
                        WhatsApp Shop Configuration
                    </CardTitle>
                    <CardDescription className="text-xs">Connect your inventory to WhatsApp and start selling directly through chat</CardDescription>
                </CardHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-3 w-full rounded-none border-b">
                        <TabsTrigger
                            value="setup"
                            disabled={isLoading}
                            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-700"
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            Setup
                        </TabsTrigger>
                        <TabsTrigger
                            value="inventory"
                            disabled={isLoading || !isShopCreated}
                            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-700"
                        >
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Inventory
                        </TabsTrigger>
                        <TabsTrigger
                            value="share"
                            disabled={isLoading || !isShopCreated}
                            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-700"
                        >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="setup" className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="shop-name">
                                        Current Shop Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="shop-name"
                                        placeholder="Change if you wish"
                                        value={shopConfig.shopName}
                                        onChange={(e) => handleInputChange("shopName", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone-number">
                                        WhatsApp Number <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone-number"
                                            className="pl-10"
                                            placeholder="+254 7XX XXX XXX"
                                            value={shopConfig.phoneNumber}
                                            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">This number must be registered with WhatsApp Business</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="operating-hours">Operating Hours</Label>
                                    <Input
                                        id="operating-hours"
                                        placeholder="e.g. Mon-Fri: 9AM-5PM, Sat: 10AM-3PM"
                                        value={shopConfig.operatingHours}
                                        onChange={(e) => handleInputChange("operatingHours", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="welcome-message">Welcome Message</Label>
                                    <Textarea
                                        id="welcome-message"
                                        placeholder="Enter a welcome message for your customers"
                                        rows={4}
                                        value={shopConfig.welcomeMessage}
                                        onChange={(e) => handleInputChange("welcomeMessage", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Delivery Options</Label>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Truck className="h-4 w-4 text-muted-foreground" />
                                                <span>Delivery</span>
                                            </div>
                                            <Switch
                                                checked={shopConfig.deliveryOptions.delivery}
                                                onCheckedChange={(checked) => handleDeliveryOptionChange("delivery", checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Store className="h-4 w-4 text-muted-foreground" />
                                                <span>Pickup</span>
                                            </div>
                                            <Switch
                                                checked={shopConfig.deliveryOptions.pickup}
                                                onCheckedChange={(checked) => handleDeliveryOptionChange("pickup", checked)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-2 justify-end">
                            <Link href={`/dashboard/${organizationSlug}/shop/whatsapp-shop/preview`}>
                                <Button className="bg-emerald-800 hover:bg-emerald-950 h-7 text-xs font-light cursor-pointer flex justify-between items-center gap-1">
                                    <EyeIcon />
                                    WhatsApp Preview
                                </Button>
                            </Link>
                            <Button onClick={handleSaveConfig} disabled={isLoading} className="bg-emerald-700 h-7 text-xs font-light hover:bg-emerald-800">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        Save Configuration
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="inventory" className="p-6">
                        <div className="space-y-6">
                            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-300">
                                <h3 className="text-sm font-medium flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Automatic Inventory Sync
                                </h3>
                                <p className="text-xs mt-1">
                                    Your WhatsApp shop will auto sync with your Alcora inventory. Any changes to products, prices, or
                                    stock levels in your POS will be reflected in your WhatsApp shop.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-medium">Inventory Settings</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="product-limit">Product Limit</Label>
                                        <Select defaultValue="all">
                                            <SelectTrigger id="product-limit">
                                                <SelectValue placeholder="Select product limit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Products</SelectItem>
                                                <SelectItem value="50">Top 50 Products</SelectItem>
                                                <SelectItem value="100">Top 100 Products</SelectItem>
                                                {/* <SelectItem value="custom">Custom Selection</SelectItem> */}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Control how many products are available in your WhatsApp shop
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="out-of-stock">Out of Stock Products</Label>
                                        <Select defaultValue="hide">
                                            <SelectTrigger id="out-of-stock">
                                                <SelectValue placeholder="Handle out of stock products" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="show">Show as "Out of Stock"</SelectItem>
                                                <SelectItem value="hide">Hide Completely</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">Choose how to handle products that are out of stock</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button onClick={() => setActiveTab("share")} className="bg-emerald-700 hover:bg-emerald-800">
                                    Continue to Share
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="share" className="p-6">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="border-emerald-100 dark:border-emerald-900/30">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <QrCode className="h-4 w-4" />
                                            Shop QR Code
                                        </CardTitle>
                                        <CardDescription>Customers can scan this QR code to access your shop</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col items-center justify-center pt-4">
                                        <div className="bg-white p-4 rounded-md">
                                            <QRCodeSVG
                                                id="shop-qr-code"
                                                value={shopUrl}
                                                size={180}
                                                bgColor={"#ffffff"}
                                                fgColor={"#065f46"}
                                                level={"M"}
                                                includeMargin={false}
                                            />
                                        </div>
                                        <div className="mt-4 text-center">
                                            <p className="text-xs text-muted-foreground mb-1">
                                                Shop Code: <span className="font-mono">{shopConfig.shopCode}</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Message: <span className="font-mono">{whatsappMessage}</span>
                                            </p>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setShowQRDialog(true)}>
                                            <QrCode className="mr-2 h-4 w-4" />
                                            View Full Size
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={downloadQRCode}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </Button>
                                    </CardFooter>
                                </Card>

                                <Card className="border-emerald-100 dark:border-emerald-900/30">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Share2 className="h-4 w-4" />
                                            Share Your Shop
                                        </CardTitle>
                                        <CardDescription>Share your shop link with customers</CardDescription>
                                        <Link href={`/dashboard/${organizationSlug}/shop/whatsapp-shop/preview`}>
                                            <Button className="bg-emerald-900 hover:bg-emerald-950 h-7 text-xs font-light cursor-pointer flex justify-between items-center gap-1">
                                                <EyeIcon />
                                                WhatsApp Preview
                                            </Button>
                                        </Link>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="shop-link">Shop Link</Label>
                                            <div className="flex">
                                                <Input id="shop-link" value={shopUrl} readOnly className="rounded-r-none font-mono text-xs" />
                                                <Button
                                                    onClick={() => copyToClipboard(shopUrl)}
                                                    className={cn(
                                                        "rounded-l-none px-3",
                                                        copied ? "bg-emerald-700" : "bg-slate-200 hover:bg-slate-300 text-slate-700",
                                                    )}
                                                >
                                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="whatsapp-message">WhatsApp Connection Message</Label>
                                            <div className="flex">
                                                <Input
                                                    id="whatsapp-message"
                                                    value={whatsappMessage}
                                                    readOnly
                                                    className="rounded-r-none font-mono text-xs"
                                                />
                                                <Button
                                                    onClick={() => copyToClipboard(whatsappMessage)}
                                                    className="rounded-l-none px-3 bg-slate-200 hover:bg-slate-300 text-slate-700"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Customers will send this message to connect to your shop
                                            </p>
                                        </div>

                                        <Separator className="my-4" />

                                        <div className="space-y-2">
                                            <Label>Share Directly</Label>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" className="flex-1">
                                                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="#25D366">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                    </svg>
                                                    WhatsApp
                                                </Button>
                                                <Button variant="outline" size="sm" className="flex-1">
                                                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
                                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                    </svg>
                                                    Facebook
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900/50 border rounded-md p-4 mt-6">
                                <h3 className="text-sm font-medium mb-2">Next Steps</h3>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2 text-sm">
                                        <Check className="h-4 w-4 text-emerald-600 mt-0.5" />
                                        <span>Print your QR code and display it in your store</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm">
                                        <Check className="h-4 w-4 text-emerald-600 mt-0.5" />
                                        <span>Share your shop link on social media and with your customers</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm">
                                        <Check className="h-4 w-4 text-emerald-600 mt-0.5" />
                                        <span>Make sure your WhatsApp Business app is set up to receive orders</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </Card>

            <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Shop QR Code</DialogTitle>
                        <DialogDescription>Print this QR code or save it to share with your customers</DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-4">
                        <div className="bg-white p-6 rounded-md">
                            <QRCodeSVG
                                value={shopUrl}
                                size={250}
                                bgColor={"#ffffff"}
                                fgColor={"#065f46"}
                                level={"M"}
                                includeMargin={true}
                            />
                        </div>
                    </div>
                    <div className="text-center space-y-1 mb-4">
                        <p className="text-sm font-medium">{shopConfig.shopName}</p>
                        <p className="text-xs text-muted-foreground">Shop Code: {shopConfig.shopCode}</p>
                        <p className="text-xs text-muted-foreground">Scan to browse and order</p>
                    </div>
                    <DialogFooter className="flex justify-center sm:justify-between">
                        <Button variant="outline" onClick={() => setShowQRDialog(false)}>
                            Close
                        </Button>
                        <Button onClick={downloadQRCode} className="bg-emerald-700 hover:bg-emerald-800">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
