"use client"

import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { organization, useListOrganizations, useSession } from "@/lib/auth-client"
import type { ActiveOrganization, Session } from "@/lib/auth-types"
import { LucideBuilding2, PlusIcon, Trash2 } from "lucide-react"
import {
	Loader2,
	MailPlus,
	X,
	Users,
	Shield,
	Building2,
	Store,
	MapPin,
	Briefcase,
	AlertTriangle,
	UserPlus,
	ChevronRight,
	Info
} from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { AnimatePresence, motion } from "framer-motion"
import CopyButton from "@/components/ui/copy-button"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import EmptyState from "../ui/empty-state"

export function OrganizationCard(props: {

	session: Session | null
	activeOrganization: ActiveOrganization | null
}) {
	const organizations = useListOrganizations()

	const [optimisticOrg, setOptimisticOrg] = useState<ActiveOrganization | null>(props.activeOrganization)
	const [isRevoking, setIsRevoking] = useState<string[]>([])
	const [activeTab, setActiveTab] = useState<string>("members")

	const inviteVariants = {
		hidden: { opacity: 0, height: 0 },
		visible: { opacity: 1, height: "auto" },
		exit: { opacity: 0, height: 0 },
	}

	const { data } = useSession()
	const session = data || props.session

	const currentMember = optimisticOrg?.members.find((member) => member.userId === session?.user.id)

	// Business unit type icons
	const getBusinessUnitIcon = (name: string, metadata?: any) => {
		// First check metadata if available
		if (metadata?.type) {
			const type = metadata.type;
			if (type === 'wholesale') return <Building2 className="h-4 w-4" />
			if (type === 'retail') return <Store className="h-4 w-4" />
			if (type === 'regional') return <MapPin className="h-4 w-4" />
			if (type === 'brand') return <Briefcase className="h-4 w-4" />
			if (type === 'special') return <Users className="h-4 w-4" />
		}

		if (!name) return <Briefcase className="h-4 w-4" />

		const nameLower = name.toLowerCase()
		if (nameLower.includes("wholesale") || nameLower.includes("b2b")) {
			return <Building2 className="h-4 w-4" />
		} else if (nameLower.includes("retail") || nameLower.includes("consumer")) {
			return <Store className="h-4 w-4" />
		} else if (nameLower.includes("regional") || nameLower.includes("area")) {
			return <MapPin className="h-4 w-4" />
		} else {
			return <Briefcase className="h-4 w-4" />
		}
	}

	return (
		<Card className="shadow-sm">
			<CardHeader className="pb-2 pt-4 px-4 space-y-1">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg flex items-center gap-1.5">
						<Building2 className="h-4 w-4 text-primary" />
						Business Units
					</CardTitle>

					<div className="flex items-center gap-2">
						{organizations.data && (
							<Badge
								variant="outline"
								className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800 text-xs whitespace-nowrap h-5"
							>
								{organizations.data.length}/5 units
							</Badge>
						)}

						<CreateOrganizationDialog />
					</div>
				</div>

				<p className="text-xs text-muted-foreground">Manage your distribution channels and sales operations</p>
			</CardHeader>

			<CardContent className="p-0">
				{/* Business Units List */}
				<div className="px-4 pb-3 space-y-1">
					<div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2 ml-1">
						<Info className="h-3.5 w-3.5" />
						Select a unit to manage its team and settings
					</div>
					{/* <BusinessUnitCard
						isPersonal={true}
						isActive={!optimisticOrg?.id}
						name="My Shop"
						description="Your individual retail workspace"
						icon={<Shield className="h-4 w-4" />}
						memberCount={1}
						onClick={() => {
							organization.setActive({
								organizationId: null,
							})
							setOptimisticOrg(null)
						}}
					/> */}

					{organizations?.data?.length > 0 ? (
						organizations?.data.map((org) => (
							<BusinessUnitCard
								key={org.id}
								isActive={optimisticOrg?.id === org.id}
								name={org.name}
								logo={`${org?.logo}`}
								description={getBusinessUnitDescription(org.metadata?.type)}
								icon={getBusinessUnitIcon(org.name, org.metadata)}
								memberCount={
									optimisticOrg?.id === org.id
										? optimisticOrg.members.length
										: undefined
								}
								onClick={async () => {
									if (org.id === optimisticOrg?.id) return;

									setOptimisticOrg({
										members: [],
										invitations: [],
										...org,
									});

									const { data } = await organization.setActive({
										organizationId: org.id,
									});

									setOptimisticOrg(data);
								}}
							/>
						))
					) : (
						<EmptyState
							title={"No business units yet"}
							description="Click New Unit to get started"
							icon={<LucideBuilding2 />}
						/>
					)}

				</div>

				{/* Active Unit Details */}
				{optimisticOrg?.id && (
					<div className="border-t border-slate-200 dark:border-slate-800 mt-1">
						<div className="px-4 pt-3 pb-1">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<h3 className="text-sm font-medium">Active Unit Details</h3>
									{optimisticOrg?.members.length > 0 && (
										<Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs h-5">
											{optimisticOrg?.members.length} {optimisticOrg?.members.length === 1 ? 'member' : 'members'}
										</Badge>
									)}
								</div>

								{currentMember?.role === "owner" && <DeleteOrganizationDialog optimisticOrg={optimisticOrg} />}
							</div>

							<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-3">
								<TabsList className="w-full grid grid-cols-2 h-8">
									<TabsTrigger value="members" className="text-xs flex items-center gap-1.5 h-7">
										<Users className="h-3.5 w-3.5" />
										Members
									</TabsTrigger>
									<TabsTrigger value="invites" className="text-xs flex items-center gap-1.5 h-7">
										<MailPlus className="h-3.5 w-3.5" />
										Invites
									</TabsTrigger>
								</TabsList>

								<TabsContent value="members" className="pt-3 space-y-2">
									{optimisticOrg.members.length > 0 ? (
										<ScrollArea className="h-[200px] pr-3">
											{optimisticOrg?.members.map((member) => (
												<div
													key={member.id}
													className="flex justify-between items-center p-2 rounded-md hover:bg-muted/40 transition-colors mb-1.5 border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
												>
													<div className="flex items-center gap-2">
														<Avatar className="w-8 h-8 border border-slate-200 dark:border-slate-700">
															<AvatarImage src={member.user.image || undefined} className="object-cover" />
															<AvatarFallback className="bg-primary/10 text-primary text-xs">
																{member.user.name?.charAt(0)}
															</AvatarFallback>
														</Avatar>
														<div>
															<div className="flex items-center gap-1.5">
																<p className="text-sm font-medium line-clamp-1">{member.user.name}</p>
																{member.userId === session?.user.id && (
																	<Badge variant="outline" className="text-xs h-4 bg-muted px-1">
																		You
																	</Badge>
																)}
															</div>
															<div className="flex items-center gap-1.5">
																<Badge
																	variant="outline"
																	className={`text-xs py-0 h-4 ${member.role === "owner"
																		? "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30"
																		: member.role === "admin"
																			? "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30"
																			: "text-muted-foreground"
																		}`}
																>
																	{member.role.charAt(0).toUpperCase() + member.role.slice(1)}
																</Badge>
																<p className="text-xs text-muted-foreground line-clamp-1">{member.user.email}</p>
															</div>
														</div>
													</div>

													{member.role !== "owner" &&
														(currentMember?.role === "owner" || currentMember?.role === "admin") && (
															<Button
																size="sm"
																variant="ghost"
																className="text-destructive hover:bg-destructive/10 hover:text-destructive p-1 h-7 w-7"
																onClick={() => {
																	organization.removeMember({
																		memberIdOrEmail: member.id,
																	})
																}}
																title="Remove member"
															>
																<X className="h-3.5 w-3.5" />
															</Button>
														)}
												</div>
											))}
										</ScrollArea>
									) : (
										<div className="flex flex-col items-center justify-center py-6 text-center">
											<div className="rounded-full bg-muted h-10 w-10 flex items-center justify-center mb-2">
												<Users className="h-5 w-5 text-muted-foreground" />
											</div>
											<h3 className="text-sm font-medium">No Team Members Yet</h3>
											<p className="text-xs text-muted-foreground mt-0.5 max-w-xs">
												Invite team members to collaborate in your Business Unit
											</p>
										</div>
									)}
								</TabsContent>

								<TabsContent value="invites" className="pt-3 space-y-2">
									{optimisticOrg?.invitations.filter((i) => i.status === "pending").length > 0 ? (
										<ScrollArea className="h-[200px] pr-3">
											<AnimatePresence>
												{optimisticOrg?.invitations
													.filter((invitation) => invitation.status === "pending")
													.map((invitation) => (
														<motion.div
															key={invitation.id}
															className="flex items-center justify-between p-2 rounded-md hover:bg-muted/40 transition-colors mb-1.5 border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
															variants={inviteVariants}
															initial="hidden"
															animate="visible"
															exit="exit"
															layout
														>
															<div>
																<p className="text-sm font-medium line-clamp-1">{invitation.email}</p>
																<div className="flex items-center gap-1.5">
																	<Badge
																		variant="outline"
																		className="text-xs py-0 h-4 bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800"
																	>
																		Pending
																	</Badge>
																	<p className="text-xs text-muted-foreground">
																		{invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
																	</p>
																</div>
															</div>
															<div className="flex items-center gap-1.5">
																<Button
																	disabled={isRevoking.includes(invitation.id)}
																	size="sm"
																	variant="ghost"
																	className="text-destructive hover:bg-destructive/10 hover:text-destructive h-7 text-xs"
																	onClick={() => {
																		organization.cancelInvitation(
																			{
																				invitationId: invitation.id,
																			},
																			{
																				onRequest: () => {
																					setIsRevoking([...isRevoking, invitation.id])
																				},
																				onSuccess: () => {
																					toast.success("Invitation revoked")
																					setIsRevoking(isRevoking.filter((id) => id !== invitation.id))
																					setOptimisticOrg({
																						...optimisticOrg,
																						invitations: optimisticOrg?.invitations.filter(
																							(inv) => inv.id !== invitation.id,
																						),
																					})
																				},
																				onError: (ctx) => {
																					toast.error(ctx.error.message)
																					setIsRevoking(isRevoking.filter((id) => id !== invitation.id))
																				},
																			},
																		)
																	}}
																>
																	{isRevoking.includes(invitation.id) ? (
																		<Loader2 className="animate-spin" size={14} />
																	) : (
																		"Revoke"
																	)}
																</Button>
																<CopyButton
																	textToCopy={`${window.location.origin}/accept-invitation/${invitation.id}`} />
															</div>
														</motion.div>
													))}
											</AnimatePresence>
										</ScrollArea>
									) : (
										<div className="flex flex-col items-center justify-center py-6 text-center">
											<div className="rounded-full bg-muted h-10 w-10 flex items-center justify-center mb-2">
												<MailPlus className="h-5 w-5 text-muted-foreground" />
											</div>
											<h3 className="text-sm font-medium">No Active Invitations</h3>
											<p className="text-xs text-muted-foreground mt-0.5 max-w-xs">
												Invite team members to collaborate in your Business Unit
											</p>
										</div>
									)}
								</TabsContent>
							</Tabs>
						</div>

						<div className="px-4 pb-4 pt-2">
							<InviteMemberDialog setOptimisticOrg={setOptimisticOrg} optimisticOrg={optimisticOrg} />
						</div>
					</div>
				)}

				{/* Personal Workspace Details */}
				{/* {!optimisticOrg?.id && (
					<div className="border-t border-slate-200 dark:border-slate-800 mt-1">
						<div className="px-4 pt-3 pb-4">
							<div className="p-3 rounded-md bg-muted/30 mb-3 border">
								<div className="flex items-start gap-3">
									<div className="h-8 w-8 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0">
										<Shield className="h-4 w-4" />
									</div>
									<div>
										<h3 className="text-sm font-medium">My Shop</h3>
										<p className="text-xs text-muted-foreground">
											This is your default outlet. Create additional Business Units for other branches or teams.
										</p>
									</div>
								</div>
							</div>

							<div>
								<div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/40 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800">
									<Avatar className="w-8 h-8 border border-slate-200 dark:border-slate-700">
										<AvatarImage src={session?.user.image || undefined} className="object-cover" />
										<AvatarFallback className="bg-primary/10 text-primary">
											{session?.user.name?.charAt(0)}
										</AvatarFallback>
									</Avatar>
									<div>
										<p className="text-sm font-medium">{session?.user.name}</p>
										<div className="flex items-center gap-1.5">
											<Badge
												variant="outline"
												className="text-xs py-0 h-4 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30"
											>
												Owner
											</Badge>
											<p className="text-xs text-muted-foreground line-clamp-1">{session?.user.email}</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)} */}
			</CardContent>
		</Card>
	)
}

function getBusinessUnitDescription(type?: string) {
	if (!type) return "Team workspace";

	switch (type) {
		case 'wholesale':
			return "B2B distribution channel";
		case 'retail':
			return "Consumer sales channel";
		case 'regional':
			return "Geographic sales area";
		case 'brand':
			return "Product portfolio unit";
		case 'special':
			return "Key accounts channel";
		default:
			return "Business Unit";
	}
}

function BusinessUnitCard({
	isPersonal = false,
	isActive = false,
	name,
	description,
	logo,
	icon,
	memberCount,
	onClick,
}: {
	isPersonal?: boolean
	isActive?: boolean
	name: string
	description?: string
	logo?: string
	icon?: React.ReactNode
	memberCount?: number
	onClick: () => void
}) {
	return (
		<motion.div
			whileHover={{ scale: 1.01 }}
			transition={{ duration: 0.15 }}
			className={`relative rounded-md border ${isActive
				? "border-primary bg-primary/5 shadow-sm dark:bg-primary/10"
				: "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
				} overflow-hidden cursor-pointer`}
			onClick={onClick}
		>
			{isActive && <div className="absolute top-0 left-0 w-1 h-full bg-primary" />}

			<div className="flex items-center p-2 gap-3">
				<Avatar className="h-8 w-8 rounded-md border border-slate-200 dark:border-slate-700 flex-shrink-0">
					<AvatarImage src={logo || undefined} className="object-cover" />
					<AvatarFallback
						className={`rounded-md ${isPersonal ? "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400" : "bg-primary/10 text-primary"}`}
					>
						{icon || name.charAt(0)}
					</AvatarFallback>
				</Avatar>

				<div className="min-w-0 flex-1">
					<div className="flex items-center justify-between">
						<h3 className="font-medium text-sm truncate">{name}</h3>
						{isActive && (
							<Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs py-0 h-5 ml-1.5">
								Active
							</Badge>
						)}
					</div>

					<div className="flex items-center justify-between gap-2 mt-0.5">
						<p className="text-xs text-muted-foreground truncate">{description}</p>
						{memberCount !== undefined && (
							<Badge variant="outline" className="text-xs py-0 h-4 px-1.5 flex-shrink-0">
								{memberCount} {memberCount === 1 ? "member" : "members"}
							</Badge>
						)}
					</div>
				</div>

				<ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
			</div>
		</motion.div>
	)
}

function CreateOrganizationDialog() {
	const [name, setName] = useState("")
	const [slug, setSlug] = useState("")
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState(false)
	const [isSlugEdited, setIsSlugEdited] = useState(false)
	const [logo, setLogo] = useState<string | null>(null)
	const [businessType, setBusinessType] = useState("wholesale")

	useEffect(() => {
		if (!isSlugEdited) {
			const generatedSlug = name.trim().toLowerCase().replace(/\s+/g, "-")
			setSlug(generatedSlug)
		}
	}, [name, isSlugEdited])

	useEffect(() => {
		if (open) {
			setName("")
			setSlug("")
			setIsSlugEdited(false)
			setLogo(null)
			setBusinessType("wholesale")
		}
	}, [open])

	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0]
			const reader = new FileReader()
			reader.onloadend = () => {
				setLogo(reader.result as string)
			}
			reader.readAsDataURL(file)
		}
	}

	const businessTypes = [
		{
			value: "wholesale",
			label: "Wholesale Distribution",
			icon: <Building2 className="h-3.5 w-3.5 mr-1.5" />,
			description: "For B2B sales to retailers",
		},
		{
			value: "retail",
			label: "Retail Operations",
			icon: <Store className="h-3.5 w-3.5 mr-1.5" />,
			description: "For direct consumer sales",
		},
		{
			value: "regional",
			label: "Regional Distribution",
			icon: <MapPin className="h-3.5 w-3.5 mr-1.5" />,
			description: "For geographic-specific operations",
		},
		{
			value: "brand",
			label: "Brand Portfolio",
			icon: <Briefcase className="h-3.5 w-3.5 mr-1.5" />,
			description: "For separate product categories",
		},
		{
			value: "special",
			label: "Special Accounts",
			icon: <Users className="h-3.5 w-3.5 mr-1.5" />,
			description: "For key clients and VIPs",
		},
	]

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm" className="gap-1.5 h-8 text-xs" variant="default">
					<PlusIcon className="h-3.5 w-3.5" />
					New Unit
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px] overflow-y-auto">
				<ScrollArea className="h-[85vh] px-4">
					<DialogHeader className="space-y-1">
						<DialogTitle>Create Business Unit</DialogTitle>
						<DialogDescription className="text-xs">
							Set up a new distribution channel or operational unit for your business.
						</DialogDescription>
					</DialogHeader>

					<div className="flex flex-col gap-4 py-2">
						<div className="space-y-1.5">
							<Label className="text-sm">Unit Type</Label>
							<div className="grid grid-cols-1 gap-1">
								{businessTypes.map((type) => (
									<div
										key={type.value}
										className={`flex items-start p-2 rounded-md border cursor-pointer transition-all ${businessType === type.value ? "border-primary bg-primary/5 shadow-sm" : "hover:border-primary/30"
											}`}
										onClick={() => setBusinessType(type.value)}
									>
										<div
											className={`mr-3 mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center ${businessType === type.value ? "border-primary" : "border-muted-foreground"
												}`}
										>
											{businessType === type.value && <div className="h-2 w-2 rounded-full bg-primary" />}
										</div>
										<div>
											<div className="flex items-center">
												{type.icon}
												<span className="text-sm font-medium">{type.label}</span>
											</div>
											<p className="text-xs text-muted-foreground">{type.description}</p>
										</div>
									</div>
								))}
							</div>
						</div>
						<div className="space-y-1">
							<div className="space-y-1.5">
								<Label htmlFor="unit-name" className="text-sm">Business Unit Name</Label>
								<Input
									id="unit-name"
									placeholder="e.g., Nairobi Wholesale"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="h-9"
								/>
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="unit-slug" className="text-sm">Unit Slug</Label>
								<div className="flex items-center gap-2">
									<Input
										id="unit-slug"
										value={slug}
										onChange={(e) => {
											setSlug(e.target.value)
											setIsSlugEdited(true)
										}}
										placeholder="nairobi-wholesale"
										className="font-mono text-xs h-9"
									/>
								</div>
								<p className="text-xs text-muted-foreground">Used in URLs and API references</p>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="unit-logo" className="text-sm">Logo</Label>
								<div className="flex items-center gap-3">
									{logo ? (
										<div className="relative h-14 w-14">
											<Image
												src={logo || "/placeholder.svg"}
												alt="Logo preview"
												className="object-cover rounded-md border"
												width={56}
												height={56}
											/>
											<Button
												variant="ghost"
												size="icon"
												className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-background border shadow-sm hover:bg-muted p-0"
												onClick={(e) => {
													e.stopPropagation()
													setLogo(null)
												}}
											>
												<X className="h-3 w-3" />
											</Button>
										</div>
									) : (
										<div className="h-14 w-14 border rounded-md flex items-center justify-center bg-muted flex-shrink-0">
											<PlusIcon className="h-5 w-5 text-muted-foreground" />
										</div>
									)}
									<div className="flex-1">
										<Input id="unit-logo" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
										<Button variant="outline" className="w-full h-9 text-sm" asChild>
											<label htmlFor="unit-logo" className="cursor-pointer">
												{logo ? "Change Logo" : "Upload Logo"}
											</label>
										</Button>
										<p className="text-xs text-muted-foreground mt-1">Square image, PNG or JPG format</p>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="flex justify-between items-center">
						<Button variant="outline" size="sm" onClick={() => setOpen(false)} className="h-8 text-xs">
							Cancel
						</Button>
						<Button
							size="sm"
							disabled={loading || !name.trim()}
							onClick={async () => {
								setLoading(true)
								await organization.create(
									{
										name: name,
										slug: slug,
										logo: logo || undefined,
										metadata: { type: businessType },
									},
									{
										onResponse: () => {
											setLoading(false)
										},
										onSuccess: () => {
											toast.success("Business unit created successfully")
											setOpen(false)
										},
										onError: (error) => {
											toast.error(error.error.message)
											setLoading(false)
										},
									},
								)
							}}
							className="h-8 text-xs"
						>
							{loading ? <Loader2 className="animate-spin mr-1.5" size={14} /> : <>Create Business Unit</>}
						</Button>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	)
}

function InviteMemberDialog({
	setOptimisticOrg,
	optimisticOrg,
}: {
	setOptimisticOrg: (org: ActiveOrganization | null) => void
	optimisticOrg: ActiveOrganization | null
}) {
	const [open, setOpen] = useState(false)
	const [email, setEmail] = useState("")
	const [role, setRole] = useState("member")
	const [loading, setLoading] = useState(false)

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild className="flex justify-end">
				<Button
					size="sm"
					className="gap-1.5 text-xs h-8"
					variant="default"
				>
					<UserPlus size={14} />
					Invite Team Member
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader className="space-y-1">
					<DialogTitle>Invite Team Member</DialogTitle>
					<DialogDescription className="text-xs">
						Add a team member to your Business Unit.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-3 py-2">
					<div className="space-y-1.5">
						<Label htmlFor="member-email" className="text-sm">Email Address</Label>
						<Input
							id="member-email"
							placeholder="colleague@example.com"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="h-9"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="member-role" className="text-sm">Role</Label>
						<Select value={role} onValueChange={setRole}>
							<SelectTrigger id="member-role" className="h-9">
								<SelectValue placeholder="Select a role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="admin" className="flex items-center gap-2">
									<div className="flex items-center gap-2">
										<Shield className="h-3.5 w-3.5 text-blue-600" />
										<span className="text-sm">Admin</span>
									</div>
								</SelectItem>
								<SelectItem value="member" className="flex items-center gap-2">
									<div className="flex items-center gap-2">
										<Users className="h-3.5 w-3.5 text-slate-600" />
										<span className="text-sm">Member</span>
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
						<p className="text-xs text-muted-foreground">
							{role === "admin"
								? "Admins can manage members and settings"
								: "Members can view and use the Business Unit"}
						</p>
					</div>
				</div>
				<DialogFooter className="flex items-center justify-between sm:justify-end gap-2">
					<Button variant="outline" size="sm" onClick={() => setOpen(false)} className="h-8 text-xs">
						Cancel
					</Button>
					<Button
						size="sm"
						disabled={loading || !email.trim()}
						onClick={async () => {
							setLoading(true)
							try {
								const invite = organization.inviteMember({
									email: email,
									role: role as "member",
									fetchOptions: {
										throw: true,
										onSuccess: (ctx) => {
											if (optimisticOrg) {
												setOptimisticOrg({
													...optimisticOrg,
													invitations: [...(optimisticOrg?.invitations || []), ctx.data],
												})
											}
											setOpen(false)
										},
									},
								})
								toast.promise(invite, {
									loading: "Sending invitation...",
									success: "Team member invited successfully",
									error: (error) => error.error.message,
								})
							} finally {
								setLoading(false)
							}
						}}
						className="h-8 text-xs"
					>
						{loading ? <Loader2 className="animate-spin mr-1.5" size={14} /> : <>Send Invitation</>}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

function DeleteOrganizationDialog({
	optimisticOrg,
}: {
	optimisticOrg: ActiveOrganization | null
}) {
	const [open, setOpen] = useState(false)
	const [confirmText, setConfirmText] = useState("")
	const [loading, setLoading] = useState(false)

	const handleDelete = async () => {
		if (!optimisticOrg || confirmText !== optimisticOrg.name) return

		setLoading(true)
		try {
			await organization.delete({
				organizationId: optimisticOrg.id,
			})

			toast.success("Business Unit deleted successfully")
			setOpen(false)
		} catch (error: any) {
			toast.error(error.message || "Failed to delete business unit")
		} finally {
			setLoading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					size="sm"
					variant="outline"
					className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 h-7 text-xs px-2 gap-1"
				>
					<Trash2 size={14} />
					Delete
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-destructive">
						<AlertTriangle className="h-4 w-4" />
						Delete Business Unit
					</DialogTitle>
					<DialogDescription className="text-xs">
						This action cannot be undone. This will permanently delete the business unit and all its associated data.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-3 py-2">
					<div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 text-sm">
						<p className="font-medium text-destructive mb-1.5 text-sm">Warning:</p>
						<ul className="list-disc pl-4 space-y-0.5 text-destructive/90 text-xs">
							<li>All team members will lose access</li>
							<li>All data associated with this unit will be deleted</li>
							<li>This action is permanent and cannot be reversed</li>
						</ul>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="confirm-delete" className="text-sm">
							To confirm, type <span className="font-semibold">{optimisticOrg?.name}</span>:
						</Label>
						<Input
							id="confirm-delete"
							placeholder={`Type "${optimisticOrg?.name}" to confirm`}
							value={confirmText}
							onChange={(e) => setConfirmText(e.target.value)}
							className={confirmText === optimisticOrg?.name ? "border-destructive" : ""}
						/>
					</div>
				</div>
				<DialogFooter className="flex items-center justify-between sm:justify-end gap-2">
					<Button variant="outline" size="sm" onClick={() => setOpen(false)} className="h-8 text-xs">
						Cancel
					</Button>
					<Button
						variant="destructive"
						size="sm"
						disabled={loading || confirmText !== optimisticOrg?.name}
						onClick={handleDelete}
						className="h-8 text-xs"
					>
						{loading ? <Loader2 className="animate-spin mr-1.5" size={14} /> : <>Permanently Delete</>}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}