/* A small perspective renderer: real 3D vertices, depth sorting and face lighting.
 * No network, WebGL dependency, textures, or continuous work while off-screen. */
(() => {
  'use strict';
  const canvas = document.getElementById('system-scene');
  const art = document.querySelector('.hero-art');
  const toggle = document.querySelector('.motion-toggle');
  let ctx;
  try { ctx = canvas.getContext('2d'); } catch { return; }
  if (!ctx) return; // The CSS sculpture is already visible.
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  let width = 0, height = 0, time = 0, last = 0, frame = 0;
  let visible = true, paused = false, pointerX = 0, pointerY = 0;
  let angleX = 0, angleY = 0;
  const phi = (1 + Math.sqrt(5)) / 2;
  const vertices = [
    [-1,phi,0],[1,phi,0],[-1,-phi,0],[1,-phi,0],
    [0,-1,phi],[0,1,phi],[0,-1,-phi],[0,1,-phi],
    [phi,0,-1],[phi,0,1],[-phi,0,-1],[-phi,0,1]
  ].map(v => v.map(n => n / Math.hypot(1, phi)));
  const faces = [];
  const distance = (a,b) => Math.hypot(...a.map((n,i) => n-b[i]));
  const edge = 2 / Math.hypot(1,phi);
  for (let a=0;a<12;a++) for(let b=a+1;b<12;b++) for(let c=b+1;c<12;c++) {
    if ([distance(vertices[a],vertices[b]),distance(vertices[a],vertices[c]),distance(vertices[b],vertices[c])].every(d=>Math.abs(d-edge)<.001)) faces.push([a,b,c]);
  }
  function rotate([x,y,z], ax, ay, az = -.28) {
    const yy = y*Math.cos(ax)-z*Math.sin(ax), zz = y*Math.sin(ax)+z*Math.cos(ax);
    const xx = x*Math.cos(ay)+zz*Math.sin(ay), zzz = -x*Math.sin(ay)+zz*Math.cos(ay);
    return [xx*Math.cos(az)-yy*Math.sin(az),xx*Math.sin(az)+yy*Math.cos(az),zzz];
  }
  function project([x,y,z]) {
    const perspective = 5 / (5-z);
    const scale = Math.min(width,height)*.205;
    return [width/2+x*scale*perspective,height/2+y*scale*perspective,z,perspective];
  }
  function path(points) {
    ctx.beginPath();
    points.forEach((p,i) => i ? ctx.lineTo(p[0],p[1]) : ctx.moveTo(p[0],p[1]));
  }
  function render() {
    if (!width || !height) return;
    const light = document.documentElement.dataset.theme === 'light';
    ctx.clearRect(0,0,width,height);
    const glow = ctx.createRadialGradient(width/2,height/2,5,width/2,height/2,width*.38);
    glow.addColorStop(0,light?'#9167d71a':'#9a70e72b');
    glow.addColorStop(1,'#9167d700');
    ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    const drawables=[];
    const ax = -.25 + angleY, ay = time*.13 + angleX;
    const transformed = vertices.map(v=>rotate(v,ax,ay));
    faces.forEach(face=>{
      const points=face.map(i=>transformed[i]);
      const center=points[0].map((_,i)=>points.reduce((n,p)=>n+p[i],0)/3);
      const u=points[1].map((n,i)=>n-points[0][i]),v=points[2].map((n,i)=>n-points[0][i]);
      let normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
      if(normal.reduce((s,n,i)=>s+n*center[i],0)<0) normal=normal.map(n=>-n);
      const len=Math.hypot(...normal);normal=normal.map(n=>n/len);
      const lighting=Math.max(0,normal[0]*-.4+normal[1]*-.6+normal[2]*.7);
      drawables.push({z:center[2],draw:()=>{
        path(points.map(project));ctx.closePath();
        ctx.fillStyle=`hsl(${260+lighting*8} 43% ${light ? 32+lighting*37 : 18+lighting*48}%)`;
        ctx.fill();ctx.strokeStyle=light?'#e7d9ff66':'#d4bfff55';ctx.lineWidth=.7;ctx.stroke();
      }});
    });
    // Three inclined circular orbits, split into depth-sorted segments.
    for(let ring=0;ring<3;ring++){
      const radius=1.62+ring*.2;
      const orbit = theta => rotate([Math.cos(theta)*radius,Math.sin(theta)*radius,0], .65+ring*.65, .5+ring*.8+time*.025, -.4);
      const segments=coarse.matches?64:96;
      for(let i=0;i<segments;i++){
        const a=orbit(i/segments*Math.PI*2),b=orbit((i+1)/segments*Math.PI*2);
        drawables.push({z:(a[2]+b[2])/2,draw:()=>{
          path([project(a),project(b)]);ctx.strokeStyle=light?'#7853ad55':'#b49bd05c';ctx.lineWidth=ring===0?1:.6;ctx.stroke();
        }});
      }
      for(let n=0;n<2;n++){
        const position=orbit(time*(.16+ring*.04)+n*Math.PI+ring*1.5);
        drawables.push({z:position[2],draw:()=>{
          const p=project(position),r=(n===0?6:3)*p[3]*(width/450);
          const shine=ctx.createRadialGradient(p[0]-r*.3,p[1]-r*.4,.1,p[0],p[1],r);
          shine.addColorStop(0,'#eee4ff');shine.addColorStop(.45,ring===1?'#a7d2c9':'#b59be1');shine.addColorStop(1,'#493264');
          ctx.beginPath();ctx.arc(p[0],p[1],r,0,Math.PI*2);ctx.fillStyle=shine;ctx.fill();
        }});
      }
    }
    // Sparse reference points make the form feel suspended in space.
    ctx.fillStyle=light?'#80679755':'#b6a2ff44';
    for(let i=0;i<22;i++){
      const x=(Math.sin(i*81.7)*.5+.5)*width,y=(Math.cos(i*29.1)*.5+.5)*height;
      ctx.fillRect(x,y,1,1);
    }
    drawables.sort((a,b)=>a.z-b.z).forEach(item=>item.draw());
    art.classList.add('scene-ready');
  }
  function shouldAnimate(){return visible&&!document.hidden&&!paused&&!reduced.matches;}
  function tick(now){
    frame=0;
    if(!shouldAnimate()){last=0;return;}
    const elapsed=now-last;
    if(elapsed>=(coarse.matches?50:32)){
      time+=last?Math.min(elapsed,100)/1000:0;
      last=now;angleX+=(pointerX-angleX)*.06;angleY+=(pointerY-angleY)*.06;
      render();
    }
    frame=requestAnimationFrame(tick);
  }
  function synchronize(){
    cancelAnimationFrame(frame);frame=0;last=0;
    toggle.hidden=reduced.matches;
    toggle.textContent=paused?'Resume artwork':'Pause artwork';
    toggle.setAttribute('aria-pressed',String(paused));
    render();
    if(shouldAnimate()) frame=requestAnimationFrame(tick);
  }
  function resize(){
    const rect=art.getBoundingClientRect();width=rect.width;height=rect.height;
    if(!width||!height)return;
    const dpr=Math.min(devicePixelRatio||1,coarse.matches?1.5:2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);render();
  }
  art.addEventListener('pointermove',e=>{
    if(coarse.matches||reduced.matches||paused)return;
    const rect=art.getBoundingClientRect();
    pointerX=((e.clientX-rect.left)/rect.width-.5)*.5;
    pointerY=((e.clientY-rect.top)/rect.height-.5)*.4;
  },{passive:true});
  art.addEventListener('pointerleave',()=>{pointerX=pointerY=0;});
  toggle.addEventListener('click',()=>{paused=!paused;synchronize();});
  reduced.addEventListener('change',synchronize);
  coarse.addEventListener('change',resize);
  document.addEventListener('visibilitychange',synchronize);
  document.addEventListener('themechange',render);
  if('ResizeObserver' in window)new ResizeObserver(resize).observe(art);
  else window.addEventListener('resize',resize);
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;synchronize();
  },{threshold:0}).observe(art);
  resize();synchronize();
})();
