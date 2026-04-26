class EpubService {
  constructor(file) {
    this.file = file;
    this.zip = null;
    this.opfPath = "";
    this.opfBasePath = "";
    this.manifest = {};
    this.spine = [];
  }

  async load() {

    this.zip = await JSZip.loadAsync(this.file);

    const containerXml = await this.zip.file("META-INF/container.xml").async("string");
    const parser = new DOMParser();
    const containerDoc = parser.parseFromString(containerXml, "application/xml");
    
    const rootfile = containerDoc.querySelector("rootfile");
    if (!rootfile) throw new Error("EPUB inválido: No se encontró rootfile en container.xml");
    
    this.opfPath = rootfile.getAttribute("full-path");
    this.opfBasePath = this.opfPath.substring(0, this.opfPath.lastIndexOf("/") + 1);

    const opfContent = await this.zip.file(this.opfPath).async("string");
    const opfDoc = parser.parseFromString(opfContent, "application/xml");

    const items = opfDoc.querySelectorAll("manifest > item");
    items.forEach(item => {
      const id = item.getAttribute("id");
      this.manifest[id] = {
        href: item.getAttribute("href"),
        mediaType: item.getAttribute("media-type")
      };
    });

    const itemrefs = opfDoc.querySelectorAll("spine > itemref");
    itemrefs.forEach(itemref => {
      this.spine.push(itemref.getAttribute("idref"));
    });
  }

  get chapterCount() {
    return this.spine.length;
  }

  _resolvePath(base, relative) {
    const stack = base.split('/').filter(p => p !== '');
    const parts = relative.split('/');

    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') {
        stack.pop();
      } else {
        stack.push(part);
      }
    }
    return stack.join('/');
  }

  async getChapter(index) {
    if (index < 0 || index >= this.spine.length) {
      throw new Error("Índice de capítulo fuera de rango");
    }

    const id = this.spine[index];
    const item = this.manifest[id];
    
    if (!item) {
      throw new Error(`Elemento no encontrado en manifest para id: ${id}`);
    }

    const chapterPath = this.opfBasePath + item.href;
    const chapterBasePath = chapterPath.substring(0, chapterPath.lastIndexOf("/") + 1);
    
    const htmlContent = await this.zip.file(chapterPath).async("string");
    
    return await this._processImages(htmlContent, chapterBasePath);
  }

  async _processImages(htmlContent, basePath) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "application/xhtml+xml");

    const images = doc.querySelectorAll("img, image");
    
    for (const img of images) {
      let srcAttr = img.hasAttribute("src") ? "src" : (img.hasAttribute("href") ? "href" : "xlink:href");
      let src = img.getAttribute(srcAttr);
      
      if (!src || src.startsWith("data:") || src.startsWith("http")) continue;
      const cleanSrc = src.split('#')[0];
      const fullPath = this._resolvePath(basePath, cleanSrc);
      
      try {
        const file = this.zip.file(fullPath);
        if (file) {
          const base64 = await file.async("base64");
          let ext = fullPath.split('.').pop().toLowerCase();
          let mime = ext === 'jpg' ? 'jpeg' : ext;
          if (ext === 'svg') mime = 'svg+xml';
          
          img.setAttribute(srcAttr, `data:image/${mime};base64,${base64}`);
        }
      } catch (err) {
        console.warn(`No se pudo procesar la imagen: ${fullPath}`, err);
      }
    }

    const body = doc.querySelector("body");
    return body ? body.innerHTML : doc.documentElement.innerHTML;
  }
}
