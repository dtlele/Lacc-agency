const $=s=>document.querySelector(s);
const colori={Rosa:'#ff4f8b',Lilla:'#c3aaf7',Menta:'#a5e8cf',Giallo:'#ffe066'};
const sfondo=c=>`repeating-linear-gradient(45deg,transparent 0 9px,rgba(61,23,71,.16) 9px 11px),repeating-linear-gradient(-45deg,transparent 0 9px,rgba(255,255,255,.3) 9px 11px),${c}`;

/* VIDEO (dati di prova: la ricerca vera richiede un backend) */
const video=[
 {t:'Il tuo primo amigurumi, passo passo',f:'YouTube',l:'Facile',d:'18 min',c:'#ff4f8b',a:'Canale esempio'},
 {t:'Punto ventaglio senza paura',f:'YouTube',l:'Media',d:'12 min',c:'#c3aaf7',a:'Canale esempio'},
 {t:'Borsa a rete con filo di cotone',f:'Blog',l:'Facile',d:'25 min',c:'#a5e8cf',a:'Blog esempio'},
 {t:'Scialle triangolare in lana morbida',f:'YouTube',l:'Media',d:'32 min',c:'#ffd9bf',a:'Canale esempio'},
 {t:'Granny square: la guida completa',f:'Instagram',l:'Facile',d:'6 min',c:'#ffe066',a:'Profilo esempio'},
 {t:'Maglia a punto pizzo per esperte',f:'YouTube',l:'Esperta',d:'41 min',c:'#ff4f8b',a:'Canale esempio'}
];
let livello='';
function chipsVideo(){
  const box=$('#chipLivello');box.innerHTML='';
  ['','Facile','Media','Esperta'].forEach(l=>{
    const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=l||'Tutti i livelli';
    b.setAttribute('aria-pressed',String(l===livello));
    b.onclick=()=>{livello=l;chipsVideo();mostraVideo()};box.append(b);
  });
}
function mostraVideo(){
  const q=$('#qVideo').value.toLowerCase().trim(),fo=$('#fonteVideo').value;
  const r=video.filter(v=>(!q||v.t.toLowerCase().includes(q))&&(!fo||v.f===fo)&&(!livello||v.l===livello));
  $('#listaVideo').innerHTML=r.length?r.map(v=>`
   <article class="video"><div class="anteprima" style="background:${sfondo(v.c)}"><div class="play"></div><span class="durata">${v.d}</span></div>
   <div class="corpo"><span class="fonte">${v.f} · ${v.l}</span><h3>${v.t}</h3><span class="meta">${v.a}</span><span class="umano">✓ Creatrice umana</span></div></article>`).join(''):'<p class="vuoto">Nessun video trovato. Prova con un\'altra parola.</p>';
}
$('#formVideo').onsubmit=e=>{e.preventDefault();mostraVideo()};
$('#fonteVideo').onchange=mostraVideo;

/* FOTO */
const foto=[
 {n:'Orsetto coccolone',c:'Amigurumi',d:'Facile',col:'Rosa'},
 {n:'Borsa a rete',c:'Borse',d:'Facile',col:'Menta'},
 {n:'Coperta a granny',c:'Coperte',d:'Media',col:'Giallo'},
 {n:'Scialle a ventaglio',c:'Scialli',d:'Media',col:'Lilla'},
 {n:'Top estivo a pizzo',c:'Abbigliamento',d:'Esperta',col:'Rosa'},
 {n:'Fermacapelli a fiore',c:'Accessori',d:'Facile',col:'Lilla'},
 {n:'Coniglietto pasquale',c:'Amigurumi',d:'Media',col:'Menta'},
 {n:'Sottobicchieri a cuore',c:'Accessori',d:'Facile',col:'Rosa'}
];
const cats=['Tutte',...new Set(foto.map(f=>f.c))];let cat='Tutte';
function chipsFoto(){
  const box=$('#chipCat');box.innerHTML='';
  cats.forEach(c=>{const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=c;
    b.setAttribute('aria-pressed',String(c===cat));b.onclick=()=>{cat=c;chipsFoto();mostraFoto()};box.append(b)});
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function mostraFoto(){
  const d=$('#fDiff').value,co=$('#fCol').value;
  const r=foto.filter(f=>(cat==='Tutte'||f.c===cat)&&(!d||f.d===d)&&(!co||f.col===co));
  $('#listaFoto').innerHTML=r.length?r.map(f=>`<figure class="foto" style="background:${f.img?`url(${f.img}) center/cover`:sfondo(colori[f.col]||'#ffd9bf')}">
   <figcaption class="tag">${esc(f.n)}<small>${esc(f.c)} · ${esc(f.d)}</small></figcaption></figure>`).join(''):'<p class="vuoto">Nessuna foto con questi filtri.</p>';
}
$('#fDiff').onchange=mostraFoto;$('#fCol').onchange=mostraFoto;
$('#fileFoto').onchange=e=>{
  const file=e.target.files[0];if(!file)return;
  const rd=new FileReader();
  rd.onload=()=>{foto.unshift({n:file.name.replace(/\.[^.]+$/,'').slice(0,28)||'Nuova foto',c:cat==='Tutte'?'Accessori':cat,d:'Facile',col:'Rosa',img:rd.result});mostraFoto()};
  rd.readAsDataURL(file);e.target.value='';
};

/* CHAT (risposte d'esempio: la chat vera richiede un backend) */
const risposte=[
 [/amigurumi|pupazzo|orsetto/i,'Per l\'amigurumi usa un uncinetto più piccolo del filo (es. 2,5 mm con cotone) così la maglia resta fitta e l\'imbottitura non si vede.'],
 [/filo|filato|lana|cotone/i,'Il cotone è perfetto per borse e sottobicchieri. Per scialli e coperte scegli lana o misto lana, più morbidi.'],
 [/uncinetto|misura|mm/i,'Regola semplice: guarda la fascetta del gomitolo e parti dalla misura consigliata, poi fai un campione 10x10 cm.'],
 [/cuore|sottobicchier/i,'Prova lo schema del cuore qui sotto: è piccolo, veloce e ottimo per iniziare.']
];
$('#formChat').onsubmit=e=>{
  e.preventDefault();const q=$('#qChat').value.trim();if(!q)return;
  const m=$('#msgs');
  m.insertAdjacentHTML('beforeend',`<div class="bolla io"></div>`);m.lastElementChild.textContent=q;
  const r=(risposte.find(x=>x[0].test(q))||[0,'Bella idea! Dimmi che filo hai e che livello sei, e ti preparo i passi giusti.'])[1];
  setTimeout(()=>{m.insertAdjacentHTML('beforeend',`<div class="bolla lei">${r}</div>`);m.scrollTop=m.scrollHeight},350);
  $('#qChat').value='';m.scrollTop=m.scrollHeight;
};

/* SCHEMA */
const progetti={
 cuore:{nome:'Sottobicchiere a cuore',righe:[
  '..##...##..','.####.####.','###########','###########','###########','.#########.','..#######..','...#####...','....###....','.....#.....'],
  passi:[
   {t:'Prepara il materiale',s:'Cotone rosa, uncinetto 3 mm, forbici e ago da lana.',r:[]},
   {t:'Punta del cuore',s:'Parti dal basso con 2 catenelle e allarga di 1 maglia per lato.',r:[9,8]},
   {t:'Parte centrale',s:'Continua ad aumentare fino a 9 maglie, poi lavora dritto.',r:[7,6,5]},
   {t:'Corpo largo',s:'Lavora 3 righe da 11 maglie senza aumentare.',r:[4,3,2]},
   {t:'Le due curve',s:'Dividi il lavoro in due e chiudi ogni lobo con una riga di calo.',r:[1,0]},
   {t:'Rifinitura',s:'Giro di maglie basse tutto intorno e nascondi i fili.',r:[]}
  ]},
 fiore:{nome:'Fiore a petali',righe:[
  '...#...#...','..###.###..','...#####...','#..#####..#','###.###.###','.####.####.','..#######..','.####.####.','###.###.###','#..#####..#'],
  passi:[
   {t:'Prepara il materiale',s:'Filo lilla e giallo, uncinetto 3 mm.',r:[]},
   {t:'Il centro',s:'Anello magico con 10 maglie alte e chiudi a cerchio.',r:[9,8]},
   {t:'Primo giro di petali',s:'Ogni petalo: 5 maglie alte nello stesso punto.',r:[7,6,5]},
   {t:'Secondo giro',s:'Lavora dietro i petali con catenelle e maglie basse.',r:[4,3,2]},
   {t:'Petali grandi',s:'Allarga i petali con 7 maglie alte.',r:[1,0]},
   {t:'Rifinitura',s:'Nascondi i fili e fissa il centro giallo.',r:[]}
  ]}
};
let prog='cuore',fatti={};
function progettiChips(){
  const b=$('#progetti');b.innerHTML='';
  Object.entries(progetti).forEach(([k,p])=>{const c=document.createElement('button');c.type='button';c.className='chip';c.textContent=p.nome;
    c.setAttribute('aria-pressed',String(k===prog));c.onclick=()=>{prog=k;progettiChips();schema()};b.append(c)});
}
function schema(){
  const p=progetti[prog];fatti[prog]=fatti[prog]||new Set();const fs=fatti[prog];
  $('#titProg').textContent=p.nome;
  const prossimo=p.passi.findIndex((_,i)=>!fs.has(i));
  $('#passi').innerHTML=p.passi.map((x,i)=>`<li class="passo ${fs.has(i)?'fatto':''} ${i===prossimo?'attivo':''}" data-i="${i}" tabindex="0" role="checkbox" aria-checked="${fs.has(i)}"><div><b>${x.t}</b><span>${x.s}</span></div></li>`).join('');
  const ev=new Set(prossimo>=0?p.passi[prossimo].r:[]);
  $('#grafico').innerHTML=p.righe.map((r,y)=>[...r].map(ch=>`<div class="cella ${ch==='#'?'pieno':''} ${ev.has(y)?'evid':''}">${ch==='#'?'|':'o'}</div>`).join('')).join('');
  const pct=Math.round(fs.size/p.passi.length*100);
  $('#barra').style.width=pct+'%';
  $('#contatore').textContent=fs.size===p.passi.length?'Fatto! Il tuo lavoro è finito.':`${fs.size} passi su ${p.passi.length}, ${pct}%`;
}
function toggle(el){const li=el.closest('.passo');if(!li)return;const i=+li.dataset.i,fs=fatti[prog];fs.has(i)?fs.delete(i):fs.add(i);schema()}
$('#passi').onclick=e=>toggle(e.target);
$('#passi').onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();toggle(e.target)}};

/* MATERIALI (link di ricerca Amazon; i link affiliati si aggiungono con il tag partner) */
const AMAZON_TAG=''; // es. 'tuonome-21' quando avrai il programma affiliati
const materiali=[
 ['Uncinetti in alluminio','set misure 2–6 mm','uncinetti alluminio set'],
 ['Cotone per amigurumi','gomitoli colorati','cotone amigurumi gomitoli'],
 ['Lana morbida','per scialli e coperte','lana per uncinetto morbida'],
 ['Occhi di sicurezza','per pupazzi','occhi sicurezza amigurumi'],
 ['Imbottitura','fibra siliconata','imbottitura fibra siliconata'],
 ['Marcapunti e aghi','set per rifiniture','marcapunti uncinetto aghi lana']
];
$('#mat').innerHTML=materiali.map(m=>`<a href="https://www.amazon.it/s?k=${encodeURIComponent(m[2])}${AMAZON_TAG?`&tag=${encodeURIComponent(AMAZON_TAG)}`:''}" target="_blank" rel="noopener sponsored"><strong>${m[0]}</strong><span>${m[1]}</span><em>Cerca su Amazon →</em></a>`).join('');

chipsVideo();mostraVideo();chipsFoto();mostraFoto();progettiChips();schema();

