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

    const isVisibleElement = (element: HTMLElement): boolean => {
        if (
            element.classList.contains("hidden") ||
            element.classList.contains("facet-hidden")
        ) {
            return false;
        }

        const style = window.getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden") {
            return false;
        }

        return element.getClientRects().length > 0;
    };

    const hasVisibleFilters = (container: Element): boolean => {
        const facetBlocks = Array.from(
            container.querySelectorAll<HTMLElement>(".block-facet--links"),
        );
        if (facetBlocks.length > 0) {
            return facetBlocks.some(isVisibleElement);
        }

        return Array.from(container.children).some((child) => {
            if (!(child instanceof HTMLElement)) {
                return false;
            }
            return isVisibleElement(child);
        });
    };

    const updateFiltersVisibility = () => {
        const sidebars = Array.from(
            document.querySelectorAll<HTMLElement>(".filters-sidebar"),
        );
        sidebars.forEach((sidebar) => {
            const content = sidebar.querySelector(".filters-content");
            if (!content) {
                return;
            }

            const layout = sidebar.closest<HTMLElement>(
                ".content-children-layout",
            );
            const hasVisible = hasVisibleFilters(content);

            sidebar.classList.toggle("filters-sidebar--hidden", !hasVisible);
            sidebar.setAttribute("aria-hidden", hasVisible ? "false" : "true");

            if (layout) {
                layout.classList.toggle("filters-empty", !hasVisible);
            }
        });
    };

    let updateScheduled = false;
    const scheduleUpdate = () => {
        if (updateScheduled) {
            return;
        }

        updateScheduled = true;
        window.requestAnimationFrame(() => {
            updateScheduled = false;
            updateFiltersVisibility();
        });
    };

    window.addEventListener("DOMContentLoaded", () => {
        scheduleUpdate();

        const filterContainers = Array.from(
            document.querySelectorAll(".filters-content"),
        );
        if (filterContainers.length === 0) {
            return;
        }

        const observer = new MutationObserver(() => scheduleUpdate());
        filterContainers.forEach((container) => {
            observer.observe(container, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ["class", "style", "hidden"],
            });
        });
    });
}
