// PDF.js worker (HTTPS, works on GitHub Pages)
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.12.313/pdf.worker.min.js';

const pdfInput = document.getElementById('pdfFile');
const convertBtn = document.getElementById('convertBtn');
const result = document.getElementById('result');

convertBtn.addEventListener('click', async () => {
  if (!pdfInput.files[0]) {
    result.textContent = '⚠ Please select a PDF file.';
    return;
  }

  result.textContent = 'Processing PDF...';
  const file = pdfInput.files[0];

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    result.innerHTML = ''; // clear previous content

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      await page.render({ canvasContext: ctx, viewport }).promise;
      result.appendChild(canvas);

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/jpeg');
      link.download = `page-${pageNum}.jpeg`;
      link.textContent = `Download Page ${pageNum}`;
      link.className = 'download-link';
      result.appendChild(link);
      result.appendChild(document.createElement('br'));
    }

    convertBtn.textContent = 'Reset';
    convertBtn.dataset.mode = 'reset';
    convertBtn.classList.add('reset');

    convertBtn.onclick = () => {
      pdfInput.value = '';
      result.innerHTML = 'Upload a PDF and click Convert.';
      convertBtn.textContent = 'Convert to JPEG';
      convertBtn.classList.remove('reset');
      delete convertBtn.dataset.mode;
      convertBtn.onclick = null;
    };
  } catch (err) {
    console.error(err);
    result.textContent =
      '⚠ Error processing PDF. Make sure it is a standard, non-encrypted PDF.';
  }
});
