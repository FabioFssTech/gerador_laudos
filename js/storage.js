const KEY='gerador_laudos_v1';
const defaults={version:1,config:{empresaNome:'',empresaDocumento:'',empresaTelefone:'',empresaEmail:'fsbatepap@gmail.com',empresaEndereco:'',logo:'',logoPosicao:'left',marcaAgua:'DOCUMENTO ORIGINAL'},laudos:[],sequencia:1};
export function load(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return structuredClone(defaults)}}
export function save(data){localStorage.setItem(KEY,JSON.stringify(data))}
export function reset(){localStorage.removeItem(KEY)}
export function nextNumber(data){const y=new Date().getFullYear();return `${y}-${String(data.sequencia||1).padStart(4,'0')}`}
export function uid(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`}
export {KEY,defaults};