"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "@/lib/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { client, signIn } from "@/lib/auth-client"
import { toast } from "sonner"

const formSchema = z.object({
	email: z.string().email({ message: "Please enter a valid email address" }),
	password: z.string().min(1, { message: "Password is required" }),
	rememberMe: z.boolean().optional(),
})

export default function SignIn() {
	const [loading, setLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const router = useRouter()

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
			rememberMe: true,
		},
	})

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setLoading(true)
		await signIn.email(
			{
				email: values.email,
				password: values.password,
				rememberMe: true,
				fetchOptions: {
					onSuccess: async (response) => {
						try {
							// We'll have the org, channel, and activeOrganizationId
							const { data: session } = await client.getSession()
							if (session?.organizationSlug) {
								router.push(`/dashboard/${session?.organizationSlug}`)
							} else {
								// TODO: error edge cases
								router.push("/dashboard/default-workspace")
							}
						} catch (mutationError) {
							toast.error("An unexpected error occurred.")
							setLoading(false)
						}
					},
					onError: (ctx) => {
						console.log("SignIn Error Context", ctx)
						// Handle the error
						if (ctx.error.status === 403) {
							toast("Please verify your email address")
						}
						//you can also show the original error message
						toast(ctx.error.message)
					},
				},
			},
		)
		setLoading(false)
	}

	return (
		<Card className="w-full max-w-md mx-auto shadow-lg border dark:border-slate-800">
			<CardHeader>
				<CardTitle className="text-xl">Sign In</CardTitle>
				<CardDescription>Sign in to your account</CardDescription>
			</CardHeader>

			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input type="email" placeholder="awesomeliqour@company.com" {...field} />
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
									<div className="flex items-center justify-between">
										<FormLabel>Password</FormLabel>
										<Link href="/forget-password" className="text-xs text-primary hover:underline">
											Forgot your password?
										</Link>
									</div>
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

						<FormField
							control={form.control}
							name="rememberMe"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center space-x-3 space-y-0">
									<FormControl>
										<Checkbox checked={field.value} onCheckedChange={field.onChange} />
									</FormControl>
									<FormLabel className="text-sm font-normal">Remember me</FormLabel>
								</FormItem>
							)}
						/>

						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? (
								<div className="flex items-center justify-center gap-2">
									<Loader2 size={16} className="animate-spin" />
									<span>Signing in...</span>
								</div>
							) : (
								"Sign in"
							)}
						</Button>
					</form>
				</Form>

				<div className="relative my-6">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-card px-2 text-muted-foreground">Or continue with</span>
					</div>
				</div>

				<div className="grid gap-3">
					<Button
						variant="outline"
						className="w-full gap-2"
						onClick={async () => {
							await signIn.social({
								provider: "google",
								callbackURL: "/dashboard",
							})
						}}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="0.98em" height="1em" viewBox="0 0 256 262">
							<path
								fill="#4285F4"
								d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
							></path>
							<path
								fill="#34A853"
								d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
							></path>
							<path
								fill="#FBBC05"
								d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
							></path>
							<path
								fill="#EB4335"
								d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
							></path>
						</svg>
						Sign in with Google
					</Button>
					<Button
						variant="outline"
						className="w-full gap-2"
						onClick={async () => {
							await signIn.social({
								provider: "microsoft",
								callbackURL: "/dashboard",
							})
						}}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
							<path fill="currentColor" d="M2 3h9v9H2zm9 19H2v-9h9zM21 3v9h-9V3zm0 19h-9v-9h9z"></path>
						</svg>
						Sign in with Microsoft
					</Button>
				</div>
			</CardContent>

			<CardFooter className="flex flex-col space-y-4 border-t pt-6">
				<div className="text-center text-sm">
					Don't have an account?{" "}
					<Link href="/sign-up" className="font-medium text-primary hover:underline">
						Sign up
					</Link>
				</div>
			</CardFooter>
		</Card>
	)
}
