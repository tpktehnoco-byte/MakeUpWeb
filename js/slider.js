document.addEventListener('DOMContentLoaded', () => {

    const sliderContainer = document.querySelector('.hero-slider');
    const slidesContainer = sliderContainer.querySelector('.slide');
    const dotsContainer = sliderContainer.querySelector('.slider-dots');
    const prevButton = sliderContainer.querySelector('.prev');
    const nextButton = sliderContainer.querySelector('.next');

    let slides = [];
    let currentSlide = 0;
    let slideInterval;


    // Funkcija za učitavanje slika i kreiranje slidera
    async function initSlider() {
        try {
            const response = await fetch('image-list.json');
            const imageNames = await response.json();

            if (imageNames.length === 0) return;

            // Kreiraj slide elemente
            imageNames.forEach((imageName, index) => {
                const slideElement = document.createElement('div');
                slideElement.classList.add('slide');
                if (index === 0) slideElement.classList.add('active'); // Prvi slide je aktivan
                slideElement.style.backgroundImage = `url('../images/${imageName}')`;
                sliderContainer.insertBefore(slideElement, slidesContainer);
                slides.push(slideElement);

                // Kreiraj tačkice za indikatore
                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => goToSlide(index));
                dotsContainer.appendChild(dot);
            });

            // Ukloni inicijalni prazni slide
            slidesContainer.remove();

            // Dodaj event listenere za strelice
            prevButton.addEventListener('click', prevSlide);
            nextButton.addEventListener('click', nextSlide);

            // Pokreni automatsko prelaženje
            startSlideShow();

        } catch (error) {
            console.error("Slider konnte nicht initialisiert werden:", error);
        }
    }

    // Funkcija za prikaz određenog slajda
    function showSlide(index) {
        // Sakrij sve slajdove
        slides.forEach(slide => slide.classList.remove('active'));
        // Deaktiviraj sve tačkice
        document.querySelectorAll('.dot').forEach(dot => dot.classList.remove('active'));

        // Prikaži trenutni slajd i aktiviraj tačkicu
        slides[index].classList.add('active');
        document.querySelectorAll('.dot')[index].classList.add('active');
    }

    // Funkcija za sledeći slajd
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
        resetSlideShow();
    }

    // Funkcija za prethodni slajd
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
        resetSlideShow();
    }

    // Funkcija za skok na određeni slajd
    function goToSlide(index) {
        currentSlide = index;
        showSlide(currentSlide);
        resetSlideShow();
    }

    // Automatsko prelaženje
    function startSlideShow() {
        slideInterval = setInterval(nextSlide, 5000); // Promeni slajd svakih 5 sekundi
    }

    // Resetovanje tajmera (korisno kada korisnik klikne)
    function resetSlideShow() {
        clearInterval(slideInterval);
        startSlideShow();
    }

    // Pokreni slider
    initSlider();

});
