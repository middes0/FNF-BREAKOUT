const $=s=>document.querySelector(s);
const KEY="tlw_state_v2";
const defaults={
  visits:0,
  opened:[],
  terminalUsed:false,
  secretClicks:0,
  visitor:"0001",
  node2Unlocked:false,
  recordingPlayed:false,
  impossibleTime:null
};

let state;
try{
  state={...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")};
  if(!Array.isArray(state.opened))state.opened=[];
}catch{
  state={...defaults};
}
state.visits++;
save();

const workspace=$("#workspace");
const modal=$("#modal");
const modalTitle=$("#modalTitle");
const modalEyebrow=$("#modalEyebrow");
const modalContent=$("#modalContent");
const terminalPanel=$("#terminalPanel");
const terminalOutput=$("#terminalOutput");
const terminalForm=$("#terminalForm");
const terminalInput=$("#terminalInput");

const pad=n=>String(n).padStart(2,"0");
const now=()=>new Date();
const time=()=>{const n=now();return[n.getHours(),n.getMinutes(),n.getSeconds()].map(pad).join(":")};
const date=()=>now().toLocaleDateString("pt-BR");

function save(){
  localStorage.setItem(KEY,JSON.stringify(state));
}

function esc(s){
  return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}

function clock(){
  $("#clock").textContent=time();
  if(state.visits>1){
    $("#lastLog").textContent="agora — alguém voltou a abrir o arquivo.";
    $("#onlineText").textContent="ONLINE?";
    $("#connectionText").textContent="CONNECTION UNSTABLE";
  }
}
setInterval(clock,1000);
clock();

function openWorkspace(){
  workspace.classList.add("open");
  workspace.setAttribute("aria-hidden","false");
  workspace.scrollIntoView({behavior:"smooth",block:"start"});
}

function closeWorkspace(){
  workspace.classList.remove("open");
  workspace.setAttribute("aria-hidden","true");
}

$("#enterButton").addEventListener("click",openWorkspace);
$("#closeWorkspace").addEventListener("click",closeWorkspace);

function openModal(title,eyebrow,html){
  modalTitle.textContent=title;
  modalEyebrow.textContent=eyebrow;
  modalContent.innerHTML=html;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden","false");
}

function closeModal(){
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden","true");
}

$("#modalClose").addEventListener("click",closeModal);
modal.addEventListener("click",e=>{
  if(e.target===modal)closeModal();
});

document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){
    closeModal();
    terminalPanel.classList.remove("open");
  }
});

function opened(key){
  if(!state.opened.includes(key)){
    state.opened.push(key);
    save();
  }
}

function clueChainComplete(){
  return state.opened.includes("welcome") &&
         state.opened.includes("visitors") &&
         state.terminalUsed &&
         state.opened.includes("forbidden");
}

function unlockNode2(){
  if(!clueChainComplete())return false;
  state.node2Unlocked=true;
  save();
  return true;
}

function file(key){
  opened(key);

  if(key==="terminal"){
    terminalPanel.classList.add("open");
    terminalPanel.setAttribute("aria-hidden","false");
    terminalInput.focus();
    return;
  }

  if(key==="welcome"){
    const hasVisitors=state.opened.includes("visitors");
    const h=hasVisitors
      ? '<p>Se você já viu o registro, não precisa que eu explique.</p><p>Eu não sei quem mantém isto funcionando.</p><p>Quando eu parei de atualizar a página, ela continuou recebendo visitas.</p><pre>não apague o arquivo 003.</pre>'
      : '<p>Se você está lendo isso, o site ainda está funcionando.</p><p>Eu comecei a montar estas páginas para guardar algumas coisas. Depois parei.</p><p>Não lembro exatamente por quê.</p><pre>se encontrar alguma coisa estranha, não feche a página.</pre>';
    openModal("Mensagem de boas-vindas","FILE 001 / TEXT",h);
    return;
  }

  if(key==="forbidden"){
    const ready=clueChainComplete();
    if(ready)unlockNode2();

    let h;
    if(state.opened.includes("forbidden") && state.opened.includes("visitors") && state.terminalUsed){
      h='<p>Agora tem outra coisa.</p><pre>eu também achei que era o primeiro.</pre><p>Essa frase não estava aqui ontem.</p><p class="muted-note">Se o terminal mostrou <code>node02</code>, não procure no menu. A cópia não aparece nele.</p>';
      if(state.node2Unlocked){
        h+='<div class="hidden-route"><a class="route-link" href="node02.html">ABRIR NODE 02 →</a><small>arquivo espelho / acesso registrado</small></div>';
      }
    }else if(state.opened.includes("forbidden")){
      h='<p>Agora tem outra coisa.</p><pre>eu também achei que era o primeiro.</pre><p>Essa frase não estava aqui ontem.</p>';
    }else{
      h='<p>O arquivo deveria estar vazio.</p><p>Tem uma linha aqui:</p><pre>VOCÊ NÃO É O PRIMEIRO.</pre>';
    }
    openModal("DO_NOT_OPEN.txt","FILE 002 / WARNING",h);
    return;
  }

  if(key==="visitors"){
    const first=state.visits===1;
    let h;
    if(first){
      h='<pre>0000  SYSTEM\n0001  05/10/2026 03:17:42\n0002  --:--:--  [sem horário]</pre><p>A segunda linha não estava aqui quando o arquivo foi criado.</p>';
    }else if(state.recordingPlayed && state.impossibleTime){
      h='<pre>0000  SYSTEM\n0001  05/10/2026 03:17:42\n0002  '+date()+' '+time()+'  [VOCÊ]\n0003  '+date()+' '+state.impossibleTime+'  [NODE 02]\n0004  --/--/---- --:--:--  [aguardando]</pre><p>O horário da linha 0003 está à frente do relógio.</p><p>Eu esperaria isso se o arquivo fosse só uma cópia. Não é.</p>';
    }else{
      h='<pre>0000  SYSTEM\n0001  05/10/2026 03:17:42\n0002  '+date()+' '+time()+'  [VOCÊ]\n0003  --/--/---- --:--:--  [aguardando]</pre><p>Você abriu esta página antes. O registro sabe disso.</p>';
    }
    openModal("Registro de visitantes","FILE 003 / LOG",h);
    return;
  }
}

document.querySelectorAll("[data-open]").forEach(button=>{
  button.addEventListener("click",()=>file(button.dataset.open));
});

$("#statusButton").addEventListener("click",()=>{
  openModal(
    "Status",
    "SYSTEM STATUS",
    '<p><strong style="color:#b5ff5c">ONLINE</strong></p><p>Node: 01<br>Acesso: público<br>Última resposta: '+time()+'</p><p style="color:#777">Não há manutenção marcada.</p>'+
    (state.visits>1?"<p>Tem alguém conectado agora.</p>":"")
  );
});

function write(value){
  const row=document.createElement("div");
  row.innerHTML=value;
  terminalOutput.appendChild(row);
  terminalOutput.scrollTop=terminalOutput.scrollHeight;
}

const commands={
  help:()=>state.terminalUsed
    ?"comandos: help · status · date · whoami · open archive · log · clear"
    :"comandos: help · status · date · whoami · open archive · clear",
  status:()=>state.visits>1
    ?"NODE 01 / ONLINE / alguém está usando o arquivo."
    :"NODE 01 / ONLINE / signal=unstable",
  date:()=>new Date().toLocaleString("pt-BR"),
  whoami:()=>state.visits>1
    ?"visitor_0001 / retorno confirmado"
    :"visitor_0001",
  "open archive":()=>"o arquivo já está aberto.",
  log:()=>{
    if(!state.terminalUsed || !state.opened.includes("visitors")){
      return "comando não encontrado.";
    }
    return state.recordingPlayed
      ?"03:17:42 / visitor_0001 / arquivo espelho acessado\n03:19:?? / [NODE 02] / retorno não confirmado"
      :"03:17:42 / visitor_0001 / acesso registrado\n03:17:43 / NODE 02 / arquivo espelho criado";
  },
  clear:()=>{
    terminalOutput.innerHTML="";
    return "";
  },
  "open node02":()=>{
    if(!clueChainComplete()){
      return "rota indisponível.";
    }
    unlockNode2();
    write("rota encontrada.");
    setTimeout(()=>location.href="node02.html",250);
    return "";
  }
};

terminalForm.addEventListener("submit",e=>{
  e.preventDefault();
  const value=terminalInput.value.trim().toLowerCase();
  if(!value)return;

  write('<span style="color:#b5ff5c">&gt;</span> '+esc(value));

  if(commands[value]){
    const result=commands[value]();
    if(result)write(result);
  }else{
    write("comando não encontrado.");
  }

  state.terminalUsed=true;
  unlockNode2();
  save();
  terminalInput.value="";
});

$("#closeTerminal").addEventListener("click",()=>{
  terminalPanel.classList.remove("open");
  terminalPanel.setAttribute("aria-hidden","true");
});

let brandClicks=0;
$("#brandButton").addEventListener("click",()=>{
  brandClicks++;
  if(brandClicks===5){
    document.body.classList.add("flash");
    setTimeout(()=>document.body.classList.remove("flash"),220);
    const unlocked=clueChainComplete();
    openModal(
      "Mensagem oculta",
      unlocked?"SYSTEM / NODE 02":"SYSTEM / UNKNOWN ROUTE",
      unlocked
        ? '<p>Você encontrou o endereço.</p><pre>NODE 02 / MIRROR</pre><p>Não era para estar no menu.</p><p><a class="route-link" href="node02.html">ABRIR NODE 02 →</a></p>'
        : '<p>O endereço existe.</p><pre>NODE 02 / MIRROR</pre><p>Mas o caminho não está aqui.</p><p>Volte para os arquivos.</p>'
    );
    brandClicks=0;
  }
});

$("#secretButton").addEventListener("click",()=>{
  state.secretClicks++;
  save();
  openModal(
    "???",
    "UNKNOWN FILE",
    state.secretClicks===1
      ? '<p>Você clicou no único botão sem explicação.</p><pre>EVENT / SECRET_CLICK / SAVED</pre>'
      : '<p>Você já clicou aqui.</p><pre>EVENT / SECRET_CLICK / SAVED</pre><p style="color:#777">A página não esqueceu.</p>'
  );
});

if(state.visits>1){
  $("#onlineText").textContent="ONLINE?";
  $("#connectionText").textContent="CONNECTION UNSTABLE";
  $("#visitorId").textContent=state.visitor;
}
