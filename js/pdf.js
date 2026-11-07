async function aguardarImagens(elemento) {
  const imagens = [...elemento.querySelectorAll('img')];
  await Promise.all(imagens.map((img) => {
    if (img.complete) return Promise.resolve();
    return new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
  }));
}

function prepararPagina(original) {
  const pagina = original.cloneNode(true);
  Object.assign(pagina.style, {
    width: '210mm',
    height: '297mm',
    minHeight: '297mm',
    maxHeight: '297mm',
    margin: '0',
    padding: '12mm 14mm',
    transform: 'none',
    transformOrigin: 'top left',
    boxShadow: 'none',
    overflow: 'hidden',
    breakAfter: 'auto',
    pageBreakAfter: 'auto',
    background: '#ffffff'
  });
  return pagina;
}

export async function makePdf(element, filename) {
  if (!window.html2canvas || !window.jspdf?.jsPDF) {
    throw new Error('Biblioteca de PDF não carregada. Atualize a página e tente novamente.');
  }

  const paginasOriginais = [...element.querySelectorAll('.a4-page')];
  if (!paginasOriginais.length) {
    throw new Error('Nenhuma página do laudo foi encontrada.');
  }

  const host = document.createElement('div');
  Object.assign(host.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: '210mm',
    background: '#ffffff',
    zIndex: '-9999'
  });
  document.body.appendChild(host);

  const pdf = new window.jspdf.jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  try {
    for (let indice = 0; indice < paginasOriginais.length; indice += 1) {
      host.innerHTML = '';
      const pagina = prepararPagina(paginasOriginais[indice]);
      host.appendChild(pagina);
      await aguardarImagens(pagina);

      const canvas = await window.html2canvas(pagina, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1200,
        width: pagina.scrollWidth,
        height: pagina.scrollHeight,
        logging: false
      });

      const imagem = canvas.toDataURL('image/jpeg', 0.96);
      if (indice > 0) pdf.addPage('a4', 'portrait');
      pdf.addImage(imagem, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    }

    pdf.save(filename);
  } finally {
    host.remove();
  }
}

export function printDocument() {
  window.print();
}
