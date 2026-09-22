const DATA=window.K4A_DATA;
const categories=['Senior','Women','Master','Junior'];
let current='Senior';
const tabs=document.getElementById('tabs');
const list=document.getElementById('driverList');
const search=document.getElementById('search');
const clean=v=>v===null||v===undefined||v===''?'—':v;
function renderTabs(){
  tabs.innerHTML=categories.map(c=>`<button class="tab ${c===current?'active':''}" data-cat="${c}">${c}</button>`).join('');
  tabs.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{current=b.dataset.cat;document.body.dataset.cat=current.toLowerCase();search.value='';render();});
}
function podiumClass(pos){return pos===1?'r1':pos===2?'r2':'r3'}
function renderPodium(rows){
  const top=rows.slice(0,3);
  const order=top.length===3?[top[1],top[0],top[2]]:top;
  document.getElementById('podium').innerHTML=order.map(d=>`<div class="podiumCard ${podiumClass(d.position)}" data-name="${d.name}"><div class="podiumPos">${d.position}</div><div class="podiumName">${d.name}</div><div class="podiumScore"><strong>${d.net}</strong><span>punti</span></div><div class="podiumInfo">Lordo ${d.gross} · Scarti ${d.discardTotal}</div></div>`).join('');
  document.querySelectorAll('.podiumCard').forEach(el=>el.onclick=()=>openDriver(DATA[current].find(x=>x.name===el.dataset.name)));
}
function render(){
  renderTabs();document.body.dataset.cat=current.toLowerCase();
  document.getElementById('title').textContent='Generale '+current;
  const q=search.value.trim().toLowerCase();
  const rows=DATA[current].filter(d=>d.name.toLowerCase().includes(q));
  document.getElementById('count').textContent=rows.length+' piloti';
  renderPodium(rows);
  list.innerHTML=rows.map(d=>`<div class="driverCard" data-name="${d.name}"><div class="driverRank">${d.position}</div><div class="driverMain"><div class="driverName">${d.name}</div><div class="driverSub">Scarti: ${d.discardTotal} punti</div></div><div class="driverNet">${d.net}<span>pt</span></div><div class="driverMetric driverGross">${d.gross}<span>lordo</span></div><div class="driverMetric driverWins">${d.wins}<span>vitt.</span></div></div>`).join('');
  document.getElementById('empty').style.display=rows.length?'none':'block';
  list.querySelectorAll('.driverCard').forEach(el=>el.onclick=()=>openDriver(DATA[current].find(x=>x.name===el.dataset.name)));
}
function stateClass(s){
  if(s.locked)return 'locked';
  if(s.discarded)return 'discarded';
  if(['DNF','DNS','NP'].includes(s.status))return 'zeroState';
  if(s.points===null||s.points===undefined||s.status==='N/A')return '';
  return 'considered';
}
function stateLabel(s){
  if(s.status==='N/A')return 'Non prevista';
  if(s.locked)return 'DSQ · non scartabile';
  if(s.discarded)return 'Scartato';
  if(['DNF','DNS','NP'].includes(s.status))return s.status+' · scartabile';
  if(s.points===null||s.points===undefined)return 'Da disputare';
  return 'Considerato';
}
function roundTotal(r){return r.sessions.reduce((a,s)=>a+(typeof s.points==='number'?s.points:0),0)}
function sessionNote(s){
  if(s.locked)return '0 punti · resta nel totale';
  if(s.discarded)return 'Risultato escluso dal totale netto';
  if(['DNF','DNS','NP'].includes(s.status))return '0 punti';
  if(s.status==='N/A')return 'Sessione non prevista';
  if(s.points===null||s.points===undefined)return '';
  return 'Risultato valido';
}
function openDriver(d){
  document.getElementById('modalCat').textContent='T4 Club · '+current;
  document.getElementById('modalName').textContent=d.name;
  document.getElementById('modalRank').textContent='P'+d.position;
  document.getElementById('summary').innerHTML=[['Punti netti',d.net],['Totale lordo',d.gross],['Punti scartati',d.discardTotal],['Vittorie',d.wins],['DSQ',d.dsqCount]].map(x=>`<div class="stat"><small>${x[0]}</small><strong>${x[1]}</strong></div>`).join('');
  document.getElementById('rounds').innerHTML=d.rounds.map(r=>`<div class="round"><div class="roundHeader"><div><div class="roundTitle">${r.code} · ${r.track}</div><div class="roundDate">${r.date}</div></div><div class="roundPts">${roundTotal(r)} pt</div></div><div class="sessions">${r.sessions.map(s=>`<div class="sess ${stateClass(s)}"><div class="sessLabel">${s.label==='Q'?'Qualifica':s.label==='G1'?'Gara 1':'Gara 2'}</div><div class="stateLabel">${stateLabel(s)}</div><div class="sessPos">${clean(s.pos)}</div><div class="sessPts">${s.points===null||s.points===undefined?'—':s.points+' pt'}</div><div class="sessNote">${sessionNote(s)}</div></div>`).join('')}</div></div>`).join('');
  const items=[];
  if(d.discardQuali)items.push(`${d.discardQuali} · ${d.discardQualiPts} pt`);
  if(d.discardRace1)items.push(`${d.discardRace1} · ${d.discardRace1Pts} pt`);
  if(d.discardRace2)items.push(`${d.discardRace2} · ${d.discardRace2Pts} pt`);
  document.getElementById('discards').innerHTML=`<h4>Scarti applicati</h4><div class="chips">${items.length?items.map(x=>`<span class="chip">${x}</span>`).join(''):'<span class="chip">Nessuno</span>'}</div><div class="scartiNote">Le DSQ non possono essere selezionate come scarto. DNF, DNS e NP possono invece essere scartati.</div>`;
  document.getElementById('backdrop').classList.add('open');document.body.style.overflow='hidden';
}
function closeModal(){document.getElementById('backdrop').classList.remove('open');document.body.style.overflow=''}
search.addEventListener('input',render);document.getElementById('close').onclick=closeModal;document.getElementById('backdrop').onclick=e=>{if(e.target.id==='backdrop')closeModal()};document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});render();