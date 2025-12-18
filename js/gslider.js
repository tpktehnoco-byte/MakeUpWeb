document.addEventListener('DOMContentLoaded', async () => {
  const API_KEY = 'AIzaSyD7Wv5dtQER9LAbDMe0K0DcxFnNeD8czOw';
  const ROOT_FOLDER_ID = '1gJTbcaRAgOwWjZy2ELss4A-cS7TCHVdC'; // glavni folder

  const albumsGrid = document.querySelector('.albums-grid');
  const galleryGrid = document.querySelector('.gallery-grid');
  const statusEl = document.querySelector('.gallery-status');

  if (!albumsGrid || !galleryGrid) {
    console.error("Nedostaje .albums-grid ili .gallery-grid u HTML-u.");
    return;
  }

  const sliderOverlay = document.getElementById('album-slider');
  const slideDiv = sliderOverlay.querySelector('.slide');
  const dotsContainer = sliderOverlay.querySelector('.slider-dots');
  const prevBtn = sliderOverlay.querySelector('.prev');
  const nextBtn = sliderOverlay.querySelector('.next');
  const closeBtn = sliderOverlay.querySelector('.close');

  let currentFiles = [];
  let currentSlide = 0;

  // povlači sve fajlove (slike + foldere)
  async function fetchDriveItems(folderId, apiKey) {
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&fields=files(id,name,mimeType,thumbnailLink)&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Drive API error ${res.status}`);
    const data = await res.json();
    return data.files || [];
  }

  try {
    statusEl.hidden = false;
    statusEl.textContent = "Učitavanje...";

    const items = await fetchDriveItems(ROOT_FOLDER_ID, API_KEY);

    if (!items.length) {
      statusEl.textContent = "Nema sadržaja u folderu.";
      return;
    }

    statusEl.hidden = true;

    // razdvajanje: folderi (albume) i slike
    const folders = items.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
    const images = items.filter(f => f.mimeType.includes('image/'));

    // render albuma
    folders.forEach(folder => {
      const item = document.createElement('div');
      item.className = 'album-item';
      item.setAttribute('data-title', folder.name);
      item.innerHTML = `<img src="${folder.thumbnailLink || 'images/album-placeholder.jpg'}" alt="${folder.name}">`;
      item.addEventListener('click', () => openAlbum(folder.id));
      albumsGrid.appendChild(item);
    });

    // render slika iz root foldera
    images.forEach((file, idx) => {
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.innerHTML = `<img src="${file.thumbnailLink}" alt="${file.name}" loading="lazy">`;
      item.addEventListener('click', () => openSlider(idx, images));
      galleryGrid.appendChild(item);
    });

    // otvaranje albuma (podfoldera)
    async function openAlbum(folderId) {
      try {
        const files = await fetchDriveItems(folderId, API_KEY);
        currentFiles = files.filter(f => f.mimeType.includes('image/'));
        currentSlide = 0;
        renderDots(currentFiles.length);
        showSlide(currentSlide);
        sliderOverlay.classList.remove('hidden');
      } catch (err) {
        console.error(err);
      }
    }

    // slider logika
    function openSlider(startIndex, filesArr) {
      currentFiles = filesArr;
      currentSlide = startIndex;
      renderDots(currentFiles.length);
      showSlide(currentSlide);
      sliderOverlay.classList.remove('hidden');
    }

    function renderDots(count) {
      dotsContainer.innerHTML = '';
      for (let i = 0; i < count; i++) {
        const dot = document.createElement('span');
        dot.className = 'dot' + (i === currentSlide ? ' active' : '');
        dot.addEventListener('click', () => {
          currentSlide = i;
          showSlide(currentSlide);
        });
        dotsContainer.appendChild(dot);
      }
    }

    function showSlide(index) {
      const file = currentFiles[index];

      // prvo probaj originalnu sliku
      const originalUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w800-h600`;
      const thumbUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w280-h266-p-k-rw-v1-nu-iv1`;

      // fallback logika: ako original ne radi, koristi thumbnail
      const testImg = new Image();
      testImg.onload = () => {
        slideDiv.style.backgroundImage = `url('${originalUrl}')`;
      };
      testImg.onerror = () => {
        slideDiv.style.backgroundImage = `url('${thumbUrl}')`;
      };
      testImg.src = originalUrl;

      // update dots
      dotsContainer.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
      const active = dotsContainer.querySelectorAll('.dot')[index];
      if (active) active.classList.add('active');
    }

    prevBtn.addEventListener('click', () => {
      currentSlide = (currentSlide - 1 + currentFiles.length) % currentFiles.length;
      showSlide(currentSlide);
    });

    nextBtn.addEventListener('click', () => {
      currentSlide = (currentSlide + 1) % currentFiles.length;
      showSlide(currentSlide);
    });

    closeBtn.addEventListener('click', () => {
      sliderOverlay.classList.add('hidden');
    });

  } catch (err) {
    console.error(err);
    statusEl.hidden = false;
    statusEl.textContent = "Greška pri učitavanju galerije.";
  }
});
