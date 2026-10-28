import { BANGLADESH_DISTRICTS_DATA } from "@/lib/locations/data"

/**
 * Standard list of all 64 districts in Bangladesh, sourced from the centralized location dataset.
 */
export const BANGLADESH_DISTRICTS = BANGLADESH_DISTRICTS_DATA.map((d) => d.name).sort()
