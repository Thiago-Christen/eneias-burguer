let motionCleanup=()=>{};
function boxMotionView(){return `<section class="immersive-film" id="a-box" aria-label="Montagem imersiva da box, controlada pela rolagem"><div class="film-stage"><div class="film-surface"><img id="motion-fallback" src="/assets/motion/video/opening.webp" alt="Brasas sobre fundo preto"><canvas id="motion-canvas" role="img" aria-label="Dois burgers se montam, entram na caixa e recebem fritas, anéis de cebola e molhos"></canvas></div><div class="film-intro" aria-hidden="true"><span>ENÉIAS BURGUER</span><strong>Surpreenda-se.<br>Uma mordida por vez.</strong><small>CONTINUE ROLANDO ↓</small></div><a class="film-skip" href="/cardapio/">IR AO CARDÁPIO ↗</a><div class="film-ending"><span class="tiny-label">PARA REUNIR QUEM VOCÊ GOSTA</span><h2>UMA CAIXA.<br><em>MUITA<br>VONTADE.</em></h2><p>Combos e porções para a sua próxima escolha. Confira o que acompanha cada opção.</p><a class="ember-button" href="/cardapio/?categoria=Combos">ESCOLHER MEU COMBO ${icon('arrow')}</a><small>Composição ilustrativa de campanha por IA.</small></div><span class="film-load" id="motion-status" role="status" aria-live="polite"></span></div></section>`}
async function initMotion(){
  motionCleanup();const editorialCleanup=initEditorialMotion();
  const section=document.querySelector('.immersive-film'),canvas=document.getElementById('motion-canvas');
  if(!section||!canvas){motionCleanup=editorialCleanup;return}
  const fallback=document.getElementById('motion-fallback'),status=document.getElementById('motion-status'),ctx=canvas.getContext('2d',{alpha:false});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp=v=>Math.max(0,Math.min(1,v)),smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
  let stopped=false,sequence,manifest,observer,raf=0,started=false;
  let target=0,current=0,lastTime=0,lastPaint=-1,lastGeometry='',lastSize='',failTimer;
  const measure=()=>{const r=section.getBoundingClientRect();section.style.setProperty('--film-entry',smooth((innerHeight-r.top)/innerHeight));return clamp(-r.top/Math.max(1,r.height-innerHeight))};
  const visual=p=>{
    const ending=smooth((p-.78)/.17),intro=1-smooth((p-.065)/.075);
    section.style.setProperty('--film-ending',ending);section.style.setProperty('--film-intro',intro);
    section.classList.toggle('ending-visible',ending>.55);
    section.querySelector('.film-ending').inert=ending<.55;
    return ending;
  };
  const staticScene=()=>{
    sequence?.stop();section.classList.add('film-static');
    fallback.src=manifest?.poster||'/assets/motion/video/poster.webp';
    fallback.alt='Box conceitual completa com dois burgers, fritas, anéis de cebola e dois molhos';
    canvas.classList.remove('ready');visual(1);status.textContent='';
  };
  const tick=time=>{
    raf=0;if(stopped||!sequence)return;
    const dt=lastTime?Math.min(64,time-lastTime):16;lastTime=time;
    current+=(target-current)*(1-Math.exp(-dt/70));if(Math.abs(current-target)<.00025)current=target;
    const videoP=clamp((current-.10)/.68),index=Math.round(videoP*(manifest.count-1));
    sequence.warm(index,target>=current?1:-1);
    const candidate=sequence.nearest(index),rect=canvas.getBoundingClientRect(),pixelRatio=Math.min(devicePixelRatio||1,1.5);
    const size=`${rect.width}:${rect.height}:${pixelRatio}`,geometry=current.toFixed(4);
    const ending=visual(current),mobile=rect.width<=760;
    if(candidate&&(candidate.index!==lastPaint||lastGeometry!==geometry||size!==lastSize)){
      if(size!==lastSize){canvas.width=Math.max(1,Math.round(rect.width*pixelRatio));canvas.height=Math.max(1,Math.round(rect.height*pixelRatio));lastSize=size}
      const image=candidate.image,iw=image.width||image.naturalWidth,ih=image.height||image.naturalHeight;
      const w=canvas.width,h=canvas.height,cover=Math.max(w/iw,h/ih),contain=Math.min(w/iw,h/ih);
      // The black opening fills the viewport, then the camera reveals the complete composition.
      const reveal=smooth((current-.085)/.14);
      const fit=mobile?w/iw:contain;
      let scale=cover+(fit-cover)*reveal;
      scale*=1-ending*(mobile ? .04 : .34);
      const centerX=mobile?w*.5:w*(.5-ending*.16);
      const centerY=mobile?h*(.47-ending*.17):h*.52;
      ctx.fillStyle='#080808';ctx.fillRect(0,0,w,h);
      ctx.drawImage(image,centerX-iw*scale/2,centerY-ih*scale/2,iw*scale,ih*scale);
      canvas.classList.add('ready');canvas.dataset.frameIndex=String(candidate.index);section.dataset.filmProgress=current.toFixed(3);
      lastPaint=candidate.index;lastGeometry=geometry;clearTimeout(failTimer);status.textContent='';
    }
    if(current!==target)requestTick();
  };
  const requestTick=()=>{if(!raf&&!stopped)raf=requestAnimationFrame(tick)};
  const update=()=>{target=measure();const r=section.getBoundingClientRect();if(started&&r.bottom>0&&r.top<innerHeight)requestTick()};
  motionCleanup=()=>{stopped=true;editorialCleanup();observer?.disconnect();sequence?.stop();cancelAnimationFrame(raf);clearTimeout(failTimer);removeEventListener('scroll',update);removeEventListener('resize',update)};
  try{
    const response=await fetch('/assets/motion/manifest.json');if(!response.ok)throw Error('Manifest unavailable');manifest=await response.json();if(stopped)return;
    if(!Number.isInteger(manifest.count)||manifest.count<8||manifest.count>600||!manifest.variants?.desktop)throw Error('Invalid sequence');
    if(reduced||!ctx){staticScene();return}
    const mobile=matchMedia('(max-width: 760px)').matches||navigator.connection?.saveData,variant=mobile?'mobile':'desktop';section.dataset.sequenceVariant=variant;
    sequence=new FoodFrameSequence({base:manifest.variants[variant].base,count:manifest.count,mobile,onFrame:()=>{section.dataset.decodedFrames=String(sequence.decoded.size);requestTick()},onProgress:n=>section.dataset.loadedFrames=String(n)});
    const start=()=>{if(started||stopped)return;started=true;current=target=measure();sequence.warm(Math.round(clamp((current-.1)/.68)*(manifest.count-1)));sequence.prefetch();requestTick();failTimer=setTimeout(()=>{if(lastPaint<0&&!stopped)staticScene()},15000)};
    observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){start();observer.disconnect()}},{rootMargin:'1400px'});observer.observe(section);
    addEventListener('scroll',update,{passive:true});addEventListener('resize',update,{passive:true});measure();
  }catch{if(!stopped)staticScene()}
}

function initEditorialMotion(){const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;document.querySelectorAll('.t-stagger').forEach(el=>{void el.offsetHeight;requestAnimationFrame(()=>el.classList.add('is-shown'))});const headings=[...document.querySelectorAll('[data-word-reveal]')];headings.forEach(el=>{if(el.dataset.prepared)return;el.dataset.prepared='1';el.setAttribute('aria-label',el.innerText.replace(/\s+/g,' ').trim());el.innerHTML=el.innerHTML.split(/(<br\s*\/?>)/i).map(part=>/^<br/i.test(part)?part:part.split(/(\s+)/).map(w=>w.trim()?`<span class="reveal-word" aria-hidden="true">${w}</span>`:w).join('')).join('')});const smooth=v=>v*v*(3-2*v),clamp=v=>Math.min(1,Math.max(0,v));const update=()=>{headings.forEach(el=>{const r=el.getBoundingClientRect(),p=reduced?1:clamp((innerHeight*.9-r.top)/(innerHeight*.45));el.querySelectorAll('.reveal-word').forEach((w,i,ws)=>{const t=smooth(clamp(p*1.6-i/Math.max(1,ws.length)*.6));w.style.opacity=.25+.75*t;w.style.transform=`translateY(${(1-t)*8}px)`})});const ticker=document.querySelector('.ember-ticker>div');if(ticker&&!reduced)ticker.style.transform=`translateX(${-Math.min(180,scrollY*.09)}px)`};addEventListener('scroll',update,{passive:true});update();return()=>removeEventListener('scroll',update)}
