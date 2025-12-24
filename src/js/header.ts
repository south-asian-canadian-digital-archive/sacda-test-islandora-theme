/**
 * @file
 * GSAP-powered scroll-driven header animation (Vercel-style).
 * Uses ScrollTrigger to interpolate header shrink/expand based on scroll position.
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ============================================
// CONFIGURATION - ADJUST THESE VALUES
// ============================================
const CONFIG = {
	// How many pixels to scroll before animation completes
	scrollDistance: 100,

	// Container padding when collapsed (CSS value)
	collapsedPaddingY: "0.05rem",

	// Container height when collapsed (CSS value, e.g. "50px" or "auto")
	collapsedHeight: "60px",

	// Logo scale when collapsed (1 = 100%, 0.65 = 65%)
	logoScale: 0.65,

	// Nav horizontal shift when collapsed (negative = left)
	navX: -60,

	// Nav vertical shift when collapsed (negative = up)
	navY: -25,

	// Login region vertical shift when collapsed (negative = up)
	loginY: 25,

	// Shadow when scrolled
	boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
};
// ============================================

gsap.registerPlugin(ScrollTrigger);

function initHeaderAnimation(): void {
	const header = document.getElementById("sacda-header");
	const headerContainer = document.getElementById("sacda-header-container");
	const headerLogo = document.getElementById("sacda-header-logo");
	const headerNav = document.getElementById("sacda-header-nav");
	const menuTop = document.getElementById("sacda-menu-top");

	if (!header || !headerContainer) return;

	const tl = gsap.timeline({
		scrollTrigger: {
			trigger: "body",
			start: "top top",
			end: `+=${CONFIG.scrollDistance}`,
			scrub: true,
		},
	});

	// Shrink container padding and height
	tl.to(headerContainer, {
		paddingTop: CONFIG.collapsedPaddingY,
		paddingBottom: CONFIG.collapsedPaddingY,
		height: CONFIG.collapsedHeight,
		ease: "none",
	}, 0);

	// Scale down logo
	if (headerLogo) {
		tl.to(headerLogo, {
			scale: CONFIG.logoScale,
			ease: "none",
		}, 0);
	}

	// Shift nav left and up
	if (headerNav) {
		tl.to(headerNav, {
			x: CONFIG.navX,
			y: CONFIG.navY,
			ease: "none",
		}, 0);
	}

	// Scroll up the search/menu-top naturally (login region stays in place)
	const menuScrollable = document.getElementById("sacda-menu-scrollable");
	const menuWrapper = document.getElementById("sacda-menu-scrollable-wrapper");

	if (menuScrollable) {
		tl.to(menuScrollable, {
			yPercent: -100,  // Scroll up by 100% of its own height
			ease: "none",
		}, 0);
	}

	// Collapse the wrapper so it takes no space
	if (menuWrapper) {
		tl.to(menuWrapper, {
			height: 0,
			ease: "none",
		}, 0);
	}

	// Move login region up
	const loginRegion = document.getElementById("sacda-login-region");
	if (loginRegion) {
		tl.to(loginRegion, {
			y: CONFIG.loginY,
			ease: "none",
		}, 0);
	}

	// Add shadow when scrolled
	tl.to(header, {
		boxShadow: CONFIG.boxShadow,
		ease: "none",
	}, 0);
}

// Initialize on DOM ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initHeaderAnimation);
} else {
	initHeaderAnimation();
}
