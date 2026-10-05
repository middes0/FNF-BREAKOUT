import * as THREE from "three";

const game=document.querySelector("#game");
const start=document.querySelector("#start");
const startButton=document.querySelector("#startButton");
const taskEl=document.querySelector("#task");
const clockEl=document.querySelector("#clock");
const messageEl=document.querySelector("#message");
const promptEl=document.querySelector("#prompt");

let scene,camera,renderer,clock;
let started=false,lightsOn=true,phase=1;
let keys={};
let yaw=0,pitch=0;
let player=new THREE.Vector3(0,1.65,5.45);
const interactables=[];
const colliders=[];
const mobile={x:0,y:0};
const textures={};

function texCanvas(width=512,height=512){
  const c=document.createElement("canvas");
  c.width=width;c.height=height;
  return c.getContext("2d");
}

function makeTexture(kind){
  if(textures[kind])return textures[kind];
  const ctx=texCanvas();
  const {canvas}=ctx;
  if(kind==="floor"){
    ctx.fillStyle="#34383a";ctx.fillRect(0,0,512,512);
    for(let y=0;y<512;y+=64){
      for(let x=0;x<512;x+=64){
        ctx.fillStyle=((x/64+y/64)%2===0)?"#3c4144":"#303437";
        ctx.fillRect(x+2,y+2,60,60);
        ctx.strokeStyle="#1f2325";ctx.lineWidth=3;ctx.strokeRect(x+1,y+1,62,62);
        ctx.strokeStyle="rgba(255,255,255,.05)";ctx.lineWidth=1;ctx.strokeRect(x+5,y+5,54,54);
      }
    }
  }else if(kind==="wall"){
    ctx.fillStyle="#626569";ctx.fillRect(0,0,512,512);
    for(let y=0;y<512;y+=32){
      ctx.fillStyle=(y/32%2===0)?"#686b6e":"#5e6164";ctx.fillRect(0,y,512,30);
      ctx.strokeStyle="rgba(255,255,255,.08)";ctx.strokeRect(0,y,512,30);
    }
    for(let i=0;i<280;i++){
      const x=Math.random()*512,y=Math.random()*512;
      ctx.fillStyle="rgba(20,20,20,"+(Math.random()*.08)+")";
      ctx.fillRect(x,y,Math.random()*5+1,Math.random()*5+1);
    }
  }else if(kind==="metal"){
    ctx.fillStyle="#454a4d";ctx.fillRect(0,0,512,512);
    for(let y=0;y<512;y+=4){
      ctx.fillStyle=y%8===0?"rgba(255,255,255,.08)":"rgba(0,0,0,.04)";
      ctx.fillRect(0,y,512,1);
    }
  }else if(kind==="shelf"){
    ctx.fillStyle="#272b2d";ctx.fillRect(0,0,512,512);
    for(let y=0;y<512;y+=48){
      ctx.fillStyle="#303538";ctx.fillRect(0,y,512,42);
      ctx.fillStyle="rgba(255,255,255,.07)";ctx.fillRect(0,y,512,2);
      ctx.fillStyle="rgba(0,0,0,.2)";ctx.fillRect(0,y+39,512,3);
    }
  }else if(kind==="wood"){
    ctx.fillStyle="#4a4037";ctx.fillRect(0,0,512,512);
    for(let x=0;x<512;x+=18){
      ctx.strokeStyle="rgba(255,255,255,.045)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+8,512);ctx.stroke();
    }
    for(let y=35;y<512;y+=90){
      ctx.strokeStyle="rgba(0,0,0,.16)";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(512,y+4);ctx.stroke();
    }
  }else if(kind==="glass"){
    ctx.fillStyle="rgba(110,125,140,.28)";ctx.fillRect(0,0,512,512);
    for(let i=-512;i<512;i+=70){
      ctx.strokeStyle="rgba(255,255,255,.13)";ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+512,512);ctx.stroke();
    }
  }else if(kind==="ceiling"){
    ctx.fillStyle="#e5e6e6";ctx.fillRect(0,0,512,512);
    for(let x=0;x<512;x+=128){ctx.strokeStyle="#c7c9c9";ctx.lineWidth=6;ctx.strokeRect(x+3,3,122,506);}
    for(let y=0;y<512;y+=128){ctx.strokeStyle="#c7c9c9";ctx.lineWidth=6;ctx.strokeRect(3,y+3,506,122);}
  }else if(kind==="sign"){
    ctx.fillStyle="#202327";ctx.fillRect(0,0,512,512);
    ctx.fillStyle="#d9dcde";ctx.font="bold 70px Arial";ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.fillText("LOJA 24H",256,210);
    ctx.fillStyle="#8f77c9";ctx.fillRect(90,290,332,12);
    ctx.fillStyle="#9fa4a8";ctx.font="24px Arial";ctx.fillText("SEMPRE ABERTA",256,350);
  }else if(kind.startsWith("label-")){
    const palette={
      "label-soda":"#c44747","label-water":"#4d86c6","label-snack":"#d0a24a",
      "label-milk":"#e5e2d8","label-energy":"#8f77c9","label-cereal":"#71964e"
    };
    ctx.fillStyle=palette[kind]||"#777";ctx.fillRect(0,0,512,512);
    ctx.fillStyle="rgba(255,255,255,.88)";ctx.fillRect(30,34,452,90);
    ctx.fillStyle="#202020";ctx.font="bold 44px Arial";ctx.textAlign="center";ctx.textBaseline="middle";
    const names={soda:"SODA",water:"ÁGUA",snack:"SNACK",milk:"LEITE",energy:"ENERGY",cereal:"CEREAL"};
    const key=kind.slice(6);ctx.fillText(names[key]||"PRODUTO",256,79);
    ctx.fillStyle="rgba(255,255,255,.65)";ctx.font="28px Arial";ctx.fillText("LOJA 24H",256,350);
  }
  const t=new THREE.CanvasTexture(canvas);
  t.wrapS=t.wrapT=THREE.RepeatWrapping;
  t.colorSpace=THREE.SRGBColorSpace;
  textures[kind]=t;
  return t;
}

function mat(color,opts={}){
  return new THREE.MeshStandardMaterial({
    color:color??0xffffff,
    map:opts.texture?makeTexture(opts.texture):null,
    roughness:opts.roughness??.78,
    metalness:opts.metalness??0
  });
}

function box(name,pos,size,options={}){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),options.material||mat(options.color??0xffffff,{texture:options.texture,roughness:options.roughness,metalness:options.metalness}));
  mesh.name=name;mesh.position.set(...pos);
  scene.add(mesh);
  if(options.interact)interactables.push(mesh);
  if(options.collider)colliders.push(mesh);
  mesh.castShadow=options.castShadow!==false;
  mesh.receiveShadow=options.receiveShadow!==false;
  return mesh;
}

function cylinder(name,pos,radius,height,material,options={}){
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,20),material||mat(0xffffff));
  mesh.name=name;mesh.position.set(...pos);scene.add(mesh);
  mesh.castShadow=true;mesh.receiveShadow=true;
  if(options.interact)interactables.push(mesh);
  return mesh;
}

function textPlane(text,pos,size,color="#ffffff",bg="rgba(0,0,0,.55)"){
  const ctx=texCanvas(1024,256);
  ctx.clearRect(0,0,1024,256);
  ctx.fillStyle=bg;ctx.fillRect(24,24,976,208);
  ctx.strokeStyle="rgba(255,255,255,.12)";ctx.lineWidth=4;ctx.strokeRect(24,24,976,208);
  ctx.fillStyle=color;ctx.font="700 78px Arial";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(text,512,128);
  const t=new THREE.CanvasTexture(ctx.canvas);t.colorSpace=THREE.SRGBColorSpace;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(size[0],size[1]),new THREE.MeshBasicMaterial({map:t,transparent:true}));
  mesh.position.set(...pos);mesh.rotation.y=Math.PI;scene.add(mesh);return mesh;
}

function addProductLine(x,z,type){
  const colors={
    soda:0xc44747,water:0x4d86c6,snack:0xd0a24a,milk:0xe5e2d8,energy:0x8f77c9,cereal:0x71964e
  };
  const variants=[0,1,2,3];
  for(let i=0;i<4;i++){
    const px=x-0.45+i*.3;
    const y=1.55+(i%2)*.55;
    const p=cylinder("produto",[px,y,z],.12,.35,mat(colors[type],{texture:"label-"+type,roughness:.5}));
    p.rotation.z=Math.PI/2;
  }
}

function addShelfUnit(x,z){
  const metal=mat(0x313638,{texture:"metal",roughness:.64,metalness:.25});
  box("shelfFrame",[x,1.55,z],[1.15,3.1,.72],{material:metal,collider:true});
  for(const y of [.55,1.25,1.95,2.65]){
    box("shelf",[x,y,z],[1.35,.08,.88],{material:mat(0x2b2f31,{texture:"shelf",roughness:.72}),castShadow:true});
  }
  for(const side of [-.54,.54]){
    box("shelfPost",[x+side,1.58,z],[.08,3.05,.9],{material:metal});
  }
  addProductLine(x,z,"soda");
  addProductLine(x,z-.26,"snack");
}

function addFridge(x){
  const body=mat(0x3d4246,{texture:"metal",roughness:.42,metalness:.35});
  box("geladeiraBody",[x,2,-4.9],[2.3,4,.9],{material:body,collider:true});
  const glass=mat(0xbcc8d4,{texture:"glass",roughness:.18,metalness:.05});
  for(let i=-1;i<=1;i++){
    box("fridgeDoor",[x+i*.67,2,-4.43],[.6,3.55,.035],{material:glass});
    box("fridgeFrame",[x+i*.67,2,-4.48],[.07,3.75,.08],{material:body});
    for(let y of [1,1.9,2.8,3.55]){
      cylinder("bebida",[x+i*.67,y,-4.38],.07,.34,mat(0x79a8ce,{roughness:.4}));
    }
  }
  box("fridgeTop",[x,4.04,-4.9],[2.35,.12,.95],{material:body});
}

function build(){
  scene=new THREE.Scene();
  scene.background=new THREE.Color(0x202328);
  scene.fog=new THREE.Fog(0x202328,13,34);

  camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.05,100);
  camera.rotation.order="YXZ";

  renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
  renderer.setSize(innerWidth,innerHeight);
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  game.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff,1.8));
  scene.add(new THREE.HemisphereLight(0xffffff,0x555555,1.2));

  const floor=box("floor",[0,0,0],[16,.2,14],{color:0xffffff,texture:"floor",roughness:.92,receiveShadow:true,castShadow:false});
  floor.receiveShadow=true;

  box("back",[0,3,-7],[16,6,.3],{color:0xffffff,texture:"wall",collider:true});
  box("left",[-8,3,0],[.3,6,14],{color:0xffffff,texture:"wall",collider:true});
  box("right",[8,3,0],[.3,6,14],{color:0xffffff,texture:"wall",collider:true});
  box("front",[0,3,7],[16,6,.3],{color:0xffffff,texture:"wall",collider:true});
  box("ceiling",[0,6.05,0],[16,.2,14],{color:0xffffff,texture:"ceiling",roughness:.95,castShadow:false});

  // balcão e área do caixa
  box("balcaoBase",[0,1.05,-3.72],[5.5,2,.95],{color:0xffffff,texture:"wood",collider:true});
  box("balcaoTop",[0,2.08,-3.72],[5.75,.16,1.08],{color:0xddd9d3,texture:"wood",roughness:.62});
  box("balcaoTrim",[0,1.55,-3.21],[5.25,.12,.08],{color:0x8f77c9});
  box("caixa",[0,2.34,-3.72],[.78,.42,.65],{color:0x1b1d20,texture:"metal",roughness:.4,metalness:.35,interact:true});
  box("screen",[0,2.65,-3.72],[.5,.26,.08],{color:0x8f77c9});
  cylinder("scanner",[.56,2.34,-3.78],.1,.22,mat(0x33383b,{metalness:.45,roughness:.3}));
  textPlane("CAIXA",[0,2.82,-3.24],[1.5,.35],"#ffffff","rgba(20,20,22,.82)");

  // estantes laterais
  for(const z of [-.5,2.15,4.35]){
    addShelfUnit(-5.1,z);
    addShelfUnit(5.1,z);
  }

  // geladeiras no fundo
  addFridge(-1.45);
  addFridge(1.45);

  // ilha central baixa para snacks
  for(const z of [.2,2.2]){
    box("island",[0,1.05,z],[3.8,2,.75],{color:0xffffff,texture:"shelf",collider:true});
    box("islandTop",[0,2.08,z],[4,.14,.82],{color:0x8f77c9});
    for(const x of [-1.35,-.9,-.45,0,.45,.9,1.35]){
      box("snackBox",[x,1.34,z-.05],[.28,.42,.45],{color:0xd0a24a,texture:"label-snack",roughness:.55});
      box("snackBox2",[x,1.58,z+.12],[.28,.32,.42],{color:0x4d86c6,texture:"label-water",roughness:.55});
    }
  }

  // porta de entrada
  box("moldura",[0,2,6.82],[3.6,4.55,.26],{color:0x272b2d,texture:"metal",collider:true});
  box("porta",[0,2,6.62],[2.75,4.15,.08],{color:0x46525a,texture:"glass",roughness:.2,interact:true});
  box("doorBar",[0,2,6.5],[.08,4,.12],{color:0x262a2c,texture:"metal"});
  box("doorHandle",[1.05,1.9,6.43],[.08,.55,.08],{color:0x8f77c9,texture:"metal",roughness:.3,metalness:.65});

  // fachada interna
  const sign=box("sign",[0,5.02,-6.78],[5.8,.9,.08],{color:0xffffff,texture:"sign",roughness:.5});
  sign.castShadow=false;

  // placas das seções
  textPlane("BEBIDAS",[-5.08,3.5,-6.52],[2.25,.48],"#e8edf0","rgba(38,43,46,.92)");
  textPlane("MERCEARIA",[5.08,3.5,-6.52],[2.65,.48],"#e8edf0","rgba(38,43,46,.92)");

  // luminárias — mesma intensidade aprovada
  for(const x of [-5,0,5]){
    const l=new THREE.PointLight(0xffffff,2.5,16,1.2);
    l.position.set(x,5.55,0);l.castShadow=true;l.userData.shopLight=true;scene.add(l);
    const fixture=box("lamp",[x,5.64,0],[2.25,.08,.42],{color:0x45494c,texture:"metal",roughness:.5});
    box("lampGlow",[x,5.57,0],[1.5,.03,.18],{color:0xf5f7f7,roughness:.2});
    fixture.userData.light=l;
  }

  // relógio
  const clockMat=mat(0xf0f0ee,{roughness:.8});
  const clockFace=cylinder("relogio",[6.72,4.48,-6.79],.56,.08,clockMat,{interact:true});
  clockFace.rotation.x=Math.PI/2;
  cylinder("clockRing",[6.72,4.48,-6.83],.62,.06,mat(0x1a1d1f,{metalness:.45,roughness:.35}));
  textPlane("22:00",[6.72,4.48,-6.9],[1.15,.35],"#1b1d1f","rgba(255,255,255,.0)");

  window.addEventListener("resize",resize);
}

function setLights(on){
  lightsOn=on;
  scene.traverse(o=>{if(o.userData?.shopLight)o.intensity=on?2.5:0});
  scene.background.set(on?0x202328:0x1b1d21);
  scene.fog.color.set(on?0x202328:0x1b1d21);
}

function showMessage(t){
  messageEl.textContent=t;messageEl.classList.add("show");
  clearTimeout(showMessage.t);showMessage.t=setTimeout(()=>messageEl.classList.remove("show"),2500);
}
function setTask(t){taskEl.textContent=t}

function targetName(o){
  const names={caixa:"CAIXA",porta:"PORTA",relogio:"RELÓGIO"};
  return names[o.name]||"INTERAGIR";
}

function updatePrompt(){
  if(!started){promptEl.classList.remove("prompt-show");return}
  const ray=new THREE.Raycaster();
  ray.setFromCamera(new THREE.Vector2(0,0),camera);
  const hit=ray.intersectObjects(interactables,false)[0];
  if(hit&&hit.distance<=3.2){
    promptEl.textContent="E / INTERAGIR • "+targetName(hit.object);
    promptEl.classList.add("prompt-show");
  }else promptEl.classList.remove("prompt-show");
}

function interact(){
  const ray=new THREE.Raycaster();
  ray.setFromCamera(new THREE.Vector2(0,0),camera);
  const hits=ray.intersectObjects(interactables,false);
  if(!hits.length||hits[0].distance>3.2){showMessage("Não há nada para fazer aqui.");return}
  const o=hits[0].object;
  if(o.name==="caixa"){
    if(phase===1){phase=2;setTask("Confira se a porta está trancada.");showMessage("Caixa ligado. Tudo parece normal.");}
    else if(phase===3){phase=4;setTask("Aguarde o início do turno.");showMessage("Tudo pronto. Agora é só esperar.");}
    else showMessage("O caixa já está ligado.");
    return;
  }
  if(o.name==="porta"){
    if(phase<2){showMessage("Você ainda tem trabalho para fazer.");return}
    if(phase===2){phase=3;setTask("Volte até o caixa.");showMessage("Porta conferida e trancada.");}
    else showMessage("A porta está trancada.");
    return;
  }
  if(o.name==="relogio"){showMessage("22:00. Você acabou de chegar.");return}
}

function startGame(){
  if(started)return;
  started=true;start.style.display="none";setLights(true);
  phase=1;setTask("Vá até o caixa e ligue o sistema.");
  if(innerWidth<=700)document.body.classList.add("mobile-on");
  requestAnimationFrame(loop);
  showMessage("O turno começou. Ligue o caixa e confira a loja.");
}

function resize(){
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
}

function blockedAt(next){
  for(const c of colliders){
    const p=c.geometry.parameters;
    if(!p?.width||!p?.depth||!p?.height)continue;
    const halfX=p.width/2+.32,halfZ=p.depth/2+.32;
    if(Math.abs(next.x-c.position.x)<halfX&&Math.abs(next.z-c.position.z)<halfZ&&next.y>c.position.y-p.height/2-0.2&&next.y<c.position.y+p.height/2+0.2)return true;
  }
  return false;
}

function movement(dt){
  const dir=new THREE.Vector3();
  const forward=(keys.w?1:0)-(keys.s?1:0)-mobile.y;
  const side=(keys.d?1:0)-(keys.a?1:0)+mobile.x;
  dir.set(side,0,forward);
  if(dir.lengthSq()>0){
    dir.normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw);
    const next=player.clone().addScaledVector(dir,dt*3.2);
    if(!blockedAt(next))player.copy(next);
  }
  player.x=THREE.MathUtils.clamp(player.x,-7.1,7.1);
  player.z=THREE.MathUtils.clamp(player.z,-6.1,6.1);
}

function updateClock(){
  const mins=Math.floor((performance.now()/1000)*1.2);
  const h=22+Math.floor(mins/60);
  const m=mins%60;
  clockEl.textContent=String(h%24).padStart(2,"0")+":"+String(m).padStart(2,"0");
}

function loop(){
  const dt=Math.min(clock?.getDelta?.()||.016,.05);
  movement(dt);
  camera.position.copy(player);
  camera.rotation.y=yaw;camera.rotation.x=pitch;
  updateClock();
  updatePrompt();
  renderer.render(scene,camera);
  requestAnimationFrame(loop);
}

clock=new THREE.Clock();
build();

startButton.addEventListener("click",startGame);
window.addEventListener("keydown",e=>{keys[e.key.toLowerCase()]=true;if(e.key.toLowerCase()==="e")interact()});
window.addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);
window.addEventListener("click",()=>{if(started&&innerWidth>700)renderer.domElement.requestPointerLock()});

document.addEventListener("mousemove",e=>{
  if(document.pointerLockElement!==renderer.domElement)return;
  yaw-=e.movementX*.0022;pitch-=e.movementY*.0022;
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
  mobile.x=dx;mobile.y=dy;
  knob.style.transform="translate("+dx*28+"px,"+dy*28+"px)";
});
stick.addEventListener("pointerup",()=>{dragging=false;mobile.x=0;mobile.y=0;knob.style.transform=""});
stick.addEventListener("pointercancel",()=>{dragging=false;mobile.x=0;mobile.y=0;knob.style.transform=""});

let lookDrag=false,lastX=0,lastY=0;
function startLook(e){
  if(e.target.closest("#stick")||e.target.closest("#interact"))return;
  lookDrag=true;lastX=e.clientX;lastY=e.clientY;
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
