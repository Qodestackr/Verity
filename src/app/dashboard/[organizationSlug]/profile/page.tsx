import { useCurrency } from "@/hooks/useCurrency";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AccountSwitcher from "@/components/auth/account-switch";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Building2, ShieldCheck, BadgeDollarSign } from "lucide-react";
import { UserManagement } from "@/components/auth/user-management";
import UserCard from "@/components/auth/user-card";
import { OrganizationCard } from "@/components/auth/organization-card";
import { CurrentSubscription } from "@/components/subscriptions/current-subscription"

export default async function DashboardProfile() {
    const [session, activeSessions, deviceSessions, organization,/**subscriptions*/] =
        await Promise.all([
            auth.api.getSession({
                headers: await headers(),
            }),
            auth.api.listSessions({
                headers: await headers(),
            }),
            auth.api.listDeviceSessions({
                headers: await headers(),
            }),
            auth.api.getFullOrganization({
                headers: await headers(),
            }),
            // auth.api.listActiveSubscriptions({
            // 	headers: await headers(),
            // }),
        ]).catch((e) => {
            console.log("ERROR IN PROFILE PAGE", e);
            throw redirect("/sign-in");
        });

    if (!session) {

    }

    return (
        <div className="max-w-4xl mx-auto mt-2">
            <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-3">
                    <TabsTrigger value="account" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Account Settings</span>
                    </TabsTrigger>
                    <TabsTrigger value="business" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>Business Units</span>
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="flex items-center gap-2">
                        <BadgeDollarSign className="h-4 w-4" />
                        <span>Billing</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="account" className="space-y-2">
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-light flex items-center gap-1">
                                <User className="h-5 w-5 text-primary" />
                                Personal Account
                            </h2>
                            <div className="bg-primary/10 px-3 py-1 rounded-full text-xs font-medium text-primary flex items-center gap-1">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Account Settings
                            </div>
                        </div>

                        <AccountSwitcher
                            sessions={JSON.parse(JSON.stringify(deviceSessions))}
                        />

                        <div className="grid gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-primary" />
                                    <h3 className="text-sm font-medium">User Profile</h3>
                                </div>
                                <UserCard
                                    session={JSON.parse(JSON.stringify(session))}
                                    activeSessions={JSON.parse(JSON.stringify(activeSessions))}
                                // subscription={subscriptions.find(
                                // 	(sub) => sub.status === "active" || sub.status === "trialing",
                                // )}
                                />
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="business" className="space-y-4">
                    <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-normal flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-teal-600" />
                                Organization Management
                            </h2>
                            <div className="bg-primary/10 px-3 py-1 rounded-full text-xs font-medium text-primary flex items-center gap-1">
                                <Building2 className="h-3.5 w-3.5" />
                                Business Settings
                            </div>
                        </div>

                        <OrganizationCard
                            session={JSON.parse(JSON.stringify(session))}
                            activeOrganization={JSON.parse(JSON.stringify(organization))}
                        />
                    </div>
                    <UserManagement />
                </TabsContent>

                <TabsContent value="billing" className="space-y-4">
                    <div className="max-w-4xl mx-auto py-6">
                        <div className="mb-6">
                            <h1 className="text-2xl font-normal tracking-tight">Subscription & Billing</h1>
                            <p className="mt-2 text-muted-foreground">Manage your subscription and billing information</p>
                        </div>

                        <CurrentSubscription />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}