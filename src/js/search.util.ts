/**
 * Configuration options for the Islandora search.
 */
interface SearchConfig {
    /** The metadata field to search (default: "all") */
    field?: string;
    /** The comparison operator (default: "IS") */
    operator?: string;
    /** The base domain (default: window.location.origin) */
    baseUrl?: string;
    /** The search path (default: "/search") */
    path?: string;
}

/**
 * Generates a correctly formatted Islandora search URL.
 * @param term - The keyword or phrase to search for.
 * @param config - Optional configuration for field, operator, and base URL.
 * @returns The fully constructed URL string.
 */
export const generateIslandoraUrl = (
    term: string,
    config: SearchConfig = {},
): string => {
    const {
        field = "all",
        operator = "IS",
        baseUrl = typeof window !== "undefined"
            ? window.location.origin
            : "https://islandora.dev",
        path = "/search",
    } = config;

    // specific Islandora/Solr array-based keys
    const params = new URLSearchParams();
    params.append("a[0][f]", field);
    params.append("a[0][i]", operator);
    params.append("a[0][v]", term);

    // Construct the full URL
    // We handle the base URL carefully to avoid double slashes
    const cleanBase = baseUrl.replace(/\/$/, "");
    const url = new URL(`${cleanBase}${path}`);
    url.search = params.toString();

    return url.toString();
};

declare global {
    interface Window {
        sacdaSearch: { generateIslandoraUrl: typeof generateIslandoraUrl };
    }
}

if (typeof window !== "undefined") {
    window.sacdaSearch = { generateIslandoraUrl };
}
