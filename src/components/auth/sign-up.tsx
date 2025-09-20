"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "@/lib/zod";
import { Briefcase, CheckCircle2, Eye, EyeOff, Loader2, Package, Store, Truck, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { client, signUp } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

import { motion } from "framer-motion"

const formSchema = z.object({
	firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
	lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
	email: z.string().email({ message: "Please enter a valid email address" }),
	password: z.string().min(8, { message: "Password must be at least 8 characters" }),
	businessType: z.enum(["retailer", "wholesaler", "distributor", "user"]),
})

const BusinessCard = ({
	icon: Icon,
	title,
	description,
	onClick,
	isSelected,
}: {
	icon: React.ElementType
	title: string
	description: string
	onClick: () => void
	isSelected: boolean
}) => (
	<motion.div
		whileHover={{ scale: 1.02 }}
		whileTap={{ scale: 0.98 }}
		className={cn(
			"bg-gradient-to-br rounded-lg shadow-sm p-1.5 cursor-pointer transition-all duration-300 hover:shadow-md border group relative",
			isSelected ? "text-green-700 from-primary/5 to-primary/10 border-2 border-green-600" : "from-background to-muted border-border",
		)}
		onClick={onClick}
	>
		<div className="flex items-center gap-3">
			<div
				className={cn(
					"p-1.5 rounded-full transition-colors duration-300",
					isSelected ? "bg-blue/20" : "bg-muted group-hover:bg-primary/10",
				)}
			>
				<Icon className={cn("w-3 h-3", isSelected ? "text-blue-500" : "text-muted-foreground")} />
			</div>
			<div>
				<h3 className="text-sm font-medium text-foreground">{title}</h3>
				<p className="text-muted-foreground text-xs">{description}</p>
			</div>
			{isSelected && (
				<div className="absolute top-2 right-2">
					<CheckCircle2 className="h-4 w-4 text-green-600" />
				</div>
			)}
		</div>
	</motion.div>
)

export function SignUp() {

	const [accountType, setAccountType] = useState<"user" | "business">("business")
	const [image, setImage] = useState<File | null>(null)
	const [imagePreview, setImagePreview] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const router = useRouter()

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			businessType: "retailer",
		},
	})

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setLoading(true)

		try {
			await signUp.email({
				email: values.email,
				password: values.password,
				name: `${values.firstName} ${values.lastName}`,
				image: image ? await convertImageToBase64(image) : "",
				callbackURL: "/dashboard",
				additionalFields: {
					role: accountType === "user" ? "user" : values.businessType,
				},
				fetchOptions: {
					onResponse: () => {
						setLoading(false)
					},
					onRequest: () => {
						setLoading(true)
					},
					onError: (ctx) => {
						toast.error(ctx.error.message)
					},
					onSuccess: async (response) => {
						try {
							// We'll have the org, channel, and activeOrganizationId
							const { data: session } = await client.getSession()
							console.log("Signup session", session)
							if (session?.organizationSlug) {
								router.push(`/dashboard/${session?.organizationSlug}`)
							} else {
								// TODO: edge cases of failed org creation
								router.push("/dashboard/default-workspace")
							}
						} catch (mutationError) {
							toast.error("An unexpected error occurred.")
							setLoading(false)
						}
					},
				},
			})
		} catch (error) {
			console.error("Signup error:", error)
			toast.error("Failed to create account. Please try again.")
			setLoading(false)
		}
	}

	return (
		<div className="flex min-h-screen bg-background">
			<div className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-6 mx-auto max-w-xl">
				<div className="w-full">
					<div className="text-center mb-4">
						<h2 className="text-2xl font-light text-foreground">Create an Account</h2>
						<p className="mt-1 text-sm text-muted-foreground">Choose your account type to get started</p>
					</div>

					<div className="grid gap-5">
						<div className="grid grid-cols-2 gap-3">
							<Button
								onClick={() => {
									setAccountType("user")
									form.setValue("businessType", "user")
								}}
								variant={accountType === "user" ? "default" : "outline"}
								className="h-auto py-2"
								size="sm"
							>
								<User className="mr-2 h-4 w-4" />
								<span>Regular User</span>
							</Button>
							<Button
								onClick={() => setAccountType("business")}
								variant={accountType === "business" ? "default" : "outline"}
								className="h-auto py-2"
								size="sm"
							>
								<Briefcase className="mr-2 h-4 w-4" />
								<span>Business</span>
							</Button>
						</div>

						{accountType === "business" && (
							<div>
								<h3 className="text-sm font-medium mb-2">Select Business Type</h3>
								<Form {...form}>
									<FormField
										control={form.control}
										name="businessType"
										render={({ field }) => (
											<FormItem className="space-y-2">
												<div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
													<BusinessCard
														icon={Store}
														title="Retailer"
														description="End consumers only"
														onClick={() => field.onChange("retailer")}
														isSelected={field.value === "retailer"}
													/>
													<BusinessCard
														icon={Package}
														title="Wholesaler"
														description="Wholesale & retail"
														onClick={() => field.onChange("wholesaler")}
														isSelected={field.value === "wholesaler"}
													/>
													<BusinessCard
														icon={Truck}
														title="Distributor"
														description="Large distribution capabilities"
														onClick={() => field.onChange("distributor")}
														isSelected={field.value === "distributor"}
													/>
												</div>
												<div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md p-2 text-xs text-amber-800 dark:text-amber-300">
													<span className="font-medium">Tip:</span> If you do both wholesale and retail, select
													wholesaler role for better pricing options.
												</div>
												<FormMessage />
											</FormItem>
										)}
									/>
								</Form>
							</div>
						)}

						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
								<div className="grid grid-cols-2 gap-3">
									<FormField
										control={form.control}
										name="firstName"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-xs">First name</FormLabel>
												<FormControl>
													<Input placeholder="John" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="lastName"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-xs">Last name</FormLabel>
												<FormControl>
													<Input placeholder="Doe" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-xs">Email</FormLabel>
											<FormControl>
												<Input type="email" placeholder="you@example.com" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-xs">Password</FormLabel>
											<FormControl>
												<div className="relative">
													<Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
														onClick={() => setShowPassword(!showPassword)}
													>
														{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
														<span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
													</Button>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button type="submit" className="w-full" disabled={loading}>
									{loading ? (
										<div className="flex items-center justify-center gap-2">
											<Loader2 size={16} className="animate-spin" />
											<span>Creating account...</span>
										</div>
									) : (
										"Create account"
									)}
								</Button>

								<div className="text-center">
									<p className="text-xs text-muted-foreground">
										Already have an account?{" "}
										<Link href="/sign-in" className="font-medium text-primary hover:underline">
											Sign in
										</Link>
									</p>
								</div>
							</form>
						</Form>
					</div>
				</div>
			</div>
		</div>
	)
}

async function convertImageToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onloadend = () => resolve(reader.result as string)
		reader.onerror = reject
		reader.readAsDataURL(file)
	})
}
