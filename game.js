import * as THREE from "three";

const game=document.querySelector("#game");
const start=document.querySelector("#start");
const startButton=document.querySelector("#startButton");
const taskEl=document.querySelector("#task");
const clockEl=document.querySelector("#clock");
const messageEl=document.querySelector("#message");
const promptEl=document.querySelector("#prompt");

let scene,camera,renderer,clock;
let started=false,lightsOn=true,cleaned=false,phase=1;
let keys={};
let yaw=0,pitch=0;
let player=new THREE.Vector3(0,1.65,6);
const objects=[];
const interactables=[];
const colliders=[];
const mobile={x:0,y:0};

function material(color,roughness=1){return new THREE.MeshStandardMaterial({color,roughness});}
function box(name,pos,size,color,opts={}) {
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material(color,opts.roughness??.85));
  mesh.name=name; mesh.position.set(...pos); scene.add(mesh); objects.push(mesh);
  if(opts.interact) interactables.push(mesh);
  if(opts.collider) colliders.push(mesh);
  return mesh;
}

function build(){
  scene=new THREE.Scene();
  scene.background=new THREE.Color(0x080909);
  scene.fog=new THREE.Fog(0x080909,10,32);

  camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.05,100);
  camera.rotation.order="YXZ";

  renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
  renderer.setSize(innerWidth,innerHeight);
  renderer.shadowMap.enabled=true;
  game.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff,1.8));
  scene.add(new THREE.HemisphereLight(0xffffff,0x555555,1.2));

  const floor=box("floor",[0,0,0],[16,.2,14],0x202020);
  floor.receiveShadow=true;
  box("back",[0,3,-7],[16,6,.3],0x171717,{collider:true});
  box("left",[-8,3,0],[.3,6,14],0x151515,{collider:true});
  box("right",[8,3,0],[.3,6,14],0x151515,{collider:true});
  box("front",[0,3,7],[16,6,.3],0x111111,{collider:true});

  // balcão
  box("balcao",[0,1,-3.8],[5,1.8,.9],0x302d29,{collider:true});
  box("caixa",[0,2.15,-3.8],[.65,.35,.55],0x55504a,{interact:true});

  // prateleiras
  for(let x of [-5.2,-2.7,2.7,5.2]){
    for(let z of [-1,1.5,4]){
      box("prateleira",[x,1.2,z],[1.2,2.4,.55],0x35383a,{collider:true});
      box("produto",[x,2.05,z-.03],[.65,.45,.5],0x69645a);
    }
  }

  // geladeiras
  for(let x of [-5.6,5.6]) box("geladeira",[x,2,-4.8],[1.7,4,.8],0x292d31,{collider:true});

  // porta
  box("moldura",[0,2,6.8],[3.2,4.4,.25],0x252525,{collider:true});
  box("porta",[0,2,6.62],[2.4,4,.2],0x101010,{interact:true});

  // luzes no teto
  for(let x of [-5,0,5]){
    const l=new THREE.PointLight(0xffffff,2.5,16,1.2);
    l.position.set(x,5.5,0); l.castShadow=true; l.userData.shopLight=true; scene.add(l);
    const fixture=box("lamp",[x,5.65,0],[2,.08,.35],0x383838);
    fixture.userData.light=l;
  }

  box("sign",[0,4.9,-6.75],[5,.6,.08],0x3b3b3b);
  box("signText",[0,4.93,-6.69],[3.3,.28,.04],0xb9b9b9);

  // relógio simples na parede
  box("relogio",[6.5,4.2,-6.75],[1.2,.75,.08],0x050505,{interact:true});

  window.addEventListener("resize",resize);
}

function setLights(on){
  lightsOn=on;
  scene.traverse(o=>{if(o.userData?.shopLight)o.intensity=on?2.5:0});
  scene.background.set(on?0x202328:0x1b1d21);
  scene.fog.color.set(on?0x202328:0x1b1d21);
}

function showMessage(t){
  messageEl.textContent=t; messageEl.classList.add("show");
  clearTimeout(showMessage.t); showMessage.t=setTimeout(()=>messageEl.classList.remove("show"),2500);
}

function setTask(t){taskEl.textContent=t}
function updatePrompt(){
  if(!started){promptEl.classList.remove("prompt-show");return}
  const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(0,0),camera);
  const hit=ray.intersectObjects(interactables,false)[0];
  if(hit&&hit.distance<=3.2){
    const names={caixa:"CAIXA",porta:"PORTA",relogio:"RELÓGIO"};
    promptEl.textContent="E / INTERAGIR • "+(names[hit.object.name]||"INTERAGIR");promptEl.classList.add("prompt-show");
  }else promptEl.classList.remove("prompt-show");
}

function interact(){
  const ray=new THREE.Raycaster();
  ray.setFromCamera(new THREE.Vector2(0,0),camera);
  const hits=ray.intersectObjects(interactables,false);
  if(!hits.length || hits[0].distance>3.2){showMessage("Não há nada para fazer aqui.");return}
  const o=hits[0].object;
  if(o.name==="lamp"){return}
  if(o.name==="caixa"){if(!lightsOn){showMessage("Sem energia, o caixa não liga.");return} if(phase===1){phase=2;setTask("Confira se a porta está trancada.");showMessage("Caixa ligado. Tudo parece normal.");} else if(phase===3){phase=4;setTask("Aguarde o início do turno.");showMessage("Tudo pronto. Agora é só esperar.");} else {showMessage("O caixa já está ligado.");} return}
  if(o.name==="porta"){if(phase<2){showMessage("Você ainda tem trabalho para fazer.");return} if(phase===2){phase=3;setTask("Volte até o caixa.");showMessage("Porta conferida e trancada.");} else showMessage("A porta está trancada.");return}
  if(o.name==="relogio"){showMessage("22:00. Você acabou de chegar.");return}
}

function startGame(){
  if(started)return;
  started=true; start.style.display="none";
  setLights(true); phase=1; setTask("Vá até o caixa e ligue o sistema.");
  if(innerWidth<=700)document.body.classList.add("mobile-on");
  requestAnimationFrame(loop);
  showMessage("O turno começou. Ligue o caixa e confira a loja.");
}

function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)}
function movement(dt){
  const dir=new THREE.Vector3();
  const forward=(keys.w?1:0)-(keys.s?1:0)+mobile.y;
  const side=(keys.d?1:0)-(keys.a?1:0)+mobile.x;
  dir.set(side,0,forward);
  if(dir.lengthSq()>0){
    dir.normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw);
    const next=player.clone().addScaledVector(dir,dt*3.2);
    let blocked=false;
    for(const c of colliders){const s=new THREE.Vector3();c.getWorldScale(s);const halfX=c.geometry.parameters.width*s.x/2,halfZ=c.geometry.parameters.depth*s.z/2; if(Math.abs(next.x-c.position.x)<halfX+.28&&Math.abs(next.z-c.position.z)<halfZ+.28&&next.y>c.position.y-c.geometry.parameters.height/2&&next.y<c.position.y+c.geometry.parameters.height/2){blocked=true;break;}}
    if(!blocked)player.copy(next);
  }
  player.x=THREE.MathUtils.clamp(player.x,-7.1,7.1);
  player.z=THREE.MathUtils.clamp(player.z,-6.1,6.1);
}
function updateClock(){
  const mins=Math.floor((performance.now()/1000)*1.2);
  const h=22+Math.floor(mins/60);
  const m=mins%60;
  clockEl.textContent=String(h%24).padStart(2,"0")+":"+String(m).padStart(2,"0");
  if(h>=23&&!lightsOn){setLights(true);phase=1;setTask("Confira o caixa.");showMessage("As luzes acenderam sozinhas.");}
}
function loop(){
  const dt=Math.min(clock?.getDelta?.()||.016,.05);
  movement(dt);
  camera.position.copy(player);
  camera.rotation.y=yaw; camera.rotation.x=pitch;
  updateClock();
  updatePrompt();
  renderer.render(scene,camera);
  requestAnimationFrame(loop);
}

clock=new THREE.Clock();
build();

startButton.addEventListener("click",startGame);
window.addEventListener("keydown",e=>{keys[e.key.toLowerCase()]=true;if(e.key==="e")interact()});
window.addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);
window.addEventListener("click",()=>{if(started&&innerWidth>700)renderer.domElement.requestPointerLock()});
document.addEventListener("mousemove",e=>{
  if(document.pointerLockElement!==renderer.domElement)return;
  yaw-=e.movementX*.0022; pitch-=e.movementY*.0022;
  pitch=THREE.MathUtils.clamp(pitch,-1.35,1.35);
});
document.querySelector("#interact").addEventListener("click",interact);

const stick=document.querySelector("#stick"),knob=document.querySelector("#knob");
let dragging=false;
stick.addEventListener("pointerdown",e=>{dragging=true;stick.setPointerCapture(e.pointerId)});
stick.addEventListener("pointermove",e=>{
  if(!dragging)return;
  const r=stick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  let dx=(e.clientX-cx)/45,dy=(e.clientY-cy)/45;
  const len=Math.hypot(dx,dy);if(len>1){dx/=len;dy/=len}
  mobile.x=dx;mobile.y=dy;knob.style.transform="translate("+dx*28+"px,"+dy*28+"px)";
});
stick.addEventListener("pointerup",()=>{dragging=false;mobile.x=0;mobile.y=0;knob.style.transform=""});

let lookDrag=false,lastX=0,lastY=0;
function startLook(e){
  if(e.target.closest("#stick")||e.target.closest("#interact"))return;
  lookDrag=true;lastX=e.clientX;lastY=e.clientY;
  if(e.pointerId!==undefined)document.body.setPointerCapture?.(e.pointerId);
}
function moveLook(e){
  if(!lookDrag)return;
  yaw-=(e.clientX-lastX)*.009;pitch-=(e.clientY-lastY)*.009;
  pitch=THREE.MathUtils.clamp(pitch,-1.35,1.35);
  lastX=e.clientX;lastY=e.clientY;
}
function endLook(){lookDrag=false}
document.addEventListener("pointerdown",startLook,{passive:true});
document.addEventListener("pointermove",moveLook,{passive:true});
document.addEventListener("pointerup",endLook,{passive:true});
document.addEventListener("pointercancel",endLook,{passive:true});
