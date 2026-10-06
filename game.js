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
let anomalyTriggered=false;
let explorationStartedAt=0;
const shopLights=[];
let keys={};
let audioCtx=null;
let audioStarted=false;
let ambienceNodes=[];
let shiftStartedAt=0;
let lastMinute=0;
let yaw=0,pitch=0;
let player=new THREE.Vector3(0,1.9,5.45);
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

function addAisleRow(x,z,length,types){
  const metal=mat(0x303538,{texture:"metal",roughness:.58,metalness:.28});
  box("aisleBack",[x,1.68,z],[.14,3.25,length],{material:metal,collider:true});
  for(const y of [.58,1.27,1.96,2.65]){
    box("aisleShelf",[x,y,z],[1.18,.08,length],{material:mat(0x2b2f31,{texture:"shelf",roughness:.72})});
  }
  for(const side of [-.54,.54]){
    box("aislePost",[x+side,1.62,z],[.08,3.15,length+.05],{material:metal});
  }

  const colors={
    soda:0xc44747,water:0x4d86c6,snack:0xd0a24a,milk:0xe5e2d8,energy:0x8f77c9,cereal:0x71964e
  };
  const steps=Math.max(4,Math.floor(length/0.62));
  for(let i=0;i<steps;i++){
    const pz=z-length/2+.35+i*(length-.7)/Math.max(1,steps-1);
    for(const side of [-1,1]){
      const type=types[(i+(side===1?1:0))%types.length];
      for(const y of [1.0,1.68,2.36]){
        box("produtoAisle",[x+side*.64,y,pz],[.24,.34,.34],{
          color:colors[type],texture:"label-"+type,roughness:.55
        });
      }
    }
  }

  textPlane("CORREDOR", [x,3.6,z-length/2+.15],[1.9,.36],"#f0f2f3","rgba(28,31,33,.9)");
}

function addStockAndServiceArea(){
  // Pequeno estoque visível ao fundo, com caixas e paletes.
  box("pallet",[6.35,.18,-5.85],[2.3,.22,1.55],{color:0x4a4037,texture:"wood",roughness:.85,collider:true});
  for(const [x,z,y,sx,sz] of [
    [5.65,-5.85,.62,.72,.58],[6.45,-5.85,.62,.72,.58],[7.25,-5.85,.62,.72,.58],
    [5.85,-5.35,1.18,.7,.55],[6.65,-5.35,1.18,.7,.55],[7.2,-5.35,1.18,.6,.5]
  ]){
    box("caixaEstoque",[x,y,z],[sx,.58,sz],{color:0x665646,texture:"wood",roughness:.86,collider:true});
  }
  textPlane("ESTOQUE",[6.35,3.15,-6.32],[2.1,.42],"#e8edf0","rgba(35,38,40,.94)");

  // Banheiro/serviço como área visual secundária.
  box("serviceDoor",[-6.15,2.05,-6.66],[2.1,4.15,.13],{color:0x3a3f42,texture:"metal",roughness:.55,collider:true,interact:true});
  box("serviceHandle",[-5.45,1.95,-6.56],[.08,.55,.08],{color:0x8f77c9,texture:"metal",roughness:.3,metalness:.65});
  textPlane("BANHEIRO",[ -6.15,4.55,-6.58],[2.25,.5],"#edf0f1","rgba(35,38,40,.94)");

  // Carrinhos e área de entrada.
  for(const x of [2.35,2.85,3.35]){
    box("carrinho",[x,.62,5.15],[.62,.5,1.05],{color:0x4a5053,texture:"metal",roughness:.55,metalness:.22});
    for(const z of [4.7,5.55]) cylinder("rodaCarrinho",[x,.28,z],.1,.08,mat(0x181b1d,{metalness:.35,roughness:.45}));
  }
  textPlane("ENTRADA",[3.0,2.25,5.78],[2.0,.4],"#f0f2f3","rgba(35,38,40,.9)");
}

function smallLabel(text,pos,size,rotationY=Math.PI,bg="rgba(245,245,242,.96)",color="#222"){
  const mesh=textPlane(text,pos,size,color,bg);
  mesh.rotation.y=rotationY;
  return mesh;
}

function addShelfPriceTags(){
  const tags=[
    [-5.5,.72,-1.7,"R$ 6,49"],[-5.5,1.42,-1.7,"R$ 4,99"],[-5.5,2.12,-1.7,"R$ 7,49"],
    [-5.5,.72,1.0,"R$ 5,99"],[-5.5,1.42,1.0,"R$ 8,49"],[-5.5,2.12,1.0,"R$ 3,99"],
    [5.5,.72,-1.7,"R$ 7,99"],[5.5,1.42,-1.7,"R$ 10,49"],[5.5,2.12,-1.7,"R$ 12,99"],
    [5.5,.72,1.0,"R$ 4,49"],[5.5,1.42,1.0,"R$ 6,99"],[5.5,2.12,1.0,"R$ 9,49"]
  ];
  for(const [x,y,z,t] of tags) smallLabel(t,[x,y,z],[.62,.22],x<0?-Math.PI/2:Math.PI/2);
  
  // Etiquetas de preço nos dois novos corredores, voltadas para cada lado.
  for(const x of [-2.72,1.38,2.72,-1.38]){
    const side=x<0?Math.PI/2:-Math.PI/2;
    for(const z of [-.45,1.0,2.45]){
      smallLabel(z<0?"R$ 11,90":"R$ 5,50",[x,1.05,z],[.58,.2],side);
    }
  }
}

function addCheckoutDetails(){
  const dark=mat(0x15181a,{texture:"metal",roughness:.38,metalness:.42});
  const white=mat(0xdfe2e4,{roughness:.34,metalness:.05});
  // Impressora/terminal e rolo de recibos.
  box("terminalCaixa",[.02,2.82,-3.58],[.55,.12,.42],{material:dark});
  box("printer",[ -.32,2.29,-3.52],[.34,.28,.36],{material:white});
  cylinder("papelRecibo",[-.32,2.47,-3.34],.08,.11,mat(0xf1f1ee,{roughness:.72}));
  // Sacolas e suporte.
  box("suporteSacolas",[1.05,1.72,-3.62],[.35,.85,.5],{material:dark,collider:true});
  for(let y=1.52;y<=2.08;y+=.19){
    box("sacola",[1.05,y,-3.31],[.23,.14,.05],{color:0xbfc3c5,roughness:.72});
  }
  // Área de saída do cliente.
  box("balcaoApoio",[0,1.0,-2.95],[2.1,1.8,.62],{color:0x34383b,texture:"wood",roughness:.7});
  smallLabel("PAGUE AQUI", [0,2.02,-2.62],[1.7,.34],Math.PI,"rgba(25,28,30,.92)","#f0f2f3");
  // Faixa de piso para orientar a fila.
  for(const z of [-2.15,-1.45,-.75]){
    box("filaMarca",[0,.115,z],[2.4,.025,.08],{color:0x8f77c9,roughness:.55});
  }
}

function addExplorationPoints(){
  // Pontos opcionais para examinar durante a exploração livre.
  const screen=document.getElementById("screen");
  const panel=document.getElementById("painelParede");
}

function addStoreDetails(){
  // Lixeiras e pequenos avisos em pontos de circulação.
  smallLabel("RECICLAGEM",[7.35,2.05,2.4],[1.55,.34],Math.PI,"rgba(35,38,40,.9)","#e8edf0");
  smallLabel("ATENÇÃO AO PISO MOLHADO",[-7.35,1.75,3.0],[2.35,.34],Math.PI,"rgba(35,38,40,.9)","#e8edf0");
  
  // Relógio de parede complementar.
  box("wallClockPanel",[7.42,3.45,-2.0],[.12,1.05,1.5],{color:0x25292c,texture:"metal",roughness:.58});
  cylinder("wallClockFace",[7.32,3.45,-2.0],.45,.06,mat(0xe8e7e2,{roughness:.8}));
  // Bancada de apoio com caixas pequenas.
  box("apoioEstoque",[6.35,1.1,-5.15],[1.7,.18,.72],{color:0x3e4447,texture:"metal",roughness:.62,metalness:.25});
  for(const x of [5.8,6.35,6.9]){
    box("miniCaixa",[x,1.43,-5.15],[.42,.48,.42],{color:0x665646,texture:"wood",roughness:.86});
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
    box("fridgeDoor",[x+i*.67,2,-4.43],[.6,3.55,.035],{material:glass,interact:true});
    box("fridgeFrame",[x+i*.67,2,-4.48],[.07,3.75,.08],{material:body});
    for(let y of [1,1.9,2.8,3.55]){
      cylinder("bebida",[x+i*.67,y,-4.38],.07,.34,mat(0x79a8ce,{roughness:.4}));
    }
  }
  box("fridgeTop",[x,4.04,-4.9],[2.35,.12,.95],{material:body});
}


function addCylinderProp(name,pos,radius,height,color,options={}){
  const m=mat(color,{roughness:options.roughness??.75,metalness:options.metalness??0});
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,16),m);
  mesh.name=name;mesh.position.set(...pos);scene.add(mesh);
  mesh.castShadow=true;mesh.receiveShadow=true;
  return mesh;
}

function addBasket(x,z){
  const basket=box("cesta",[x,.62,z],[.78,.48,.55],{color:0x42484b,texture:"metal",roughness:.52,metalness:.18});
  basket.castShadow=true;
  const handle=new THREE.Mesh(new THREE.TorusGeometry(.28,.035,8,20,Math.PI),mat(0x5e666a,{metalness:.25,roughness:.45}));
  handle.position.set(x,.96,z);handle.rotation.x=Math.PI/2;scene.add(handle);
}

function addBin(x,z){
  const bin=addCylinderProp("lixeira",[x,.65,z],.32,1.05,0x25292b,{metalness:.25,roughness:.6});
  const lid=addCylinderProp("lixeiraTampa",[x,1.18,z],.35,.08,0x111416,{metalness:.55,roughness:.35});
  return {bin,lid};
}

function addCamera(x,z,rot=0){
  const mount=box("cameraMount",[x,5.45,z],[.26,.22,.42],{color:0x121416,texture:"metal",metalness:.45,roughness:.35});
  const lens=new THREE.Mesh(new THREE.CylinderGeometry(.095,.095,.12,16),mat(0x151a20,{metalness:.55,roughness:.22}));
  lens.position.set(x,5.32,z);lens.rotation.x=Math.PI/2; lens.rotation.z=rot; scene.add(lens);
}

function addDecorations(){
  addBasket(-6.45,5.55);
  addBasket(-5.55,5.55);
  addBin(6.65,5.45);
  addBin(-6.75,-5.75);

  // tapete de entrada
  box("tapete",[0,.13,5.98],[2.9,.08,1.45],{color:0x25292b,texture:"metal",roughness:.92});
  for(let x=-1.1;x<=1.1;x+=.55){
    box("tapeteStripe",[x,.18,5.98],[.11,.02,1.15],{color:0x8f77c9,roughness:.7});
  }

  // ventilação e estrutura no teto
  for(const x of [-4.3,4.3]){
    box("vent", [x,5.86,-4.1],[1.25,.08,.85],{color:0xc9ccce,texture:"metal",roughness:.78,metalness:.18});
    for(let z=-4.38;z<=-3.82;z+=.14) box("ventSlat",[x,5.92,z],[.9,.03,.035],{color:0x777d80,metalness:.25,roughness:.58});
  }

  // câmera de segurança e pequenos detalhes
  addCamera(-7.45,-5.9,-.35);
  addCamera(7.45,-5.9,.35);
  box("painelParede",[-7.8,2.6,-2.6],[.05,1.25,.85],{color:0x202428,texture:"metal",metalness:.35,roughness:.5,interact:true});
  for(let y=2.2;y<=2.9;y+=.24) addCylinderProp("painelLed",[-7.72,y,-2.6],.035,.08,0x8f77c9,{roughness:.25});

  addStockAndServiceArea();
  addBasket(4.15,5.25);
  addStoreDetails();
  addExplorationPoints();
}


function addVisualOverhaul(){
  // Reforma visual: transformar a loja em um supermercado mais convincente,
  // com hierarquia de corredores, pontos de destaque e pequenos detalhes.
  const dark=mat(0x171a1c,{texture:"metal",roughness:.5,metalness:.3});
  const light=mat(0xe7e5dc,{roughness:.72});
  const purple=mat(0x6f5aa8,{roughness:.5});
  const red=mat(0x9b3438,{roughness:.52});
  const green=mat(0x536b45,{roughness:.58});

  // Faixa de destaque no alto das paredes.
  for(const z of [-6.82,6.82]){
    box("wallBand",[0,4.65,z],[15.5,.22,.08],{material:dark});
    box("wallBandAccent",[0,4.49,z],[15.5,.045,.09],{material:purple});
  }

  // Cabeceiras dos corredores: dão sensação de supermercado real.
  const heads=[[-2.05,-1.48,"LIMPEZA"],[2.05,-1.48,"MERCEARIA"],[-2.05,3.55,"BEBIDAS"],[2.05,3.55,"LANCHES"]];
  for(const [x,z,label] of heads){
    box("aisleEnd",[x,1.7,z],[1.42,3.45,.22],{material:dark,collider:true});
    box("aisleEndTop",[x,3.52,z],[1.48,.32,.3],{material:purple});
    textPlane(label,[x,3.56,z+.14],[1.25,.28],"#f2f0ea","rgba(20,21,23,.96)");
  }

  // Ilha promocional central, quebrando o aspecto de sala vazia.
  box("promoBase",[0,.62,.25],[1.45,1.05,.9],{material:dark,collider:true});
  box("promoTop",[0,1.18,.25],[1.58,.12,1.02],{material:light});
  textPlane("OFERTAS",[0,1.55,.72],[1.28,.3],"#fff","rgba(117,43,48,.96)");
  for(const x of [-.42,0,.42]){
    box("promoProduct",[x,1.52,.08],[.22,.52,.24],{color:0xc44747,texture:"label-soda",roughness:.48});
  }

  // Caixas de hortifruti decorativas para variar cores e formas.
  for(const x of [-6.55,-5.8,5.8,6.55]){
    box("crate",[x,.42,4.1],[.62,.58,.72],{material:mat(0x65513c,{texture:"wood",roughness:.88})});
    for(const z of [3.92,4.16]){
      cylinder("produce",[x,.78,z],.13,.22,mat(x<0?0x6b7e48:0x8a513d,{roughness:.72}));
    }
  }

  // Faixas penduradas no teto e placas de seção.
  for(const [x,label] of [[-4.1,"BEBIDAS"],[4.1,"MERCEARIA"]]){
    box("hangingSign",[x,4.82,-.2],[2.15,.72,.08],{material:dark});
    textPlane(label,[x,4.82,.25],[1.9,.42],"#f0edf5","rgba(55,43,77,.98)");
  }

  // Linha de luminárias distribuídas por profundidade, evitando a iluminação plana.
  for(const z of [-4.5,-1.5,1.5,4.5]){
    for(const x of [-4.7,0,4.7]){
      box("ceilingFixture",[x,5.72,z],[1.35,.07,.25],{color:0x3a3e40,texture:"metal",roughness:.48});
      box("ceilingGlow",[x,5.665,z],[.92,.025,.12],{color:0xf4f1df,roughness:.22});
    }
  }

  // Rodapé e colunas estruturais para dar escala ao prédio.
  for(const x of [-7.65,7.65]){
    box("cornerColumn",[x,2.85,0],[.28,5.7,12.8],{material:dark});
  }

  // Pequenos detalhes de uso: lixeira, placa de promoção e fila.
  box("promoPoster",[-7.76,2.85,.25],[.04,1.55,1.05],{color:0x752f36,roughness:.7});
  textPlane("2 POR 1",[-7.70,2.85,.25],[.9,.45],"#fff","rgba(117,47,54,.96)").rotation.y=-Math.PI/2;
  for(const z of [4.9,5.35,5.8]){
    box("queueRail",[0,.62,z],[2.7,.06,.05],{material:purple});
  }

  // Fachada interna do caixa mais reconhecível.
  box("checkoutBack",[0,3.25,-4.18],[5.8,2.05,.18],{material:dark});
  box("checkoutGlow",[0,3.62,-4.06],[4.65,.06,.04],{material:purple});
  textPlane("CAIXAS",[0,3.42,-4.05],[2.25,.4],"#f4f1f6","rgba(24,26,28,.95)");

  // Pequenas marcas de desgaste quebram o visual excessivamente limpo.
  for(const [x,z] of [[-7.1,-4.8],[7.0,-4.2],[-7.0,2.2],[7.0,2.8]]){
    box("wallMark",[x,.9,z],[.025,.75,.35],{color:0x3b3e40,roughness:1});
  }
}

function createAmbientAudio(){
  if(audioStarted)return;
  audioStarted=true;
  try{
    audioCtx=new (window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==="suspended")audioCtx.resume();

    const master=audioCtx.createGain();
    master.gain.value=.12;master.connect(audioCtx.destination);

    const hum=audioCtx.createOscillator();
    const humGain=audioCtx.createGain();
    hum.type="sine";hum.frequency.value=58;humGain.gain.value=.035;
    hum.connect(humGain).connect(master);hum.start();ambienceNodes.push(hum,humGain);

    const buzz=audioCtx.createOscillator();
    const buzzGain=audioCtx.createGain();
    buzz.type="sawtooth";buzz.frequency.value=112; buzzGain.gain.value=.006;
    buzz.connect(buzzGain).connect(master);buzz.start();ambienceNodes.push(buzz,buzzGain);

    const noise=audioCtx.createBufferSource();
    const buffer=audioCtx.createBuffer(1,audioCtx.sampleRate*2,audioCtx.sampleRate);
    const data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.12;
    noise.buffer=buffer;noise.loop=true;
    const filter=audioCtx.createBiquadFilter();filter.type="lowpass";filter.frequency.value=800;
    const noiseGain=audioCtx.createGain();noiseGain.gain.value=.018;
    noise.connect(filter).connect(noiseGain).connect(master);noise.start();
    ambienceNodes.push(noise,filter,noiseGain,master);
  }catch(err){audioStarted=false;}
}

function soundTone(freq=440,duration=.12,type="sine",volume=.05){
  if(!audioCtx||audioCtx.state==="closed")return;
  const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();
  osc.type=type;osc.frequency.value=freq;
  gain.gain.setValueAtTime(volume,audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+duration);
  osc.connect(gain).connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+duration+.02);
}

function soundInteraction(){
  soundTone(520,.07,"square",.035);setTimeout(()=>soundTone(740,.08,"square",.025),70);
}

function soundDoor(){
  soundTone(190,.18,"triangle",.035);setTimeout(()=>soundTone(120,.2,"triangle",.02),110);
}

function subtleWhisper(){
  if(!audioCtx)return;
  const osc=audioCtx.createOscillator(),gain=audioCtx.createGain(),filter=audioCtx.createBiquadFilter();
  osc.type="sine";osc.frequency.setValueAtTime(260,audioCtx.currentTime);osc.frequency.exponentialRampToValueAtTime(190,audioCtx.currentTime+1.4);
  filter.type="lowpass";filter.frequency.value=720;
  gain.gain.setValueAtTime(.0001,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(.018,audioCtx.currentTime+.25);gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+1.5);
  osc.connect(filter).connect(gain).connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+1.6);
}

function subtleKnock(){
  soundTone(82,.16,"triangle",.018);
  setTimeout(()=>soundTone(61,.22,"triangle",.012),125);
}

function triggerFirstAnomaly(){
  if(anomalyTriggered||!audioCtx)return;
  anomalyTriggered=true;
  showMessage("Você ouviu um barulho vindo do fundo da loja.");
  subtleKnock();
  setTask("Continue a ronda pela loja.");

  const target=shopLights[2]||shopLights[1]||shopLights[0];
  if(!target)return;
  const original=target.intensity;
  const flickers=[0,.11,.24,.38,.52,.7,1.02];
  const values=[0.18,original,0.06,original,0.12,original*0.42,original];
  flickers.forEach((delay,i)=>{
    setTimeout(()=>{
      if(lightsOn)target.intensity=values[i];
    },delay*1000);
  });
}

function updateRoutine(){
  if(!started)return;

  if(phase===4){
    const elapsed=(performance.now()-shiftStartedAt)/1000;
    if(elapsed>12&&phase===4){
      phase=5;
      setTask("Faça uma última ronda na loja.");
      showMessage("A loja está pronta. Faça uma última verificação.");
      soundTone(330,.14,"triangle",.025);
    }
  }

  if(phase===6&&!anomalyTriggered){
    const elapsed=(performance.now()-explorationStartedAt)/1000;
    if(elapsed>18)triggerFirstAnomaly();
  }
}


function build(){
  scene=new THREE.Scene();
  scene.background=new THREE.Color(0x202328);
  scene.fog=new THREE.Fog(0x202328,17,42);

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
  box("screen",[0,2.65,-3.72],[.5,.26,.08],{color:0x8f77c9,interact:true});
  cylinder("scanner",[.56,2.34,-3.78],.1,.22,mat(0x33383b,{metalness:.45,roughness:.3}));
  textPlane("CAIXA",[0,2.82,-3.24],[1.5,.35],"#ffffff","rgba(20,20,22,.82)");
  addCheckoutDetails();

  // estantes laterais
  for(const z of [-.5,2.15,4.35]){
    addShelfUnit(-5.1,z);
    addShelfUnit(5.1,z);
  }

  // geladeiras no fundo
  addFridge(-1.45);
  addFridge(1.45);

  // Dois corredores altos substituem as ilhas baixas e organizam a área central.
  addAisleRow(-2.05,1.05,4.7,["cereal","snack"]);
  addAisleRow(2.05,1.05,4.7,["milk","energy"]);
  addShelfPriceTags();

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
    l.position.set(x,5.55,0);l.castShadow=true;l.userData.shopLight=true;scene.add(l);shopLights.push(l);
    const fixture=box("lamp",[x,5.64,0],[2.25,.08,.42],{color:0x45494c,texture:"metal",roughness:.5});
    box("lampGlow",[x,5.57,0],[1.5,.03,.18],{color:0xf5f7f7,roughness:.2});
    fixture.userData.light=l;
  }

  addVisualOverhaul();
  addDecorations();

  // Espaço maior para a loja: mantém todo o layout atual, mas dá
  // mais distância entre as áreas e deixa a exploração menos apertada.
  scene.traverse(o=>{
    if(o!==scene && o.parent===scene && o!==camera && o!==renderer.domElement){
      o.position.multiplyScalar(1.38);
      o.scale.multiplyScalar(1.38);
    }
  });

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
  const names={caixa:"CAIXA",porta:"PORTA",relogio:"RELÓGIO",screen:"MONITOR",fridgeDoor:"GELADEIRA",serviceDoor:"BANHEIRO",painelParede:"PAINEL"};
  return names[o.name]||"INTERAGIR";
}

function updatePrompt(){
  if(!started){promptEl.classList.remove("prompt-show");return}
  const ray=new THREE.Raycaster();
  ray.setFromCamera(new THREE.Vector2(0,0),camera);
  const hit=ray.intersectObjects(interactables,false)[0];
  if(hit&&hit.distance<=4.0){
    promptEl.textContent="E / INTERAGIR • "+targetName(hit.object);
    promptEl.classList.add("prompt-show");
  }else promptEl.classList.remove("prompt-show");
}

function interact(){
  const ray=new THREE.Raycaster();
  ray.setFromCamera(new THREE.Vector2(0,0),camera);
  const hits=ray.intersectObjects(interactables,false);
  if(!hits.length||hits[0].distance>4.0){showMessage("Não há nada para fazer aqui.");return}
  const o=hits[0].object;
  if(o.name==="caixa"){
    soundInteraction();
    if(phase===1){phase=2;setTask("Confira se a porta está trancada.");showMessage("Caixa ligado. Tudo parece normal.");}
    else if(phase===3){phase=4;shiftStartedAt=performance.now();setTask("Aguarde o início do turno.");showMessage("Tudo pronto. Agora é só esperar.");}
    else if(phase===5){phase=6;explorationStartedAt=performance.now();setTask("Explore a loja. Você está livre para andar.");showMessage("O monitor registrou uma falha rápida. O resto do turno é com você.");subtleWhisper();}
    else showMessage("O caixa já está ligado.");
    return;
  }
  if(o.name==="porta"){
    soundDoor();
    if(phase<2){showMessage("Você ainda tem trabalho para fazer.");return}
    if(phase===2){phase=3;setTask("Volte até o caixa.");showMessage("Porta conferida e trancada.");}
    else showMessage("A porta está trancada.");
    return;
  }
  if(o.name==="relogio"){soundInteraction();showMessage("22:00. Você acabou de chegar.");return}
  if(o.name==="screen"){
    soundInteraction();
    if(phase>=6&&anomalyTriggered)showMessage("A câmera 03 perdeu o sinal por alguns segundos.");
    else if(phase>=6)showMessage("O monitor mostra apenas as câmeras da loja.");
    else showMessage("O monitor ainda está iniciando.");
    return;
  }
  if(o.name==="fridgeDoor"){
    soundInteraction();
    showMessage("Ar gelado. As bebidas estão bem refrigeradas.");
    return;
  }
  if(o.name==="serviceDoor"){
    soundDoor();
    showMessage("Banheiro. A porta está fechada e sem sinal de uso.");
    return;
  }
  if(o.name==="painelParede"){
    soundInteraction();
    showMessage("Painel elétrico. Alguns LEDs continuam piscando.");
    return;
  }
}

function startGame(){
  if(started)return;
  started=true;start.style.display="none";setLights(true);
  phase=1;shiftStartedAt=performance.now();createAmbientAudio();soundTone(440,.08,"sine",.025);
  setTask("Vá até o caixa e ligue o sistema.");
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
    const halfX=(p.width*c.scale.x)/2+.32,halfZ=(p.depth*c.scale.z)/2+.32;
    const halfY=(p.height*c.scale.y)/2+.2;
    if(Math.abs(next.x-c.position.x)<halfX&&Math.abs(next.z-c.position.z)<halfZ&&next.y>c.position.y-halfY&&next.y<c.position.y+halfY)return true;
  }
  return false;
}

function movement(dt){
  const dir=new THREE.Vector3();
  // O eixo vertical do joystick segue a tela: tocar para cima = avançar.
  const forward=(keys.s?1:0)-(keys.w?1:0)+mobile.y;
  const side=(keys.d?1:0)-(keys.a?1:0)+mobile.x;
  dir.set(side,0,forward);
  if(dir.lengthSq()>0){
    dir.normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw);
    const next=player.clone().addScaledVector(dir,dt*3.2);
    if(!blockedAt(next))player.copy(next);
  }
  // A loja foi ampliada; os limites acompanham o novo tamanho.
  player.x=THREE.MathUtils.clamp(player.x,-10.7,10.7);
  player.z=THREE.MathUtils.clamp(player.z,-9.1,9.1);
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
  updateRoutine();
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

let lookDrag=false,lookPointerId=null,lastX=0,lastY=0;
function startLook(e){
  if(e.target.closest("#stick")||e.target.closest("#interact"))return;
  if(lookDrag)return;
  lookDrag=true;lookPointerId=e.pointerId;lastX=e.clientX;lastY=e.clientY;
}
function moveLook(e){
  // Cada dedo tem sua própria função: o dedo no joystick nunca gira a câmera.
  if(!lookDrag||e.pointerId!==lookPointerId)return;
  yaw-=(e.clientX-lastX)*.009;pitch-=(e.clientY-lastY)*.009;
  pitch=THREE.MathUtils.clamp(pitch,-1.35,1.35);
  lastX=e.clientX;lastY=e.clientY;
}
function endLook(e){
  if(e.pointerId!==lookPointerId)return;
  lookDrag=false;lookPointerId=null;
}
document.addEventListener("pointerdown",startLook,{passive:true});
document.addEventListener("pointermove",moveLook,{passive:true});
document.addEventListener("pointerup",endLook,{passive:true});
document.addEventListener("pointercancel",endLook,{passive:true});
