/* CTA WhatsApp piscante — desenhado DENTRO do vídeo (canvas) — 3 modelos
   Uso: <script src="cta-zap-video.js" defer></script> no tour-imoveis.html
   Encaixa em window.__fcModelo (fase 'post') sem substituir o que já existe. */
(function(){
  'use strict';
  var FRASE='FALE COMIGO NO ZAP:', FONE='(11) 99350-9109', PERIODO=1.5;
  var WA='M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.100.5.100.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.100.5.2.5.3.1.2.1.8-.1 1.4Z';
  var TEMAS={
    premium:{nome:'Premium / Alto padrão',bg:['#0D1B2E','#12263F'],fg:'#D4A843',line:'#C5A059',glow:'197,160,89',
      big:"800 {s}px 'Playfair Display',Georgia,serif",sub:"700 {s}px Montserrat,Arial,sans-serif",track:.10,rad:.08,ico:'#D4A843',icoFg:'#0D1B2E'},
    oportunidade:{nome:'Oportunidade / Venda rápida',bg:['#0A0A0A','#0A0A0A'],fg:'#FFD400',line:'#25D366',glow:'37,211,102',
      big:"400 {s}px 'Bebas Neue',Impact,sans-serif",sub:"900 {s}px Poppins,Arial,sans-serif",track:.04,rad:.22,ico:'#25D366',icoFg:'#FFFFFF'},
    moderno:{nome:'Moderno / Lançamentos',bg:['#07142E','#0E7490'],fg:'#FFFFFF',line:'#22F0FF',glow:'34,240,255',
      big:"700 {s}px Oswald,Inter,sans-serif",sub:"600 {s}px Inter,Arial,sans-serif",track:.08,rad:.5,ico:'#22F0FF',icoFg:'#07142E'}
  };
  var cfg={tema:'',pos:'topo'};
  try{cfg.tema=localStorage.getItem('fcCtaTema')||'';cfg.pos=localStorage.getItem('fcCtaPos')||'topo'}catch(e){}

  function rr(g,x,y,w,h,r){g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h)}
  function f(s,px){return s.replace('{s}',Math.round(px))}

  function cta(g,W,H,t){
    var T=TEMAS[cfg.tema];if(!T)return;
    var k=Math.min(1,Math.max(0,(t-0.8)/0.5));if(k<=0)return;      // entra suave após 0,8 s
    // ── layout por formato ──
    // 9:16 (vertical): respeita a zona segura do app (~13% topo / ~18% base)
    // 1:1 (quadrado) e 16:9 (horizontal): margens menores, caixa mais compacta
    var fmt=W>=H*1.2?'h':(H>=W*1.2?'v':'q');
    var L={v:{u:W/1080,big:76,sub:29,maxW:.92,top:.145,bot:.78},
           q:{u:W/1080,big:56,sub:22,maxW:.90,top:.07,bot:.93},
           h:{u:H/1080,big:60,sub:24,maxW:.55,top:.07,bot:.93}}[fmt];
    var u=L.u;
    var phase=(t%PERIODO)/PERIODO;
    var pulse=0.775+0.225*Math.cos(2*Math.PI*phase);                // 1 → 0,55 → 1 a cada 1,5 s
    var bigPx=L.big*u,subPx=L.sub*u,pad=26*u,gap=20*u;
    g.save();g.textBaseline='alphabetic';g.textAlign='left';
    function ls(px){try{g.letterSpacing=(px*T.track)+'px'}catch(e){}}
    g.font=f(T.big,bigPx);ls(bigPx);var wBig=g.measureText(FONE).width;
    g.font=f(T.sub,subPx);ls(subPx);var wSub=g.measureText(FRASE).width;
    var ico=bigPx*1.55,textW=Math.max(wBig,wSub),boxW=pad*2+ico+gap+textW;
    var max=W*L.maxW;if(boxW>max){var s=max/boxW;bigPx*=s;subPx*=s;pad*=s;gap*=s;ico*=s;textW*=s;boxW=max}
    var boxH=Math.max(ico+pad*1.2,subPx*1.3+bigPx*1.05+pad*1.3);
    var x=(W-boxW)/2,y=cfg.pos==='base'?H*L.bot-boxH:H*L.top;
    var r=Math.min(boxH/2,boxH*T.rad*1.6);
    g.globalAlpha=k;
    // halo expandindo (pulso)
    g.strokeStyle='rgba('+T.glow+','+((1-phase)*0.55)+')';g.lineWidth=3*u;
    var e=16*u*phase;rr(g,x-e,y-e,boxW+e*2,boxH+e*2,r+e);g.stroke();
    // caixa
    g.globalAlpha=k*pulse;
    var gr=g.createLinearGradient(x,y,x+boxW,y+boxH);gr.addColorStop(0,T.bg[0]);gr.addColorStop(1,T.bg[1]);
    g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=18*u;g.shadowOffsetY=6*u;
    g.fillStyle=gr;rr(g,x,y,boxW,boxH,r);g.fill();g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;
    g.strokeStyle=T.line;g.lineWidth=3*u;g.stroke();
    // ícone
    var cx=x+pad+ico/2,cy=y+boxH/2;
    g.fillStyle=T.ico;g.beginPath();g.arc(cx,cy,ico/2,0,Math.PI*2);g.fill();
    g.save();g.translate(cx-ico*.31,cy-ico*.31);g.scale(ico*.62/24,ico*.62/24);g.fillStyle=T.icoFg;
    try{g.fill(new Path2D(WA))}catch(e){}g.restore();
    // textos
    var tx=x+pad+ico+gap;g.fillStyle=T.fg;g.shadowColor='rgba(0,0,0,.55)';g.shadowBlur=4*u;g.shadowOffsetY=1*u;
    g.font=f(T.sub,subPx);ls(subPx);g.fillText(FRASE,tx,cy-bigPx*.28);
    g.font=f(T.big,bigPx);ls(bigPx);g.fillText(FONE,tx,cy+bigPx*.72);
    g.restore();
  }

  // ── encaixe em window.__fcModelo (preserva o que já existe) ──
  var orig=window.__fcModelo;
  function wrapped(fase,g,W,H,t){
    var r;if(typeof orig==='function')r=orig.apply(this,arguments);
    if(fase==='post'){try{cta(g,W,H,t)}catch(e){}}
    return r;
  }
  Object.defineProperty(window,'__fcModelo',{configurable:true,get:function(){return wrapped},set:function(fn){orig=fn}});
  window.FCCta={cfg:cfg,TEMAS:TEMAS,draw:cta};

  // ── fontes + seletor no passo 2 ──
  var L=document.createElement('link');L.rel='stylesheet';
  L.href='https://fonts.googleapis.com/css2?family=Playfair+Display:wght@800&family=Montserrat:wght@700&family=Bebas+Neue&family=Poppins:wght@900&family=Oswald:wght@700&family=Inter:wght@600&display=swap';
  document.head.appendChild(L);
  function warm(){try{['800 40px "Playfair Display"','700 20px Montserrat','400 40px "Bebas Neue"','900 20px Poppins','700 40px Oswald','600 20px Inter'].forEach(function(s){document.fonts.load(s)})}catch(e){}}
  function ui(){
    var ref=document.getElementById('propertyContact');ref=ref&&ref.closest('.field');if(!ref||document.getElementById('ctaTema'))return;
    var d=document.createElement('div');d.className='field';d.style.flex='1 1 100%';
    var o='<option value="">Sem destaque piscante</option>';for(var k in TEMAS)o+='<option value="'+k+'">'+TEMAS[k].nome+'</option>';
    d.innerHTML='<label for="ctaTema">Destaque piscante “FALE COMIGO NO ZAP” dentro do vídeo</label>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><select id="ctaTema" style="flex:2;min-width:200px">'+o+'</select>'+
      '<select id="ctaPos" style="flex:1;min-width:160px"><option value="topo">Posição: topo</option><option value="base">Posição: base</option></select></div>';
    ref.parentNode.insertBefore(d,ref.nextSibling);
    var a=document.getElementById('ctaTema'),b=document.getElementById('ctaPos');a.value=cfg.tema;b.value=cfg.pos;
    a.onchange=function(){cfg.tema=a.value;try{localStorage.setItem('fcCtaTema',cfg.tema)}catch(e){}warm()};
    b.onchange=function(){cfg.pos=b.value;try{localStorage.setItem('fcCtaPos',cfg.pos)}catch(e){}};
    warm();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ui);else ui();
})();
