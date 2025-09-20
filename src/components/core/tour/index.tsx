"use client"

import { RetailerTour } from "./retailer-tour"
import { WholesalerTour } from "./wholesaler-tour"
import { DistributorTour } from "./distributor-tour"
import { TourButton } from "./tour-button"

export { RetailerTour, WholesalerTour, DistributorTour, TourButton }

export default function BrewEdgeTour({ role }: { role?: "retailer" | "wholesaler" | "distributor" }) {
    if (role === "wholesaler") {
        return <WholesalerTour />
    } else if (role === "distributor") {
        return <DistributorTour />
    } else {
        return <RetailerTour />
    }
}
