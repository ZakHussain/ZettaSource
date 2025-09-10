// Load PDF.js from CDN instead of npm package to avoid module loading issues
let pdfjs: any = null;

export async function loadPdfJs() {
  if (!pdfjs) {
    // Load PDF.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    
    // Wait for script to load
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    
    // Get PDF.js from global
    pdfjs = (window as any).pdfjsLib;
    
    if (!pdfjs) {
      throw new Error('PDF.js failed to load from CDN');
    }
    
    // Set worker source
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
  return pdfjs;
}

export async function loadPdfDocument(source: string) {
  try {
    const pdf = await loadPdfJs();
    
    // Load PDF from URL or Object URL
    const loadingTask = pdf.getDocument({
      url: source,
      // Disable workers for Object URLs to avoid CORS issues
      disableWorker: source.startsWith('blob:'),
      // Add memory management options
      maxImageSize: 16777216, // 16MB max image size
      disableFontFace: false,
      disableRange: false,
      disableStream: false
    });
    
    const pdfDoc = await loadingTask.promise;
    
    // Store reference to loading task for cleanup
    pdfDoc._loadingTask = loadingTask;
    
    return pdfDoc;
    
  } catch (error) {
    console.error('Error loading PDF:', error);
    if (error.name === 'RangeError' && error.message.includes('memory')) {
      throw new Error('PDF file is too large or system is out of memory');
    }
    throw new Error('Failed to load PDF document: ' + error.message);
  }
}

export function cleanupPdfDocument(pdfDoc: any) {
  try {
    if (pdfDoc && pdfDoc._loadingTask) {
      pdfDoc._loadingTask.destroy();
    }
    if (pdfDoc && typeof pdfDoc.destroy === 'function') {
      pdfDoc.destroy();
    }
  } catch (error) {
    console.warn('Error cleaning up PDF document:', error);
  }
}

export async function renderPdfPage(
  pdfDoc: any,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number = 1.0
) {
  try {
    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas context not available');
    
    // Set canvas dimensions
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    // Render page
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    
    await page.render(renderContext).promise;
    
    return { width: viewport.width, height: viewport.height };
    
  } catch (error) {
    console.error('Error rendering PDF page:', error);
    throw new Error('Failed to render PDF page');
  }
}