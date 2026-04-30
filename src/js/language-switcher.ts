// @ts-nocheck
((Drupal) => {
    Drupal.behaviors.sacdaLanguageSwitcher = {
        attach: (context) => {
            if (context !== document) return;

            const wrappers = document.querySelectorAll(
                ".sacda-language-switcher-wrapper",
            );

            wrappers.forEach((wrapper) => {
                const button = wrapper.querySelector("[data-language-toggle]");
                const dropdown = wrapper.querySelector(
                    "[data-language-dropdown]",
                );
                const icon = wrapper.querySelector("[data-language-icon]");
                const label = wrapper.querySelector("[data-language-label]");

                if (!button || !dropdown) return;

                // Find the active language link and update the label
                if (label) {
                    const activeLink = dropdown.querySelector("a.is-active");
                    if (activeLink) {
                        label.textContent = activeLink.textContent.trim();
                    }
                }

                button.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const expanded =
                        button.getAttribute("aria-expanded") === "true";
                    button.setAttribute("aria-expanded", String(!expanded));
                    dropdown.classList.toggle("sacda-hide");
                    if (icon) {
                        icon.classList.toggle("rotate-180");
                    }
                });
            });

            // Close all dropdowns when clicking outside
            document.addEventListener("click", (e) => {
                wrappers.forEach((wrapper) => {
                    const button = wrapper.querySelector(
                        "[data-language-toggle]",
                    );
                    const dropdown = wrapper.querySelector(
                        "[data-language-dropdown]",
                    );
                    const icon = wrapper.querySelector("[data-language-icon]");

                    if (
                        dropdown &&
                        button &&
                        !dropdown.contains(e.target) &&
                        !button.contains(e.target)
                    ) {
                        dropdown.classList.add("sacda-hide");
                        button.setAttribute("aria-expanded", "false");
                        if (icon) {
                            icon.classList.remove("rotate-180");
                        }
                    }
                });
            });

            // Close on escape key
            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape") {
                    wrappers.forEach((wrapper) => {
                        const button = wrapper.querySelector(
                            "[data-language-toggle]",
                        );
                        const dropdown = wrapper.querySelector(
                            "[data-language-dropdown]",
                        );
                        const icon = wrapper.querySelector(
                            "[data-language-icon]",
                        );

                        if (
                            dropdown &&
                            !dropdown.classList.contains("sacda-hide")
                        ) {
                            dropdown.classList.add("sacda-hide");
                            button.setAttribute("aria-expanded", "false");
                            if (icon) {
                                icon.classList.remove("rotate-180");
                            }
                        }
                    });
                }
            });
        },
    };
})(Drupal);
