document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput');
  const fileNameDisplay = document.getElementById('fileNameDisplay');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const viewer = document.getElementById('viewer');
  const pageCounter = document.getElementById('pageCounter');

  let epubService = null;
  let currentChapter = 0;

  async function processFile(file) {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.epub')) {
      viewer.innerHTML = `<div class="placeholder-text" style="color: red;">Por favor, sube un archivo con extensión .epub</div>`;
      return;
    }

    fileNameDisplay.textContent = file.name;
    viewer.innerHTML = '<div class="placeholder-text">Cargando libro...</div>';
    pageCounter.textContent = '';
    
    try {
      epubService = new EpubService(file);
      await epubService.load();
      
      currentChapter = 0;
      await renderChapter();
    } catch (err) {
      console.error("Error al cargar el archivo:", err);
      viewer.innerHTML = `<div class="placeholder-text" style="color: red;">Error al cargar el EPUB:<br/>${err.message || 'El archivo puede estar corrupto o no ser válido.'}</div>`;
    }
  }

  fileInput.addEventListener('change', (e) => {
    processFile(e.target.files[0]);
  });

  // Drag and Drop
  viewer.addEventListener('dragover', (e) => {
    e.preventDefault();
    viewer.classList.add('dragover');
  });

  viewer.addEventListener('dragleave', (e) => {
    e.preventDefault();
    viewer.classList.remove('dragover');
  });

  viewer.addEventListener('drop', (e) => {
    e.preventDefault();
    viewer.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  });

  prevBtn.addEventListener('click', async () => {
    if (epubService && currentChapter > 0) {
      currentChapter--;
      await renderChapter();
    }
  });

  nextBtn.addEventListener('click', async () => {
    if (epubService && currentChapter < epubService.chapterCount - 1) {
      currentChapter++;
      await renderChapter();
    }
  });

  async function renderChapter() {
    if (!epubService) return;

    prevBtn.disabled = true;
    nextBtn.disabled = true;
    viewer.innerHTML = '<div class="placeholder-text">Renderizando capítulo...</div>';

    try {
      const html = await epubService.getChapter(currentChapter);
      viewer.innerHTML = html;
      
      prevBtn.disabled = currentChapter === 0;
      nextBtn.disabled = currentChapter === epubService.chapterCount - 1;
      
      viewer.scrollTop = 0;
      
      pageCounter.textContent = `${currentChapter + 1} / ${epubService.chapterCount}`;
    } catch (err) {
      console.error("Error al renderizar capítulo:", err);
      viewer.innerHTML = `<div class="placeholder-text" style="color: red;">Error al renderizar el capítulo:<br/>${err.message}</div>`;
      prevBtn.disabled = currentChapter === 0;
      nextBtn.disabled = currentChapter === epubService.chapterCount - 1;
    }
  }
});
