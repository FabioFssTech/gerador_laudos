function limpar(valor) {
  return String(valor ?? '').trim() || 'Não informado';
}

function linha(titulo, valor) {
  return `${titulo}: ${limpar(valor)}`;
}

export function gerarTextoLaudo(laudo, empresa = {}) {
  const separador = '='.repeat(72);
  const subSeparador = '-'.repeat(72);

  return [
    separador,
    'LAUDO TÉCNICO',
    separador,
    linha('Número da OS', laudo.numero),
    linha('Data', laudo.data),
    linha('Hora', laudo.hora),
    linha('Código de verificação', laudo.codigo),
    linha('Hash', laudo.hash),
    '',
    'DADOS DA EMPRESA / PROFISSIONAL',
    subSeparador,
    linha('Nome', empresa.empresaNome),
    linha('CPF/CNPJ', empresa.empresaDocumento),
    linha('Telefone', empresa.empresaTelefone),
    linha('E-mail', empresa.empresaEmail),
    linha('Endereço', empresa.empresaEndereco),
    '',
    'DADOS DO CLIENTE',
    subSeparador,
    linha('Nome / Razão social', laudo.clienteNome),
    linha('CPF/CNPJ', laudo.clienteDocumento),
    linha('Telefone', laudo.clienteTelefone),
    linha('E-mail', laudo.clienteEmail),
    linha('Endereço', laudo.clienteEndereco),
    '',
    'IDENTIFICAÇÃO DO EQUIPAMENTO',
    subSeparador,
    linha('Equipamento', laudo.equipamento),
    linha('Marca / Modelo', laudo.marcaModelo),
    linha('Número de série', laudo.numeroSerie),
    '',
    'INFORMAÇÕES TÉCNICAS',
    subSeparador,
    linha('Problema relatado', laudo.problema),
    '',
    linha('Defeito constatado', laudo.defeito),
    '',
    linha('Diagnóstico', laudo.diagnostico),
    '',
    linha('Procedimentos realizados', laudo.procedimentos),
    '',
    linha('Peças utilizadas', laudo.pecas),
    '',
    linha('Conclusão técnica', laudo.conclusao),
    '',
    linha('Valor', laudo.valor ? `R$ ${laudo.valor}` : ''),
    linha('Responsável técnico', laudo.responsavel),
    '',
    linha('Observações', laudo.observacoes),
    '',
    subSeparador,
    `Arquivo TXT gerado em ${new Date().toLocaleString('pt-BR')}.`,
    'As fotos não são incluídas no TXT. Elas permanecem no laudo e no backup JSON.',
    separador,
    ''
  ].join('\r\n');
}

export function baixarTxtLaudo(laudo, empresa) {
  const conteudo = gerarTextoLaudo(laudo, empresa);
  const blob = new Blob(['\uFEFF', conteudo], {
    type: 'text/plain;charset=utf-8'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const numeroSeguro = String(laudo.numero || 'sem-numero')
    .replace(/[^a-zA-Z0-9_-]/g, '-');

  link.href = url;
  link.download = `Laudo-OS-${numeroSeguro}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
