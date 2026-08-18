/**
 * Per-section "Show more" progressive reveal for the /about/team listing.
 *
 * The team view renders every member (no pager) and this trims the initial
 * view down, so the page opens at a readable length without losing the
 * grouping or forcing a round-trip per page.
 *
 * Each .team-group (built by includes/team.inc — SASI, Advisory Committee, …)
 * is collapsed and revealed on its OWN button. A single listing-wide button
 * was worse than it sounds: with ~28 SASI members ahead of it, the Advisory
 * Committee heading only appeared after three clicks, so the page looked like
 * it had one section.
 *
 * Why JS-side hiding rather than CSS or a Views pager:
 *  - Progressive enhancement: with JS off, every member is already in the DOM
 *    and visible. Nothing is hidden until we know we can un-hide it, and the
 *    buttons are created here rather than in Twig so there's never a dead
 *    control on the page.
 *  - A group short enough to fit gets no button at all, rather than a disabled
 *    one.
 *
 * Note: Drupal core ships an unlayered `.hidden { display: none }` that beats
 * layered Tailwind utilities, so visibility is toggled with that class and the
 * `hidden` attribute rather than a utility class.
 */

declare global {
	interface Window {
		Drupal?: {
			behaviors: Record<string, { attach: (context: Document | HTMLElement) => void }>;
			t?: (s: string) => string;
		};
		once?: (id: string, selector: string, context?: Document | HTMLElement) => Element[];
	}
}

/** One desktop row is visible per group before any interaction. */
const INITIAL_VISIBLE = 4;
/** Reveal one additional desktop row per click. */
const STEP = 4;

function t(s: string): string {
	return window.Drupal?.t ? window.Drupal.t(s) : s;
}

function setHidden(el: HTMLElement, hidden: boolean): void {
	el.classList.toggle("hidden", hidden);
	if (hidden) {
		el.setAttribute("hidden", "");
	} else {
		el.removeAttribute("hidden");
	}
}

function initGroup(group: HTMLElement): void {
	const grid = group.querySelector<HTMLElement>(".team-members-grid");
	if (!grid) {
		return;
	}

	const cards = Array.from(grid.children) as HTMLElement[];
	const total = cards.length;

	// Nothing to collapse — leave the DOM untouched and add no button.
	if (total <= INITIAL_VISIBLE) {
		return;
	}

	let visible = INITIAL_VISIBLE;

	const button = document.createElement("button");
	button.type = "button";
	button.className = "team-show-more btn btn-outline";

	// Several buttons read identically ("Show more (12)") to a screen reader
	// unless each names its own section.
	const heading = group.querySelector<HTMLElement>(".team-group__heading");
	const section = heading?.textContent?.trim();

	const wrapper = document.createElement("div");
	wrapper.className = "team-show-more__wrapper";
	wrapper.appendChild(button);
	group.appendChild(wrapper);

	const render = (): void => {
		cards.forEach((card, i) => setHidden(card, i >= visible));

		const remaining = total - visible;
		if (remaining > 0) {
			button.textContent = `${t("Show more")} (${remaining})`;
			if (section) {
				button.setAttribute("aria-label", `${t("Show more")} — ${section} (${remaining})`);
			}
			setHidden(wrapper, false);
		} else {
			setHidden(wrapper, true);
		}
	};

	button.addEventListener("click", () => {
		const firstNewIndex = visible;
		visible = Math.min(visible + STEP, total);
		render();

		// Move focus to the first newly revealed card so keyboard and screen
		// reader users land on the new content instead of a vanished button.
		const card = cards[firstNewIndex];
		if (card) {
			card.setAttribute("tabindex", "-1");
			card.focus({ preventScroll: true });
		}
	});

	render();
}

function init(container: HTMLElement): void {
	const groups = Array.from(container.querySelectorAll<HTMLElement>(".team-group"));

	// Ungrouped listing (includes/team.inc found no team_group values) — treat
	// the container itself as the single group.
	for (const group of groups.length ? groups : [container]) {
		initGroup(group);
	}
}

const behavior = {
	attach(context: Document | HTMLElement): void {
		const targets = window.once
			? window.once("sacdaTeamShowMore", ".team-listing", context)
			: Array.from((context as Document).querySelectorAll(".team-listing"));

		for (const el of targets) {
			init(el as HTMLElement);
		}
	},
};

if (window.Drupal) {
	window.Drupal.behaviors.sacdaTeamShowMore = behavior;
} else {
	document.addEventListener("DOMContentLoaded", () => behavior.attach(document));
}

export {};
