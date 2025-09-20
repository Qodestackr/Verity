import { useCurrency } from "@/hooks/useCurrency";
import { StockReceivingForm } from "@/components/orders/stock-receiving"

export default function StockReceivingPage() {
  return (
    <div className="container py-6">
      <StockReceivingForm />
    </div>
  )
}

