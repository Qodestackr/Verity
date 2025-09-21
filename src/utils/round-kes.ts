
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
