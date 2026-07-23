/**
 * Full-panel collapse toggle for the search filters sidebar.
 *
 * The "Filter Results" heading acts as a single toggle that collapses or
 * expands the entire facet panel. On small screens the panel starts
 * collapsed so it doesn't push search results below the fold; on desktop
 * it starts expanded. Crossing the breakpoint re-applies that default
 * until the user has toggled it manually.
 */

const DESKTOP_QUERY = "(min-width: 64rem)"; // Tailwind `lg`
const COLLAPSED_CLASS = "filters--collapsed";

function initFiltersPanel(): void {
	const panel = document.querySelector<HTMLElement>(".filters.result-facets");
	if (!panel) return;

	const toggle = panel.querySelector<HTMLButtonElement>(".filters-toggle");
	if (!toggle) return;

	const setState = (collapsed: boolean): void => {
		panel.classList.toggle(COLLAPSED_CLASS, collapsed);
		toggle.setAttribute("aria-expanded", String(!collapsed));
	};

	const desktop = window.matchMedia(DESKTOP_QUERY);

	// Initial state: collapsed on mobile, expanded on desktop.
	setState(!desktop.matches);

	let userToggled = false;

	toggle.addEventListener("click", () => {
		userToggled = true;
		setState(!panel.classList.contains(COLLAPSED_CLASS));
	});

	// Re-apply the responsive default when the viewport crosses the
	// breakpoint, unless the user has already made a choice.
	desktop.addEventListener("change", (event) => {
		if (userToggled) return;
		setState(!event.matches);
	});
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initFiltersPanel);
} else {
	initFiltersPanel();
}
