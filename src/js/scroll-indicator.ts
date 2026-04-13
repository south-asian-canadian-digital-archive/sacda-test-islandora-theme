// @ts-nocheck

((Drupal) => {
  Drupal.behaviors.sacdaScrollIndicator = {
    attach: (context) => {
      if (context !== document) return;

      const indicator = document.getElementById('media-scroll-indicator');
      if (!indicator) return;

      // Show indicator after a short delay if we're at the top
      setTimeout(() => {
        if (window.scrollY < 50) {
          indicator.classList.remove('opacity-0', 'translate-y-4');
          indicator.classList.add('opacity-100', 'translate-y-0');
        }
      }, 1000);

      // Hide indicator on scroll
      const handleScroll = () => {
        if (window.scrollY > 100) {
          indicator.classList.add('opacity-0', 'translate-y-4');
          indicator.classList.remove('opacity-100', 'translate-y-0');
          window.removeEventListener('scroll', handleScroll);
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
    },
  };
})(Drupal);
