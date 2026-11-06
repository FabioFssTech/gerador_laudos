import {load,save,nextNumber,uid} from './storage.js';
import {sha256,canonical,shortHash} from './hash.js';
import {downloadBackup,readBackup} from './backup.js';
import {makePdf,printDocument} from './pdf.js';
import {prepareEmail} from './email.js';
import {baixarTxtLaudo} from './txt.js';

let db=load(), fotos=[];
const $=id=>document.getElementById(id);
const fields=['id','numero','data','hora','clienteNome','clienteDocumento','clienteTelefone','clienteEmail','clienteEndereco','equipamento','marcaModelo','numeroSerie','problema','defeito','diagnostico','procedimentos','pecas','conclusao','valor','responsavel','observacoes'];
const esc = valor =>
  String(valor ?? '').replace(
    /[&<>"']/g,
    caractere =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[caractere]
  );
function toast(msg){$('toast').textContent=msg;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2400)}
function today(){const d=new Date(),p=n=>String(n).padStart(2,'0');return {date:`${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`,time:`${p(d.getHours())}:${p(d.getMinutes())}`}}
function collect(){const o={};fields.forEach(k=>o[k]=$(k).value.trim());o.fotos=fotos;o.atualizadoEm=new Date().toISOString();return o}
function setForm(o={}){fields.forEach(k=>$(k).value=o[k]||'');fotos=o.fotos||[];renderThumbs();render()}
function newDoc(){const t=today();setForm({id:'',numero:nextNumber(db),data:t.date,hora:t.time,responsavel:db.config.empresaNome||'',fotos:[]});$('saveStatus').textContent='Novo documento'}
async function enrich(o){o.id=o.id||uid();o.codigo=`OS-${o.numero}`;o.hash=await sha256(canonical(o));o.codigo=`${o.numero}-${o.hash.slice(0,8)}`;return o}
async function persist(){let o=await enrich(collect());const i=db.laudos.findIndex(x=>x.id===o.id);if(i>=0)db.laudos[i]=o;else{db.laudos.unshift(o);db.sequencia=(db.sequencia||1)+1}save(db);$('id').value=o.id;$('saveStatus').textContent='Salvo em '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});renderHistory();render();toast('Laudo salvo.');return o}
function info(label,val){return val?`<div><b>${esc(label)}</b>${esc(val)}</div>`:''}
function block(label,val){return val?`<div class="doc-block"><b>${esc(label)}</b>${esc(val)}</div>`:''}
async function render(){const o=collect(),c=db.config;$('wm').textContent=c.marcaAgua||'DOCUMENTO ORIGINAL';$('docEmpresa').textContent=c.empresaNome||'Nome da empresa / profissional';$('docEmpresaDados').textContent=[c.empresaDocumento,c.telefone,c.empresaTelefone,c.empresaEmail,c.empresaEndereco].filter(Boolean).join(' • ');$('docNumero').textContent=`OS ${o.numero||''}`;$('docEmissao').textContent=`Emissão: ${o.data||''} ${o.hora||''}`;$('docCodigo').textContent=o.numero?`Código: OS-${o.numero}`:'';$('docCliente').innerHTML=info('Nome',o.clienteNome)+info('CPF/CNPJ',o.clienteDocumento)+info('Telefone',o.clienteTelefone)+info('E-mail',o.clienteEmail)+info('Endereço',o.clienteEndereco);$('docEquipamento').innerHTML=info('Equipamento',o.equipamento)+info('Marca / Modelo',o.marcaModelo)+info('Número de série',o.numeroSerie);$('docConteudo').innerHTML=block('Problema relatado',o.problema)+block('Defeito constatado',o.defeito)+block('Diagnóstico',o.diagnostico)+block('Procedimentos realizados',o.procedimentos)+block('Peças utilizadas',o.pecas)+block('Conclusão técnica',o.conclusao)+block('Valor',o.valor?`R$ ${o.valor}`:'')+block('Responsável técnico',o.responsavel)+block('Observações',o.observacoes);$('docFotos').innerHTML=fotos.map(x=>`<img src="${x}" alt="Foto do serviço">`).join('');$('docRodape').textContent=`Documento emitido em ${o.data||''} às ${o.hora||''}`;if(o.numero){const h=await sha256(canonical(o));$('docHash').textContent=`Hash: ${shortHash(h)}`}else $('docHash').textContent='';const img=$('docLogo');if(c.logo){img.src=c.logo;img.style.display='block'}else img.style.display='none';$('documento').querySelector('.doc-header').classList.toggle('logo-right',c.logoPosicao==='right')}
function renderThumbs(){$('fotoLista').innerHTML=fotos.map((x,i)=>`<div><img src="${x}"><button type="button" data-rm="${i}">×</button></div>`).join('')}
function renderHistory(q=''){q=q.toLowerCase();const list=db.laudos.filter(x=>[x.numero,x.clienteNome,x.equipamento].join(' ').toLowerCase().includes(q));$('historicoLista').innerHTML=list.length?list.map(x=>`<div class="history-item"><div><strong>OS ${esc(x.numero)} — ${esc(x.clienteNome)}</strong><p>${esc(x.equipamento)} • ${esc(x.data)}</p></div><div class="history-actions"><button data-edit="${x.id}">Abrir</button><button data-dup="${x.id}">Duplicar</button><button class="danger" data-del="${x.id}">Excluir</button></div></div>`).join(''):'<p class="muted">Nenhum laudo encontrado.</p>'}
function fillConfig(){const c=db.config;['empresaNome','empresaDocumento','empresaTelefone','empresaEmail','empresaEndereco','logoPosicao','marcaAgua'].forEach(k=>$(k).value=c[k]||'')}
function readImages(fileList){return Promise.all([...fileList].slice(0,6).map(file=>new Promise((res,rej)=>{if(file.size>4*1024*1024)return rej(new Error('Cada foto deve ter no máximo 4 MB.'));const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)})))}

$('laudoForm').addEventListener('input',render);$('laudoForm').addEventListener('submit',async e=>{e.preventDefault();await persist()});
$('fotos').addEventListener('change',async e=>{try{fotos=[...fotos,...await readImages(e.target.files)].slice(0,6);renderThumbs();render()}catch(err){toast(err.message)}});
$('fotoLista').addEventListener('click',e=>{if(e.target.dataset.rm!==undefined){fotos.splice(+e.target.dataset.rm,1);renderThumbs();render()}});
$('btnNovo').onclick=()=>{if(confirm('Iniciar um novo laudo?'))newDoc()};$('btnHistorico').onclick=()=>{$('historicoDialog').showModal();renderHistory()};$('btnConfig').onclick=()=>{fillConfig();$('configDialog').showModal()};$('btnPrint').onclick=printDocument;
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());$('busca').oninput=e=>renderHistory(e.target.value);
$('historicoLista').onclick=e=>{const id=e.target.dataset.edit||e.target.dataset.dup||e.target.dataset.del;if(!id)return;const o=db.laudos.find(x=>x.id===id);if(e.target.dataset.del){if(confirm('Excluir este laudo?')){db.laudos=db.laudos.filter(x=>x.id!==id);save(db);renderHistory();toast('Laudo excluído.')}return}const copy=structuredClone(o);if(e.target.dataset.dup){copy.id='';copy.numero=nextNumber(db);const t=today();copy.data=t.date;copy.hora=t.time}setForm(copy);$('historicoDialog').close();window.scrollTo({top:0,behavior:'smooth'})};
$('configForm').onsubmit=async e=>{e.preventDefault();['empresaNome','empresaDocumento','empresaTelefone','empresaEmail','empresaEndereco','logoPosicao','marcaAgua'].forEach(k=>db.config[k]=$(k).value.trim());const f=$('logoInput').files[0];if(f){db.config.logo=(await readImages([f]))[0]}save(db);render();$('configDialog').close();toast('Configurações salvas.')};
$('btnExportar').onclick=()=>downloadBackup(db);$('importarArquivo').onchange=async e=>{try{const imported=await readBackup(e.target.files[0]);if(confirm(`Importar ${imported.laudos.length} laudo(s) e substituir os dados atuais?`)){db=imported;delete db.exportadoEm;save(db);newDoc();renderHistory();$('configDialog').close();toast('Backup importado.')}}catch(err){alert(err.message)}e.target.value=''};
async function ensureSaved() {
  if (
    !$('clienteNome').value ||
    !$('equipamento').value ||
    !$('diagnostico').value ||
    !$('conclusao').value ||
    !$('responsavel').value
  ) {
    $('laudoForm').reportValidity();
    throw new Error('Preencha os campos obrigatórios.');
  }

  return await persist();
}

$('btnTxt').onclick = async () => {
  try {
    const laudo = await ensureSaved();
    baixarTxtLaudo(laudo, db.config);
    toast('Arquivo TXT gerado.');
  } catch (erro) {
    toast(erro.message);
  }
};

$('btnPdf').onclick = async () => {
  try {
    const laudo = await ensureSaved();

    await makePdf(
      $('documento'),
      `Laudo-OS-${laudo.numero}.pdf`
    );

    toast('PDF gerado.');
  } catch (erro) {
    toast(erro.message);
  }
};

$('btnPdfEmail').onclick = async () => {
  try {
    const laudo = await ensureSaved();

    await makePdf(
      $('documento'),
      `Laudo-OS-${laudo.numero}.pdf`
    );

    alert(
      'O PDF foi baixado. Seu aplicativo de e-mail será aberto. ' +
      'Anexe manualmente o PDF recém-baixado.'
    );

    prepareEmail(
      laudo,
      db.config.empresaEmail || 'fsbatepap@gmail.com'
    );
  } catch (erro) {
    toast(erro.message);
  }
};

newDoc();
renderHistory();

$('btnPdf').onclick=async()=>{try{const o=await ensureSaved();await makePdf($('documento'),`Laudo-OS-${o.numero}.pdf`);toast('PDF gerado.')}catch(e){toast(e.message)}};
$('btnPdfEmail').onclick=async()=>{try{const o=await ensureSaved();await makePdf($('documento'),`Laudo-OS-${o.numero}.pdf`);alert('O PDF foi baixado. Seu aplicativo de e-mail será aberto; anexe manualmente o PDF recém-baixado.');prepareEmail(o,db.config.empresaEmail||'fsbatepap@gmail.com')}catch(e){toast(e.message)}};
newDoc();renderHistory();
