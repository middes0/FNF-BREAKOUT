const $ = (selector) => document.querySelector(selector);

const workspace = $("#workspace");
const enterButton = $("#enterButton");
const statusButton = $("#statusButton");
const closeWorkspace = $("#closeWorkspace");
const modal = $("#modal");
const modalTitle = $("#modalTitle");
const modalEyebrow = $("#modalEyebrow");
const modalContent = $("#modalContent");
const terminalPanel = $("#terminalPanel");
const terminalOutput = $("#terminalOutput");
const terminalForm = $("#terminalForm");
const terminalInput = $("#terminalInput");

function pad(n){ return String(n).padStart(2, "0"); }

function updateClock(){
  const now = new Date();
  $("#clock").textContent = [now.getHours(), now.getMinutes(), now.getSeconds()].map(pad).join(":");
}
setInterval(updateClock,1000);
updateClock();

function openWorkspace(){
  workspace.classList.add("open");
  workspace.setAttribute("aria-hidden","false");
  workspace.scrollIntoView({behavior:"smooth",block:"start"});
}
function closeWorkspaceView(){
  workspace.classList.remove("open");
  workspace.setAttribute("aria-hidden","true");
}

enterButton.addEventListener("click",openWorkspace);
closeWorkspace.addEventListener("click",closeWorkspaceView);

statusButton.addEventListener("click",()=>{
  openModal("SYSTEM STATUS","STATUS",`
    <p><strong style="color:#b5ff5c">ONLINE</strong></p>
    <p>Node: 01<br>Access: PUBLIC<br>Archive integrity: 97%<br>Last heartbeat: <span id="statusTime">now</span></p>
    <p>There is no scheduled maintenance.</p>
    <p style="color:#777">Nota: este aviso foi escrito antes de a manutenção ser cancelada.</p>
  `);
});

const files = {
  welcome:{
    eyebrow:"FILE 001 / TEXT",
    title:"Mensagem de boas-vindas",
    html:`
      <p>Se você está lendo isso, o site ainda está funcionando.</p>
      <p>Não procure por uma empresa. Não existe empresa.</p>
      <p>Não procure pelo dono. O dono parou de responder.</p>
      <p>Por enquanto, faça apenas uma coisa:</p>
      <pre>continue explorando.</pre>
    `
  },
  forbidden:{
    eyebrow:"FILE 002 / WARNING",
    title:"DO_NOT_OPEN.txt",
    html:`
      <p>O arquivo deveria estar vazio.</p>
      <p>Em vez disso, ele contém uma única linha:</p>
      <pre>VOCÊ NÃO É O PRIMEIRO.</pre>
      <p style="color:#777">O arquivo foi modificado enquanto você o abriu.</p>
    `
  },
  visitors:{
    eyebrow:"FILE 003 / LOG",
    title:"Registro de visitantes",
    html:`
      <pre>0000  SYSTEM
0001  05/10/2026 03:17:42
0002  --:--:--  [UNKNOWN]</pre>
      <p>A segunda entrada aparece vazia, mas ocupa espaço no arquivo.</p>
    `
  }
};

function openModal(title,eyebrow,html){
  modalEyebrow.textContent = eyebrow;
  modalTitle.textContent = title;
  modalContent.innerHTML = html;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden","false");
}
function closeModal(){
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden","true");
}
$("#modalClose").addEventListener("click",closeModal);
modal.addEventListener("click",(e)=>{ if(e.target===modal) closeModal(); });
document.addEventListener("keydown",(e)=>{
  if(e.key==="Escape"){ closeModal(); terminalPanel.classList.remove("open"); }
});

document.querySelectorAll("[data-open]").forEach((button)=>{
  button.addEventListener("click",()=>{
    const key = button.dataset.open;
    if(key==="terminal"){
      terminalPanel.classList.add("open");
      terminalInput.focus();
      return;
    }
    const file = files[key];
    if(file) openModal(file.title,file.eyebrow,file.html);
  });
});

function writeTerminal(line, className=""){
  const row = document.createElement("div");
  if(className) row.className = className;
  row.innerHTML = line;
  terminalOutput.appendChild(row);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

const commands = {
  help:()=> "comandos: help · status · date · whoami · open archive · clear",
  status:()=> "NODE 01 / ONLINE / archive=97% / signal=unstable",
  date:()=> new Date().toLocaleString("pt-BR"),
  whoami:()=> "visitor_0001",
  "open archive":()=> "arquivo já disponível na página principal.",
  clear:()=>{
    terminalOutput.innerHTML="";
    return "";
  }
};

terminalForm.addEventListener("submit",(e)=>{
  e.preventDefault();
  const value = terminalInput.value.trim().toLowerCase();
  if(!value) return;
  writeTerminal(`<span style="color:#b5ff5c">&gt;</span> ${value.replaceAll("<","&lt;")}`);
  if(commands[value]){
    const result = commands[value]();
    if(result) writeTerminal(result);
  }else{
    writeTerminal("comando não encontrado.");
  }
  terminalInput.value="";
});

$("#closeTerminal").addEventListener("click",()=>terminalPanel.classList.remove("open"));

let clicks = 0;
$("#brandButton").addEventListener("click",()=>{
  clicks++;
  if(clicks===5){
    document.body.classList.add("flash");
    setTimeout(()=>document.body.classList.remove("flash"),220);
    openModal("Mensagem oculta","SYSTEM / ???",`
      <p style="color:#b5ff5c">Você encontrou algo que não deveria estar visível.</p>
      <pre>NODE 02: "AINDA TEM ALGUÉM AQUI."</pre>
      <p>Depois de ler esta mensagem, o visitante recebe um novo identificador.</p>
    `);
    $("#visitorId").textContent="0002";
    clicks=0;
  }
});

$("#secretButton").addEventListener("click",()=>{
  openModal("???","UNKNOWN FILE",`
    <p>Você clicou no botão que não tinha função.</p>
    <p>Isso foi anotado.</p>
    <pre>EVENT / SECRET_CLICK / SAVED</pre>
  `);
});
