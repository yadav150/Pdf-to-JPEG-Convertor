document.addEventListener('DOMContentLoaded', () => {
  const pdfInput = document.getElementById('pdfFile');
  const btn = document.getElementById('convertBtn');
  const result = document.getElementById('result');

  btn.addEventListener('click', async () => {
    if (btn.dataset.mode === 'reset') {
      resetAll();
      return;
    }

    if (!pdfInput.files[0]) {
      result.textContent = '⚠ Please select a PDF file.';
      return;
    }

    await convertPDF(pdfInput.files[0]);
  });

  async function convertPDF(file) {
    result.textContent = 'Processing PDF...';

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      result.innerHTML = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
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
      }

      btn.textContent = 'Reset';
      btn.classList.add('reset');
      btn.dataset.mode = 'reset';

    } catch (err) {
      console.error(err);
      result.textContent = '⚠ Error processing PDF.';
    }
  }

  function resetAll() {
    pdfInput.value = '';
    result.textContent = 'Upload a PDF and click Convert to see JPEG images here.';
    btn.textContent = 'Convert to JPEG';
    btn.classList.remove('reset');
    delete btn.dataset.mode;
  }
});