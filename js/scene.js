/* A kinetic ribbon: a small, dependency-free canvas sculpture. */
(() => {
  'use strict';
  const canvas=document.getElementById('system-scene'),art=document.querySelector('.hero-art'),hero=document.querySelector('.hero'),toggle=document.querySelector('.motion-toggle');
  let ctx;try{ctx=canvas.getContext('2d');}catch{return;}if(!ctx)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),coarse=matchMedia('(pointer: coarse)');
  let width=0,height=0,time=0,last=0,frame=0,visible=true,paused=false,scroll=0,pointerX=0,pointerY=0,tiltX=0,tiltY=0;
  function readScroll(){const r=hero.getBoundingClientRect();scroll=Math.max(0,Math.min(1,-r.top/Math.max(r.height*.7,1)));}
  function project(x,y,z,ax,ay){const c=Math.cos(ay),s=Math.sin(ay),cx=Math.cos(ax),sx=Math.sin(ax),xx=x*c+z*s,zz=-x*s+z*c,yy=y*cx-zz*sx,depth=y*sx+zz*cx,scale=Math.min(width,height)*.28*(4/(4-depth));return [width/2+xx*scale,height/2+yy*scale,depth];}
  function render(){
    if(!width||!height)return;
    const light=document.documentElement.dataset.theme==='light',size=Math.min(width,height),cx=width/2,cy=height/2;
    ctx.clearRect(0,0,width,height);
    const glow=ctx.createRadialGradient(cx,cy,size*.015,cx,cy,size*.44);glow.addColorStop(0,light?'#a894e344':'#ad93ff55');glow.addColorStop(.5,light?'#ad93ee1a':'#9e80ed1f');glow.addColorStop(1,'#a58bff00');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    const ax=-.46+tiltY*.3,ay=time*.11+tiltX*.4+scroll*.8;
    const rings=[];
    for(let k=0;k<52;k++){
      const v=(k/51-.5)*1.3,points=[];let depth=0;
      for(let i=0;i<=160;i++){
        const t=i/160*Math.PI*2, twist=t*1.5+time*.14;
        const x=(1.05+v*.42*Math.cos(twist))*Math.cos(t),y=v*.7*Math.sin(twist),z=(1.05+v*.42*Math.cos(twist))*Math.sin(t);
        const p=project(x,y,z,ax,ay);points.push(p);depth+=p[2];
      }
      rings.push({points,depth:depth/161,k});
    }
    rings.sort((a,b)=>a.depth-b.depth).forEach(({points,k})=>{
      ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
      const hue=258+k*.7;ctx.strokeStyle=light?`hsla(${hue},52%,46%,.42)`:`hsla(${hue},85%,${70+k*.18}%,.48)`;ctx.lineWidth=k%9===0?1.4:.65;ctx.stroke();
    });
    // A glimmer moves along the outer curve.
    const t=time*.4,twist=t*1.5+time*.14,v=.65;
    const p=project((1.05+v*.42*Math.cos(twist))*Math.cos(t),v*.7*Math.sin(twist),(1.05+v*.42*Math.cos(twist))*Math.sin(t),ax,ay),r=size*.009;
    const halo=ctx.createRadialGradient(p[0],p[1],0,p[0],p[1],r*6);halo.addColorStop(0,light?'#7451bfbb':'#f0e9ffff');halo.addColorStop(1,'#b6a2ff00');ctx.fillStyle=halo;ctx.beginPath();ctx.arc(p[0],p[1],r*6,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=light?'#7451bf':'#fff';ctx.beginPath();ctx.arc(p[0],p[1],r*.7,0,Math.PI*2);ctx.fill();
    art.classList.add('scene-ready');
  }
  function shouldAnimate(){return visible&&!document.hidden&&!paused&&!reduced.matches;}
  function tick(now){frame=0;if(!shouldAnimate()){last=0;return;}if(now-last>=40){time+=last?Math.min(now-last,100)/1000:0;last=now;tiltX+=(pointerX-tiltX)*.06;tiltY+=(pointerY-tiltY)*.06;render();}frame=requestAnimationFrame(tick);}
  function synchronize(){cancelAnimationFrame(frame);frame=0;last=0;readScroll();toggle.hidden=reduced.matches;toggle.textContent=paused?'Resume artwork':'Pause artwork';toggle.setAttribute('aria-pressed',String(paused));render();if(shouldAnimate())frame=requestAnimationFrame(tick);}
  function resize(){const r=art.getBoundingClientRect();width=r.width;height=r.height;if(!width||!height)return;const dpr=Math.min(devicePixelRatio||1,coarse.matches?1.5:2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);render();}
  art.addEventListener('pointermove',e=>{if(coarse.matches||reduced.matches||paused)return;const r=art.getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width-.5;pointerY=(e.clientY-r.top)/r.height-.5;},{passive:true});
  art.addEventListener('pointerleave',()=>{pointerX=pointerY=0;});window.addEventListener('scroll',()=>{if(!paused){readScroll();if(!shouldAnimate())render();}},{passive:true});
  toggle.addEventListener('click',()=>{paused=!paused;synchronize();});reduced.addEventListener('change',synchronize);coarse.addEventListener('change',resize);document.addEventListener('visibilitychange',synchronize);document.addEventListener('themechange',render);
  if('ResizeObserver'in window)new ResizeObserver(resize).observe(art);else window.addEventListener('resize',resize);
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;synchronize();},{threshold:0}).observe(art);
  resize();synchronize();
})();
