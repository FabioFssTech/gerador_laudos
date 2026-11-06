/**
 * Gera o PDF usando uma copia do documento em tamanho A4 real.
 * Isso evita que o transform: scale() usado na visualizacao do celular
 * seja capturado pelo html2canvas e deixe o PDF pequeno/cortado.
 */
export async function makePdf(element, filename, download = true) {
  if (!window.html2pdf) {
    throw new Error('Biblioteca de PDF nao carregada. Verifique a internet.');
  }

  const clone = element.cloneNode(true);
  clone.id = 'documento-exportacao-pdf';

  // Sobrescreve o CSS responsivo da visualizacao em celular.
  Object.assign(clone.style, {
    width: '210mm',
    minHeight: '296mm',
    height: 'auto',
    margin: '0',
    marginBottom: '0',
    padding: '14mm',
    transform: 'none',
    transformOrigin: 'top left',
    boxShadow: 'none',
    overflow: 'visible',
    background: '#ffffff',
    position: 'relative'
  });

  // Area temporaria fora da tela. O clone fica em largura A4 sem ser
  // afetado pela largura ou pelo zoom do celular.
  const host = document.createElement('div');
  Object.assign(host.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: '210mm',
    background: '#ffffff',
    zIndex: '-9999'
  });
  host.appendChild(clone);
  document.body.appendChild(host);

  const options = {
    margin: 0,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1200,
      logging: false
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true
    },
    pagebreak: {
      mode: ['css', 'legacy'],
      avoid: ['.doc-header', '.doc-meta', '.doc-grid', '.doc-block', '.assinaturas', 'footer']
    }
  };

  try {
    const worker = window.html2pdf().set(options).from(clone);
    if (download) {
      await worker.save();
      return null;
    }
    return await worker.outputPdf('blob');
  } finally {
    host.remove();
  }
}

export function printDocument() {
  window.print();
}
