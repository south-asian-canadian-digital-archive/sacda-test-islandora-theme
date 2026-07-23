/**
 * Full-panel collapse toggle for the search filters sidebar.
 *
 * The "Filter Results" heading is a single toggle that collapses or expands
 * the entire facet panel. It is used on every page that renders the filters
 * region — the global /search page and collection ("search within") pages.
 *
 * Robustness notes (these come from real breakage):
 *  - Facets refresh via Drupal AJAX and some actions (year-range "Apply",
 *    search-in-results) do a full page reload. So the toggle is wired up as a
 *    `Drupal.behaviors` entry with `once()` and re-attaches after every AJAX
 *    replacement instead of running once on DOMContentLoaded.
 *  - The open/closed choice is persisted in localStorage, so a full reload
 *    after applying a facet restores the user's state instead of snapping back
 *    to the responsive default (which made the panel look like it vanished).
 *  - If the server-rendered `.filters-toggle` button is missing for any reason,
 *    the panel's heading is made clickable as a fallback so the control always
 *    exists wherever the panel does.
 */

declare global {
	interface Window {
		Drupal?: {
			behaviors: Record<string, { attach: (context: Document | HTMLElement) => void }>;
		};
		once?: (id: string, selector: string, context?: Document | HTMLElement) => Element[];
	}
}

const COLLAPSED_CLASS = "filters--collapsed";
const DESKTOP_QUERY = "(min-width: 64rem)"; // Tailwind `lg`
const STORAGE_KEY = "sacdaFiltersCollapsed";

/** Read the persisted choice, or null if the user hasn't chosen yet. */
function storedState(): boolean | null {
	try {
		const v = window.localStorage.getItem(STORAGE_KEY);
		if (v === "true") return true;
		if (v === "false") return false;
	} catch {
		/* localStorage may be unavailable (private mode) — fall through */
	}
	return null;
}

function persistState(collapsed: boolean): void {
	try {
		window.localStorage.setItem(STORAGE_KEY, String(collapsed));
	} catch {
		/* ignore */
	}
}

function applyState(panel: HTMLElement, toggle: HTMLElement, collapsed: boolean): void {
	panel.classList.toggle(COLLAPSED_CLASS, collapsed);
	toggle.setAttribute("aria-expanded", String(!collapsed));
}

function setupPanel(panel: HTMLElement): void {
	// Prefer the server-rendered button; fall back to the heading element so
	// the control still works if the markup differs.
	let toggle = panel.querySelector<HTMLElement>(".filters-toggle");
	if (!toggle) {
		const heading = panel.querySelector<HTMLElement>("h4, .filters-heading");
		if (!heading) return;
		heading.classList.add("filters-toggle");
		heading.setAttribute("role", "button");
		heading.setAttribute("tabindex", "0");
		toggle = heading;
	}

	const desktop = window.matchMedia(DESKTOP_QUERY);

	// Initial state: persisted choice wins; otherwise responsive default
	// (collapsed on mobile, expanded on desktop).
	const stored = storedState();
	applyState(panel, toggle, stored !== null ? stored : !desktop.matches);

	const toggleState = (): void => {
		const collapsed = !panel.classList.contains(COLLAPSED_CLASS);
		applyState(panel, toggle!, collapsed);
		persistState(collapsed);
	};

	toggle.addEventListener("click", toggleState);
	toggle.addEventListener("keydown", (event) => {
		// Only needed for the heading fallback; a real <button> handles these.
		if (toggle!.tagName === "BUTTON") return;
		const key = (event as KeyboardEvent).key;
		if (key === "Enter" || key === " ") {
			event.preventDefault();
			toggleState();
		}
	});

	// Follow the responsive default across breakpoint changes until the user
	// has made an explicit choice.
	desktop.addEventListener("change", (event) => {
		if (storedState() !== null) return;
		applyState(panel, toggle!, !event.matches);
	});
}

function init(context: Document | HTMLElement): void {
	const scope = context || document;
	const selector = ".filters.result-facets";
	const panels: Element[] = window.once
		? window.once("sacdaFiltersPanel", selector, scope)
		: Array.from(scope.querySelectorAll(selector));
	panels.forEach((el) => setupPanel(el as HTMLElement));
}

if (window.Drupal && window.Drupal.behaviors) {
	window.Drupal.behaviors.sacdaFiltersPanel = {
		attach(context) {
			init(context);
		},
	};
} else if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => init(document));
} else {
	init(document);
}

export {};
