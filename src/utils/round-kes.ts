
/**
 * Rounds a value to the nearest, up, or down step (KES-style).
 * 
 * @param value The numeric value to round
 * @param step The rounding step (default is 5 — good for KES)
 * @param direction 'nearest' | 'up' | 'down'
 * @returns Rounded number
 */
export function roundKES(
    value: number,
    step: number = 5,
    direction: "nearest" | "up" | "down" = "nearest"
): number {

    if (typeof value !== "number" || isNaN(value)) {
        throw new Error("Invalid value. Must be a number.");
    }

    if (typeof step !== "number" || step <= 0) {
        throw new Error("Invalid step. Must be a positive number.");
    }

    switch (direction) {
        case "up":
            return Math.ceil(value / step) * step;
        case "down":
            return Math.floor(value / step) * step;
        case "nearest":
        default:
            return Math.round(value / step) * step;
    }
}

// import { useCurrency } from "@/hooks/useCurrency";
// import { roundKES } from "@/utils/roundKES";
// const saleAmount = 228;
// const customerPrice = roundKES(saleAmount, 10, "up");    // → 230
// const vendorBill = roundKES(saleAmount, 5, "down");       // → 225
// const budgetFigure = roundKES(saleAmount);                // → 230 (default: step=5, nearest)


// const orgSettings = {
//     rounding: {
//       step: 10,
//       direction: "up",
//     },
//   };

//   const total = roundKES(817, orgSettings.rounding.step, orgSettings.rounding.direction); // → 820


// function calculateSellingPrice(
//     buyingPrice: number,
//     brand?: string,
//     category?: string
// ): number {
//     const {
//         defaultMarginRate,
//         brandMarginOverrides,
//         categoryMarginOverrides,
//         minimumMarginRate,
//     } = appConfig.business;

//     let margin = defaultMarginRate;

//     if (brand && brandMarginOverrides[brand]) {
//         margin = brandMarginOverrides[brand];
//     } else if (category && categoryMarginOverrides[category]) {
//         margin = categoryMarginOverrides[category];
//     }

//     // Ensure margin isn't lower than minimum
//     margin = Math.max(margin, minimumMarginRate);

//     const price = buyingPrice * (1 + margin);
//     return roundKES(price, 5, "nearest"); // optional rounding
// }
