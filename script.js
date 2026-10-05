const $=s=>document.querySelector(s);
const KEY="tlw_state_v2";
const defaults={visits:0,opened:[],terminalUsed:false,secretClicks:0,visitor:"0001"};
let state;try{state={...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{state={...defaults}}
state.visits++;save();
const workspace=$("#workspace"),modal=$("#modal"),modalTitle=$("#modalTitle"),modalEyebrow=$("#modalEyebrow"),modalContent=$("#modalContent"),terminalPanel=$("#terminalPanel"),terminalOutput=$("#terminalOutput"),terminalForm=$("#terminalForm"),terminalInput=$("#terminalInput");
const pad=n=>String(n).padStart(2,"0");
const time=()=>{const n=new Date();return[n.getHours(),n.getMinutes(),n.getSeconds()].map(pad).join(":")};
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function esc(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function clock(){$("#clock").textContent=time();if(state.visits>1)$("#lastLog").textContent="agora — alguém voltou a abrir o arquivo."}
setInterval(clock,1000);clock();
function openWorkspace(){workspace.classList.add("open");workspace.setAttribute("aria-hidden","false");workspace.scrollIntoView({behavior:"smooth",block:"start"})}
function closeWorkspace(){workspace.classList.remove("open");workspace.setAttribute("aria-hidden","true")}
$("#enterButton").addEventListener("click",openWorkspace);$("#closeWorkspace").addEventListener("click",closeWorkspace);
function openModal(t,e,h){modalTitle.textContent=t;modalEyebrow.textContent=e;modalContent.innerHTML=h;modal.classList.add("open");modal.setAttribute("aria-hidden","false")}
function closeModal(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true")}
$("#modalClose").addEventListener("click",closeModal);modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeModal();terminalPanel.classList.remove("open")}});
function opened(k){if(!state.opened.includes(k)){state.opened.push(k);save()}}
function file(k){
 opened(k);
 if(k==="terminal"){terminalPanel.classList.add("open");terminalInput.focus();return}
 if(k==="welcome"){
  const h=state.opened.includes("visitors")?'<p>Se você já viu o registro, não precisa que eu explique.</p><p>Eu não sei quem mantém isto funcionando.</p><p>Quando eu parei de atualizar a página, ela continuou recebendo visitas.</p><pre>não apague o arquivo 003.</pre>':'<p>Se você está lendo isso, o site ainda está funcionando.</p><p>Eu comecei a montar estas páginas para guardar algumas coisas. Depois parei.</p><p>Não lembro exatamente por quê.</p><pre>se encontrar alguma coisa estranha, não feche a página.</pre>';
  openModal("Mensagem de boas-vindas","FILE 001 / TEXT",h)
 }
 if(k==="forbidden"){
  const h=state.opened.includes("forbidden")?'<p>Agora tem outra coisa.</p><pre>eu também achei que era o primeiro.</pre><p>Essa frase não estava aqui ontem.</p>':'<p>O arquivo deveria estar vazio.</p><p>Tem uma linha aqui:</p><pre>VOCÊ NÃO É O PRIMEIRO.</pre>';
  openModal("DO_NOT_OPEN.txt","FILE 002 / WARNING",h)
 }
 if(k==="visitors"){
  const today=new Date().toLocaleDateString("pt-BR"),h=state.visits===1?'<pre>0000  SYSTEM\n0001  05/10/2026 03:17:42\n0002  --:--:--  [sem horário]</pre><p>A segunda linha não estava aqui quando o arquivo foi criado.</p>':`<pre>0000  SYSTEM\n0001  05/10/2026 03:17:42\n0002  ${today} ${time()}  [VOCÊ]\n0003  --/--/---- --:--:--  [aguardando]</pre><p>Você abriu esta página antes. O registro sabe disso.</p>`;
  openModal("Registro de visitantes","FILE 003 / LOG",h)
 }
}
document.querySelectorAll("[data-open]").forEach(b=>b.addEventListener("click",()=>file(b.dataset.open)));
$("#statusButton").addEventListener("click",()=>openModal("Status","SYSTEM STATUS",`<p><strong style="color:#b5ff5c">ONLINE</strong></p><p>Node: 01<br>Acesso: público<br>Última resposta: ${time()}</p><p style="color:#777">Não há manutenção marcada.</p>${state.visits>1?"<p>Tem alguém conectado agora.</p>":""}`));
function write(s){const r=document.createElement("div");r.innerHTML=s;terminalOutput.appendChild(r);terminalOutput.scrollTop=terminalOutput.scrollHeight}
const commands={help:()=>state.terminalUsed?"comandos: help · status · date · whoami · open archive · log · clear":"comandos: help · status · date · whoami · open archive · clear",status:()=>state.visits>1?"NODE 01 / ONLINE / alguém está usando o arquivo.":"NODE 01 / ONLINE / signal=unstable",date:()=>new Date().toLocaleString("pt-BR"),whoami:()=>state.visits>1?"visitor_0001 / retorno confirmado":"visitor_0001","open archive":()=>"o arquivo já está aberto.",log:()=>state.terminalUsed?"última entrada: visitor_0001 / acesso repetido":"comando não encontrado.",clear:()=>{terminalOutput.innerHTML="";return""}};
terminalForm.addEventListener("submit",e=>{e.preventDefault();const v=terminalInput.value.trim().toLowerCase();if(!v)return;write('<span style="color:#b5ff5c">&gt;</span> '+esc(v));if(commands[v]){const r=commands[v]();if(r)write(r)}else write("comando não encontrado.");state.terminalUsed=true;save();terminalInput.value=""});
$("#closeTerminal").addEventListener("click",()=>terminalPanel.classList.remove("open"));
let clicks=0;$("#brandButton").addEventListener("click",()=>{if(++clicks===5){document.body.classList.add("flash");setTimeout(()=>document.body.classList.remove("flash"),220);state.visitor="0002";save();$("#visitorId").textContent="0002";openModal("Mensagem oculta","SYSTEM / NODE 02",'<p>Não era para você encontrar isso pelo logo.</p><pre>AINDA TEM ALGUÉM AQUI.</pre><p>Feche a janela e volte para o arquivo 003.</p>');clicks=0}});
$("#secretButton").addEventListener("click",()=>{state.secretClicks++;save();openModal("???","UNKNOWN FILE",state.secretClicks===1?'<p>Você clicou no único botão sem explicação.</p><pre>EVENT / SECRET_CLICK / SAVED</pre>':'<p>Você já clicou aqui.</p><pre>EVENT / SECRET_CLICK / SAVED</pre><p style="color:#777">A página não esqueceu.</p>')});
if(state.visits>1){$("#onlineText").textContent="ONLINE?";$("#connectionText").textContent="CONNECTION UNSTABLE";$("#visitorId").textContent=state.visitor}
