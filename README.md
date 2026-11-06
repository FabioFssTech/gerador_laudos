# Gerador de Laudos Técnicos

Aplicação estática para criar, salvar, imprimir e exportar laudos técnicos. Os dados ficam no navegador e podem ser exportados em JSON.

## Uso local

Abra `index.html` em um navegador moderno. Para a geração de PDF, mantenha conexão com a internet, pois a biblioteca `html2pdf.js` é carregada por CDN. A impressão funciona sem essa biblioteca.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie todos os arquivos deste projeto para a branch `main`.
3. Abra **Settings > Pages**.
4. Em **Source**, escolha **GitHub Actions**.
5. Aguarde o workflow "Publicar no GitHub Pages" terminar.

## Backup

Use **Configurações > Exportar backup**. Guarde o JSON em uma pasta segura. Ao importar, os dados atuais são substituídos após confirmação.

## E-mail

O botão **PDF + preparar e-mail** baixa o PDF e abre o aplicativo de e-mail com destinatário, assunto e corpo preenchidos. Por segurança e limitações do protocolo `mailto:`, o PDF precisa ser anexado manualmente.

## Integridade

O documento mostra marca d'água, número, data, hora e um hash SHA-256 dos dados textuais. Isso ajuda na conferência, mas não substitui assinatura digital com certificado.

## Privacidade

Não coloque backups, PDFs de clientes, chaves ou senhas no repositório. Os dados pessoais ficam somente no navegador e nos arquivos exportados por você.
