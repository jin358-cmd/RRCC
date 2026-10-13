/* Eva Hands R5-1 Rev.2: local-only cloth-to-lamp return renderer. */
(()=>{'use strict';
const viewportStyle=document.createElement('style');viewportStyle.textContent='#app{position:fixed!important;inset:0}';document.head.append(viewportStyle);
const NS='http://www.w3.org/2000/svg',reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
const cache=new WeakMap();let active=null,lastStats=null,serial=0;
const decorative=()=>!reduced.matches&&!document.getElementById('app')?.classList.contains('fx-off');
const props=('display position box-sizing width height min-width min-height max-width max-height padding-top padding-right padding-bottom padding-left margin-top margin-right margin-bottom margin-left border-top border-right border-bottom border-left border-radius background-color background-image background-size background-position color opacity font-family font-size font-weight font-style line-height letter-spacing text-align text-decoration text-transform text-shadow white-space overflow overflow-x overflow-y overflow-wrap word-break align-items align-self justify-content flex flex-direction flex-wrap flex-shrink flex-grow gap row-gap column-gap grid-template-columns grid-template-rows grid-column grid-row vertical-align top right bottom left transform transform-origin object-fit stroke stroke-width stroke-linecap stroke-linejoin fill list-style-type').split(' ');
function prepare(element){
 if(!element||element.hidden||!decorative())return Promise.resolve(null);
 const p=element.getBoundingClientRect(),key=[Math.round(p.width),Math.round(p.height),element.querySelector('#content')?.scrollTop||0,element.innerHTML].join('|');
 const prev=cache.get(element);if(prev?.key===key)return prev.promise;
 const record={key,promise:null};cache.set(element,record);
 record.promise=(async()=>{
  const began=performance.now();let count=0;
  function copy(node){
   if(node.nodeType===3)return document.createTextNode(node.textContent);
   if(node.nodeType!==1||node.matches('script,style,canvas,.led-frame,.light-ribbon,[data-export-ignore=true]'))return null;
   const s=getComputedStyle(node);if(s.display==='none'||s.visibility==='hidden')return null;
   if(++count>700)return null;
   let n;
   if(node.matches('textarea,input,[contenteditable=true]')){n=document.createElement('div');n.textContent=node.value??node.innerText;}
   else if(node.tagName==='AUDIO'){n=document.createElement('div');n.textContent='▶ 語音';}
   else n=node.cloneNode(false);
   for(const a of [...n.attributes])if(/^on/i.test(a.name)||['id','autofocus','contenteditable'].includes(a.name))n.removeAttribute(a.name);
   let css='';for(const k of props){const v=s.getPropertyValue(k);if(v)css+=k+':'+v+';'}
   n.setAttribute('style',css);n.style.animation='none';n.style.transition='none';n.style.caretColor='transparent';n.style.boxShadow='none';n.style.backdropFilter='none';
   if(n.tagName==='IMG'&&!n.src.startsWith('data:')){try{const c=document.createElement('canvas');c.width=node.naturalWidth;c.height=node.naturalHeight;c.getContext('2d').drawImage(node,0,0);n.src=c.toDataURL('image/png')}catch{n.removeAttribute('src')}}
   if(n.style.backgroundImage.includes('url('))n.style.backgroundImage='none';
   if(!node.matches('textarea,input,audio,[contenteditable=true]'))for(const child of node.childNodes){const c=copy(child);if(c)n.append(c)}
   if(node.scrollTop||node.scrollLeft){const wrap=document.createElement('div');wrap.style.cssText=`position:relative;transform:translate(${-node.scrollLeft}px,${-node.scrollTop}px);width:100%;`;while(n.firstChild)wrap.append(n.firstChild);n.append(wrap)}
   return n;
  }
  const clone=copy(element);if(!clone)return null;
  Object.assign(clone.style,{position:'relative',top:'0px',left:'0px',right:'auto',bottom:'auto',width:p.width+'px',height:p.height+'px',minWidth:'0',minHeight:'0',maxWidth:'none',maxHeight:'none',transform:'none',opacity:'1',margin:'0',overflow:'hidden'});
  clone.setAttribute('xmlns','http://www.w3.org/1999/xhtml');
  const ratio=Math.min(devicePixelRatio||1,1.25),w=Math.ceil(p.width*ratio),h=Math.ceil(p.height*ratio);
  const text=`<svg xmlns="${NS}" width="${w}" height="${h}" viewBox="0 0 ${p.width} ${p.height}"><foreignObject width="100%" height="100%">${new XMLSerializer().serializeToString(clone)}</foreignObject></svg>`;
  const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(text);
  await image.decode();const bitmap=document.createElement('canvas');bitmap.width=w;bitmap.height=h;bitmap.getContext('2d').drawImage(image,0,0);return {image:bitmap,width:p.width,height:p.height,ratio,ms:performance.now()-began};
 })().catch(()=>null);return record.promise;
}
let sharedGPU=null;
function gpuRenderer(){
 if(sharedGPU&&!sharedGPU.gl.isContextLost())return sharedGPU;
 const canvas=document.createElement('canvas');canvas.dataset.genieLayer='true';canvas.dataset.exportIgnore='true';canvas.setAttribute('aria-hidden','true');canvas.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:85;contain:strict;width:100%;height:100%;';
 const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:true,powerPreference:'low-power'});if(!gl)return null;
 try{
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('shader');return s;}
  const vs=shader(gl.VERTEX_SHADER,'attribute vec2 p; attribute vec2 uv; uniform vec2 res; varying vec2 v; void main(){v=uv;gl_Position=vec4(p.x/res.x*2.0-1.0,1.0-p.y/res.y*2.0,0.0,1.0);}');
  const fs=shader(gl.FRAGMENT_SHADER,'precision mediump float; varying vec2 v; uniform sampler2D tex; uniform float opacity; void main(){gl_FragColor=texture2D(tex,v)*opacity;}');
  const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('program');gl.deleteShader(vs);gl.deleteShader(fs);gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);const p=gl.getAttribLocation(program,'p'),uv=gl.getAttribLocation(program,'uv');gl.enableVertexAttribArray(p);gl.enableVertexAttribArray(uv);gl.vertexAttribPointer(p,2,gl.FLOAT,false,16,0);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,16,8);
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  const res=gl.getUniformLocation(program,'res'),opacity=gl.getUniformLocation(program,'opacity');const data=new Float32Array(64*6*4);let at=0,w=1,h=1;
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();active?.finish();sharedGPU=null});
  sharedGPU={canvas,gl,upload(img,ratio){canvas.width=Math.round(innerWidth*ratio);canvas.height=Math.round(innerHeight*ratio);gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(res,innerWidth,innerHeight);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);w=img.width;h=img.height},begin(){at=0;gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT)},vertex(s,d){data[at++]=d.x;data[at++]=d.y;data[at++]=s.x/w;data[at++]=s.y/h},flush(a){gl.uniform1f(opacity,a);gl.bufferData(gl.ARRAY_BUFFER,data.subarray(0,at),gl.DYNAMIC_DRAW);gl.drawArrays(gl.TRIANGLES,0,at/4)},clear(){gl.clear(gl.COLOR_BUFFER_BIT);canvas.remove()}};
  return sharedGPU;
 }catch{return null;}
}

function renderReturn(element,anchor,done){
 if(active)active.finish();
 const id=++serial,p=element.getBoundingClientRect(),a=anchor.getBoundingClientRect();
 const target={x:a.left+a.width/2,y:a.top+a.height/2},middle={x:p.left+p.width/2,y:p.top+p.height/2};
 const dx=target.x-middle.x,dy=target.y-middle.y;
 // Use the nearest physical edge, not the Session label or a fixed horizontal side.
 const edge=anchor.closest?.('.mission-strip')?'top':Math.abs(dx)/(p.width/2)>Math.abs(dy)/(p.height/2)?(dx<0?'left':'right'):(dy<0?'top':'bottom');
 const horizontal=edge==='left'||edge==='right',length=horizontal?p.width:p.height,half=(horizontal?p.height:p.width)/2;
 const duration=Math.round(Math.min(1180,1000+Math.hypot(dx,dy)*.12));
 const stats={id,element:element.id,edge,target:{...target},duration,renderer:'pending',frames:0,meanRenderMs:0,maxRenderMs:0,preparationMs:0,completed:false,cancelled:false,segments:48};
 lastStats=stats;
 const savedOpacity=element.style.opacity,savedPointer=element.style.pointerEvents;
 let frame=0,stopped=false,start=0,texture=null,fallback=null,timeout=0,totalMs=0,previousFrame=0,slowFrames=0;
 const canvas=document.createElement('canvas');canvas.dataset.genieLayer='true';canvas.dataset.exportIgnore='true';canvas.setAttribute('aria-hidden','true');
 canvas.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:85;contain:strict;width:100%;height:100%;';
 let ratio=Math.min(devicePixelRatio||1,1.25);canvas.width=Math.ceil(innerWidth*ratio);canvas.height=Math.ceil(innerHeight*ratio);
 const ctx=canvas.getContext('2d');let gpu=null;
 const cleanup=()=>{cancelAnimationFrame(frame);clearTimeout(timeout);canvas.remove();gpu?.clear();fallback?.cancel();element.style.opacity=savedOpacity;element.style.pointerEvents=savedPointer;window.removeEventListener('resize',complete);document.removeEventListener('visibilitychange',onHidden);reduced.removeEventListener('change',onReduced);if(active?.id===id)active=null;};
 const complete=()=>{if(stopped)return;stopped=true;stats.completed=true;cleanup();done();};
 const cancel=()=>{if(stopped)return;stopped=true;stats.cancelled=true;cleanup();};
 const onHidden=()=>{if(document.hidden)complete()},onReduced=()=>{if(reduced.matches)complete()};
 const handle={id,cancel,finish:complete,stats};active=handle;
 element.dataset.returnX=String(target.x);element.dataset.returnY=String(target.y);element.dataset.genieEdge=edge;
 if(!decorative()||!ctx||p.width<5||p.height<5){stats.renderer='reduced-motion';queueMicrotask(complete);return handle;}
 element.style.pointerEvents='none';window.addEventListener('resize',complete);document.addEventListener('visibilitychange',onHidden);reduced.addEventListener('change',onReduced);
 // Fail closed without blocking the real close operation when a browser cannot snapshot.
 function useFallback(){if(stopped)return;stats.renderer='dom-fallback';fallback=element.animate([{opacity:1,transform:'none'},{opacity:.85,transform:`translate(${dx*.15}px,${dy*.15}px) scale(.78)`},{opacity:0,transform:`translate(${dx}px,${dy}px) scale(.008)`}],{duration:480,easing:'cubic-bezier(.45,0,.6,1)',fill:'forwards'});fallback.finished.then(complete,()=>{});}
 function center(u,t){
  const phase=smooth((clamp((t-.055)/.89)*1.62-u*.62));
  let x=horizontal?(edge==='left'?p.left+u*p.width:p.right-u*p.width):middle.x;
  let y=horizontal?middle.y:(edge==='top'?p.top+u*p.height:p.bottom-u*p.height);
  const b=Math.sin(Math.PI*phase),flow=(edge==='right'||edge==='top'?-1:1);
  const bend=b*b*Math.sin(Math.PI*u+.35)*(Math.min(half*.16,38))*flow;
  x=mix(x,target.x,phase)+(horizontal?0:bend);y=mix(y,target.y,phase)+(horizontal?bend:0);
  const width=half*Math.pow(1-phase,1.65)*(1+.009*Math.sin(t*Math.PI*2)*(1-phase));
  return {x,y,width,phase};
 }
 function band(u,t){
  const c=center(u,t),l=center(Math.max(0,u-.003),t),r=center(Math.min(1,u+.003),t);
  let nx=-(r.y-l.y),ny=r.x-l.x,m=Math.hypot(nx,ny);
  if(m<.001){nx=horizontal?0:1;ny=horizontal?1:0;m=1;}
  nx/=m;ny/=m;if((horizontal?ny:nx)<0){nx=-nx;ny=-ny;}
  // Do not rotate the broad, still-readable end. Curvature grows only with suction.
  const turn=smooth(c.phase)*.65;nx=mix(horizontal?0:1,nx,turn);ny=mix(horizontal?1:0,ny,turn);m=Math.hypot(nx,ny);nx/=m;ny/=m;
  return {minus:{x:c.x-nx*c.width,y:c.y-ny*c.width},plus:{x:c.x+nx*c.width,y:c.y+ny*c.width},center:c};
 }
 function tex(u,v){const w=texture.image.width,h=texture.image.height;return horizontal?{x:(edge==='left'?u:1-u)*w,y:v*h}:{x:v*w,y:(edge==='top'?u:1-u)*h};}
 function triangle(s0,s1,s2,d0,d1,d2){
  if(gpu){gpu.vertex(s0,d0);gpu.vertex(s1,d1);gpu.vertex(s2,d2);return;}
  const det=(s1.x-s0.x)*(s2.y-s0.y)-(s2.x-s0.x)*(s1.y-s0.y);if(Math.abs(det)<.001)return;
  const area=(d1.x-d0.x)*(d2.y-d0.y)-(d2.x-d0.x)*(d1.y-d0.y);if(Math.abs(area)<.02)return;
  const a=((d1.x-d0.x)*(s2.y-s0.y)-(d2.x-d0.x)*(s1.y-s0.y))/det;
  const b=((d1.y-d0.y)*(s2.y-s0.y)-(d2.y-d0.y)*(s1.y-s0.y))/det;
  const c=((d2.x-d0.x)*(s1.x-s0.x)-(d1.x-d0.x)*(s2.x-s0.x))/det;
  const d=((d2.y-d0.y)*(s1.x-s0.x)-(d1.y-d0.y)*(s2.x-s0.x))/det;
  ctx.save();ctx.beginPath();ctx.moveTo(d0.x,d0.y);ctx.lineTo(d1.x,d1.y);ctx.lineTo(d2.x,d2.y);ctx.closePath();ctx.clip();ctx.transform(a,b,c,d,d0.x-a*s0.x-c*s0.y,d0.y-b*s0.x-d*s0.y);
  const sx=Math.min(s0.x,s1.x,s2.x),sy=Math.min(s0.y,s1.y,s2.y),sw=Math.max(s0.x,s1.x,s2.x)-sx,sh=Math.max(s0.y,s1.y,s2.y)-sy;ctx.drawImage(texture.image,sx,sy,sw,sh,sx,sy,sw,sh);ctx.restore();
 }
 function draw(now){
  if(stopped)return;if(!start)start=now;if(previousFrame&&now-previousFrame>32)slowFrames++;previousFrame=now;if(slowFrames>=5&&ratio>.75){ratio=.75;canvas.width=Math.ceil(innerWidth*ratio);canvas.height=Math.ceil(innerHeight*ratio);if(gpu)gpu.upload(texture.image,ratio);stats.segments=32;stats.quality='adaptive';}const began=performance.now(),t=clamp((now-start)/duration);
  // One small anchor read follows hover de-magnification without guessing where it settled.
  if(anchor.isConnected){const r=anchor.getBoundingClientRect();if(r.width){target.x=r.x+r.width/2;target.y=r.y+r.height/2;stats.target={...target}}}
  ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,innerWidth,innerHeight);ctx.globalAlpha=1;ctx.shadowBlur=0;
  const N=stats.segments,points=[];for(let i=0;i<=N;i++)points.push(band(i/N,t));
  // 48 mesh bands progressively enter the lamp. The tail retains its original size longer.
  ctx.globalAlpha=1-smooth((t-.875)/.1);gpu?.begin();
  for(let i=0;i<N;i++){const l=points[i],r=points[i+1];if(l.center.width+r.center.width<.08)continue;
   const s0=tex(i/N,0),s1=tex((i+1)/N,0),s2=tex((i+1)/N,1),s3=tex(i/N,1);
   triangle(s0,s1,s2,l.minus,r.minus,r.plus);triangle(s0,s2,s3,l.minus,r.plus,l.plus);
  }
  gpu?.flush(1-smooth((t-.875)/.1));
  // A fine contour follows the actual deforming sheet, not a separate generic arrow.
  const light=Math.sin(Math.PI*clamp(t/.98));ctx.globalAlpha=.42*light;ctx.strokeStyle='#b4edff';ctx.lineWidth=1.05;ctx.shadowColor='#50bfff';ctx.shadowBlur=7;
  for(const side of ['minus','plus']){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[side].x,p[side].y):ctx.moveTo(p[side].x,p[side].y));ctx.stroke()}
  ctx.shadowBlur=0;
  // Three restrained threads and twelve motes travel inward. No outward explosion.
  if(t>.12){for(let j=0;j<3;j++){ctx.beginPath();for(let i=0;i<=24;i++){let u=i/24,c=center(u,t),w=Math.min(c.width*.19,13),wave=Math.sin(u*5.2-t*6+j*1.5)*w;let x=c.x+(horizontal?0:wave),y=c.y+(horizontal?wave:0);i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=j===1?'#c4bdff':'#8bdfff';ctx.lineWidth=j===1?.7:1;ctx.globalAlpha=light*.22;ctx.stroke()}
   for(let j=0;j<12;j++){const u=1-((t*1.8+j*.083)%1),c=center(u,t);if(c.phase<.12)continue;const w=Math.sin(j*2.4+t*4)*Math.min(c.width*.12,11);ctx.fillStyle=j%4===0?'#b7a4ff':'#c6f1ff';ctx.globalAlpha=light*(.22+.2*(j%2));ctx.beginPath();ctx.arc(c.x+(horizontal?0:w),c.y+(horizontal?w:0),.7+(j%3)*.22,0,Math.PI*2);ctx.fill()}}
  // Small contracting throat at the icon and a quiet final halo.
  const gate=smooth(t/.16)*(1-smooth((t-.84)/.16)),rad=5+8*(1-smooth(t));
  if(gate>.001){ctx.globalAlpha=gate*.55;ctx.strokeStyle='#c4f4ff';ctx.lineWidth=1.25;ctx.shadowColor='#43b6ef';ctx.shadowBlur=9;ctx.beginPath();ctx.ellipse(target.x,target.y,horizontal?rad*.45:rad,horizontal?rad:rad*.45,0,0,Math.PI*2);ctx.stroke()}
  ctx.globalAlpha=1;ctx.shadowBlur=0;
  const cost=performance.now()-began;stats.frames++;totalMs+=cost;stats.meanRenderMs=totalMs/stats.frames;stats.maxRenderMs=Math.max(stats.maxRenderMs,cost);stats.progress=t;
  if(stats.frames>8&&stats.meanRenderMs>9)stats.segments=32;
  if(t<1)frame=requestAnimationFrame(draw);else complete();
 }
 timeout=setTimeout(useFallback,230);
 const began=performance.now();prepare(element).then(result=>{if(stopped||fallback)return;clearTimeout(timeout);if(!result){useFallback();return}texture=result;try{gpu=gpuRenderer();gpu?.upload(texture.image,ratio)}catch{gpu=null}stats.renderer=gpu?'webgl-mesh':'canvas-mesh';if(gpu)document.body.append(gpu.canvas);stats.preparationMs=performance.now()-began;document.body.append(canvas);element.style.opacity='0';frame=requestAnimationFrame(draw);});
 return handle;
}
window.r51PlaceLayout?.(false);
window.evaGenie={prepare,animate:renderReturn,cancel:()=>active?.cancel(),finish:()=>active?.finish(),stats:()=>lastStats?structuredClone(lastStats):null};
// Board and normal feature windows share one renderer. This never mutates their content.
window.cpReturnElement=(element,anchor,done)=>{const h=renderReturn(element,anchor,done);return ()=>h.cancel()};
})();

