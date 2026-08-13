/**
 * "Read more" expansion for team member bios on /about/team.
 *
 * The card template used to hard-truncate the bio at 180 characters, which cut
 * most bios mid-sentence with no way to read the rest. The full text is now
 * rendered and this clamps it visually instead, so:
 *  - with JS off the whole bio is readable (nothing is hidden until we know we
 *    can un-hide it, same contract as team-show-more.ts), and
 *  - the grid still opens at a uniform card height.
 *
 * Clamping is by line count rather than characters so every card is trimmed to
 * the same *height* regardless of how the text wraps.
 *
 * The toggle is only added to bios that actually overflow — a two-line bio gets
 * no dead control. Overflow can't always be measured on first attach: cards
 * start hidden behind team-show-more.ts's initial collapse, and web fonts land
 * later. A ResizeObserver re-measures whenever a bio changes size, which covers
 * reveal, font swap and viewport resize alike.
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

function t(s: string): string {
	return window.Drupal?.t ? window.Drupal.t(s) : s;
}

/** Sub-pixel line-height rounding makes an exact comparison flap. */
const OVERFLOW_SLOP = 2;

function isOverflowing(text: HTMLElement): boolean {
	return text.scrollHeight - text.clientHeight > OVERFLOW_SLOP;
}

let idCounter = 0;

/** The toggle needs something to point `aria-controls` at. */
function ensureId(text: HTMLElement): string {
	if (!text.id) {
		text.id = `team-bio-${++idCounter}`;
	}
	return text.id;
}

function init(bio: HTMLElement): void {
	const text = bio.querySelector<HTMLElement>(".team-member-card__bio-text");
	if (!text) {
		return;
	}

	let button: HTMLButtonElement | null = null;
	let expanded = false;

	const setExpanded = (next: boolean): void => {
		expanded = next;
		text.classList.toggle("is-clamped", !expanded);
		if (button) {
			button.textContent = expanded ? t("Read less") : t("Read more");
			button.setAttribute("aria-expanded", expanded ? "true" : "false");
		}
	};

	const ensureButton = (): void => {
		if (button) {
			return;
		}
		button = document.createElement("button");
		button.type = "button";
		button.className = "team-member-card__bio-toggle";
		button.setAttribute("aria-controls", ensureId(text));
		button.addEventListener("click", () => setExpanded(!expanded));
		bio.appendChild(button);
		setExpanded(expanded);
	};

	const measure = (): void => {
		// While expanded the text is unclamped and never overflows, so there is
		// nothing to re-measure — and hiding the button would strand the reader
		// in an open bio with no way to close it.
		if (expanded) {
			return;
		}

		text.classList.add("is-clamped");
		if (isOverflowing(text)) {
			ensureButton();
			button!.hidden = false;
		} else if (button) {
			button.hidden = true;
		}
	};

	measure();

	if (typeof ResizeObserver !== "undefined") {
		new ResizeObserver(() => measure()).observe(text);
	}
}

const behavior = {
	attach(context: Document | HTMLElement): void {
		const targets = window.once
			? window.once("sacdaTeamBioReadMore", ".team-member-card__bio", context)
			: Array.from((context as Document).querySelectorAll(".team-member-card__bio"));

		for (const el of targets) {
			init(el as HTMLElement);
		}
	},
};

if (window.Drupal) {
	window.Drupal.behaviors.sacdaTeamBioReadMore = behavior;
} else {
	document.addEventListener("DOMContentLoaded", () => behavior.attach(document));
}

export {};
