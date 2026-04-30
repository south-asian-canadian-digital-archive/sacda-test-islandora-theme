/**
 * Advanced Search Form Handler
 * Enables form submission via Enter key in search input fields
 */

/**
 * Initialize advanced search form behavior
 */
export const initAdvancedSearchForm = (): void => {
  const textInputs = document.querySelectorAll('.grid-col-value input[type="text"]');

  textInputs.forEach(input => {
    input.addEventListener('keypress', function(event: KeyboardEvent) {
      if (event.key === 'Enter') {
        event.preventDefault();
        const form = (input as HTMLInputElement).closest('form');
        if (form) {
          const searchButton = form.querySelector('input[type="submit"][value="Search"]');
          if (searchButton) {
            (searchButton as HTMLInputElement).click();
          }
        }
      }
    });
  });
};

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdvancedSearchForm);
  } else {
    initAdvancedSearchForm();
  }
}

// Also support Drupal behaviors for dynamic content
declare global {
  interface Window {
    Drupal?: {
      behaviors?: {
        [key: string]: {
          attach?: (context: Document | Element, settings?: any) => void;
        };
      };
    };
  }
}

if (typeof window !== 'undefined' && window.Drupal?.behaviors) {
  window.Drupal.behaviors.advancedSearchForm = {
    attach: (context: Document | Element) => {
      const textInputs = (context as Document | Element).querySelectorAll(
        '.grid-col-value input[type="text"]'
      );

      textInputs.forEach(input => {
        // Only attach if not already attached
        if (!(input as any).dataset.advancedSearchAttached) {
          (input as any).dataset.advancedSearchAttached = 'true';

          input.addEventListener('keypress', function(event: KeyboardEvent) {
            if (event.key === 'Enter') {
              event.preventDefault();
              const form = (input as HTMLInputElement).closest('form');
              if (form) {
                const searchButton = form.querySelector('input[type="submit"][value="Search"]');
                if (searchButton) {
                  (searchButton as HTMLInputElement).click();
                }
              }
            }
          });
        }
      });
    },
  };
}
