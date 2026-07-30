/**
 * "Show more" progressive reveal for the /about/team listing.
 *
 * The team view renders every member (no pager) and this trims the initial
 * view down, so the page opens at a readable length without losing the
 * grouping or forcing a round-trip per page.
 *
 * Why JS-side hiding rather than CSS or a Views pager:
 *  - Progressive enhancement: with JS off, every member is already in the DOM
 *    and visible. Nothing is hidden until we know we can un-hide it, and the
 *    button is created here rather than in Twig so there's never a dead
 *    control on the page.
 *  - The listing is several grids (one per team group, built by
 *    includes/team.inc). Cards are revealed in document order across all of
 *    them, and a group whose cards are all still hidden has its heading hidden
 *    too — otherwise you get a heading floating above an empty grid.
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

/** Cards visible before any interaction. */
const INITIAL_VISIBLE = 8;
/** Additional cards revealed per click. */
const STEP = 8;

function t(s: string): string {
	return window.Drupal?.t ? window.Drupal.t(s) : s;
}

/**
 * A group heading plus the grid it introduces.
 *
 * The heading is a sibling of the grid, not a parent, so they have to be
 * paired up by walking the container.
 */
interface Group {
	heading: HTMLElement | null;
	cards: HTMLElement[];
}

function collectGroups(container: HTMLElement): Group[] {
	const groups: Group[] = [];
	let heading: HTMLElement | null = null;

	for (const child of Array.from(container.children) as HTMLElement[]) {
		if (child.classList.contains("team-group__heading")) {
			heading = child;
			continue;
		}
		if (child.classList.contains("team-members-grid")) {
			groups.push({
				heading,
				cards: Array.from(child.children) as HTMLElement[],
			});
			heading = null;
		}
	}
	return groups;
}

function setHidden(el: HTMLElement, hidden: boolean): void {
	el.classList.toggle("hidden", hidden);
	if (hidden) {
		el.setAttribute("hidden", "");
	} else {
		el.removeAttribute("hidden");
	}
}

function init(container: HTMLElement): void {
	const groups = collectGroups(container);
	const total = groups.reduce((n, g) => n + g.cards.length, 0);

	// Nothing to collapse — leave the DOM untouched and add no button.
	if (total <= INITIAL_VISIBLE) {
		return;
	}

	let visible = INITIAL_VISIBLE;

	const button = document.createElement("button");
	button.type = "button";
	button.className = "team-show-more btn btn-outline";

	const wrapper = document.createElement("div");
	wrapper.className = "team-show-more__wrapper";
	wrapper.appendChild(button);
	container.appendChild(wrapper);

	const render = (): void => {
		let seen = 0;

		for (const group of groups) {
			let anyVisible = false;

			for (const card of group.cards) {
				const show = seen < visible;
				setHidden(card, !show);
				if (show) {
					anyVisible = true;
				}
				seen++;
			}

			// Don't leave a heading stranded above a fully hidden grid.
			if (group.heading) {
				setHidden(group.heading, !anyVisible);
			}
			const grid = group.cards[0]?.parentElement as HTMLElement | undefined;
			if (grid) {
				setHidden(grid, !anyVisible);
			}
		}

		const remaining = total - visible;
		if (remaining > 0) {
			button.textContent = `${t("Show more")} (${remaining})`;
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
		let seen = 0;
		for (const group of groups) {
			for (const card of group.cards) {
				if (seen === firstNewIndex) {
					card.setAttribute("tabindex", "-1");
					card.focus({ preventScroll: true });
					return;
				}
				seen++;
			}
		}
	});

	render();
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
