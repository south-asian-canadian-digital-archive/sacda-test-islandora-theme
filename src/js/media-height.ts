// @ts-nocheck

((Drupal) => {
    Drupal.behaviors.sacdaMediaHeight = {
        attach: (context) => {
            if (context !== document) return;

            function updateMediaHeight() {
                const mobileHeader = document.getElementById('sacda-mobile-header');
                const desktopHeader = document.getElementById('sacda-header');
                const activeHeader = window.innerWidth >= 768 ? desktopHeader : mobileHeader;

                if (activeHeader) {
                    const headerHeight = activeHeader.offsetHeight;
                    document.documentElement.style.setProperty('--header-height', headerHeight + 'px');
                }
            }

            // Initial update
            updateMediaHeight();

            // Update on resize (debounced)
            let resizeTimeout;
            window.addEventListener('resize', function() {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(updateMediaHeight, 100);
            });

            // Update on window load (after all resources loaded)
            window.addEventListener('load', updateMediaHeight);
        },
    };
})(Drupal);
