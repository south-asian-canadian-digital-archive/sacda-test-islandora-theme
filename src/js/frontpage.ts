import { generateIslandoraUrl } from './search.util';

document.addEventListener('DOMContentLoaded', () => {
	const searchInput = document.getElementById('frontSearchInput') as HTMLInputElement;
	const searchButton = document.getElementById('frontSearchButton') as HTMLButtonElement; // Note: This might not be present in the simplified form, but keeping logic.

	if (searchInput) {
		if (searchButton) {
			searchInput.addEventListener('input', () => {
				searchButton.disabled = searchInput.value.trim().length === 0;
			});
		}

		const form = searchInput.closest('form');
		if (form) {
			form.addEventListener('submit', (e) => {
				e.preventDefault();
				const term = searchInput.value.trim();
				if (term) {
					window.location.href = generateIslandoraUrl(term);
				}
			});
		}
	}

	for (const rotator of document.querySelectorAll<HTMLElement>('[data-exhibits-rotator]')) {
		const slides = Array.from(rotator.querySelectorAll<HTMLElement>('[data-exhibits-slide]'));
		if (slides.length < 2) continue;

		const previous = rotator.querySelector<HTMLButtonElement>('[data-exhibits-previous]');
		const next = rotator.querySelector<HTMLButtonElement>('[data-exhibits-next]');
		const pause = rotator.querySelector<HTMLButtonElement>('[data-exhibits-pause]');
		const status = rotator.querySelector<HTMLElement>('[data-exhibits-status]');
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		let active = 0;
		let timer: number | undefined;
		let userPaused = reduceMotion;

		const show = (index: number) => {
			active = (index + slides.length) % slides.length;
			slides.forEach((slide, slideIndex) => {
				slide.hidden = slideIndex !== active;
			});
			if (status) status.textContent = `${active + 1} / ${slides.length}`;
		};

		const stop = () => {
			if (timer !== undefined) window.clearInterval(timer);
			timer = undefined;
		};
		const start = () => {
			stop();
			if (!userPaused) timer = window.setInterval(() => show(active + 1), 7000);
		};

		previous?.addEventListener('click', () => { show(active - 1); start(); });
		next?.addEventListener('click', () => { show(active + 1); start(); });
		pause?.addEventListener('click', () => {
			userPaused = !userPaused;
			pause.setAttribute('aria-pressed', String(userPaused));
			pause.setAttribute('aria-label', userPaused ? 'Resume exhibit rotation' : 'Pause exhibit rotation');
			const icon = pause.querySelector('i');
			icon?.classList.toggle('fa-pause', !userPaused);
			icon?.classList.toggle('fa-play', userPaused);
			userPaused ? stop() : start();
		});
		if (reduceMotion && pause) {
			pause.setAttribute('aria-pressed', 'true');
			pause.setAttribute('aria-label', 'Resume exhibit rotation');
			pause.querySelector('i')?.classList.replace('fa-pause', 'fa-play');
		}
		rotator.addEventListener('mouseenter', stop);
		rotator.addEventListener('mouseleave', start);
		rotator.addEventListener('focusin', stop);
		rotator.addEventListener('focusout', (event) => {
			if (!rotator.contains((event as FocusEvent).relatedTarget as Node | null)) start();
		});
		start();
	}
});

export { };
