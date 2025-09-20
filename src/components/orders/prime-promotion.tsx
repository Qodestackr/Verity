import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

export function PrimePromotion() {

    return (
        <div className="px-4 mt-3 py-3 border-b flex justify-between items-center">
            <p className="text-sm">Start saving on every order with Prime</p>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full text-xs bg-indigo-100 border-indigo-200 text-indigo-700 hover:bg-indigo-200"
                >
                    Try for free
                </Button>
                <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Star className="text-blue-600 font-light h-7 w-7" />
                </div>
            </div>
        </div>
    )
}
