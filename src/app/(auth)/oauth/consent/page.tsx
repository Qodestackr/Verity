"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConsentPage() {
    const clientName = 'client_name'//searchParams.get("client_name") || "Unknown App";
    const [loading, setLoading] = useState(false);

    const handleConsent = async (granted: boolean) => {
        setLoading(true);
        try {
            // TODO: Implement consent submission to BetterAuth
            console.log("User consent:", granted);
            console.error("Consent error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="max-w-md w-full shadow-lg">
                <CardHeader>
                    <CardTitle>{clientName} Requests Access</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-700 mb-4">
                        {clientName} wants to access your account. Do you approve?
                    </p>
                    <div className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={() => handleConsent(false)}
                            disabled={loading}
                        >
                            Deny
                        </Button>
                        <Button
                            onClick={() => handleConsent(true)}
                            disabled={loading}
                        >
                            Approve
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
