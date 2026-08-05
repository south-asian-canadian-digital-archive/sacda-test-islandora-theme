// @ts-nocheck

((Drupal) => {
  Drupal.behaviors.sacdaScrollIndicator = {
    attach: (context) => {
      if (context !== document) return;

      const indicator = document.getElementById('media-scroll-indicator');
      if (!indicator) return;

      // The hint only makes sense when the viewer actually fills the screen and
      // hides what's below it. The collapsed PDF poster card is short, so the
      // metadata is already visible and "scroll down to view more" would be
      // both wrong and overlapping the card.
      const wrapper = indicator.closest('.media-content-wrapper');
      if (wrapper && wrapper.getBoundingClientRect().height < window.innerHeight * 0.7) {
        indicator.remove();
        return;
      }

      let shown = false;
      let dismissed = false;

      const show = () => {
        shown = true;
        indicator.classList.remove('opacity-0', 'translate-y-4');
        indicator.classList.add('opacity-100', 'translate-y-0');
      };

      const hide = () => {
        if (dismissed) return;
        dismissed = true;
        indicator.classList.add('opacity-0', 'translate-y-4');
        indicator.classList.remove('opacity-100', 'translate-y-0');
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('wheel', onIntent);
        window.removeEventListener('touchmove', onIntent);
        window.removeEventListener('keydown', onKeydown);
        window.removeEventListener('blur', onBlur);
      };

      // Show after a short delay if the page is still at the top.
      setTimeout(() => {
        if (!dismissed && window.scrollY < 50) show();
      }, 1000);

      // Auto-dismiss a while after it appears — covers scrolling that never
      // reaches the page (e.g. inside the PDF.js iframe).
      setTimeout(hide, 8000);

      const onScroll = () => {
        if (window.scrollY > 50) hide();
      };

      // The viewers swallow wheel/touch input (OpenSeadragon zooms, PDF.js
      // scrolls internally), so window.scrollY may never move — treat any
      // scroll *intent* as a dismissal once the indicator is visible.
      const onIntent = () => {
        if (shown) hide();
      };

      const onKeydown = (e) => {
        if (['ArrowDown', 'PageDown', 'End', ' '].includes(e.key)) hide();
      };

      // Clicking into the PDF.js iframe blurs the window — the user is
      // interacting with the viewer, so the hint has done its job.
      const onBlur = () => {
        if (shown) hide();
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('wheel', onIntent, { passive: true });
      window.addEventListener('touchmove', onIntent, { passive: true });
      window.addEventListener('keydown', onKeydown);
      window.addEventListener('blur', onBlur);
    },
  };
})(Drupal);
