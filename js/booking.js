document.addEventListener('DOMContentLoaded', () => {

    const packagesContainer = document.getElementById('packages-container');
    const bookingModal = document.getElementById('booking-modal');
    const bookingForm = document.getElementById('booking-form');
    const successMessage = document.getElementById('success-message');
    const closeBtn = document.querySelector('.close-btn');
    const selectedPackageName = document.getElementById('selected-package-name');
    const packageIdInput = document.getElementById('package-id-input');

    let currentTranslations = {};

    // Funkcija za učitavanje paketa i prikaz na stranici
    async function loadPackages(lang) {
        console.log(`[booking.js] Pokrećem učitavanje paketa za jezik: ${lang}`); // DIJAGNOSTIKA

        try {
            const response = await fetch('config.json');
            if (!response.ok) {
                throw new Error(`Greška pri učitavanju config.json: ${response.status}`);
            }
            const translations = await response.json();
            const langData = translations[lang];

            if (!langData || !langData.booking) {
                console.error(`[booking.js] Nema podataka o bukiranju za jezik: ${lang}`); // DIJAGNOSTIKA
                packagesContainer.innerHTML = "<p>Pakete konnten nicht geladen werden.</p>";
                return;
            }

            currentTranslations = langData;
            const packages = currentTranslations.booking.packages;
            packagesContainer.innerHTML = ''; // Očisti postojeći sadržaj
            console.log(`[booking.js] Učitano paketa: ${packages.length}`); // DIJAGNOSTIKA

            const packageIcons = {
                'soft-glam': 'fa-sparkles',
                'full-glam': 'fa-gem',
                'bridal-trial': 'fa-heart',
                'bridal-day': 'fa-crown'
            };

            packages.forEach(pkg => {
                const iconClass = packageIcons[pkg.id] || 'fa-star';
                const packageCard = document.createElement('div');
                packageCard.classList.add('package-card');
                packageCard.innerHTML = `
                    <i class="fa-solid ${iconClass}"></i>
                    <h3>${pkg.name}</h3>
                    <p class="price">${pkg.price}</p>
                    <p class="duration"><i class="far fa-clock"></i> ${pkg.duration}</p>
                    <p class="description">${pkg.description}</p>
                    <button class="select-package-btn" data-package-id="${pkg.id}">${currentTranslations.global.navBooking}</button>
                `;
                packagesContainer.appendChild(packageCard);
            });

            document.querySelectorAll('.select-package-btn').forEach(button => {
                button.addEventListener('click', openBookingModal);
            });

        } catch (error) {
            console.error("[booking.js] Greška u funkciji loadPackages:", error); // DIJAGNOSTIKA
            packagesContainer.innerHTML = "<p>Pakete konnten nicht geladen werden.</p>";
        }
    }

    // Funkcija za otvaranje modala
    function openBookingModal(event) {
        const button = event.target;
        const packageId = button.getAttribute('data-package-id');
        const packageName = button.parentElement.querySelector('h3').textContent;

        packageIdInput.value = packageId;
        selectedPackageName.textContent = `Ausgewähltes Paket: ${packageName}`;

        bookingModal.style.display = 'flex';
        successMessage.style.display = 'none';
    }

    // Funkcija za zatvaranje modala
    function closeModal() {
        bookingModal.style.display = 'none';
    }

    // Funkcija za obradu slanja forme
    function handleFormSubmit(event) {
        event.preventDefault();
        const formData = new FormData(bookingForm);
        const data = Object.fromEntries(formData);
        console.log("Podaci za slanje:", data);
        showSuccessMessage();
    }

    // Funkcija za prikaz poruke o uspehu
    function showSuccessMessage() {
        closeModal();
        bookingForm.reset();
        successMessage.style.display = 'block';
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    }

    // Event Listeners
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === bookingModal) {
            closeModal();
        }
    });
    bookingForm.addEventListener('submit', handleFormSubmit);

    // ---> SLUŠAJTE ZA DOGAĐAJ PROMENE JEZIKA <---
    document.addEventListener('languageChanged', (event) => {
        const newLang = event.detail.lang;
        console.log(`[booking.js] Primljen događaj 'languageChanged' za jezik: ${newLang}`); // DIJAGNOSTIKA
        loadPackages(newLang);
    });

    // Inicijalno učitavanje paketa kada se stranica učita
    const initialLang = localStorage.getItem('selectedLanguage') || 'de';
    console.log(`[booking.js] Početno učitavanje za jezik: ${initialLang}`); // DIJAGNOSTIKA
    loadPackages(initialLang);

});

