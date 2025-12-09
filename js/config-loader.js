document.addEventListener('DOMContentLoaded', () => {

    const languageSwitcher = document.getElementById('language-switcher');
    const DEFAULT_LANGUAGE = 'de';
    let currentLanguage = localStorage.getItem('selectedLanguage') || DEFAULT_LANGUAGE;

    // Function to fetch and apply language data
    async function setLanguage(lang) {
        try {
            const response = await fetch('/config.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const translations = await response.json();
            const langData = translations[lang];

            if (!langData) {
                console.error(`Language data for '${lang}' not found. Defaulting to '${DEFAULT_LANGUAGE}'.`);
                setLanguage(DEFAULT_LANGUAGE);
                return;
            }

            // Update all elements with a 'data-translate-key' attribute
            document.querySelectorAll('[data-translate-key]').forEach(element => {
                const key = element.getAttribute('data-translate-key');
                const keys = key.split('.');
                let value = langData;

                for (const k of keys) {
                    value = value[k];
                }

                if (value) {
                    element.textContent = value;
                }
            });

            // Update the language switcher's value
            languageSwitcher.value = lang;
            // Save the choice
            localStorage.setItem('selectedLanguage', lang);
            // Update the <html> lang attribute
            document.documentElement.lang = lang;

            // ---> NOVO: JAVITI OSTALIM SKRIPTAMA DA SE JEZIK PROMENIO <---
            const event = new CustomEvent('languageChanged', { detail: { lang: lang } });
            document.dispatchEvent(event);

        } catch (error) {
            console.error("Could not load translations:", error);
        }
    }

    // Event listener for the language switcher
    languageSwitcher.addEventListener('change', (event) => {
        setLanguage(event.target.value);
    });

    // Initial language setting on page load
    setLanguage(currentLanguage);
});