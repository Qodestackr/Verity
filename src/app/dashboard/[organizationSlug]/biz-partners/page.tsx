"use client"

import { useCurrency } from "@/hooks/useCurrency";
import { PartnerManagement } from "@/components/partner-manager/partner-management"

export default function PartnerManagementPage() {
  return (
    <div className="w-full">
      <PartnerManagement />
    </div>
  )
}
