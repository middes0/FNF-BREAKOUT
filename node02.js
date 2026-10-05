const KEY="tlw_state_v2";
const $=s=>document.querySelector(s);
const app=$("#app");
const button=$("#playButton");
const wave=$("#wave");
const status=$("#recStatus");
const timeLabel=$("#recTime");
const transcript=$("#transcript");
const visitorLabel=$("#visitor");

let state;
try{
  state=JSON.parse(localStorage.getItem(KEY)||"{}");
}catch{
  state={};
}

if(!state.node2Unlocked){
  app.innerHTML='<section class="mirror-hero"><p class="eyebrow">NODE 02 / MIRROR</p><h1>Acesso negado.</h1><p class="lead">Esse endereço existe, mas você chegou aqui pelo caminho errado.</p><p><a class="route-link" href="index.html">← VOLTAR AO NODE 01</a></p></section>';
}else{
  visitorLabel.textContent=state.visitor||"0001";

  let playing=false;
  let timer=null;
  let audioContext=null;

  function futureTimestamp(){
    const d=new Date(Date.now()+120000);
    return [d.getHours(),d.getMinutes(),d.getSeconds()].map(n=>String(n).padStart(2,"0")).join(":");
  }

  function revealTranscript(){
    status.textContent="PLAYED";
    status.classList.remove("playing");
    wave.classList.remove("active");
    button.classList.remove("playing");
    button.textContent="↻";
    timeLabel.textContent="00:12 / 00:12";
    transcript.classList.add("revealed");
    transcript.innerHTML=
      '<p class="line"><span class="time">00:00</span>teste... um, dois.</p>'+
      '<p class="line"><span class="time">00:02</span>não sei se isso tá gravando.</p>'+
      '<p class="line"><span class="time">00:04</span>beleza.</p>'+
      '<p class="line"><span class="time">00:06</span>[ruído]</p>'+
      '<p class="line"><span class="time">00:08</span>espera. o horário do computador tá errado de novo.</p>'+
      '<p class="line"><span class="time">00:11</span>[clique]</p>'+
      '<p class="muted">Depois do clique não há mais áudio.</p>';
  }

  function markPlayed(){
    state.recordingPlayed=true;
    if(!state.impossibleTime)state.impossibleTime=futureTimestamp();
    localStorage.setItem(KEY,JSON.stringify(state));
    revealTranscript();
  }

  function clickTone(ctx,t,freq,duration){
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    osc.type="sine";
    osc.frequency.value=freq;
    gain.gain.setValueAtTime(.0001,t);
    gain.gain.exponentialRampToValueAtTime(.035,t+.02);
    gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t+duration+.03);
  }

  function playRecording(){
    if(playing)return;
    playing=true;
    status.textContent="PLAYING";
    status.classList.add("playing");
    wave.classList.add("active");
    button.classList.add("playing");
    button.textContent="■";

    try{
      audioContext=audioContext||new (window.AudioContext||window.webkitAudioContext)();
      const start=audioContext.currentTime+.05;
      clickTone(audioContext,start,880,.12);
      clickTone(audioContext,start+.75,440,.16);
      clickTone(audioContext,start+2.4,110,.35);
      clickTone(audioContext,start+5.8,98,.45);
      clickTone(audioContext,start+10.7,74,.15);
    }catch{}

    let seconds=0;
    clearInterval(timer);
    timer=setInterval(()=>{
      seconds++;
      timeLabel.textContent="00:"+String(Math.min(seconds,12)).padStart(2,"0")+" / 00:12";
      if(seconds>=12){
        clearInterval(timer);
        playing=false;
        markPlayed();
      }
    },1000);
  }

  button.addEventListener("click",()=>{
    if(state.recordingPlayed){
      revealTranscript();
      return;
    }
    playRecording();
  });

  if(state.recordingPlayed)revealTranscript();
}
